// store.js — persistent, file-backed state for live chat, agents, and approvals.
// Zero dependencies. Atomic-ish writes (write temp then rename). An EventEmitter
// fans changes out to Server-Sent-Events subscribers so the dashboard updates live.
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const config = require('./config');

const bus = new EventEmitter();
bus.setMaxListeners(0);

fs.mkdirSync(config.stateDir, { recursive: true });

function file(name) { return path.join(config.stateDir, name); }

function readJSON(name, fallback) {
  try {
    const raw = fs.readFileSync(file(name), 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(name, data) {
  const tmp = file(name + '.tmp');
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file(name));
}

// A small monotonic id that doesn't rely on Math.random (stable + sortable).
let _seq = 0;
function id(prefix) {
  _seq += 1;
  return prefix + '_' + Date.now().toString(36) + _seq.toString(36);
}

// ---------------------------------------------------------------- seeds
// The agent ROSTER (identity) is real and structural — it is not "fake data".
// Their live STATUS starts honest: idle / no current task until they report in.
const AGENT_SEED = [
  { id: 'sage',   name: 'Sage',   role: 'COO · Command Router' },
  { id: 'kratos', name: 'Kratos', role: 'CTO · Security / QA' },
  { id: 'faye',   name: 'Faye',   role: 'Lead Builder · Antigravity' },
  { id: 'chloe',  name: 'Chloe',  role: 'Positioning · Brand' },
  { id: 'legacylew', name: 'Legacy Lew', role: 'Founder · Digital Twin' },
];

// One-time migration: the twin agent used to share the operator's id ('lew'),
// which made operator messages and twin replies indistinguishable in the UI.
// The twin is now 'legacylew'; 'lew' is reserved for the human operator.
function migrateTwinId() {
  const agents = readJSON('agents.json', null);
  if (Array.isArray(agents) && agents.some(a => a.id === 'lew')) {
    writeJSON('agents.json', agents.map(a => a.id === 'lew' ? { ...a, id: 'legacylew' } : a));
  }
  const chat = readJSON('chat.json', null);
  if (chat && chat.channels) {
    let dirty = false;
    if (chat.channels['agent:lew']) {
      chat.channels['agent:legacylew'] = (chat.channels['agent:legacylew'] || []).concat(chat.channels['agent:lew']);
      delete chat.channels['agent:lew'];
      dirty = true;
    }
    for (const ch of Object.keys(chat.channels)) {
      chat.channels[ch] = chat.channels[ch].map(m => {
        if (m.from === 'lew' && m.role === 'agent') { dirty = true; return { ...m, from: 'legacylew' }; }
        if (ch === 'agent:legacylew' && m.channel === 'agent:lew') { dirty = true; return { ...m, channel: ch }; }
        return m;
      });
    }
    if (dirty) writeJSON('chat.json', chat);
  }
}

function ensureSeed() {
  if (!fs.existsSync(file('agents.json'))) {
    writeJSON('agents.json', AGENT_SEED.map(a => ({
      ...a,
      status: 'offline',          // offline until the real agent connects + reports
      statusLabel: 'Not connected',
      task: null,
      model: null,
      lastSeen: null,
      connectedVia: null,         // 'mcp' | 'cli' | 'api'
    })));
  }
  if (!fs.existsSync(file('chat.json'))) {
    writeJSON('chat.json', { channels: {} });
  }
  if (!fs.existsSync(file('approvals.json'))) {
    writeJSON('approvals.json', []);
  }
  if (!fs.existsSync(file('mode.json'))) {
    writeJSON('mode.json', { mode: 'manual', changedAt: new Date().toISOString(), changedBy: 'seed' });
  }
}
ensureSeed();
migrateTwinId();

// ------------------------------------------------------------- autonomy mode
// manual = every approval waits for the operator.
// semi   = low-risk approvals auto-approve; med/high wait.
// full   = low + med auto-approve; only high-risk waits for the operator.
const MODES = ['manual', 'semi', 'full'];
function getMode() { return (readJSON('mode.json', { mode: 'manual' }).mode) || 'manual'; }
function setMode(mode, by) {
  if (!MODES.includes(mode)) throw new Error('mode must be one of: ' + MODES.join(', '));
  const rec = { mode, changedAt: new Date().toISOString(), changedBy: by || 'operator' };
  writeJSON('mode.json', rec);
  bus.emit('event', { type: 'mode', mode, changedBy: rec.changedBy });
  return rec;
}

// ---------------------------------------------------------------- chat
function getChannel(channel) {
  const data = readJSON('chat.json', { channels: {} });
  return data.channels[channel] || [];
}

// ---------------------------------------------------------------- LOOP GUARD
// Hard backstop against bot-to-bot infinite loops, enforced at the single
// write path so NO bridge bug can defeat it. Two independent limits:
//   1. Per-agent rate cap   — an agent may post at most LOOP_MAX_AGENT
//      messages to one channel per LOOP_WINDOW_MS.
//   2. Channel agent-burst   — all agents combined may post at most
//      LOOP_MAX_CHANNEL agent-role messages per channel per window.
// Operator (Lew) and system messages are never rate-limited. When a cap trips
// the post is rejected (429 at the API), a single 'loopguard' event fires, and
// one system notice is posted so it's visible on the dashboard.
const LOOP_WINDOW_MS = Number(process.env.MC_LOOP_WINDOW_MS || 60000);
const LOOP_MAX_AGENT = Number(process.env.MC_LOOP_MAX_AGENT || 8);    // per agent / channel / window
const LOOP_MAX_CHANNEL = Number(process.env.MC_LOOP_MAX_CHANNEL || 20); // all agents / channel / window
const _postLog = [];           // {channel, from, ts} for agent-role posts
const _tripped = {};           // channel -> last trip ts (debounce the notice)

function _prune(now) { while (_postLog.length && now - _postLog[0].ts > LOOP_WINDOW_MS) _postLog.shift(); }

// Returns { ok:true } or { ok:false, reason } — call BEFORE accepting an agent post.
function loopGuardCheck(channel, from) {
  const now = Date.now(); _prune(now);
  const inCh = _postLog.filter(e => e.channel === channel);
  if (inCh.length >= LOOP_MAX_CHANNEL) return { ok: false, reason: 'channel burst cap (' + LOOP_MAX_CHANNEL + '/' + (LOOP_WINDOW_MS / 1000) + 's)' };
  if (inCh.filter(e => e.from === from).length >= LOOP_MAX_AGENT) return { ok: false, reason: 'agent rate cap (' + LOOP_MAX_AGENT + '/' + (LOOP_WINDOW_MS / 1000) + 's)' };
  return { ok: true };
}

// Record a trip + emit one visible notice per channel per window.
function loopGuardTrip(channel, from, reason) {
  const now = Date.now();
  bus.emit('event', { type: 'loopguard', channel, from, reason, ts: new Date().toISOString() });
  if (!_tripped[channel] || now - _tripped[channel] > LOOP_WINDOW_MS) {
    _tripped[channel] = now;
    try { postMessage(channel, { from: 'system', role: 'system', text: `⛔ Loop guard: paused auto-replies on this channel — ${reason}. Conversation continues; auto-replies resume next window or when Lew posts.` }, true); } catch {}
  }
}

// _internal=true skips the guard (operator/system/guard-notice posts).
function postMessage(channel, { from, role, text, hop, replyTo }, _internal = false) {
  if (!channel || !text || !String(text).trim()) {
    throw new Error('channel and non-empty text are required');
  }
  const resolvedRole = role || (from === 'lew' ? 'operator' : 'agent');
  // Loop guard applies only to agent-role posts and only via the public path.
  if (!_internal && resolvedRole === 'agent') {
    const g = loopGuardCheck(channel, from);
    if (!g.ok) { const e = new Error('loop guard: ' + g.reason); e.loopGuard = true; e.channel = channel; e.from = from; e.reason = g.reason; throw e; }
    _postLog.push({ channel, from: from || 'unknown', ts: Date.now() });
  }
  const data = readJSON('chat.json', { channels: {} });
  if (!data.channels[channel]) data.channels[channel] = [];
  const msg = {
    id: id('m'),
    channel,
    from: from || 'unknown',
    role: resolvedRole,
    text: String(text).slice(0, 8000),
    ts: new Date().toISOString(),
  };
  // conversation-depth metadata (used by bridges to cap bot-to-bot chains)
  const h = Number(hop);
  if (Number.isFinite(h) && h > 0) msg.hop = Math.min(99, Math.floor(h));
  if (replyTo && typeof replyTo === 'string') msg.replyTo = replyTo.slice(0, 64);
  data.channels[channel].push(msg);
  // keep channels from growing unbounded
  if (data.channels[channel].length > 2000) {
    data.channels[channel] = data.channels[channel].slice(-2000);
  }
  writeJSON('chat.json', data);
  bus.emit('event', { type: 'chat', channel, message: msg });
  // posting counts as a heartbeat for known agents
  if (msg.role === 'agent') touchAgent(msg.from);
  return msg;
}

// ---------------------------------------------------------------- agents
function listAgents() { return readJSON('agents.json', []); }

function updateAgent(agentId, patch) {
  const agents = readJSON('agents.json', []);
  const i = agents.findIndex(a => a.id === agentId);
  if (i === -1) throw new Error('unknown agent: ' + agentId);
  const allowed = ['status', 'statusLabel', 'task', 'model', 'connectedVia'];
  for (const k of allowed) if (k in patch) agents[i][k] = patch[k];
  agents[i].lastSeen = new Date().toISOString();
  writeJSON('agents.json', agents);
  bus.emit('event', { type: 'agent', agent: agents[i] });
  return agents[i];
}

function touchAgent(agentId) {
  const agents = readJSON('agents.json', []);
  const i = agents.findIndex(a => a.id === agentId);
  if (i === -1) return;
  agents[i].lastSeen = new Date().toISOString();
  if (agents[i].status === 'offline') { agents[i].status = 'online'; agents[i].statusLabel = 'Online'; }
  writeJSON('agents.json', agents);
  bus.emit('event', { type: 'agent', agent: agents[i] });
}

// ---------------------------------------------------------------- approvals
function listApprovals() { return readJSON('approvals.json', []); }

function addApproval({ subject, by, risk, detail }) {
  if (!subject) throw new Error('subject is required');
  const approvals = readJSON('approvals.json', []);
  const item = {
    id: id('a'),
    subject: String(subject),
    by: by || 'system',
    risk: ['low', 'med', 'high'].includes(risk) ? risk : 'low',
    detail: detail || '',
    state: 'pending',
    createdAt: new Date().toISOString(),
  };
  approvals.push(item);
  writeJSON('approvals.json', approvals);
  bus.emit('event', { type: 'approval', approval: item });
  return item;
}

function resolveApproval(approvalId, decision, decidedBy) {
  const approvals = readJSON('approvals.json', []);
  const i = approvals.findIndex(a => a.id === approvalId);
  if (i === -1) throw new Error('unknown approval: ' + approvalId);
  approvals[i].state = decision === 'approve' ? 'approved' : 'held';
  approvals[i].resolvedAt = new Date().toISOString();
  if (decidedBy) approvals[i].decidedBy = decidedBy;
  writeJSON('approvals.json', approvals);
  bus.emit('event', { type: 'approval', approval: approvals[i] });
  return approvals[i];
}

module.exports = {
  bus,
  getChannel, postMessage,
  listAgents, updateAgent, touchAgent,
  listApprovals, addApproval, resolveApproval,
  getMode, setMode,
  loopGuardCheck, loopGuardTrip,
  LOOP_LIMITS: { windowMs: LOOP_WINDOW_MS, maxAgent: LOOP_MAX_AGENT, maxChannel: LOOP_MAX_CHANNEL },
};
