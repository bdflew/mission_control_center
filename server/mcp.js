#!/usr/bin/env node
// mcp.js — Model Context Protocol server for Mission Control.
// This is how AI employees (Claude Code, Claude Desktop, any MCP client) get
// full control of the live dashboard: read orders, post replies, update their
// status, search the shared vault, and request human approvals.
//
// Zero dependencies. Speaks MCP over stdio (newline-delimited JSON-RPC 2.0).
// It is a thin client to the running backend, so every write flows through the
// same server the dashboard is watching → the UI updates live.
//
// Register it with a client by pointing at:  node server/mcp.js
// Env: MC_API (default http://127.0.0.1:8754)

const API = (process.env.MC_API || 'http://127.0.0.1:8754').replace(/\/$/, '');
const PROTOCOL_VERSION = '2024-11-05';

function log(...a) { process.stderr.write('[mc-mcp] ' + a.join(' ') + '\n'); }

async function apiGET(p) {
  const r = await fetch(API + p);
  if (!r.ok) throw new Error(`GET ${p} → ${r.status}`);
  return r.json();
}
async function apiPOST(p, body) {
  const r = await fetch(API + p, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || `POST ${p} → ${r.status}`);
  return j;
}

// ---------------------------------------------------------------- tools
const TOOLS = [
  {
    name: 'mc_status',
    description: 'Get a live snapshot of Mission Control: real vault stats, every agent\'s status, pending approvals, and which integrations are connected. Call this first to orient.',
    inputSchema: { type: 'object', properties: {} },
    run: async () => {
      const b = await apiGET('/api/bootstrap');
      return {
        vault: b.vault.ok ? { name: b.vault.vault, notes: b.vault.stats.notes, links: b.vault.stats.links, written7d: b.vault.stats.written7d, clusters: b.vault.clusters.map(c => `${c.name} (${c.count})`) } : { error: b.vault.error },
        agents: b.agents.map(a => ({ id: a.id, name: a.name, status: a.status, task: a.task, lastSeen: a.lastSeen })),
        approvals: b.approvals.filter(a => a.state === 'pending').map(a => ({ id: a.id, subject: a.subject, by: a.by, risk: a.risk })),
        connections: b.connections.map(c => `${c.name}: ${c.live ? 'LIVE' : 'not connected'}`),
      };
    },
  },
  {
    name: 'chat_read',
    description: 'Read recent messages from a team channel (the War Room or a direct agent channel). Use this to receive orders from Lew or Sage.',
    inputSchema: { type: 'object', properties: {
      channel: { type: 'string', description: 'Channel id. "warroom" (default), "announcements", or "agent:<id>" for a direct line.' },
      limit: { type: 'number', description: 'How many recent messages (default 30).' },
    } },
    run: async (a) => {
      const channel = a.channel || 'warroom';
      const d = await apiGET('/api/chat?channel=' + encodeURIComponent(channel));
      const msgs = d.messages.slice(-(a.limit || 30));
      return { channel, count: msgs.length, messages: msgs.map(m => ({ from: m.from, role: m.role, text: m.text, ts: m.ts })) };
    },
  },
  {
    name: 'chat_post',
    description: 'Post a message to a team channel as yourself. This appears live in the dashboard War Room. Use it to reply to orders, report progress, or talk to the team.',
    inputSchema: { type: 'object', properties: {
      from: { type: 'string', description: 'Your agent id: sage | kratos | faye | chloe | lew (or a persona id).' },
      text: { type: 'string', description: 'The message body.' },
      channel: { type: 'string', description: 'Channel id (default "warroom").' },
    }, required: ['from', 'text'] },
    run: async (a) => {
      const m = await apiPOST('/api/chat', { channel: a.channel || 'warroom', from: a.from, role: 'agent', text: a.text });
      return { posted: true, id: m.id, channel: m.channel };
    },
  },
  {
    name: 'agent_set_status',
    description: 'Report your live status to Mission Control so Lew can see what you are doing. Sets you online and updates your current task.',
    inputSchema: { type: 'object', properties: {
      id: { type: 'string', description: 'Your agent id.' },
      status: { type: 'string', description: 'working | idle | online | offline | approval' },
      statusLabel: { type: 'string', description: 'Short human label, e.g. "Repairing", "Building".' },
      task: { type: 'string', description: 'One-line description of what you are doing now.' },
      model: { type: 'string', description: 'The model you are running on.' },
    }, required: ['id'] },
    run: async (a) => {
      const r = await apiPOST('/api/agents/update', { ...a, connectedVia: 'mcp' });
      return { ok: true, agent: r.id, status: r.status, task: r.task };
    },
  },
  {
    name: 'vault_search',
    description: 'Search the shared Obsidian second brain by keyword (matches note titles and content excerpts). This is the team\'s shared memory.',
    inputSchema: { type: 'object', properties: {
      query: { type: 'string', description: 'Keywords to search for.' },
      limit: { type: 'number', description: 'Max results (default 12).' },
    }, required: ['query'] },
    run: async (a) => {
      const v = await apiGET('/api/vault');
      const q = a.query.toLowerCase();
      const hits = v.notes.filter(n => (n.title + ' ' + n.excerpt).toLowerCase().includes(q)).slice(0, a.limit || 12);
      return { query: a.query, count: hits.length, results: hits.map(n => ({ title: n.title, path: n.path, excerpt: n.excerpt })) };
    },
  },
  {
    name: 'vault_read_note',
    description: 'Read the full markdown content of one vault note by its path (as returned by vault_search).',
    inputSchema: { type: 'object', properties: {
      path: { type: 'string', description: 'Vault-relative path to the .md note.' },
    }, required: ['path'] },
    run: async (a) => apiGET('/api/vault/note?path=' + encodeURIComponent(a.path)),
  },
  {
    name: 'vault_write_note',
    description: 'Write a note into the shared Obsidian vault (the team second brain). Use this to log your work, decisions, and outputs so they compound in the Memory Galaxy. Path is vault-relative and must end in .md. mode "create" (default) refuses to overwrite an existing note; use "append" to add to one or "overwrite" to replace it.',
    inputSchema: { type: 'object', properties: {
      path: { type: 'string', description: 'Vault-relative path, e.g. "03_AGENTS_FIRST_BRAINS/Kratos/log.md".' },
      content: { type: 'string', description: 'Markdown content to write.' },
      mode: { type: 'string', description: 'create | append | overwrite (default create).' },
      by: { type: 'string', description: 'Your agent id (for the activity feed).' },
    }, required: ['path', 'content'] },
    run: async (a) => {
      const r = await apiPOST('/api/vault/note', { path: a.path, content: a.content, mode: a.mode || 'create', by: a.by });
      return { written: true, path: r.path, bytes: r.bytes, mode: r.mode };
    },
  },
  {
    name: 'vault_recent',
    description: 'List the most recently modified notes in the vault — what the team has been working on lately.',
    inputSchema: { type: 'object', properties: { limit: { type: 'number', description: 'How many (default 10).' } } },
    run: async (a) => {
      const v = await apiGET('/api/vault');
      return { recent: v.notes.slice(0, a.limit || 10).map(n => ({ title: n.title, path: n.path, recency: n.recency })) };
    },
  },
  {
    name: 'approval_request',
    description: 'Surface something for Lew to approve or hold. This is the human-in-the-loop gate — use it before any high-impact or outward-facing action. You CANNOT approve on Lew\'s behalf; only request.',
    inputSchema: { type: 'object', properties: {
      subject: { type: 'string', description: 'What needs approval (one line).' },
      by: { type: 'string', description: 'Your agent id.' },
      risk: { type: 'string', description: 'low | med | high' },
      detail: { type: 'string', description: 'Context Lew needs to decide.' },
    }, required: ['subject'] },
    run: async (a) => {
      const r = await apiPOST('/api/approvals', a);
      return { requested: true, id: r.id, subject: r.subject, state: r.state };
    },
  },
  {
    name: 'approval_list',
    description: 'List approvals and their state (pending / approved / held). Check whether Lew has signed off before you ship.',
    inputSchema: { type: 'object', properties: {} },
    run: async () => {
      const d = await apiGET('/api/approvals');
      return { approvals: d.approvals.map(a => ({ id: a.id, subject: a.subject, by: a.by, risk: a.risk, state: a.state })) };
    },
  },
];

const TOOL_MAP = Object.fromEntries(TOOLS.map(t => [t.name, t]));

// ---------------------------------------------------------------- JSON-RPC
function reply(id, result) { writeMsg({ jsonrpc: '2.0', id, result }); }
function replyError(id, code, message) { writeMsg({ jsonrpc: '2.0', id, error: { code, message } }); }
function writeMsg(obj) { process.stdout.write(JSON.stringify(obj) + '\n'); }

async function handle(msg) {
  const { id, method, params } = msg;
  if (method === 'initialize') {
    return reply(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: { name: 'legacy-mission-control', version: '1.0.0' },
    });
  }
  if (method === 'notifications/initialized' || method === 'initialized') return; // notification, no reply
  if (method === 'ping') return reply(id, {});
  if (method === 'tools/list') {
    return reply(id, { tools: TOOLS.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) });
  }
  if (method === 'tools/call') {
    const tool = TOOL_MAP[params && params.name];
    if (!tool) return replyError(id, -32602, 'unknown tool: ' + (params && params.name));
    try {
      const out = await tool.run(params.arguments || {});
      return reply(id, { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] });
    } catch (e) {
      return reply(id, { content: [{ type: 'text', text: 'Error: ' + e.message }], isError: true });
    }
  }
  if (typeof id !== 'undefined') return replyError(id, -32601, 'method not found: ' + method);
}

// newline-delimited JSON over stdin
let buf = '';
let inflight = 0;
let ended = false;
function maybeExit() { if (ended && inflight === 0) process.exit(0); }

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { log('bad json line'); continue; }
    inflight += 1;
    Promise.resolve(handle(msg))
      .catch(e => log('handler error: ' + e.message))
      .finally(() => { inflight -= 1; maybeExit(); });
  }
});
// Don't exit while tool calls are still in flight — drain them first.
process.stdin.on('end', () => { ended = true; maybeExit(); });
log('Mission Control MCP server ready on stdio · API ' + API);
