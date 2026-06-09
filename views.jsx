// views.jsx — AgentPage, WarRoom, Connectors, CommandPalette, Pantheon, Placeholder
const { useState: useS, useEffect: useE, useRef: useR } = React;

// ============ AGENT DETAIL ============
const AGENT_SEED_CHAT = {
  sage: [
    { me: false, t: 'Morning, Lew. I’ve routed the overnight queue — 3 approvals are stacked for you, P1 repair is on Kratos.' },
    { me: true, t: 'Good. Anything blocking the build?' },
    { me: false, t: 'Only the Q3 page waiting on your sign-off. Everything else is moving. Want me to escalate it?' },
  ],
  kratos: [
    { me: false, t: 'P1 ChatRoom race reproduced. Two writers hitting war_room storage at once — classic collision. Fix + test landing by noon.' },
    { me: true, t: 'Make sure the markdown allow-list ships too.' },
    { me: false, t: 'Already in this pass. https / mailto / obsidian only. javascript: is blocked. I’ll prove it with a test.' },
  ],
  faye: [
    { me: false, t: 'Galaxy view is at 78%. Orbit and zoom feel great. I want Kratos to review before I wire the note panel.' },
    { me: true, t: 'Ship it behind a flag on staging first.' },
    { me: false, t: 'On it — staging deploy is in your approvals queue. One tap and it’s live for testing.' },
  ],
  chloe: [
    { me: false, t: 'Q3 page is drafted: “From Chaos to Control.” Every line ties to an outcome — leads recovered, time saved, control.' },
    { me: true, t: 'Love the angle. Tighten the hero to 5 words.' },
    { me: false, t: 'Done — “Stop Losing Leads. Start Scaling.” Pushed for your approval.' },
  ],
};

function AgentPage({ id, onNav }) {
  const a = window.MC.agents.find(x => x.id === id);
  const [tab, setTab] = useS('overview');
  if (!a) return null;
  const cust = (window.MC.agentCustom || {})[a.id];
  const tabs = [
    { id: 'overview', label: 'Overview', glyph: 'layout-dashboard' },
    ...(cust ? [{ id: 'role', label: cust.tab, glyph: cust.glyph }] : []),
    { id: 'goals', label: 'Goals', glyph: 'flag' },
    { id: 'health', label: 'Health', glyph: 'heart-pulse' },
    { id: 'chat', label: 'Chat', glyph: 'message-square' },
    { id: 'improve', label: 'Improvements', glyph: 'trending-up' },
    { id: 'brain', label: '2nd Brain', glyph: 'box' },
  ];
  return React.createElement('div', { className: 'mc-agent theme-' + a.theme, key: a.id },
    // hero
    React.createElement('div', { className: 'mc-agent__hero fade-up' },
      React.createElement('div', { className: 'mc-agent__herotop' },
        React.createElement('div', { className: 'mc-agent__av', style: { background: a.avatarGrad } }, a.name[0], React.createElement('span', { className: 'ring' })),
        React.createElement('div', { className: 'mc-agent__id' },
          React.createElement('div', { className: 'mc-agent__name' }, a.name),
          React.createElement('div', { className: 'mc-agent__role' }, a.role)),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' } },
          React.createElement('span', { className: 'mc-chip ' + a.theme }, React.createElement('span', { className: 'dot' }), a.statusLabel),
          React.createElement('span', { className: 'mc-modeltag', style: { fontSize: 11 } }, a.model))),
      React.createElement('p', { className: 'mc-agent__blurb' }, a.blurb),
      React.createElement('div', { className: 'mc-agent__stats' },
        React.createElement('div', { className: 'mc-agent__stat' }, React.createElement('div', { className: 'v' }, a.tasksToday), React.createElement('div', { className: 'l' }, 'Tasks Today')),
        React.createElement('div', { className: 'mc-agent__stat' }, React.createElement('div', { className: 'v' }, a.uptime), React.createElement('div', { className: 'l' }, 'Uptime')),
        React.createElement('div', { className: 'mc-agent__stat' }, React.createElement('div', { className: 'v' }, a.tokens), React.createElement('div', { className: 'l' }, 'Tokens')),
        React.createElement('div', { className: 'mc-agent__stat' }, React.createElement('div', { className: 'v' }, a.spend), React.createElement('div', { className: 'l' }, 'Spend Today')))),
    // tabs
    React.createElement('div', { className: 'mc-tabs', role: 'tablist' },
      ...tabs.map(t => React.createElement('button', { key: t.id, className: 'mc-tab' + (tab === t.id ? ' is-active' : ''), onClick: () => setTab(t.id), role: 'tab', 'aria-selected': tab === t.id },
        React.createElement(Icon, { name: t.glyph, size: 14 }), t.label))),
    // tab body
    React.createElement('div', { key: tab, className: 'fade-up' }, renderAgentTab(tab, a)),
  );
}

function renderAgentTab(tab, a) {
  if (tab === 'overview') {
    return React.createElement('div', { className: 'mc-agent__body' },
      React.createElement('div', { className: 'mc-tpanel' },
        React.createElement('div', { className: 'mc-phead' }, React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'activity', size: 15 })), 'Current Focus')),
        React.createElement('div', { style: { fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.55, marginBottom: 16 } }, a.task),
        React.createElement(Sparkline, { data: [3,5,4,6,5,7,6,8,7], color: a.accent, w: 320, h: 60 }),
        React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 10 } }, 'Activity · last 9 cycles')),
      React.createElement('div', { className: 'mc-tpanel' },
        React.createElement('div', { className: 'mc-phead' }, React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'target', size: 15 })), 'Top Goal')),
        React.createElement('div', { className: 'mc-goal' },
          React.createElement('div', { className: 'mc-goal__row' },
            React.createElement('div', { className: 'top' }, React.createElement('span', { className: 'mc-goal__t' }, a.goals[0].t), React.createElement('span', { className: 'mc-goal__due' }, a.goals[0].due)),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', marginTop: 4 } },
              React.createElement('div', { className: 'mc-goal__bar', style: { flex: 1 } }, React.createElement('div', { className: 'mc-goal__fill', style: { width: a.goals[0].p + '%' } })),
              React.createElement('span', { className: 'mc-goal__pct' }, a.goals[0].p + '%')))),
        React.createElement('div', { style: { marginTop: 18 } }, React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'message-square' }, 'Message ' + a.name))),
    );
  }
  if (tab === 'goals') {
    return React.createElement('div', { className: 'mc-tpanel' },
      React.createElement('div', { className: 'mc-phead' }, React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'flag', size: 15 })), 'Active Goals'), React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'plus' }, 'Set Goal')),
      React.createElement('div', { className: 'mc-goal' },
        ...a.goals.map((g, i) => React.createElement('div', { key: i, className: 'mc-goal__row' },
          React.createElement('div', { className: 'top' }, React.createElement('span', { className: 'mc-goal__t' }, g.t), React.createElement('span', { className: 'mc-goal__due' }, g.p === 100 ? 'complete' : 'due ' + g.due)),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
            React.createElement('div', { className: 'mc-goal__bar', style: { flex: 1 } }, React.createElement('div', { className: 'mc-goal__fill', style: { width: g.p + '%' } })),
            React.createElement('span', { className: 'mc-goal__pct' }, g.p + '%'))))),
    );
  }
  if (tab === 'health') {
    const pct = parseFloat(a.uptime);
    return React.createElement('div', { className: 'mc-agent__body' },
      React.createElement('div', { className: 'mc-tpanel', style: { textAlign: 'center' } },
        React.createElement('div', { className: 'mc-phead', style: { justifyContent: 'center' } }, React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'gauge', size: 15 })), 'Reliability')),
        React.createElement(Ring, { pct, color: a.accent, label: 'Uptime', value: a.uptime })),
      React.createElement('div', { className: 'mc-tpanel' },
        React.createElement('div', { className: 'mc-phead' }, React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'heart-pulse', size: 15 })), 'Vitals')),
        React.createElement('div', { className: 'mc-health' },
          React.createElement('div', { className: 'mc-hstat' }, React.createElement('div', { className: 'v' }, a.tasksToday), React.createElement('div', { className: 'l' }, 'Tasks')),
          React.createElement('div', { className: 'mc-hstat' }, React.createElement('div', { className: 'v' }, a.tokens), React.createElement('div', { className: 'l' }, 'Tokens')),
          React.createElement('div', { className: 'mc-hstat' }, React.createElement('div', { className: 'v' }, a.spend), React.createElement('div', { className: 'l' }, 'Spend'))),
        React.createElement('div', { style: { marginTop: 16 } }, React.createElement(Sparkline, { data: [4,6,5,7,6,8,7,9,8,7], color: a.accent, w: 300, h: 60 })),
        React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 8 } }, 'Throughput · stable')),
    );
  }
  if (tab === 'chat') return React.createElement(AgentChat, { agent: a });
  if (tab === 'role') return React.createElement(AgentRole, { a });
  if (tab === 'improve') return React.createElement(AgentImprove, { a });
  if (tab === 'brain') return React.createElement(AgentBrain, { a });
}

function AgentImprove({ a }) {
  const LS = 'mc_reviewnotes_' + a.id;
  const [notes, setNotes] = useS(() => { try { return JSON.parse(localStorage.getItem(LS)) || []; } catch (e) { return []; } });
  const [val, setVal] = useS('');
  const save = (next) => { setNotes(next); try { localStorage.setItem(LS, JSON.stringify(next)); } catch (e) {} };
  const add = () => { if (!val.trim()) return; save([{ t: val.trim(), time: 'just now' }, ...notes]); setVal(''); };
  return React.createElement('div', { className: 'mc-agent__body' },
    React.createElement('div', { className: 'mc-tpanel' },
      React.createElement('div', { className: 'mc-phead' },
        React.createElement('div', null,
          React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'trending-up', size: 15 })), 'The Loop · Self-Improvements'),
          React.createElement('div', { className: 'mc-psub' }, 'What ' + a.name + ' learned and changed')),
        React.createElement('span', { className: 'mc-chip ' + a.theme }, React.createElement('span', { className: 'dot' }), 'COMPOUNDING')),
      React.createElement('div', { className: 'mc-improve' },
        ...a.improvements.map((im, i) => React.createElement('div', { key: i, className: 'mc-improve__row' },
          React.createElement('div', { className: 'mc-improve__ico' }, React.createElement(Icon, { name: 'zap', size: 13 })),
          React.createElement('div', { className: 'mc-improve__txt' }, im)))),
    ),
    React.createElement('div', { className: 'mc-tpanel' },
      React.createElement('div', { className: 'mc-phead' },
        React.createElement('div', null,
          React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', { style: { color: 'var(--la-gold)' } }, React.createElement(Icon, { name: 'pen-line', size: 15 })), 'Your Improvement Notes'),
          React.createElement('div', { className: 'mc-psub' }, 'Tell ' + a.name + ' what to improve — it feeds the loop')),
        React.createElement('span', { className: 'mc-chip gold' }, React.createElement('span', { className: 'dot' }), notes.length + ' NOTES')),
      React.createElement('div', { className: 'mc-reviewbox', style: { marginBottom: 14 } },
        React.createElement('textarea', { value: val, onChange: e => setVal(e.target.value), placeholder: 'e.g. “Be more concise in the War Room” or “Always cite the vault note you used”…', 'aria-label': 'Improvement note' }),
        React.createElement(Btn, { variant: 'gold', size: 'sm', icon: 'plus', onClick: add }, 'Send to ' + a.name)),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 9 } },
        notes.length === 0
          ? React.createElement('div', { style: { fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-3)', textAlign: 'center', padding: '12px 0' } }, 'No notes yet. What you write here trains ' + a.name + ' over time.')
          : notes.map((n, i) => React.createElement('div', { key: i, className: 'mc-reviewnote' },
              React.createElement('div', { className: 'mc-reviewnote__ico' }, React.createElement(Icon, { name: 'corner-down-right', size: 12 })),
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('div', { className: 'mc-reviewnote__t' }, n.t),
                React.createElement('div', { className: 'mc-reviewnote__time' }, 'You · ' + n.time)),
              React.createElement('button', { className: 'mc-dream__x', onClick: () => save(notes.filter((_, j) => j !== i)), 'aria-label': 'Remove' }, React.createElement(Icon, { name: 'x', size: 12 }))))),
    ),
  );
}

function AgentBrain({ a }) {
  const brain = (window.MC.agentBrains || {})[a.id] || { notes: 0, focus: [], recent: [] };
  return React.createElement('div', { className: 'mc-agent__body' },
    React.createElement('div', { className: 'mc-tpanel' },
      React.createElement('div', { className: 'mc-phead' },
        React.createElement('div', null,
          React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'box', size: 15 })), a.name + '’s Second Brain'),
          React.createElement('div', { className: 'mc-psub' }, 'Private vault · what ' + a.name + ' remembers')),
        React.createElement('span', { className: 'mc-chip ' + a.theme }, React.createElement('span', { className: 'dot' }), brain.notes + ' NOTES')),
      React.createElement('div', { style: { fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fg-3)' } }, 'Focus areas'),
      React.createElement('div', { className: 'mc-brain__focus' }, ...brain.focus.map((f, i) => React.createElement('span', { key: i, className: 'mc-brain__chip' }, f))),
      React.createElement('div', { style: { marginTop: 6, display: 'flex', gap: 8 } },
        React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'eye' }, 'Open in Obsidian'),
        React.createElement(Btn, { variant: 'quiet', size: 'sm', icon: 'message-square' }, 'Ask ' + a.name + ' about it'))),
    React.createElement('div', { className: 'mc-tpanel' },
      React.createElement('div', { className: 'mc-phead' }, React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'zap', size: 15 })), 'Recent Notes')),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 3 } },
        ...brain.recent.map((r, i) => React.createElement('div', { key: i, className: 'mc-brain__note' },
          React.createElement('span', { className: 'mc-brain__star' }),
          React.createElement('span', { style: { fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--fg-1)' } }, r),
          React.createElement(Icon, { name: 'chevron-right', size: 14, style: { color: 'var(--fg-3)', marginLeft: 'auto' } }))))),
  );
}

function AgentRole({ a }) {
  const c = (window.MC.agentCustom || {})[a.id];
  if (!c) return null;
  const stateChip = { working: 'good', approval: 'gold', idle: 'slate' };
  const toolIco = ['sliders', 'zap', 'eye', 'plus', 'target', 'shield-check'];
  return React.createElement('div', { className: 'mc-agent theme-' + a.theme },
    React.createElement('div', { className: 'mc-role' },
      React.createElement('div', { className: 'mc-tpanel' },
        React.createElement('div', { className: 'mc-phead' },
          React.createElement('div', null,
            React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: c.glyph, size: 15 })), c.headline),
            React.createElement('div', { className: 'mc-psub' }, c.sub)),
          React.createElement('span', { className: 'mc-chip ' + a.theme }, React.createElement('span', { className: 'dot' }), 'LIVE')),
        React.createElement('div', { className: 'mc-role__stat' },
          ...c.stats.map((s, i) => React.createElement('div', { key: i, className: 'mc-role__s' }, React.createElement('div', { className: 'v' }, s.v), React.createElement('div', { className: 'l' }, s.l)))),
        React.createElement('div', { className: 'mc-psub', style: { marginBottom: 11 } }, c.board.title),
        React.createElement('div', { className: 'mc-role__board' },
          ...c.board.rows.map((r, i) => { const ag = window.MC.agents.find(x => x.id === r.who) || a;
            return React.createElement('div', { key: i, className: 'mc-role__row' },
              React.createElement('div', { className: 'mc-role__av', style: { background: ag.avatarGrad } }, ag.name[0]),
              React.createElement('span', { className: 'mc-role__task' }, r.task),
              React.createElement('span', { className: 'mc-chip ' + (stateChip[r.state] || 'slate') }, React.createElement('span', { className: 'dot' }), r.state)); }))),
      React.createElement('div', { className: 'mc-tpanel' },
        React.createElement('div', { className: 'mc-phead' }, React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'cpu', size: 15 })), c.headline.split(' · ')[0] + ' Tools')),
        React.createElement('div', { className: 'mc-role__tools' },
          ...c.tools.map((t, i) => React.createElement('button', { key: i, className: 'mc-role__tool' },
            React.createElement('span', { className: 'ic' }, React.createElement(Icon, { name: toolIco[i % toolIco.length], size: 13 })), t)))) ),
  );
}

function AgentChat({ agent }) {
  const { messages, send: postMsg } = window.MCLive.useChannel('agent:' + agent.id);
  const [val, setVal] = useS('');
  const feedRef = useR(null);
  useE(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [messages]);
  const view = messages.map(m => ({ me: m.from === 'lew' || m.role === 'operator', t: m.text }));
  // LIVE direct line. Lew's message posts to the agent's channel; the real agent
  // (connected via MCP / CLI) reads it and replies. No scripted responses.
  const send = () => { if (!val.trim()) return; postMsg('lew', val); setVal(''); };
  const onlineNow = agent.status && agent.status !== 'offline';
  return React.createElement('div', { className: 'mc-tpanel' },
    React.createElement('div', { className: 'mc-phead' },
      React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'message-square', size: 15 })), 'Direct Line · ' + agent.name),
      React.createElement('span', { className: 'mc-chip ' + (onlineNow ? agent.theme : '') }, React.createElement('span', { className: 'dot' }), onlineNow ? 'ONLINE' : 'OFFLINE')),
    React.createElement('div', { className: 'mc-achat' },
      React.createElement('div', { className: 'mc-achat__feed', ref: feedRef },
        view.length === 0 && React.createElement('div', { className: 'mc-bubble them', style: { opacity: .75 } },
          React.createElement('div', { className: 'mc-bubble__meta' }, agent.name),
          onlineNow ? 'Connected. Send a message — I read this channel live.' : 'Not connected yet. Connect ' + agent.name + ' via MCP or CLI (see the handoff) and messages here reach them live.'),
        ...view.map((m, i) => React.createElement('div', { key: i, className: 'mc-bubble ' + (m.me ? 'me' : 'them') },
          React.createElement('div', { className: 'mc-bubble__meta' }, m.me ? 'You' : agent.name),
          m.t))),
      React.createElement('div', { className: 'mc-composer' },
        React.createElement('input', { value: val, onChange: e => setVal(e.target.value), onKeyDown: e => e.key === 'Enter' && send(), placeholder: 'Message ' + agent.name + '…', 'aria-label': 'Message ' + agent.name }),
        React.createElement('button', { className: 'mc-composer__send', onClick: send, 'aria-label': 'Send' }, React.createElement(Icon, { name: 'send', size: 15 })))),
  );
}

// ============ WAR ROOM (full) ============
function WarRoom() {
  const { messages, send: postMsg } = window.MCLive.useChannel('warroom');
  const [val, setVal] = useS('');
  const feedRef = useR(null);
  useE(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [messages]);
  const msgs = messages;
  const typing = null;

  const renderText = (t) => {
    const parts = String(t).split(/(@\w+)/g);
    return parts.map((p, i) => p.startsWith('@') ? React.createElement('span', { key: i, className: 'mention' }, p) : p);
  };
  // LIVE: the order is posted to the team channel. Connected agents (via MCP /
  // CLI) read it and reply for real — there are no scripted responses.
  const send = () => { if (!val.trim()) return; postMsg('lew', val); setVal(''); };

  const quickOrders = ['Status report — what are you working on?', 'Any blockers I should clear?', 'What did the team get done today?', 'Stand by for orders'];
  const present = window.MC.agents;
  const onlineN = window.MCLive.onlineCount();

  return React.createElement('div', { className: 'mc-war' },
    React.createElement('div', { className: 'mc-war__main' },
      React.createElement('div', { className: 'mc-war__head' },
        React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'messages-square', size: 15 })), 'War Room'),
        React.createElement('span', { className: 'mc-chip ' + (onlineN ? 'good' : '') }, React.createElement('span', { className: 'dot' }), onlineN + ' ONLINE')),
      React.createElement('div', { className: 'mc-war__feed', ref: feedRef },
        ...msgs.map(m => {
          const who = m.from === 'lew' ? window.MC.operator : (window.MC.agents.find(x => x.id === m.from) || { name: m.from, role: 'Agent', accent: '#94A3B8', avatarGrad: 'linear-gradient(145deg,#475569,#94A3B8)' });
          const grad = m.from === 'lew' ? 'linear-gradient(145deg,#A87B2E,#F3D27A)' : who.avatarGrad;
          const role = m.from === 'lew' ? 'Founder' : who.role.split(' · ')[0];
          const col = m.from === 'lew' ? '#F3D27A' : who.accent;
          return React.createElement('div', { key: m.id, className: 'mc-war__msg' },
            React.createElement('div', { className: 'mc-war__av', style: { background: grad } }, who.name[0],
              m.from !== 'lew' && React.createElement('span', { className: 'live', style: { background: '#2BD8A0', boxShadow: '0 0 6px #2BD8A0' } })),
            React.createElement('div', { className: 'mc-war__b' },
              React.createElement('div', { className: 'mc-war__bh' },
                React.createElement('span', { className: 'mc-war__nm', style: { color: col } }, who.name),
                React.createElement('span', { className: 'mc-war__rl' }, role),
                React.createElement('span', { className: 'mc-war__tm' }, window.MCLive.fmtTime(m.ts))),
              React.createElement('div', { className: 'mc-war__tx' }, renderText(m.text))));
        }),
        typing && (() => { const w = window.MC.agents.find(x => x.id === typing); return React.createElement('div', { className: 'mc-war__msg' },
          React.createElement('div', { className: 'mc-war__av', style: { background: w.avatarGrad } }, w.name[0]),
          React.createElement('div', { className: 'mc-war__b' },
            React.createElement('div', { className: 'mc-war__bh' }, React.createElement('span', { className: 'mc-war__nm', style: { color: w.accent } }, w.name)),
            React.createElement('div', { className: 'mc-typing' }, React.createElement('span'), React.createElement('span'), React.createElement('span')))); })()),
      React.createElement('div', { className: 'mc-war__composer' },
        React.createElement('div', { className: 'mc-war__order' }, React.createElement(Icon, { name: 'command', size: 13 }), 'ORDER'),
        React.createElement('input', { value: val, onChange: e => setVal(e.target.value), onKeyDown: e => e.key === 'Enter' && send(), placeholder: 'Give an order — Sage routes it to the right agent…', 'aria-label': 'Send an order' }),
        React.createElement('button', { className: 'mc-composer__send', onClick: send, 'aria-label': 'Send' }, React.createElement(Icon, { name: 'send', size: 15 })))),
    React.createElement('div', { className: 'mc-war__side' },
      React.createElement('div', { className: 'mc-war__sidepanel' },
        React.createElement('div', { className: 'mc-ptitle', style: { marginBottom: 14 } }, React.createElement('i', null, React.createElement(Icon, { name: 'users-round', size: 15 })), 'Present'),
        React.createElement('div', { className: 'mc-war__present' },
          React.createElement('div', { className: 'mc-war__pres' },
            React.createElement('div', { className: 'av', style: { background: 'linear-gradient(145deg,#A87B2E,#F3D27A)' } }, 'L'),
            React.createElement('span', { className: 'nm' }, 'Lew'), React.createElement('span', { className: 'st' }, 'you')),
          ...present.map(a => React.createElement('div', { key: a.id, className: 'mc-war__pres' },
            React.createElement('div', { className: 'av', style: { background: a.avatarGrad } }, a.name[0], React.createElement('span', { className: 'live', style: { position: 'absolute', right: -2, bottom: -2, width: 8, height: 8, borderRadius: '50%', border: '2px solid #1a2030', background: (a.status && a.status !== 'offline') ? '#2BD8A0' : '#64748B' } })),
            React.createElement('span', { className: 'nm' }, a.name), React.createElement('span', { className: 'st' }, a.statusLabel))))),
      React.createElement('div', { className: 'mc-war__sidepanel' },
        React.createElement('div', { className: 'mc-ptitle', style: { marginBottom: 14 } }, React.createElement('i', null, React.createElement(Icon, { name: 'zap', size: 15 })), 'Quick Orders'),
        React.createElement('div', { className: 'mc-order-chips' },
          ...quickOrders.map((q, i) => React.createElement('button', { key: i, className: 'mc-order-chip', onClick: () => { setVal(q); } }, q))),
        React.createElement('div', { style: { fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)', marginTop: 14, lineHeight: 1.5 } }, 'Sage logs every order and routes it to the right agent — even while you’re at work.'))),
  );
}

// ============ CONNECTORS (create real connections) ============
const CONN_LS_KEY = 'mc_connections_v1';
function loadConns() {
  try { const s = JSON.parse(localStorage.getItem(CONN_LS_KEY)); if (Array.isArray(s)) return s; } catch (e) {}
  return window.MC.connections.slice();
}
function methodIco(m) {
  return ({ 'API Key': 'key-round', 'MCP': 'plug', 'CLI': 'terminal', 'OAuth': 'log-in', 'Bot Token': 'key-round', 'Webhook': 'link' })[m] || 'plug';
}
function Connectors() {
  const [conns, setConns] = useS(loadConns);
  const [modal, setModal] = useS(false);
  const persist = (next) => { setConns(next); try { localStorage.setItem(CONN_LS_KEY, JSON.stringify(next)); } catch (e) {} };
  const remove = (id) => persist(conns.filter(c => c.id !== id));
  const reconnect = (id) => persist(conns.map(c => c.id === id ? { ...c, status: 'live' } : c));
  const create = (cat, method, name) => {
    const id = 'cx' + Date.now();
    persist([{ id, catId: cat.id, name: name || cat.name, method, status: 'live', meta: 'just now' }, ...conns]);
    setModal(false);
  };
  const cat = (id) => window.MC.connectorCatalog.find(c => c.id === id) || { glyph: 'plug', name: id };
  const byCat = {};
  conns.forEach(c => { const k = cat(c.catId).cat || 'Other'; (byCat[k] = byCat[k] || []).push(c); });
  const order = ['Agents', 'Models', 'Memory', 'Channels', 'Apps', 'Production', 'Automation', 'Other'];
  const groups = order.filter(k => byCat[k]);

  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-section__head' },
      React.createElement('div', { className: 'mc-page-head', style: { marginBottom: 0 } },
        React.createElement('h2', null, 'Connectors'),
        React.createElement('p', null, conns.filter(c => c.status === 'live').length + ' live connections. Add models, agents, channels, and apps — API key, MCP, CLI, OAuth, bot token, or webhook per service.')),
      React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plus', onClick: () => setModal(true) }, 'New connection')),
    ...groups.map(g => React.createElement('div', { key: g, className: 'mc-section' },
      React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, marginBottom: 12 } }, g),
      React.createElement('div', { className: 'mc-conn-grid' },
        ...byCat[g].map(c => { const ct = cat(c.catId); const live = c.status === 'live';
          return React.createElement('div', { key: c.id, className: 'mc-conn' },
            React.createElement('div', { className: 'mc-conn__top' },
              React.createElement('div', { className: 'mc-conn__ico' }, React.createElement(Icon, { name: ct.glyph, size: 19 })),
              React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                React.createElement('div', { className: 'mc-conn__nm' }, c.name),
                React.createElement('div', { className: 'mc-conn__note' }, c.meta)),
              React.createElement('span', { className: 'mc-chip ' + (live ? 'good' : 'slate') }, React.createElement('span', { className: 'dot' }), live ? 'Connected' : 'Idle')),
            React.createElement('div', { className: 'mc-conn__field', style: { marginTop: 4 } },
              React.createElement('i', null, React.createElement(Icon, { name: methodIco(c.method), size: 14 })),
              React.createElement('span', { style: { flex: 1, color: 'var(--fg-2)' } }, 'via ' + c.method),
              React.createElement('span', { className: 'mono', style: { fontSize: 10, color: live ? '#4fe3b5' : 'var(--fg-3)' } }, live ? '●' : '○')),
            React.createElement('div', { className: 'mc-conn__foot' },
              React.createElement(Btn, { variant: live ? 'ghost' : 'cyan', size: 'sm', icon: live ? 'check' : 'plug', onClick: () => reconnect(c.id) }, live ? 'Reconnect' : 'Connect'),
              React.createElement('button', { className: 'mc-conn__del', onClick: () => remove(c.id), 'aria-label': 'Remove connection' }, React.createElement(Icon, { name: 'x', size: 14 })))); })))),
    modal && React.createElement(NewConnectionModal, { onClose: () => setModal(false), onCreate: create }),
  );
}
function NewConnectionModal({ onClose, onCreate }) {
  const [sel, setSel] = useS(null);
  const [method, setMethod] = useS(null);
  const [name, setName] = useS('');
  const [cred, setCred] = useS('');
  const cat = sel ? window.MC.connectorCatalog.find(c => c.id === sel) : null;
  const credPh = { 'API Key': 'sk-•••••••••••••••••••', 'Bot Token': 'Bot •••••••••••••••', 'MCP': 'mcp://localhost:742/' + (sel || ''), 'CLI': '$ ' + (sel || 'tool') + ' auth login', 'OAuth': 'Authorize in popup →', 'Webhook': 'https://hooks…/' + (sel || '') };
  return React.createElement('div', { className: 'mc-modal-scrim', onMouseDown: e => e.target === e.currentTarget && onClose() },
    React.createElement('div', { className: 'mc-modal' },
      React.createElement('div', { className: 'mc-modal__head' },
        React.createElement('div', { className: 'mc-catalog__ico' }, React.createElement(Icon, { name: 'plug', size: 17 })),
        React.createElement('div', { className: 'mc-modal__t' }, 'New Connection'),
        React.createElement('button', { className: 'mc-modal__x', onClick: onClose, 'aria-label': 'Close' }, React.createElement(Icon, { name: 'x', size: 17 }))),
      React.createElement('div', { className: 'mc-modal__body' },
        React.createElement('div', { className: 'mc-field-label', style: { marginTop: 0 } }, '1 · Choose a service'),
        React.createElement('div', { className: 'mc-catalog' },
          ...window.MC.connectorCatalog.map(c => React.createElement('button', { key: c.id, className: 'mc-catalog__item' + (sel === c.id ? ' is-sel' : ''), onClick: () => { setSel(c.id); setMethod(c.methods[0]); setName(c.name); } },
            React.createElement('div', { className: 'mc-catalog__ico' }, React.createElement(Icon, { name: c.glyph, size: 17 })),
            React.createElement('div', { style: { minWidth: 0 } },
              React.createElement('div', { className: 'mc-catalog__n' }, c.name),
              React.createElement('div', { className: 'mc-catalog__c' }, c.cat))))),
        cat && React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'mc-field-label' }, '2 · Name this connection'),
          React.createElement('div', { className: 'mc-conn__field' }, React.createElement('i', null, React.createElement(Icon, { name: cat.glyph, size: 14 })), React.createElement('input', { value: name, onChange: e => setName(e.target.value), placeholder: cat.name + ' · Primary', 'aria-label': 'Connection name' })),
          React.createElement('div', { className: 'mc-field-label' }, '3 · Connection method'),
          React.createElement('div', { className: 'mc-conn__methods wrap' }, ...cat.methods.map(m => React.createElement('button', { key: m, className: 'mc-method' + (method === m ? ' is-active' : ''), onClick: () => setMethod(m) }, m))),
          React.createElement('div', { className: 'mc-field-label' }, '4 · ' + (method || '') + ' credential'),
          React.createElement('div', { className: 'mc-conn__field' }, React.createElement('i', null, React.createElement(Icon, { name: methodIco(method), size: 14 })),
            method === 'OAuth' ? React.createElement('span', { style: { flex: 1, color: 'var(--la-cyan)' } }, credPh.OAuth) : React.createElement('input', { value: cred, onChange: e => setCred(e.target.value), placeholder: credPh[method] || '', type: /Key|Token/.test(method) ? 'password' : 'text', 'aria-label': 'Credential' })),
          React.createElement('div', { style: { fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)', marginTop: 12, lineHeight: 1.5 } }, 'Credentials are stored locally in this prototype. Wire a backend to vault them and complete the live handshake.'))),
      React.createElement('div', { className: 'mc-modal__foot' },
        React.createElement(Btn, { variant: 'quiet', size: 'sm', onClick: onClose }, 'Cancel'),
        React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plug', onClick: () => cat && method && onCreate(cat, method, name.trim()) }, 'Create connection'))),
  );
}

// ============ PANTHEON ============
function Pantheon({ onNav }) {
  const [summoned, setSummoned] = useS({});
  const [auto, setAuto] = useS({ athena: false, mercury: true, vulcan: false });
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-page-head' },
      React.createElement('h2', null, 'Pantheon'),
      React.createElement('p', null, 'A visual roster of specialist personas. Summon one for a mission, pick its job and preferred model, and let Hermes delegate to it. Autopilot personas run on cron with cheaper models.')),
    React.createElement('div', { className: 'mc-conn-grid', style: { marginBottom: 'var(--gap-grid)' } },
      ...window.MC.personas.map(p => React.createElement('div', { key: p.id, className: 'mc-conn' },
        React.createElement('div', { className: 'mc-conn__top' },
          React.createElement('div', { className: 'mc-conn__ico', style: { background: window.hexA(p.accent, 0.12), borderColor: window.hexA(p.accent, 0.3), color: p.accent } }, React.createElement(Icon, { name: p.glyph, size: 19 })),
          React.createElement('div', { style: { flex: 1 } },
            React.createElement('div', { className: 'mc-conn__nm' }, p.name),
            React.createElement('div', { className: 'mc-conn__note' }, p.role)),
          React.createElement('span', { className: 'mc-chip ' + (summoned[p.id] ? 'good' : 'slate') }, React.createElement('span', { className: 'dot' }), summoned[p.id] ? 'Active' : 'Standby')),
        React.createElement('div', { className: 'mc-conn__field', style: { marginBottom: 9 } },
          React.createElement('i', null, React.createElement(Icon, { name: 'cpu', size: 14 })),
          React.createElement('span', { style: { flex: 1, color: 'var(--fg-2)' } }, 'Preferred model'),
          React.createElement('span', { style: { color: p.accent } }, p.model)),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 } },
          React.createElement('span', { className: 'mono', style: { fontSize: 10, color: 'var(--fg-3)' } }, 'Autopilot · cron'),
          React.createElement('button', { onClick: () => setAuto(a => ({ ...a, [p.id]: !a[p.id] })), 'aria-label': 'Toggle autopilot',
            style: { all: 'unset', cursor: 'pointer', width: 38, height: 21, borderRadius: 999, background: auto[p.id] ? p.accent : 'rgba(206,214,224,0.18)', position: 'relative', transition: 'background .18s' } },
            React.createElement('span', { style: { position: 'absolute', top: 2, left: auto[p.id] ? 19 : 2, width: 17, height: 17, borderRadius: '50%', background: '#fff', transition: 'left .18s' } }))),
        React.createElement(Btn, { variant: summoned[p.id] ? 'quiet' : 'ghost', size: 'sm', icon: summoned[p.id] ? 'pause' : 'zap', onClick: () => setSummoned(s => ({ ...s, [p.id]: !s[p.id] })) }, summoned[p.id] ? 'Return to standby' : 'Summon ' + p.name)))),
    React.createElement('div', { className: 'mc-conn', style: { borderStyle: 'dashed', borderColor: 'rgba(35,214,245,0.3)' } },
      React.createElement('div', { className: 'mc-ptitle', style: { marginBottom: 14 } }, React.createElement('i', null, React.createElement(Icon, { name: 'plus', size: 15 })), 'Add a Persona'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 11 } },
        React.createElement('div', { className: 'mc-conn__field' }, React.createElement('i', null, React.createElement(Icon, { name: 'circle-dot', size: 14 })), React.createElement('input', { placeholder: 'Name (e.g. Apollo)', 'aria-label': 'Persona name' })),
        React.createElement('div', { className: 'mc-conn__field' }, React.createElement('i', null, React.createElement(Icon, { name: 'target', size: 14 })), React.createElement('input', { placeholder: 'Job (e.g. Analytics)', 'aria-label': 'Persona job' }))),
      React.createElement('div', { className: 'mc-conn__field', style: { marginBottom: 11 } }, React.createElement('i', null, React.createElement(Icon, { name: 'pen-line', size: 14 })), React.createElement('input', { placeholder: 'System prompt — how this persona thinks and works…', 'aria-label': 'System prompt' })),
      React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plus' }, 'Add to Pantheon')),
  );
}

// ============ PLACEHOLDER ============
function Placeholder({ title, glyph, desc }) {
  return React.createElement('div', { className: 'mc-placeholder' },
    React.createElement('div', null,
      React.createElement('div', { className: 'mc-placeholder__ico' }, React.createElement(Icon, { name: glyph || 'circle-dot', size: 30 })),
      React.createElement('h3', null, title),
      React.createElement('p', null, desc || 'This workspace is wired into the operating system and ready for its first build.')),
  );
}

Object.assign(window, { AgentPage, WarRoom, Connectors, Pantheon, Placeholder });
