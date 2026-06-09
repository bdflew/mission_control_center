// home.jsx — Mission Control home (bento grid)
const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

function HeroStrip() {
  const op = window.MC.operator;
  const h = new Date().getHours();
  const tod = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  const agents = window.MC.agents || [];
  const online = window.MCLive ? window.MCLive.onlineCount() : 0;
  const working = agents.filter(a => a.status === 'working').length;
  const approvals = (window.MC.approvals || []).length;
  const live = !!(window.MCLive && window.MCLive.online);
  const notes = (window.MC.obsidian && window.MC.obsidian.stats) ? window.MC.obsidian.stats.notes : 0;
  return React.createElement('div', { className: 'mc-hero fade-up' },
    React.createElement('div', null,
      React.createElement('div', { className: 'mc-hero__greet' }, `Good ${tod}, `, React.createElement('span', { className: 'accent' }, op.name + '.')),
      React.createElement('p', { className: 'mc-hero__sum' },
        online > 0
          ? [React.createElement('b', { key: 'o' }, online + ' of ' + agents.length + ' agents online'), ', ', React.createElement('b', { key: 'w' }, working + ' working'), ', and ', React.createElement('b', { key: 'a' }, approvals + ' approval' + (approvals === 1 ? '' : 's')), ' waiting on your sign-off.']
          : 'Your command center is wired to the live backend and your vault. No agents have reported in yet — connect them via MCP or CLI (see the handoff) and their live status appears here.')),
    React.createElement('div', { className: 'mc-hero__meta' },
      React.createElement('span', { className: 'mc-chip ' + (live ? 'good' : '') }, React.createElement('span', { className: 'dot' }), live ? 'LIVE · VAULT CONNECTED' : 'DEMO · BACKEND OFFLINE'),
      React.createElement('span', { className: 'mc-chip cyan' }, React.createElement('span', { className: 'dot' }), notes + ' NOTES IN VAULT')),
  );
}

function MetricCards() {
  return React.createElement('div', { className: 'mc-metrics' },
    ...window.MC.heroMetrics.map((m, i) => {
      const gold = m.tone === 'gold';
      const color = gold ? '#E8C766' : '#23D6F5';
      return React.createElement('div', { key: m.id, className: `mc-metric${m.featured ? ' is-featured' : ''} fade-up` },
        React.createElement('div', { className: 'mc-metric__top' },
          React.createElement('div', { className: 'mc-metric__ico' + (gold ? ' gold' : '') }, React.createElement(Icon, { name: m.glyph, size: 15 })),
          React.createElement('div', { className: 'mc-metric__label' }, m.label)),
        React.createElement('div', { className: 'mc-metric__val' }, m.value, m.suffix && React.createElement('span', { className: 'sfx' }, m.suffix)),
        React.createElement('div', { className: 'mc-metric__foot' },
          React.createElement('span', { className: 'mc-metric__delta' + (gold ? ' gold' : '') }, m.delta),
          React.createElement(Sparkline, { data: m.spark, color })),
      );
    }),
  );
}

// ---- Agent grid (two variants via tweak) ----
function AgentGrid({ variant, onNav }) {
  const A = window.MC.agents;
  if (variant === 'roster') {
    return React.createElement('div', { className: 'mc-panel fade-up' },
      React.createElement('div', { className: 'mc-phead' },
        React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'cpu', size: 15 })), 'Agent Roster'),
        React.createElement('span', { className: 'mc-chip ' + (window.MCLive && window.MCLive.onlineCount() ? 'good' : '') }, React.createElement('span', { className: 'dot' }), (window.MCLive ? window.MCLive.onlineCount() : 0) + ' ONLINE')),
      React.createElement('div', { className: 'mc-roster' },
        ...A.map(a => React.createElement('button', { key: a.id, className: 'mc-roster__row', style: { '--ag-acc': a.accent }, onClick: () => onNav('agent:' + a.id) },
          React.createElement(AgentAv, { agent: a, size: 34 }),
          React.createElement('div', { className: 'mc-roster__id' },
            React.createElement('div', { className: 'mc-roster__name' }, a.name, ' ', React.createElement('span', { style: { fontSize: 10, color: 'var(--fg-3)', fontWeight: 400 } }, '· ' + a.role)),
            React.createElement('div', { className: 'mc-roster__task' }, a.task)),
          React.createElement('span', { className: 'mc-chip ' + a.theme }, React.createElement('span', { className: 'dot' }), a.statusLabel),
          React.createElement(Icon, { name: 'chevron-right', size: 15, style: { color: 'var(--fg-3)' } })))),
    );
  }
  return React.createElement('div', { className: 'mc-panel fade-up' },
    React.createElement('div', { className: 'mc-phead' },
      React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'cpu', size: 15 })), 'Agent Status'),
      React.createElement('span', { className: 'mc-chip ' + (window.MCLive && window.MCLive.onlineCount() ? 'good' : '') }, React.createElement('span', { className: 'dot' }), (window.MCLive ? window.MCLive.onlineCount() : 0) + ' ONLINE')),
    React.createElement('div', { className: 'mc-agents' },
      ...A.map(a => React.createElement('button', {
        key: a.id, className: 'mc-agentcard',
        style: { '--ag-acc': a.accent, '--ag-line': `color-mix(in srgb, ${a.accent} 22%, transparent)`, '--ag-glow': a.theme === 'cyan' ? 'rgba(35,214,245,0.4)' : a.theme === 'crimson' ? 'rgba(244,81,107,0.4)' : a.theme === 'emerald' ? 'rgba(52,211,153,0.4)' : 'rgba(216,167,74,0.4)', '--ag-grad': a.avatarGrad },
        onClick: () => onNav('agent:' + a.id),
      },
        React.createElement('div', { className: 'mc-agentcard__top' },
          React.createElement(AgentAv, { agent: a, size: 40 }),
          React.createElement('div', { className: 'mc-agentcard__id' },
            React.createElement('div', { className: 'mc-agentcard__name' }, a.name),
            React.createElement('div', { className: 'mc-agentcard__role' }, a.role)),
          React.createElement('span', { className: 'mc-chip ' + a.theme }, React.createElement('span', { className: 'dot' }), a.statusLabel)),
        React.createElement('div', { className: 'mc-agentcard__task' }, a.task),
        React.createElement('div', { className: 'mc-agentcard__foot' },
          React.createElement('span', { className: 'mc-modeltag' }, a.model),
          React.createElement('div', { className: 'mc-act' },
            ...[0,1,2,3,4].map(n => React.createElement('span', { key: n, style: { background: a.accent, animationDelay: (n * 0.12) + 's' } })))),
      ))),
  );
}

// ---- Active Mission ----
function MissionCard() {
  const m = window.MC.mission;
  const nextAgent = window.MC.agents.find(a => a.id === m.next.agent);
  return React.createElement('div', { className: 'mc-panel mc-panel--gold fade-up' },
    React.createElement('div', { className: 'mc-phead' },
      React.createElement('div', null,
        React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', { style: { color: 'var(--la-gold)' } }, React.createElement(Icon, { name: 'target', size: 15 })), 'Active Mission'),
        React.createElement('div', { className: 'mc-psub' }, m.phase)),
      React.createElement('span', { className: 'mc-chip gold' }, React.createElement('span', { className: 'dot' }), m.progress + '%')),
    React.createElement('div', { className: 'mc-mission__name' }, m.name),
    React.createElement('div', { className: 'mc-mission__meter' }, React.createElement('div', { className: 'mc-mission__fill', style: { width: m.progress + '%' } })),
    React.createElement('div', { className: 'mc-mission__steps' },
      ...m.steps.map((s, i) => React.createElement('div', { key: i, className: 'mc-step' + (s.done ? ' done' : '') + (s.active ? ' active' : '') },
        React.createElement('span', { className: 'mc-step__bullet' }, s.done && React.createElement(Icon, { name: 'check', size: 10 })),
        s.t))),
    React.createElement('div', { className: 'mc-next' },
      React.createElement('div', { className: 'mc-next__ico' }, React.createElement(Icon, { name: 'corner-down-right', size: 15 })),
      React.createElement('div', { className: 'mc-next__txt' }, 'Next: ', React.createElement('b', null, m.next.text))),
  );
}

// ---- Approvals queue (interactive) ----
function ApprovalsQueue() {
  const [items, setItems] = useStateH(() => window.MC.approvals || []);
  const [flash, setFlash] = useStateH(null);
  // keep in sync with live approvals (live.js reassigns MC.approvals on SSE events)
  useEffectH(() => { setItems(window.MC.approvals || []); }, [window.MC.approvals]);
  const resolve = (id, ok) => {
    setFlash({ id, ok });
    if (window.MCLive && window.MCLive.online) window.MCLive.resolveApproval(id, ok ? 'approve' : 'hold');
    setTimeout(() => { setItems(p => p.filter(x => x.id !== id)); setFlash(null); }, 360);
  };
  const riskChip = { low: 'good', med: 'gold', high: 'crimson' };
  return React.createElement('div', { className: 'mc-panel fade-up' },
    React.createElement('div', { className: 'mc-phead' },
      React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', { style: { color: 'var(--la-gold)' } }, React.createElement(Icon, { name: 'shield-check', size: 15 })), 'Approvals'),
      items.length > 0 && React.createElement('span', { className: 'mc-chip gold' }, React.createElement('span', { className: 'dot' }), items.length + ' WAITING')),
    items.length === 0
      ? React.createElement('div', { className: 'mc-approve__done' }, React.createElement(Icon, { name: 'check-circle', size: 26 }), React.createElement('div', null, 'Queue clear. Nothing waiting on you.'))
      : React.createElement('div', { className: 'mc-approve' },
        ...items.map(a => {
          const by = window.MC.agents.find(x => x.id === a.by) || { name: a.by || 'system', avatarGrad: 'linear-gradient(145deg,#475569,#94A3B8)' };
          const f = flash && flash.id === a.id;
          return React.createElement('div', { key: a.id, className: 'mc-approve__row', style: f ? { opacity: 0, transform: 'translateX(' + (flash.ok ? '' : '-') + '12px)' } : null },
            React.createElement('div', { className: 'mc-approve__top' },
              React.createElement('div', { className: 'mc-approve__subj' }, a.subject),
              React.createElement('span', { className: 'mc-chip ' + riskChip[a.risk] }, React.createElement('span', { className: 'dot' }), a.risk + ' risk')),
            React.createElement('div', { className: 'mc-approve__detail' }, a.detail),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 } },
              React.createElement('div', { className: 'mc-approve__by' },
                React.createElement('div', { className: 'av', style: { background: by.avatarGrad } }, by.name[0]),
                by.name, ' · ', a.age),
              React.createElement('div', { className: 'mc-approve__act' },
                React.createElement(Btn, { variant: 'gold', size: 'sm', icon: 'check', onClick: () => resolve(a.id, true) }, 'Approve'),
                React.createElement(Btn, { variant: 'quiet', size: 'sm', icon: 'pause', onClick: () => resolve(a.id, false) }, 'Hold'))));
        })),
  );
}

// ---- Dreaming brief ----
function DreamingBrief() {
  const [items, setItems] = useStateH(window.MC.dreaming);
  return React.createElement('div', { className: 'mc-panel fade-up' },
    React.createElement('div', { className: 'mc-phead' },
      React.createElement('div', null,
        React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'moon-star', size: 15 })), 'Dreaming Brief'),
        React.createElement('div', { className: 'mc-psub' }, 'Overnight · surfaced while you slept')),
      React.createElement('span', { className: 'mono', style: { fontSize: 10, color: 'var(--fg-3)' } }, '03:14')),
    items.length === 0
      ? React.createElement('div', { className: 'mc-approve__done' }, React.createElement(Icon, { name: 'check-circle', size: 26 }), React.createElement('div', null, 'Brief cleared. Sweet dreams.'))
      : React.createElement('div', { className: 'mc-dream' },
        ...items.map(d => React.createElement('div', { key: d.id, className: 'mc-dream__row' },
          React.createElement('div', { className: 'mc-dream__ico ' + d.tone }, React.createElement(Icon, { name: d.glyph, size: 14 })),
          React.createElement('div', { className: 'mc-dream__body' },
            React.createElement('div', { className: 'mc-dream__txt' }, d.text),
            React.createElement('div', { className: 'mc-dream__time' }, d.time + ' · suggestion')),
          React.createElement('button', { className: 'mc-dream__x', onClick: () => setItems(p => p.filter(x => x.id !== d.id)), 'aria-label': 'Dismiss' }, React.createElement(Icon, { name: 'x', size: 13 }))))),
  );
}

// ---- Memory pulse ----
function MemoryPulse({ onNav }) {
  return React.createElement('div', { className: 'mc-panel fade-up' },
    React.createElement('div', { className: 'mc-phead' },
      React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'orbit', size: 15 })), 'Memory Pulse'),
      React.createElement('button', { className: 'mc-link', onClick: () => onNav('galaxy') }, 'Open Galaxy', React.createElement(Icon, { name: 'arrow-right', size: 13 }))),
    React.createElement('div', { className: 'mc-mempulse' },
      ...window.MC.memoryPulse.map(m => React.createElement('button', { key: m.id, className: 'mc-mem__row', onClick: () => onNav('galaxy'), style: { all: 'unset', cursor: 'pointer', display: 'flex' } },
        React.createElement('span', { className: 'mc-mem__star', style: { background: `rgba(35,214,245,${0.3 + m.glow * 0.7})`, boxShadow: `0 0 ${4 + m.glow * 10}px rgba(35,214,245,${m.glow})` } }),
        React.createElement('div', { className: 'mc-mem__id' },
          React.createElement('div', { className: 'mc-mem__title' }, m.title),
          React.createElement('span', { className: 'mc-mem__tag' }, '#' + m.tag)),
        React.createElement('span', { className: 'mc-mem__time' }, m.time)))),
  );
}

// ---- Recent artifacts ----
const KIND_GLYPH = { html: 'code', doc: 'file-text', code: 'terminal', image: 'image', video: 'video' };
function Artifacts() {
  const [filter, setFilter] = useStateH('all');
  const [items, setItems] = useStateH(window.MC.artifacts);
  const kinds = ['all', 'doc', 'html', 'code', 'image', 'video'];
  const shown = items.filter(a => filter === 'all' || a.kind === filter);
  return React.createElement('div', { className: 'mc-panel fade-up' },
    React.createElement('div', { className: 'mc-phead' },
      React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'sparkles', size: 15 })), 'Recent Outputs'),
      React.createElement('div', { className: 'mc-art__filters' },
        ...kinds.map(k => React.createElement('button', { key: k, className: 'mc-art__filter' + (filter === k ? ' is-active' : ''), onClick: () => setFilter(k) }, k)))),
    React.createElement('div', { className: 'mc-art__grid' },
      ...shown.map(a => {
        const by = window.MC.agents.find(x => x.id === a.by) || window.MC.personas.find(x => x.id === a.by) || { name: a.by, avatarGrad: 'linear-gradient(145deg,#444,#888)' };
        return React.createElement('div', { key: a.id, className: 'mc-tile' },
          React.createElement('div', { className: 'mc-tile__prev k-' + a.kind },
            React.createElement('span', { className: 'mc-tile__kind' }, a.kind),
            React.createElement('span', { className: 'mc-tile__glyph' }, React.createElement(Icon, { name: KIND_GLYPH[a.kind], size: 26 })),
            React.createElement('button', { className: 'mc-tile__del', onClick: () => setItems(p => p.filter(x => x.id !== a.id)), 'aria-label': 'Delete artifact' }, React.createElement(Icon, { name: 'x', size: 13 }))),
          React.createElement('div', { className: 'mc-tile__body' },
            React.createElement('div', { className: 'mc-tile__title' }, a.title),
            React.createElement('div', { className: 'mc-tile__sum' }, a.summary),
            React.createElement('div', { className: 'mc-tile__foot' },
              React.createElement('span', null, by.name),
              React.createElement('span', null, a.time + ' ago'))));
      })),
  );
}

// ---- War room mini ----
function WarRoomMini({ onNav }) {
  const { messages, send: postMsg } = window.MCLive.useChannel('warroom');
  const [val, setVal] = useStateH('');
  const feedRef = useRefH(null);
  useEffectH(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [messages]);
  const msgs = messages.slice(-6);
  const send = () => { if (!val.trim()) return; postMsg('lew', val); setVal(''); };
  return React.createElement('div', { className: 'mc-panel fade-up', style: { display: 'flex', flexDirection: 'column' } },
    React.createElement('div', { className: 'mc-phead' },
      React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'messages-square', size: 15 })), 'War Room'),
      React.createElement('button', { className: 'mc-link', onClick: () => onNav('warroom') }, 'Full channel', React.createElement(Icon, { name: 'arrow-right', size: 13 }))),
    React.createElement('div', { className: 'mc-warmini', style: { flex: 1 } },
      React.createElement('div', { className: 'mc-warmini__feed', ref: feedRef },
        msgs.length === 0 && React.createElement('div', { style: { opacity: .7, fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--fg-3)', padding: '6px 2px' } }, 'No messages yet — this channel is live. Post here, or your team can post via MCP / CLI.'),
        ...msgs.map(mm => {
          const who = mm.from === 'lew' ? window.MC.operator : (window.MC.agents.find(x => x.id === mm.from) || { name: mm.from, accent: '#94A3B8', avatarGrad: 'linear-gradient(145deg,#475569,#94A3B8)' });
          const grad = mm.from === 'lew' ? 'linear-gradient(145deg,#A87B2E,#F3D27A)' : who.avatarGrad;
          return React.createElement('div', { key: mm.id, className: 'mc-msg' },
            React.createElement('div', { className: 'mc-msg__av', style: { background: grad } }, who.name[0]),
            React.createElement('div', { className: 'mc-msg__body' },
              React.createElement('div', { className: 'mc-msg__head' },
                React.createElement('span', { className: 'mc-msg__name', style: { color: mm.from === 'lew' ? '#F3D27A' : who.accent } }, who.name),
                React.createElement('span', { className: 'mc-msg__time' }, window.MCLive.fmtTime(mm.ts))),
              React.createElement('div', { className: 'mc-msg__txt' }, mm.text)));
        })),
      React.createElement('div', { className: 'mc-composer' },
        React.createElement('input', { value: val, onChange: e => setVal(e.target.value), onKeyDown: e => e.key === 'Enter' && send(), placeholder: 'Message your team…', 'aria-label': 'Message the war room' }),
        React.createElement('button', { className: 'mc-composer__send', onClick: send, 'aria-label': 'Send' }, React.createElement(Icon, { name: 'send', size: 15 })))),
  );
}

function MemoryLoop({ onNav }) {
  const steps = [
    { g: 'sparkles', t: 'Agents produce', d: 'builds, content, reviews' },
    { g: 'box', t: 'Write to vault', d: 'logged as linked notes' },
    { g: 'moon-star', t: 'Dream nightly', d: 'patterns + savings surface' },
    { g: 'trending-up', t: 'Improve', d: 'the loop compounds' },
  ];
  return React.createElement('div', { className: 'mc-panel fade-up' },
    React.createElement('div', { className: 'mc-phead' },
      React.createElement('div', null,
        React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'trending-up', size: 15 })), 'Self-Improving Loop'),
        React.createElement('div', { className: 'mc-psub' }, 'Layer 7 · the compounding engine')),
      React.createElement('button', { className: 'mc-link', onClick: () => onNav('dreaming') }, 'Dreaming', React.createElement(Icon, { name: 'arrow-right', size: 13 }))),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
      ...steps.map((s, i) => React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 11 } },
        React.createElement('div', { style: { width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'rgba(35,214,245,0.1)', border: '1px solid rgba(35,214,245,0.26)', color: 'var(--la-cyan)', flexShrink: 0 } }, React.createElement(Icon, { name: s.g, size: 14 })),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('div', { style: { fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' } }, s.t),
          React.createElement('div', { style: { fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' } }, s.d)),
        i < steps.length - 1 && React.createElement(Icon, { name: 'arrow-right', size: 12, style: { color: 'var(--fg-3)', transform: 'rotate(90deg)', opacity: .5 } })))),
    React.createElement('div', { style: { marginTop: 12, padding: '9px 12px', borderRadius: 10, background: 'rgba(43,216,160,0.08)', border: '1px solid rgba(43,216,160,0.26)', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#4fe3b5', display: 'flex', alignItems: 'center', gap: 8 } },
      React.createElement('span', { className: 'pulse-dot good', style: { width: 7, height: 7 } }), ((window.MC.obsidian && window.MC.obsidian.stats ? window.MC.obsidian.stats.written7d : 0)) + ' notes written this week · system getting smarter'),
  );
}

function HomeView({ onNav, agentVariant, heroVariant }) {
  return React.createElement('div', null,
    React.createElement(HeroStrip),
    React.createElement(MetricCards),
    React.createElement('div', { className: 'mc-bento' },
      React.createElement('div', { className: 'span2' }, React.createElement(AgentGrid, { variant: agentVariant, onNav })),
      React.createElement(MissionCard),
      React.createElement(ApprovalsQueue),
      React.createElement(DreamingBrief),
      React.createElement(MemoryPulse, { onNav }),
      React.createElement(MemoryLoop, { onNav }),
      React.createElement('div', { className: 'span2' }, React.createElement(Artifacts)),
      React.createElement(WarRoomMini, { onNav }),
    ),
  );
}

window.HomeView = HomeView;
