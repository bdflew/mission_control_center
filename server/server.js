#!/usr/bin/env node
// server.js — Legacy Automations Mission Control · live backend.
// Zero dependencies. Serves the dashboard, reads the Obsidian vault, and runs a
// live chat / approvals / agent-status store with Server-Sent Events.
// Localhost only by default. No secrets are stored or logged.
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const config = require('./config');
const store = require('./store');
const vault = require('./vault');
const google = require('./google');
const notionApi = require('./notion');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.map': 'application/json',
};

function send(res, code, body, headers = {}) {
  res.writeHead(code, { 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}
function sendJSON(res, code, obj) {
  send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' });
}
function readBody(req, limit = 1e6) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > limit) { reject(new Error('body too large')); req.destroy(); } });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('invalid JSON')); } });
    req.on('error', reject);
  });
}

// --- connections: real status of each external integration. Honest by default:
// nothing claims "connected" unless an env var / token is actually present.
function connections() {
  const has = n => Boolean(process.env[n] && process.env[n].trim());
  return [
    { id: 'obsidian',  name: 'Obsidian Vault', method: 'Local FS', live: fs.existsSync(config.vaultDir) },
    // "live" means the data path is implemented AND authorized — never just "a key exists".
    { id: 'gmail',     name: 'Gmail',          method: 'OAuth',    live: google.hasToken() },
    { id: 'calendar',  name: 'Google Calendar',method: 'OAuth',    live: google.hasToken() },
    { id: 'drive',     name: 'Google Drive',   method: 'OAuth',    live: google.hasToken() },
    { id: 'notion',    name: 'Notion',         method: 'API token',live: notionApi.hasToken() },
    // No data surface implemented for these yet — keyPresent is reported honestly,
    // but they are NOT claimed live until a real fetch exists.
    { id: 'anthropic', name: 'Claude API',     method: 'API key',  live: false, keyPresent: has('ANTHROPIC_API_KEY') },
    { id: 'billing',   name: 'AI Spend / Billing', method: 'API',  live: false, keyPresent: has('OPENROUTER_API_KEY') || has('ANTHROPIC_ADMIN_KEY') },
  ];
}

const SSE = new Set();
store.bus.on('event', evt => {
  const line = `data: ${JSON.stringify(evt)}\n\n`;
  for (const res of SSE) { try { res.write(line); } catch {} }
});

// Integration responses are cached briefly so dashboard refreshes don't hammer APIs.
const integCache = {};
async function cached(key, ttlMs, force, fetcher, res) {
  try {
    const c = integCache[key];
    if (!force && c && Date.now() - c.at < ttlMs) return sendJSON(res, 200, c.data);
    const data = await fetcher();
    if (data && data.connected) integCache[key] = { at: Date.now(), data };
    sendJSON(res, 200, data);
  } catch (e) { sendJSON(res, 502, { connected: true, error: e.message }); }
}

const api = {
  'GET /api/health': (req, res) => sendJSON(res, 200, { ok: true, ts: new Date().toISOString() }),

  'GET /api/bootstrap': (req, res) => {
    const v = vault.getVault();
    sendJSON(res, 200, {
      live: true,
      generatedAt: new Date().toISOString(),
      vault: v,
      agents: store.listAgents(),
      approvals: store.listApprovals(),
      connections: connections(),
    });
  },

  'GET /api/vault': (req, res) => sendJSON(res, 200, vault.getVault(req._q.force === '1')),

  'GET /api/vault/note': (req, res) => {
    try { sendJSON(res, 200, vault.readNote(req._q.path || '')); }
    catch (e) { sendJSON(res, 400, { error: e.message }); }
  },

  'POST /api/vault/note': async (req, res) => {
    try {
      const b = await readBody(req, 6e5);
      const r = vault.writeNote(b.path, b.content, b.mode || 'create');
      store.bus.emit('event', { type: 'vault', note: r, by: b.by || 'agent' });
      sendJSON(res, 200, { ok: true, ...r });
    } catch (e) { sendJSON(res, 400, { error: e.message }); }
  },

  // Live integrations (all read-only). Honest: each returns { connected:false }
  // until its credential exists — `npm run google-auth` for the Google three,
  // NOTION_TOKEN in the environment for Notion.
  'GET /api/gmail': (req, res) =>
    cached('gmail', 60000, req._q.force === '1', () => google.gmail(Math.min(25, parseInt(req._q.max || '10', 10) || 10)), res),
  'GET /api/calendar': (req, res) =>
    cached('calendar', 120000, req._q.force === '1', () => google.calendar(4), res),
  'GET /api/drive': (req, res) =>
    cached('drive', 120000, req._q.force === '1', () => google.drive(12), res),
  'GET /api/notion': (req, res) =>
    cached('notion', 120000, req._q.force === '1', () => notionApi.notion(), res),

  'GET /api/chat': (req, res) => {
    const channel = req._q.channel || 'warroom';
    sendJSON(res, 200, { channel, messages: store.getChannel(channel) });
  },

  'POST /api/chat': async (req, res) => {
    try {
      const b = await readBody(req);
      sendJSON(res, 200, store.postMessage(b.channel || 'warroom', b));
    } catch (e) { sendJSON(res, 400, { error: e.message }); }
  },

  'GET /api/agents': (req, res) => sendJSON(res, 200, { agents: store.listAgents() }),

  'POST /api/agents/update': async (req, res) => {
    try {
      const b = await readBody(req);
      sendJSON(res, 200, store.updateAgent(b.id, b));
    } catch (e) { sendJSON(res, 400, { error: e.message }); }
  },

  'GET /api/approvals': (req, res) => sendJSON(res, 200, { approvals: store.listApprovals() }),

  'POST /api/approvals': async (req, res) => {
    try { const b = await readBody(req); sendJSON(res, 200, store.addApproval(b)); }
    catch (e) { sendJSON(res, 400, { error: e.message }); }
  },

  'POST /api/approvals/resolve': async (req, res) => {
    try { const b = await readBody(req); sendJSON(res, 200, store.resolveApproval(b.id, b.decision)); }
    catch (e) { sendJSON(res, 400, { error: e.message }); }
  },

  'GET /api/stream': (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store',
      'Connection': 'keep-alive', 'X-Accel-Buffering': 'no',
    });
    res.write('retry: 3000\n\n');
    res.write(`data: ${JSON.stringify({ type: 'hello', ts: new Date().toISOString() })}\n\n`);
    SSE.add(res);
    const ka = setInterval(() => { try { res.write(': keep-alive\n\n'); } catch {} }, 20000);
    req.on('close', () => { clearInterval(ka); SSE.delete(res); });
  },
};

// ---- static file serving (path-traversal guarded) ----
function serveStatic(req, res, pathname) {
  const root = path.resolve(config.webRoot);
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  const target = path.resolve(root, '.' + rel);
  if (target !== root && !target.startsWith(root + path.sep)) return send(res, 403, 'forbidden');
  fs.stat(target, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'not found');
    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(target).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  // CORS for localhost dev (dashboard is normally same-origin, so this is belt-and-suspenders)
  const origin = req.headers.origin || '';
  if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return send(res, 204, '');

  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  req._q = parsed.query;

  if (pathname.startsWith('/api/')) {
    const handler = api[`${req.method} ${pathname}`];
    if (handler) return handler(req, res);
    return sendJSON(res, 404, { error: 'no such endpoint: ' + req.method + ' ' + pathname });
  }
  serveStatic(req, res, pathname);
});

server.listen(config.port, config.host, () => {
  const v = vault.getVault();
  const banner = [
    '',
    '  ┌─ Legacy Automations · Mission Control (LIVE) ───────────────',
    `  │  Dashboard   http://${config.host}:${config.port}/`,
    `  │  API         http://${config.host}:${config.port}/api/bootstrap`,
    `  │  Vault       ${config.vaultDir}`,
    `  │  Notes read  ${v.ok ? v.stats.notes + ' markdown notes, ' + v.stats.links + ' links' : 'VAULT NOT FOUND'}`,
    `  │  State       ${config.stateDir}`,
    '  └──────────────────────────────────────────────────────────────',
    '',
  ].join('\n');
  console.log(banner);
});
