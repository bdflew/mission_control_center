#!/usr/bin/env node
/**
 * Mission Control live agent loops.
 *
 * Localhost-only bridge that keeps Legacy employee dashboard channels chattable.
 * - Watches each agent:<id> channel for operator messages.
 * - Posts agent replies on the same channel.
 * - Heartbeats each roster agent online.
 * - Does not read, print, or modify secrets.
 * - Does not perform external sends/deploys/permission changes.
 */
const fs = require('fs');
const path = require('path');

const API = (process.env.MC_API || 'http://127.0.0.1:8754').replace(/\/$/, '');
const STATE_PATH = process.env.MC_LIVE_LOOP_STATE || path.join(__dirname, 'state', 'live-agent-loop-state.json');
const POLL_MS = Number(process.env.MC_LIVE_LOOP_POLL_MS || 1200);
const HEARTBEAT_MS = Number(process.env.MC_LIVE_LOOP_HEARTBEAT_MS || 30000);

const AGENTS = [
  {
    id: 'sage',
    name: 'Sage',
    role: 'COO · Command Router',
    model: 'sage-live-ops-bridge',
    lane: 'operations, routing, approvals, coordination, briefs, and protecting Lew’s time',
    tone: 'direct, strategic, proof-before-claims, approval-aware',
  },
  // kratos intentionally NOT here — the REAL Kratos answers on agent:kratos
  // + warroom via bridges/kratos-bridge.js (Claude Code CLI). Keeping him in
  // this templated loop would double-reply on his channel.
  {
    id: 'faye',
    name: 'Faye',
    role: 'Lead Builder · Antigravity',
    model: 'faye-live-builder-bridge',
    lane: 'build execution, UX, product flow, interface polish, and implementation handoffs',
    tone: 'builder-focused, visual, practical, product-minded',
  },
  {
    id: 'chloe',
    name: 'Chloe',
    role: 'Positioning · Brand',
    model: 'chloe-live-brand-bridge',
    lane: 'brand voice, offers, messaging, content, customer perception, and conversion angles',
    tone: 'clear, persuasive, market-aware, human',
  },
  {
    id: 'legacylew',
    name: 'Legacy Lew',
    role: 'Founder · Digital Twin',
    model: 'legacy-lew-live-fallback-bridge',
    lane: 'founder mirror, strategic recall, decision framing, and Legacy Automations context',
    tone: 'founder-minded, decisive, strategic, direct',
  },
];

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { lastSeen: {}, repliedTo: {} }; }
}
function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  const tmp = STATE_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, STATE_PATH);
}
let state = loadState();

async function request(method, endpoint, body) {
  const res = await fetch(API + endpoint, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`${method} ${endpoint} -> ${res.status}: ${json.error || text}`);
  return json;
}
const get = endpoint => request('GET', endpoint);
const post = (endpoint, body) => request('POST', endpoint, body);

function clean(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, 700);
}
function looksLikeAction(text) {
  return /\b(send|delete|remove|deploy|publish|spend|buy|rotate|change password|expose|bind|0\.0\.0\.0|autonomous|launch|start|run|edit|write|merge|commit|push)\b/i.test(text);
}
function wantsStatus(text) {
  return /\b(status|live|online|connected|heartbeat|are you there|ping|check in)\b/i.test(text);
}
function wantsHelp(text) {
  return /\b(help|what can you do|commands|how do i use|lane|role)\b/i.test(text);
}

function agentReply(agent, msg, recent) {
  const text = clean(msg.text);
  const opener = `${agent.name} live on \`agent:${agent.id}\`.`;
  if (wantsStatus(text)) {
    return `${opener}\n\nStatus: 🟢 online and watching this dashboard chat box.\nLane: ${agent.lane}.\nBoundary: I can answer and prepare work here; high-impact actions still require approval/proof.`;
  }
  if (wantsHelp(text)) {
    return `${opener}\n\nUse this box for my lane: ${agent.lane}.\n\nBest prompts:\n- “Give me your status.”\n- “What should I do next on <project>?”\n- “Review this idea from your lane: …”\n- “Prepare a handoff / QA checklist / message / offer angle.”\n\nI will keep answers ${agent.tone}.`;
  }
  if (looksLikeAction(text)) {
    return `${opener}\n\nI heard the action request: “${text}”\n\nApproval gate: I can help frame/prepare it here, but I will not claim I executed high-impact work from the dashboard bridge without a verified tool/process handoff. If you want execution, route it through Sage/Hermes with approval so there is a proof trail.`;
  }
  const contextLine = recent.length > 1 ? `\n\nContext: I can see the latest ${Math.min(recent.length, 6)} messages in this channel and will keep continuity inside this chat box.` : '';
  return `${opener}\n\nI received: “${text || '(blank)'}”\n\nMy lane read: ${agent.lane}. Give me the specific decision, file, offer, bug, or handoff you want me to work through and I’ll respond from that role.${contextLine}`;
}

async function heartbeat(agent) {
  await post('/api/agents/update', {
    id: agent.id,
    status: 'online',
    statusLabel: 'Live loop online',
    task: `Watching agent:${agent.id} for Lew dashboard chat`,
    model: agent.model,
    connectedVia: 'api',
  });
}

async function bootstrap() {
  const health = await get('/api/health');
  if (!health.ok) throw new Error('Mission Control health check failed');
  for (const agent of AGENTS) await heartbeat(agent);
  for (const agent of AGENTS) {
    const channel = `agent:${agent.id}`;
    const data = await get('/api/chat?channel=' + encodeURIComponent(channel));
    const last = (data.messages || []).slice(-1)[0];
    // Start at current tail to avoid replying to old history after launch.
    if (!state.lastSeen[channel] && last) state.lastSeen[channel] = last.id;
  }
  saveState(state);
  console.log(`LIVE_AGENT_LOOPS_READY ${new Date().toISOString()} api=${API} agents=${AGENTS.map(a => a.id).join(',')}`);
}

async function tickAgent(agent) {
  const channel = `agent:${agent.id}`;
  const data = await get('/api/chat?channel=' + encodeURIComponent(channel));
  const messages = data.messages || [];
  const lastSeen = state.lastSeen[channel];
  let start = 0;
  if (lastSeen) {
    const i = messages.findIndex(m => m.id === lastSeen);
    start = i >= 0 ? i + 1 : Math.max(0, messages.length - 20);
  }
  const fresh = messages.slice(start);
  for (const msg of fresh) {
    state.lastSeen[channel] = msg.id;
    if (msg.role === 'operator' && !state.repliedTo[msg.id]) {
      const recent = messages.slice(Math.max(0, messages.indexOf(msg) - 5), messages.indexOf(msg) + 1);
      const reply = agentReply(agent, msg, recent);
      await post('/api/chat', { channel, from: agent.id, role: 'agent', text: reply });
      state.repliedTo[msg.id] = true;
      console.log(`[${new Date().toISOString()}] replied ${agent.id} -> ${channel} for ${msg.id}`);
    }
  }
  saveState(state);
}

let lastHeartbeat = 0;
async function mainLoop() {
  const now = Date.now();
  if (now - lastHeartbeat > HEARTBEAT_MS) {
    for (const agent of AGENTS) {
      try { await heartbeat(agent); } catch (e) { console.error(`[heartbeat:${agent.id}] ${e.message}`); }
    }
    lastHeartbeat = now;
  }
  for (const agent of AGENTS) {
    try { await tickAgent(agent); } catch (e) { console.error(`[tick:${agent.id}] ${e.message}`); }
  }
}

let stopping = false;
async function run() {
  while (!stopping) {
    try { await mainLoop(); } catch (e) { console.error(`[loop] ${e.message}`); }
    await new Promise(r => setTimeout(r, POLL_MS));
  }
}
process.on('SIGINT', () => { stopping = true; console.log('live agent loops stopping SIGINT'); });
process.on('SIGTERM', () => { stopping = true; console.log('live agent loops stopping SIGTERM'); });

async function once() {
  await mainLoop();
  console.log(`LIVE_AGENT_LOOPS_ONCE_OK ${new Date().toISOString()} api=${API}`);
}

bootstrap()
  .then(() => process.env.MC_LIVE_LOOP_ONCE === '1' ? once() : run())
  .catch(err => {
    console.error('LIVE_AGENT_LOOPS_FAILED', err.message);
    process.exit(1);
  });
