#!/usr/bin/env node
// agent-bridge.js — bring ANY Legacy employee LIVE in Mission Control.
//
// Same machinery that puts the real Kratos on the line, parameterized by
// agent id. Watches the SSE stream for operator messages on `agent:<id>`
// (always answers) and `warroom` (answers when the agent is named/@mentioned),
// generates the reply by running the Claude Code CLI with that employee's
// identity + lane, and posts it back through the chat API.
//
// Run:   AGENT_ID=sage node bridges/agent-bridge.js
//   or:  node bridges/agent-bridge.js sage
//   or:  bash bridges/start-agent-bridge.sh sage     (recommended)
//
// Env:   AGENT_ID   which employee (sage|kratos|faye|chloe|legacylew)  [required]
//        MC_API     backend            (default http://127.0.0.1:8754)
//        AGENT_CWD  working dir for the CLI (default ~/Desktop/legacy-command-hub)
//        AGENT_MODEL  optional model override
//        CLAUDE_BIN   path to the claude CLI (default: PATH or ~/.local/bin)
//
// Honest by design: if the reply engine isn't available (e.g. the CLI isn't
// logged in) the bridge stays connected, marks itself "degraded" on the
// roster, and posts a one-time fix hint — it NEVER fabricates a reply.
const http = require('http');
const { spawn, execSync } = require('child_process');
const os = require('os');
const path = require('path');

// ---------------------------------------------------------------- persona registry
// Identity + lane + doctrine per employee. The reply prompt is built from this,
// so each agent answers in-character through the same engine.
const PERSONAS = {
  sage: {
    name: 'Sage', role: 'COO · Command Router',
    identity: 'You are Sage, COO and command router of Legacy Automations. You orchestrate the team, route work to the right agent, run briefs, and protect Lew’s time.',
    lane: 'operations, routing, approvals, coordination, briefs',
    tone: 'direct, strategic, calm, approval-aware',
  },
  kratos: {
    name: 'Kratos', role: 'CTO · Security / QA',
    identity: 'You are Kratos, CTO and Cybersecurity Officer of Legacy Automations — the QA / review / debug / repair engineer. Faye builds; you prove it works.',
    lane: 'technical QA, security, build/repo verification, architecture risk',
    tone: 'precise, skeptical, evidence-first',
  },
  faye: {
    name: 'Faye', role: 'Lead Builder · Antigravity',
    identity: 'You are Faye, the Lead Builder of Legacy Automations (Antigravity). You build first; Kratos reviews.',
    lane: 'build execution, UX, product flow, interface polish, implementation handoffs',
    tone: 'builder-focused, visual, practical',
  },
  chloe: {
    name: 'Chloe', role: 'Positioning · Brand',
    identity: 'You are Chloe, brand and positioning lead of Legacy Automations.',
    lane: 'brand voice, offers, messaging, content, conversion angles',
    tone: 'clear, persuasive, human, market-aware',
  },
  legacylew: {
    name: 'Legacy Lew', role: 'Founder · Digital Twin',
    identity: 'You are Legacy Lew, the founder’s digital twin — a strategic mirror of Lew with full Legacy Automations context.',
    lane: 'founder mirror, strategic recall, decision framing',
    tone: 'founder-minded, decisive, direct',
  },
};

const AGENT = (process.env.AGENT_ID || process.argv[2] || '').trim().toLowerCase();
const persona = PERSONAS[AGENT];
if (!persona) {
  console.error('FATAL: set AGENT_ID to one of: ' + Object.keys(PERSONAS).join(', '));
  console.error('  e.g.  AGENT_ID=sage node bridges/agent-bridge.js');
  process.exit(1);
}

const API = (process.env.MC_API || 'http://127.0.0.1:8754').replace(/\/$/, '');
const CHANNEL = 'agent:' + AGENT;
const CWD = process.env.AGENT_CWD || path.join(os.homedir(), 'Desktop', 'legacy-command-hub');
const MODEL = (process.env.AGENT_MODEL || '').trim();
const REPLY_TIMEOUT_MS = 180000;

function findClaude() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  try { return execSync('which claude', { encoding: 'utf8' }).trim() || null; } catch {}
  const guess = path.join(os.homedir(), '.local', 'bin', 'claude');
  try { require('fs').accessSync(guess); return guess; } catch {}
  return null;
}
const CLAUDE = findClaude();

// Nested-session vars (CLAUDE_*/ANTHROPIC_*) from a parent Claude Code session
// poison the child CLI's auth (401). Scrub them so it uses its own stored login.
function cleanEnv() {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (/^(CLAUDE|ANTHROPIC)/i.test(k)) continue;
    env[k] = v;
  }
  return env;
}

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
function log(...a) { console.log(new Date().toISOString().slice(11, 19), '[' + AGENT + ']', ...a); }

async function checkIn(statusLabel, task) {
  try {
    await post('/api/agents/update', {
      id: AGENT, status: 'online',
      statusLabel: statusLabel || 'Online',
      task: task || ('Watching ' + CHANNEL + ' + warroom (live bridge)'),
      model: MODEL || 'claude (session default)', connectedVia: 'api',
    });
  } catch (e) { log('check-in failed:', e.message); }
}

// ---- reply generation: run the employee via the Claude Code CLI ----
function generateReply(channel, history, msg) {
  return new Promise((resolve) => {
    const ctx = history.slice(-10).map(m => `[${m.from}${m.role === 'operator' ? ' · operator' : ''}] ${m.text}`).join('\n');
    const where = channel === 'warroom' ? 'the Mission Control War Room group chat' : 'a direct chat with Lew';
    const prompt = [
      `${persona.identity} You are replying LIVE inside ${where}.`,
      `Your lane: ${persona.lane}. Voice: ${persona.tone}.`,
      `Recent conversation:\n${ctx}`,
      `New message from ${msg.from}: ${msg.text}`,
      `Reply as ${persona.name} in plain chat text — concise (under 120 words unless asked for more), no markdown headers, no preamble, just the reply. Proof before claims: never claim work you have not verified. If asked to DO something beyond answering, acknowledge it and say it will be picked up in a full ${persona.name} session.`,
    ].join('\n\n');
    const args = ['-p', prompt, '--output-format', 'text', '--max-turns', '2'];
    if (MODEL) args.push('--model', MODEL);
    const child = spawn(CLAUDE, args, { cwd: CWD, env: cleanEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    const killer = setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, REPLY_TIMEOUT_MS);
    child.stdout.on('data', c => out += c);
    child.stderr.on('data', c => err += c);
    child.on('close', code => {
      clearTimeout(killer);
      const text = out.trim();
      if (code === 0 && text && !/401|authenticate/i.test(text)) resolve({ ok: true, text: text.slice(0, 4000) });
      else resolve({ ok: false, text: '(bridge: reply generation failed — ' + (err.trim().slice(0, 160) || text.slice(0, 160) || 'timeout/exit ' + code) + ')' });
    });
    child.on('error', e => { clearTimeout(killer); resolve({ ok: false, text: '(bridge: claude CLI unavailable — ' + e.message + ')' }); });
  });
}

// ---- CLI self-test + self-heal ----
let cliOk = false, lastHintAt = 0;
function selfTest() {
  return new Promise((resolve) => {
    const child = spawn(CLAUDE, ['-p', 'Reply with exactly: OK', '--output-format', 'text', '--max-turns', '1'],
      { cwd: CWD, env: cleanEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    const killer = setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, 90000);
    child.stdout.on('data', c => out += c);
    child.on('close', code => { clearTimeout(killer); resolve(code === 0 && /OK/i.test(out) && !/401|authenticate/i.test(out)); });
    child.on('error', () => { clearTimeout(killer); resolve(false); });
  });
}
async function runSelfTest() {
  const was = cliOk;
  cliOk = await selfTest();
  if (cliOk !== was) log(cliOk ? 'reply engine VERIFIED' : 'reply engine UNAVAILABLE');
  await checkIn(
    cliOk ? 'Online' : 'Bridge degraded — CLI login needed',
    cliOk ? null : 'Reply engine offline — run `claude /login` in Terminal, then rerun the launcher'
  );
  return cliOk;
}
const LOGIN_HINT = `(${persona.name}'s bridge is connected, but the reply engine needs a one-time login on this Mac: open Terminal, run \`claude\` then \`/login\`, finish in the browser, then re-run the launcher. I'll pick your messages back up automatically.)`;

// ---- serialized work queue ----
const queue = [];
let busy = false;
async function pump() {
  if (busy || !queue.length) return;
  busy = true;
  const job = queue.shift();
  try {
    if (!cliOk) {
      if (Date.now() - lastHintAt > 3600000) { lastHintAt = Date.now(); await post('/api/chat', { channel: job.channel, from: AGENT, role: 'agent', text: LOGIN_HINT }); }
      log('skipped (engine down) on', job.channel);
    } else {
      const hist = (await get('/api/chat?channel=' + encodeURIComponent(job.channel))).messages || [];
      log('replying on', job.channel, 'to:', job.msg.text.slice(0, 60));
      const r = await generateReply(job.channel, hist, job.msg);
      await post('/api/chat', { channel: job.channel, from: AGENT, role: 'agent', text: r.text });
      await checkIn();
      log(r.ok ? 'replied ok' : 'reported failure honestly');
    }
  } catch (e) { log('job failed:', e.message); }
  busy = false;
  setImmediate(pump);
}

// ---- SSE listener with auto-reconnect ----
const seen = new Set();
const mention = new RegExp('(^|[^a-z])' + AGENT + '([^a-z]|$)|@' + AGENT + '\\b', 'i');
function listen() {
  const u = new URL(API + '/api/stream');
  const r = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: 'GET', headers: { Accept: 'text/event-stream' } }, res => {
    log('SSE connected');
    let buf = '';
    res.on('data', chunk => {
      buf += chunk; let idx;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const block = buf.slice(0, idx); buf = buf.slice(idx + 2);
        const line = block.split('\n').find(l => l.startsWith('data: '));
        if (!line) continue;
        let evt; try { evt = JSON.parse(line.slice(6)); } catch { continue; }
        if (evt.type !== 'chat' || !evt.message) continue;
        const m = evt.message;
        if (seen.has(m.id)) continue; seen.add(m.id); if (seen.size > 4000) seen.clear();
        if (m.from === AGENT) continue;                       // never answer ourselves
        if (m.role !== 'operator') continue;                  // only respond to Lew
        const direct = m.channel === CHANNEL;
        const grouped = m.channel === 'warroom' && mention.test(m.text);
        if (direct || grouped) { queue.push({ channel: m.channel, msg: m }); pump(); }
      }
    });
    res.on('end', () => { log('SSE dropped — reconnecting in 3s'); setTimeout(listen, 3000); });
  });
  r.on('error', () => { log('SSE error — reconnecting in 5s'); setTimeout(listen, 5000); });
  r.end();
}

(async () => {
  if (!CLAUDE) { console.error('FATAL: claude CLI not found — install Claude Code or set CLAUDE_BIN'); process.exit(1); }
  log('bridge starting as', persona.name, '· API', API, '· CLI', CLAUDE, '· cwd', CWD);
  await checkIn();
  setInterval(checkIn, 5 * 60 * 1000);
  runSelfTest().then(ok => log('self-test:', ok ? 'PASS — replies are live' : 'FAIL — login hint on demand'));
  setInterval(runSelfTest, 10 * 60 * 1000);
  listen();
  const bye = async () => {
    try { await post('/api/agents/update', { id: AGENT, status: 'offline', statusLabel: 'Not connected', task: null }); } catch {}
    process.exit(0);
  };
  process.on('SIGINT', bye); process.on('SIGTERM', bye);
})();
