// live.js — the bridge that makes Mission Control LIVE.
// Loaded BEFORE app.jsx. It:
//   1. defines window.MCLive (live chat hook + helpers) synchronously
//   2. fetches /api/bootstrap and patches window.MC with REAL data
//      (vault, agents, approvals, memory pulse) — replacing the seed values
//   3. opens one Server-Sent-Events stream so chat / status / approvals update live
//   4. shows a LIVE / DEMO badge and re-renders the app when live data lands
//
// If no backend is running it degrades gracefully to DEMO mode (honest empty
// states from the seed files — never fabricated numbers).

(function () {
  const API = (window.MC_API || (location.origin && location.origin.startsWith('http') ? location.origin : 'http://127.0.0.1:8754')).replace(/\/$/, '');

  const MCLive = window.MCLive = {
    API,
    online: false,
    _es: null,
    _chatSubs: {},           // channel -> Set(cb)
    bootstrap: null,
  };

  // ---- helpers ----
  MCLive.fmtTime = (ts) => {
    try { return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }); }
    catch { return ''; }
  };
  MCLive.relTime = (ts) => {
    const ms = Date.now() - new Date(ts).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return s + 's';
    const m = Math.floor(s / 60); if (m < 60) return m + 'm';
    const h = Math.floor(m / 60); if (h < 24) return h + 'h';
    return Math.floor(h / 24) + 'd';
  };
  MCLive.agent = (id) => (window.MC.agents || []).find(a => a.id === id);

  async function get(p) { const r = await fetch(API + p); if (!r.ok) throw new Error(p + ' ' + r.status); return r.json(); }
  async function post(p, body) {
    const r = await fetch(API + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error || r.status); return j;
  }
  MCLive.get = get; MCLive.post = post;

  // ---- chat API ----
  MCLive.fetchChannel = (channel) => get('/api/chat?channel=' + encodeURIComponent(channel)).then(d => d.messages).catch(() => []);
  MCLive.postMessage = (channel, from, text) =>
    post('/api/chat', { channel, from, role: from === 'lew' ? 'operator' : 'agent', text }).catch(e => { console.warn('post failed', e); return null; });

  MCLive.onChat = (channel, cb) => {
    if (!MCLive._chatSubs[channel]) MCLive._chatSubs[channel] = new Set();
    MCLive._chatSubs[channel].add(cb);
    return () => { MCLive._chatSubs[channel] && MCLive._chatSubs[channel].delete(cb); };
  };

  // ---- live React hook for any channel ----
  MCLive.useChannel = function (channel) {
    const { useState, useEffect } = React;
    const [messages, setMessages] = useState([]);
    const [online, setOnline] = useState(MCLive.online);
    useEffect(() => {
      let alive = true;
      MCLive.fetchChannel(channel).then(ms => { if (alive) { setMessages(ms); setOnline(MCLive.online); } });
      const off = MCLive.onChat(channel, (msg) => setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]));
      const onState = () => setOnline(MCLive.online);
      window.addEventListener('mc:live', onState);
      return () => { alive = false; off(); window.removeEventListener('mc:live', onState); };
    }, [channel]);
    // SSE echoes posts back, so post() does not optimistically append (avoids dupes).
    const send = (from, text) => { if (text && text.trim()) MCLive.postMessage(channel, from, text.trim()); };
    return { messages, send, online };
  };

  // ---- raw event fanout (Living Office, voice, companion subscribe here) ----
  MCLive._evtSubs = new Set();
  MCLive.onEvent = (cb) => { MCLive._evtSubs.add(cb); return () => MCLive._evtSubs.delete(cb); };

  // ---- SSE ----
  function openStream() {
    try {
      const es = new EventSource(API + '/api/stream');
      MCLive._es = es;
      es.onmessage = (e) => {
        let evt; try { evt = JSON.parse(e.data); } catch { return; }
        MCLive._evtSubs.forEach(cb => { try { cb(evt); } catch {} });
        if (evt.type === 'chat') {
          const subs = MCLive._chatSubs[evt.channel];
          if (subs) subs.forEach(cb => { try { cb(evt.message); } catch {} });
        } else if (evt.type === 'agent') {
          patchAgent(evt.agent); window.dispatchEvent(new Event('mc:live'));
        } else if (evt.type === 'approval') {
          refreshApprovals().then(() => window.dispatchEvent(new Event('mc:live')));
        } else if (evt.type === 'vault') {
          refreshVault().then(() => window.dispatchEvent(new Event('mc:live')));
        }
      };
      es.onerror = () => { /* EventSource auto-reconnects */ };
    } catch (e) { console.warn('SSE unavailable', e); }
  }

  // ---- patchers: live data -> window.MC (the shape the UI already reads) ----
  function patchAgent(live) {
    const a = MCLive.agent(live.id);
    if (!a) return;
    a.status = live.status;
    a.statusLabel = live.statusLabel || (live.status === 'offline' ? 'Not connected' : live.status);
    a.task = live.task || (live.status === 'offline' ? 'Not connected — awaiting check-in' : a.task);
    if (live.model) a.model = live.model;
    a.connectedVia = live.connectedVia;
  }

  function onlineCount() { return (window.MC.agents || []).filter(a => a.status && a.status !== 'offline').length; }
  MCLive.onlineCount = onlineCount;

  function recomputeHeroMetrics() {
    const MC = window.MC;
    const agents = MC.agents || [];
    const online = onlineCount();
    const working = agents.filter(a => a.status === 'working').length;
    const pending = (MC.approvals || []).length;
    const stats = (MC.obsidian && MC.obsidian.stats) || { notes: 0 };
    MC.heroMetrics = [
      { id: 'agents', label: 'Agents Online', value: String(online), suffix: '/ ' + agents.length, glyph: 'users-round', spark: [0,0,0,0,0,0,online], tone: 'cyan', delta: online ? online + ' connected' : 'none connected' },
      { id: 'tasks', label: 'Agents Working', value: String(working), glyph: 'list-checks', spark: [0,0,0,0,0,0,working], tone: 'cyan', delta: working ? 'in progress' : 'idle' },
      { id: 'approvals', label: 'Approvals Waiting', value: String(pending), glyph: 'shield-alert', spark: [0,0,0,0,0,0,pending], tone: 'gold', delta: pending ? 'needs you' : 'queue clear', featured: true },
      { id: 'notes', label: 'Vault Notes', value: String(stats.notes || 0), glyph: 'box', spark: [0,0,0,0,0,0,Math.min(9,(stats.written7d||0))], tone: 'cyan', delta: (stats.written7d || 0) + ' this week' },
    ];
  }

  async function refreshApprovals() {
    try {
      const d = await get('/api/approvals');
      window.MC.approvals = d.approvals.filter(a => a.state === 'pending').map(a => ({
        id: a.id, subject: a.subject, by: a.by, risk: a.risk === 'med' ? 'med' : a.risk,
        age: MCLive.relTime(a.createdAt), detail: a.detail || '',
      }));
      recomputeHeroMetrics();
    } catch {}
  }
  MCLive.resolveApproval = (id, decision) => post('/api/approvals/resolve', { id, decision });

  async function refreshVault() {
    try { const v = await get('/api/vault?force=1'); patchVault(v); } catch {}
  }

  // Live integrations — each only patches window.MC when the backend reports a
  // real authorized connection with real data. Until then the de-faked
  // "Sample data · not connected" state stands. Nothing is ever fabricated.
  async function refreshGmail() {
    try {
      const g = await get('/api/gmail');
      if (!g || !g.connected || !Array.isArray(g.threads)) return;
      window.MC.gmail = { account: g.account, status: 'connected', unread: g.unread || 0, threads: g.threads };
      window.MC.gmailThread = {}; // bodies render from real snippets until full-read is wired
      window.dispatchEvent(new Event('mc:live'));
    } catch {}
  }
  async function refreshCalendar() {
    try {
      const c = await get('/api/calendar');
      if (!c || !c.connected || !Array.isArray(c.events)) return;
      window.MC.calendar = { status: 'connected', account: c.account || '', today: c.today, hours: c.hours, days: c.days, events: c.events, nowHour: c.nowHour, live: true };
      window.dispatchEvent(new Event('mc:live'));
    } catch {}
  }
  async function refreshDrive() {
    try {
      const d = await get('/api/drive');
      if (!d || !d.connected || !Array.isArray(d.files)) return;
      window.MC.drive = { status: 'connected', account: d.account || '', used: d.used, usedLabel: d.usedLabel, files: d.files };
      window.dispatchEvent(new Event('mc:live'));
    } catch {}
  }
  async function refreshNotion() {
    try {
      const n = await get('/api/notion');
      if (!n || !n.connected || !Array.isArray(n.sidebar)) return;
      window.MC.notion = { status: 'connected', workspace: n.workspace, sidebar: n.sidebar, page: n.page, pagesShared: n.pagesShared };
      window.dispatchEvent(new Event('mc:live'));
    } catch {}
  }
  MCLive.refreshGmail = refreshGmail;
  MCLive.refreshCalendar = refreshCalendar;
  MCLive.refreshDrive = refreshDrive;
  MCLive.refreshNotion = refreshNotion;

  function patchVault(v) {
    const MC = window.MC;
    if (!v || !v.ok) return;
    // Memory Galaxy — real notes + clusters
    MC.galaxyClusters = v.clusters.map(c => ({ id: c.id, name: c.name, color: c.color, cx: c.cx, cy: c.cy }));
    MC.galaxyNotes = v.notes.map(n => ({ id: n.id, cluster: n.cluster, title: n.title, recency: n.recency, links: n.links || [], excerpt: n.excerpt, path: n.path }));
    // Memory Pulse
    MC.memoryPulse = v.pulse.map(p => ({ id: p.id, title: p.title, tag: p.tag, glow: p.glow, time: p.ago, path: p.path }));
    // Obsidian page
    MC.obsidian = MC.obsidian || {};
    MC.obsidian.status = 'connected · local vault';
    MC.obsidian.vault = v.vault;
    MC.obsidian.stats = { notes: v.stats.notes, links: v.stats.links, clusters: v.stats.clusters, written7d: v.stats.written7d };
    MC.obsidian.recent = v.pulse.map((p, i) => ({ id: 'or' + i, title: p.title, tag: p.tag, ago: p.ago, by: 'vault', glow: p.glow, path: p.path }));
    // Recent Outputs — surface real recent notes (genuine outputs, not fabricated)
    MC.artifacts = v.pulse.slice(0, 6).map((p, i) => ({ id: 'ra' + i, kind: 'doc', title: p.title, summary: p.excerpt || ('Vault note · ' + (p.path || '')), by: 'vault', time: (p.ago || '').replace(' ago', '') }));
  }

  function applyBootstrap(b) {
    const MC = window.MC;
    MCLive.bootstrap = b;
    MCLive.online = !!b.live;
    if (b.vault) patchVault(b.vault);
    if (Array.isArray(b.agents)) b.agents.forEach(patchAgent);
    if (Array.isArray(b.approvals)) {
      MC.approvals = b.approvals.filter(a => a.state === 'pending').map(a => ({
        id: a.id, subject: a.subject, by: a.by, risk: a.risk, age: MCLive.relTime(a.createdAt), detail: a.detail || '',
      }));
    }
    MC.connections = b.connections || [];
    if (b.mode) MC.autonomy = b.mode; // autonomy ladder: manual | semi | full
    const liveConn = id => { const c = MC.connections.find(x => x.id === id); return c && c.live; };
    if (liveConn('gmail')) refreshGmail();
    if (liveConn('calendar')) refreshCalendar();
    if (liveConn('drive')) refreshDrive();
    if (liveConn('notion')) refreshNotion();
    recomputeHeroMetrics();
  }

  // ---- LIVE / DEMO badge ----
  function badge(text, live) {
    let el = document.getElementById('mc-live-badge');
    if (!el) {
      el = document.createElement('div');
      el.id = 'mc-live-badge';
      el.style.cssText = 'position:fixed;right:96px;bottom:12px;z-index:120;font-family:var(--font-mono,monospace);font-size:10.5px;letter-spacing:.04em;padding:6px 11px;border-radius:999px;display:flex;align-items:center;gap:7px;cursor:default;backdrop-filter:blur(8px);user-select:none;transition:opacity .3s;';
      document.body.appendChild(el);
    }
    const c = live ? '#34D399' : '#64748B';
    el.style.background = live ? 'rgba(13,32,24,0.85)' : 'rgba(20,26,38,0.85)';
    el.style.border = '1px solid ' + (live ? 'rgba(52,211,153,0.5)' : 'rgba(100,116,139,0.4)');
    el.style.color = live ? '#6EE7B7' : '#94A3B8';
    el.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:' + c + ';box-shadow:0 0 8px ' + c + (live ? ';animation:mcPulse 2s infinite' : '') + '"></span>' + text;
    companionButton();
  }

  // ---- companion dock (v3): animated avatar FAB → 3D voice widget window ----
  function companionButton() {
    if (!(window.MC && MC.features && MC.features.companion)) return;
    let dock = document.getElementById('mc-companion-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'mc-companion-dock';
      dock.className = 'companion-dock';
      const fab = document.createElement('button');
      fab.className = 'companion-fab';
      fab.title = 'Open ' + ((window.MC.twin && MC.twin.displayName) || 'the companion') + ' — voice + chat';
      fab.setAttribute('aria-label', 'Open companion widget');
      fab.innerHTML = '<span class="pulse"></span><img src="assets/avatar-headshot.png" alt=""/><span class="badge" style="display:none">0</span>';
      fab.onclick = () => window.open('companion.html', 'mcCompanion', 'width=420,height=680,resizable=yes');
      dock.appendChild(fab);
      document.body.appendChild(dock);
      // badge = live pending-approval count (real signal, not decoration)
      const sync = () => {
        const n = (window.MC.approvals || []).length;
        const el = fab.querySelector('.badge');
        if (el) { el.textContent = String(n); el.style.display = n > 0 ? 'grid' : 'none'; }
      };
      window.addEventListener('mc:live', sync);
      MCLive.onEvent(e => { if (e.type === 'approval') setTimeout(sync, 50); });
      sync();
    }
  }

  // ---- boot ----
  async function boot() {
    try {
      const b = await get('/api/bootstrap');
      applyBootstrap(b);
      openStream();
      badge('LIVE · ' + (b.vault && b.vault.ok ? b.vault.stats.notes + ' notes' : 'no vault'), true);
      window.dispatchEvent(new Event('mc:live'));
      console.log('%cMission Control is LIVE', 'color:#34D399;font-weight:700', b.vault && b.vault.stats);
    } catch (e) {
      MCLive.online = false;
      badge('DEMO · backend offline', false);
      console.warn('Mission Control backend not reachable — DEMO mode. Run: npm start', e);
    }
  }

  // keyframes for the pulsing badge dot
  const st = document.createElement('style');
  st.textContent = '@keyframes mcPulse{0%,100%{opacity:1}50%{opacity:.4}}';
  document.head.appendChild(st);

  // ---- de-fake: neutralize fabricated seed values up front, in BOTH live and
  // demo mode, so nothing fake is ever shown. Live data then overrides the
  // genuinely-connected surfaces (vault, agents, chat, approvals).
  function defake() {
    const MC = window.MC; if (!MC) return;
    (MC.agents || []).forEach(a => {
      a.status = 'offline'; a.statusLabel = 'Not connected';
      a.task = 'Not connected — awaiting check-in';
      a.uptime = '—'; a.tokens = '—'; a.spend = '—'; a.tasksToday = 0;
    });
    // OAuth / billing surfaces are NOT connected — label honestly, drop fabricated content
    const sample = 'Sample data · not connected';
    if (MC.gmail) { MC.gmail.status = sample; MC.gmail.unread = 0; }
    if (MC.calendar) MC.calendar.status = sample;
    if (MC.drive) MC.drive.status = sample;
    if (MC.notion) MC.notion.status = sample;
    if (MC.studio) MC.studio.status = sample;
    if (MC.hermes) MC.hermes.status = sample;
    // fabricated feeds → empty until a real source fills them
    MC.warRoomSeed = [];
    MC.approvals = MC.approvals || [];
    MC.dreaming = [];
  }
  defake();

  // run after window.MC exists (data.jsx already ran before this script)
  if (window.MC) boot(); else window.addEventListener('DOMContentLoaded', boot);
})();
