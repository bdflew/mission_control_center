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

function postMessage(channel, { from, role, text }) {
  if (!channel || !text || !String(text).trim()) {
    throw new Error('channel and non-empty text are required');
  }
  const data = readJSON('chat.json', { channels: {} });
  if (!data.channels[channel]) data.channels[channel] = [];
  const msg = {
    id: id('m'),
    channel,
    from: from || 'unknown',
    role: role || (from === 'lew' ? 'operator' : 'agent'),
    text: String(text).slice(0, 8000),
    ts: new Date().toISOString(),
  };
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
};
