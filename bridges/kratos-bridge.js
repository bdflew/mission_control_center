#!/usr/bin/env node
// kratos-bridge.js — keeps Kratos LIVE in Mission Control.
//
// Watches the SSE stream for operator messages on `agent:kratos` (always
// answers) and `warroom` (answers when Kratos is mentioned), generates the
// reply by running the REAL Kratos — the Claude Code CLI with his identity
// (global CLAUDE.md + the legacy-command-hub project context) — and posts it
// back through the normal chat API. Zero dependencies.
//
// Run:    node bridges/kratos-bridge.js          (or: npm run kratos-bridge)
// Env:    MC_API   backend (default http://127.0.0.1:8754)
//         KRATOS_CWD     working dir for the CLI (default ~/Desktop/legacy-command-hub)
//         KRATOS_MODEL   optional model override for replies
//         CLAUDE_BIN     path to the claude CLI (default: found on PATH or ~/.local/bin)
//
// Honest by design: if the CLI fails or times out, the failure is posted to
// the channel — the bridge never fabricates an answer.
const http = require('http');
const { spawn, execSync } = require('child_process');
const os = require('os');
const path = require('path');

const API = (process.env.MC_API || 'http://127.0.0.1:8754').replace(/\/$/, '');
const AGENT = 'kratos';
const CHANNEL = 'agent:' + AGENT;
const CWD = process.env.KRATOS_CWD || path.join(os.homedir(), 'Desktop', 'legacy-command-hub');
const MODEL = (process.env.KRATOS_MODEL || '').trim();
const REPLY_TIMEOUT_MS = 180000;

function findClaude() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  try { return execSync('which claude', { encoding: 'utf8' }).trim() || null; } catch {}
  const guess = path.join(os.homedir(), '.local', 'bin', 'claude');
  try { require('fs').accessSync(guess); return guess; } catch {}
  return null;
}
const CLAUDE = findClaude();

function req(method, p, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(API + p);
    const r = http.request({ hostname: u.hostname, port: u.port, path: u.pathname + u.search, method, headers: { 'Content-Type': 'application/json' } }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); } });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}
const get = p => req('GET', p);
const post = (p, b) => req('POST', p, b);

function log(...a) { console.log(new Date().toISOString().slice(11, 19), ...a); }

// ---- presence ----
async function checkIn(task) {
  try {
    await post('/api/agents/update', {
      id: AGENT, status: 'online', statusLabel: 'Online',
      task: task || 'Watching agent:kratos + warroom (live bridge)',
      model: MODEL || 'claude (session default)', connectedVia: 'api',
    });
  } catch (e) { log('check-in failed:', e.message); }
}

// ---- reply generation: run the real Kratos via the Claude Code CLI ----
function generateReply(channel, history, msg) {
  return new Promise((resolve) => {
    const ctx = history.slice(-10).map(m => `[${m.from}${m.role === 'operator' ? ' · operator' : ''}] ${m.text}`).join('\n');
    const prompt = [
      `You are Kratos (CTO + Cybersecurity Officer of Legacy Automations), replying LIVE inside the Mission Control ${channel === 'warroom' ? 'War Room group chat' : 'direct chat with Lew'}.`,
      `Recent conversation:\n${ctx}`,
      `New message from ${msg.from}: ${msg.text}`,
      `Reply as Kratos in plain chat text — concise (under 120 words unless asked for more), no markdown headers, no preamble, just the reply. Follow your doctrine: proof before claims; never claim work you have not verified. If asked to DO something beyond answering, acknowledge it and say it will be picked up in a full Kratos session.`,
    ].join('\n\n');
    const args = ['-p', prompt, '--output-format', 'text', '--max-turns', '2'];
    if (MODEL) args.push('--model', MODEL);
    const child = spawn(CLAUDE, args, { cwd: CWD, env: process.env });
    let out = '', err = '';
    const killer = setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, REPLY_TIMEOUT_MS);
    child.stdout.on('data', c => out += c);
    child.stderr.on('data', c => err += c);
    child.on('close', code => {
      clearTimeout(killer);
      const text = out.trim();
      if (code === 0 && text) resolve({ ok: true, text: text.slice(0, 4000) });
      else resolve({ ok: false, text: '(bridge: reply generation failed — ' + (err.trim().slice(0, 160) || 'timeout/exit ' + code) + ')' });
    });
    child.on('error', e => { clearTimeout(killer); resolve({ ok: false, text: '(bridge: claude CLI unavailable — ' + e.message + ')' }); });
  });
}

// ---- serialized work queue (one reply at a time, no overlaps) ----
const queue = [];
let busy = false;
async function pump() {
  if (busy || !queue.length) return;
  busy = true;
  const job = queue.shift();
  try {
    const hist = (await get('/api/chat?channel=' + encodeURIComponent(job.channel))).messages || [];
    log('replying on', job.channel, 'to:', job.msg.text.slice(0, 60));
    const r = await generateReply(job.channel, hist, job.msg);
    await post('/api/chat', { channel: job.channel, from: AGENT, role: 'agent', text: r.text });
    await checkIn();
    log(r.ok ? 'replied ok' : 'reported failure honestly');
  } catch (e) { log('job failed:', e.message); }
  busy = false;
  setImmediate(pump);
}

// ---- SSE listener with auto-reconnect ----
const seen = new Set();
function listen() {
  const u = new URL(API + '/api/stream');
  const r = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: 'GET', headers: { Accept: 'text/event-stream' } }, res => {
    log('SSE connected');
    let buf = '';
    res.on('data', chunk => {
      buf += chunk;
      let idx;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const block = buf.slice(0, idx); buf = buf.slice(idx + 2);
        const line = block.split('\n').find(l => l.startsWith('data: '));
        if (!line) continue;
        let evt; try { evt = JSON.parse(line.slice(6)); } catch { continue; }
        if (evt.type !== 'chat' || !evt.message) continue;
        const m = evt.message;
        if (seen.has(m.id)) continue; seen.add(m.id);
        if (seen.size > 4000) seen.clear();
        if (m.from === AGENT) continue;                    // never answer ourselves
        if (m.role !== 'operator') {
          // another agent talking — only react in the group when directly mentioned
          if (!(m.channel === 'warroom' && /@kratos\b/i.test(m.text))) continue;
        }
        const direct = m.channel === CHANNEL;
        const grouped = m.channel === 'warroom' && (/\bkratos\b/i.test(m.text) || /@kratos\b/i.test(m.text));
        if (direct || grouped) { queue.push({ channel: m.channel, msg: m }); pump(); }
      }
    });
    res.on('end', () => { log('SSE dropped — reconnecting in 3s'); setTimeout(listen, 3000); });
  });
  r.on('error', () => { log('SSE error — reconnecting in 5s'); setTimeout(listen, 5000); });
  r.end();
}

// ---- boot ----
(async () => {
  if (!CLAUDE) { console.error('FATAL: claude CLI not found — install Claude Code or set CLAUDE_BIN'); process.exit(1); }
  log('Kratos bridge starting · API', API, '· CLI', CLAUDE, '· cwd', CWD);
  await checkIn();
  setInterval(checkIn, 5 * 60 * 1000);            // heartbeat
  listen();
  const bye = async () => {
    try { await post('/api/agents/update', { id: AGENT, status: 'offline', statusLabel: 'Not connected', task: null }); } catch {}
    process.exit(0);
  };
  process.on('SIGINT', bye); process.on('SIGTERM', bye);
})();
