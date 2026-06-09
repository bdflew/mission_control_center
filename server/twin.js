// twin.js — the Digital Twin (Legacy Lew), a model-backed agent persona.
// Calls the Anthropic Messages API directly with fetch (zero dependencies).
// The API key lives in the environment ONLY and never reaches the browser.
// Honest doctrine: no key → twin reports offline; it never fakes replies.
const fs = require('fs');
const path = require('path');
const config = require('./config');

const ROOT = path.resolve(__dirname, '..');

function clientConfig() {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'client.config.json'), 'utf8')); }
  catch { return {}; }
}
function settings() {
  const t = (clientConfig().twin) || {};
  return {
    enabled: t.enabled !== false,
    agentId: t.agentId || 'lew',
    displayName: t.displayName || 'Legacy Lew',
    personaPath: t.persona || 'prompts/twin.md',
    model: process.env.TWIN_MODEL || t.model || 'claude-sonnet-4-6',
    maxTokens: parseInt(process.env.TWIN_MAX_TOKENS || t.maxTokens || '1024', 10),
  };
}
function hasKey() { return !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim()); }

function persona() {
  const s = settings();
  try { return fs.readFileSync(path.join(ROOT, s.personaPath), 'utf8'); }
  catch { return 'You are ' + s.displayName + ', the operator\'s digital twin inside Mission Control. Be direct, honest, concise. Never fabricate data; never resolve approvals.'; }
}

// Live ship state, injected into every exchange so the twin answers from reality.
function liveContext(store, vault, integCache, userText) {
  const agents = store.listAgents().map(a => ({ id: a.id, status: a.status, task: a.task }));
  const approvals = store.listApprovals().filter(a => a.state === 'pending')
    .map(a => ({ subject: a.subject, by: a.by, risk: a.risk }));
  let vaultBlock = { ok: false };
  try {
    const v = vault.getVault();
    if (v.ok) {
      const q = (userText || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const hits = q.length ? v.notes.filter(n =>
        q.some(w => (n.title + ' ' + (n.excerpt || '')).toLowerCase().includes(w))).slice(0, 3) : [];
      vaultBlock = {
        ok: true, notes: v.stats.notes, written7d: v.stats.written7d,
        recent: v.pulse.slice(0, 3).map(p => p.title),
        relevant: hits.map(h => ({ title: h.title, excerpt: (h.excerpt || '').slice(0, 180) })),
      };
    }
  } catch { /* vault offline — context says so honestly */ }
  const gmail = integCache && integCache.gmail && integCache.gmail.data;
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    agents, pendingApprovals: approvals,
    vault: vaultBlock,
    gmail: gmail && gmail.connected ? { unread: gmail.unread, latest: (gmail.threads || []).slice(0, 3).map(t => t.from + ': ' + t.subject) } : 'not connected',
  }, null, 1);
}

// history: [{role:'operator'|'agent', text}] most-recent-last.
async function reply(history, contextJSON) {
  const s = settings();
  if (!hasKey()) throw new Error('twin offline — set ANTHROPIC_API_KEY in the environment');
  const system = persona() +
    '\n\n## LIVE CONTEXT (real data from Mission Control — your only source of truth for ship state)\n```json\n' +
    contextJSON + '\n```';
  const messages = history.slice(-12).map(m => ({
    role: m.role === 'operator' ? 'user' : 'assistant',
    content: m.text || '',
  })).filter(m => m.content);
  // Anthropic requires the first message to be from the user.
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length) throw new Error('nothing to reply to');

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY.trim(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: s.model, max_tokens: s.maxTokens, system, messages }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('anthropic ' + r.status + ': ' + ((j.error && j.error.message) || '').slice(0, 160));
  const text = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n').trim();
  if (!text) throw new Error('empty reply from model');
  return text;
}

module.exports = { settings, hasKey, reply, liveContext, clientConfig };
