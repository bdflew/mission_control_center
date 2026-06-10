// views.jsx — AgentPage, WarRoom, Connectors, Pantheon, Placeholder
// v3 WAR DECK upgrade: alien-tech war room (live ticker, DEFCON readiness,
// tactical radar, approval board), premium per-agent stage hero, and
// multi-method connector catalog. All live behaviors preserved exactly:
// chat = MCLive.useChannel, approvals = MCLive.resolveApproval, voice = MCVoice.
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
  const onlineNow = a.status && a.status !== 'offline';
  return (
    <div className={'mc-agent theme-' + a.theme} key={a.id}>
      {/* premium stage hero — the agent accent drives rings, aura, and readouts */}
      <div className="agent-stage fade-up" style={{ '--ag-acc': a.accent, '--acc': a.accent, '--acc2': a.accent2 || a.accent }}>
        <div className="agent-stage__ring" aria-hidden="true" />
        <div className="agent-aura" aria-hidden="true" />
        {a.sprite ? <img className="agent-stage__char" src={a.sprite} alt="" /> : null}
        <div className="v3w-stage">
          <div className="v3w-stage__top">
            {!a.sprite && <AgentAv agent={a} size={84} cls="mc-av v3w-stage__av" />}
            <div className="v3w-stage__id">
              <div className="hud-eyebrow">{a.role}</div>
              <div className="hud-title v3w-stage__name">{a.name}</div>
              <div className="v3w-stage__meta">
                <span className={'mc-chip ' + a.theme}><span className="dot" />{a.statusLabel}</span>
                <span className="mc-modeltag">{a.model}</span>
                {a.connectedVia ? <span className="v3w-tag">via {a.connectedVia}</span> : null}
              </div>
            </div>
          </div>
          <p className="v3w-stage__blurb">{a.blurb}</p>
          <div className="v3w-stage__stats">
            <HoloStat label="Tasks Today" value={a.tasksToday} size={21} />
            <HoloStat label="Uptime" value={a.uptime} size={21} />
            <HoloStat label="Tokens" value={a.tokens} size={21} />
            <HoloStat label="Spend Today" value={a.spend} size={21} />
            {onlineNow && <span className="v3w-reported" title="Values reported live by this agent">reported</span>}
          </div>
        </div>
      </div>
      {/* tabs */}
      <div className="mc-tabs" role="tablist">
        {tabs.map(t => (
          <button key={t.id} className={'mc-tab' + (tab === t.id ? ' is-active' : '')} onClick={() => setTab(t.id)} role="tab" aria-selected={tab === t.id}>
            <Icon name={t.glyph} size={14} />{t.label}
          </button>
        ))}
      </div>
      {/* tab body */}
      <div key={tab} className="fade-up">{renderAgentTab(tab, a)}</div>
    </div>
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
        window.MCVoice && MCVoice.sttSupported && React.createElement('button', {
          className: 'mc-composer__mic', title: 'Push to talk', 'aria-label': 'Push to talk',
          onClick: (e) => MCVoice.pushToTalk(t => setVal(v => (v ? v + ' ' : '') + t), e.currentTarget),
        }, React.createElement(Icon, { name: 'zap', size: 14 })),
        window.MCVoice && React.createElement('button', {
          className: 'mc-composer__mic', title: 'Speak replies aloud', 'aria-label': 'Speak replies aloud',
          style: MCVoice.speakOn() ? { color: 'var(--acc)', borderColor: 'rgba(35,214,245,.4)' } : null,
          onClick: (e) => { const on = MCVoice.toggleSpeak(); e.currentTarget.style.color = on ? 'var(--acc)' : ''; },
        }, React.createElement(Icon, { name: 'megaphone', size: 14 })),
        React.createElement('button', { className: 'mc-composer__send', onClick: send, 'aria-label': 'Send' }, React.createElement(Icon, { name: 'send', size: 15 })))),
  );
}

// ============ WAR ROOM (full command deck) ============
// Helpers — honest derivations only. No fabricated events, no fake readiness.
function warName(id) {
  if (id === 'lew') return (window.MC.operator && window.MC.operator.name) || 'Lew';
  const a = (window.MC.agents || []).find(x => x.id === id);
  return a ? a.name : (id || 'system');
}
const AUTONOMY_RULES = {
  manual: 'MANUAL — every action waits for your sign-off',
  semi: 'SEMI-AUTO — low-risk auto-approves · med / high wait for you',
  full: 'AUTONOMOUS — only high-risk waits for you',
};
function v3wHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// Map a raw SSE event to one readable ticker item (or null to skip).
function warTickerItem(evt, n) {
  const k = 'ev-' + n;
  if (evt.type === 'chat' && evt.message) return { k, tone: 'chat', b: warName(evt.message.from), t: ' posted in ' + (evt.channel || 'warroom') };
  if (evt.type === 'agent' && evt.agent) return { k, tone: 'agent', b: warName(evt.agent.id), t: ' → ' + (evt.agent.statusLabel || evt.agent.status || 'updated') };
  if (evt.type === 'approval' && evt.approval) {
    const ap = evt.approval;
    if (ap.state === 'pending') return { k, tone: ap.risk === 'high' ? 'crit' : 'warn', b: 'APPROVAL ' + String(ap.risk || 'low').toUpperCase(), t: ' · ' + ap.subject };
    const auto = String(ap.decidedBy || '').indexOf('autonomy:') === 0 ? ' · AUTO' : '';
    return { k, tone: ap.state === 'approved' ? 'good' : 'warn', b: String(ap.state || 'resolved').toUpperCase(), t: ' · ' + ap.subject + auto };
  }
  if (evt.type === 'vault') return { k, tone: 'vault', b: 'VAULT', t: ' ← note by ' + warName(evt.by || 'agent') };
  if (evt.type === 'mode') return { k, tone: 'mode', b: 'AUTONOMY', t: ' → ' + String(evt.mode || '').toUpperCase() };
  return null;
}

// Side-stack panel chrome (holo glass + corner brackets + sheen).
function WarPanel({ icon, title, variant, chip, children }) {
  return (
    <div className={'holo v3w-panel' + (variant ? ' ' + variant : '')}>
      <div className="holo-sheen" />
      <div className="v3w-panel__head">
        <span className="v3w-panel__t"><Icon name={icon || 'circle-dot'} size={13} />{title}</span>
        {chip || null}
      </div>
      {children}
    </div>
  );
}

function WarRoom() {
  // ---- live chat (existing behavior — preserved exactly) ----
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

  // ---- war-deck state: mission clock, live ops ticker, live refresh ----
  const [now, setNow] = useS(() => new Date());
  const [events, setEvents] = useS([]);
  const seq = useR(0);
  const [, setTick] = useS(0);

  useE(() => { const iv = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(iv); }, []);
  useE(() => {
    const bump = () => setTick(n => n + 1);
    window.addEventListener('mc:live', bump);
    return () => window.removeEventListener('mc:live', bump);
  }, []);
  useE(() => {
    let alive = true;
    // seed the ticker from the channel's most recent real messages
    window.MCLive.fetchChannel('warroom').then(ms => {
      if (!alive || !Array.isArray(ms) || !ms.length) return;
      const seed = ms.slice(-8).map(m => ({ k: 'seed-' + m.id, tone: 'chat', b: warName(m.from), t: ' posted in warroom' }));
      setEvents(prev => (prev.length ? prev : seed));
    });
    // then accumulate live SSE events (last 30)
    const off = window.MCLive.onEvent(evt => {
      if (evt.type === 'mode' && evt.mode) window.MC.autonomy = evt.mode;
      const it = warTickerItem(evt, ++seq.current);
      if (it) setEvents(prev => [...prev, it].slice(-30));
      if (evt.type === 'approval') setTick(n => n + 1);
    });
    return () => { alive = false; off && off(); };
  }, []);

  // ---- honest readiness derivation ----
  const pending = window.MC.approvals || [];
  const highRisk = pending.some(p => p.risk === 'high');
  const workingN = present.filter(x => x.status === 'working').length;
  const segs = ['lit-good', 'lit-good', '', '', ''];
  for (let i = 0; i < Math.min(pending.length, 3); i++) segs[2 + i] = 'lit-warn';
  if (highRisk) segs[4] = 'lit-crit';
  const readiness = highRisk ? 'HIGH-RISK WAITING' : pending.length ? pending.length + ' PENDING' : 'ALL CLEAR';
  const items = events.length ? events : [{ k: 'none', tone: 'idle', b: 'NO LIVE EVENTS', t: ' — connect agents via MCP / CLI to light this up' }];
  const pendingBy = {};
  pending.forEach(p => { pendingBy[p.by] = true; });
  const mode = window.MC.autonomy || 'manual';
  const mission = window.MC.mission || { name: 'No active mission', phase: '', progress: 0, steps: [] };
  const decide = (aid, d) => { try { window.MCLive.resolveApproval(aid, d).catch(() => {}); } catch (e) {} };
  const hhmmss = now.toLocaleTimeString('en-GB', { hour12: false });
  const utc = now.toISOString().slice(11, 19);

  return (
    <div className="sci-wrap">
      <SciFiBackdrop variant="alien" />
      <div className="sci-fg war-shell">

        {/* ===== 1 · WAR HERO ===== */}
        <div className="war-hero">
          <div className="war-hero__grid">
            <div className="v3w-hero-id">
              <div className="hud-eyebrow">COMMAND CHANNEL · TEAM OPS</div>
              <div className="hud-title v3w-war-title">WAR ROOM</div>
            </div>
            <div className="v3w-clockbox">
              <div className="war-clock" aria-label="Mission clock">{hhmmss}</div>
              <div className="v3w-clock-utc">{utc} UTC</div>
            </div>
            <div className="v3w-defconbox">
              <div className="hud-eyebrow">READINESS · {readiness}</div>
              <div className="war-defcon" role="img" aria-label={'Readiness: ' + readiness}>
                {segs.map((s, i) => <span key={i} className={s} />)}
              </div>
              <div className="v3w-defcon-rule">2 green = all clear · +1 gold per pending approval (max 3) · red = high-risk waiting</div>
            </div>
            <div className="v3w-hero-right">
              <HoloStat label="Online" value={onlineN} suffix={'/ ' + present.length} tone={onlineN ? 'emerald' : undefined} size={24} />
              <HoloStat label="Working" value={workingN} size={24} />
              <AutonomyControl compact />
            </div>
          </div>
        </div>

        {/* ===== 2 · LIVE OPS TICKER ===== */}
        <div className="war-ticker">
          <span className="war-ticker__label"><span className="v3w-livedot" />LIVE OPS</span>
          <div className="war-ticker__track">
            <div className="war-ticker__inner">
              {[0, 1].map(copy => (
                <React.Fragment key={copy}>
                  {items.map(it => (
                    <span key={copy + it.k} className="war-ticker__item" aria-hidden={copy === 1 ? 'true' : undefined}>
                      <span className={'v3w-tick-dot ' + (it.tone || '')} /><b>{it.b}</b>{it.t}
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="war-cols">
          {/* ===== 3 · COMMS — the live chat (logic unchanged) ===== */}
          <div className="holo holo--alert v3w-comms">
            <div className="holo-sheen" />
            <div className="v3w-comms__head">
              <span className="v3w-comms__t"><Icon name="messages-square" size={13} />COMMS · WARROOM CHANNEL</span>
              <span className={'mc-chip ' + (onlineN ? 'good' : 'slate')}><span className="dot" />{onlineN + ' ONLINE'}</span>
            </div>
            <div className="hud-rail v3w-comms__rail" />
            <div className="mc-war__feed" ref={feedRef}>
              {msgs.length === 0 && (
                <div className="v3w-empty">Channel open. Orders posted here reach every connected agent live — none are connected yet.</div>
              )}
              {msgs.map(m => {
                const who = m.from === 'lew' ? window.MC.operator : (window.MC.agents.find(x => x.id === m.from) || { name: m.from, role: 'Agent', accent: '#94A3B8', avatarGrad: 'linear-gradient(145deg,#475569,#94A3B8)' });
                const grad = m.from === 'lew' ? 'linear-gradient(145deg,#A87B2E,#F3D27A)' : who.avatarGrad;
                const role = m.from === 'lew' ? 'Founder' : who.role.split(' · ')[0];
                const col = m.from === 'lew' ? '#F3D27A' : who.accent;
                return (
                  <div key={m.id} className="mc-war__msg">
                    <div className="mc-war__av" style={{ background: grad }}>
                      {who.name[0]}
                      {m.from !== 'lew' && <span className="live" style={{ background: '#2BD8A0', boxShadow: '0 0 6px #2BD8A0' }} />}
                    </div>
                    <div className="mc-war__b">
                      <div className="mc-war__bh">
                        <span className="mc-war__nm" style={{ color: col }}>{who.name}</span>
                        <span className="mc-war__rl">{role}</span>
                        <span className="mc-war__tm">{window.MCLive.fmtTime(m.ts)}</span>
                      </div>
                      <div className="mc-war__tx">{renderText(m.text)}</div>
                    </div>
                  </div>
                );
              })}
              {typing && (() => {
                const w = window.MC.agents.find(x => x.id === typing);
                return (
                  <div className="mc-war__msg">
                    <div className="mc-war__av" style={{ background: w.avatarGrad }}>{w.name[0]}</div>
                    <div className="mc-war__b">
                      <div className="mc-war__bh"><span className="mc-war__nm" style={{ color: w.accent }}>{w.name}</span></div>
                      <div className="mc-typing"><span /><span /><span /></div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="mc-war__composer">
              <div className="mc-war__order"><Icon name="command" size={13} />ORDER</div>
              <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Give an order — Sage routes it to the right agent…" aria-label="Send an order" />
              {window.MCVoice && MCVoice.sttSupported && (
                <button className="mc-composer__mic" title="Push to talk" aria-label="Push to talk"
                  onClick={(e) => MCVoice.pushToTalk(t => setVal(v => (v ? v + ' ' : '') + t), e.currentTarget)}>
                  <Icon name="zap" size={14} />
                </button>
              )}
              {window.MCVoice && (
                <button className="mc-composer__mic" title="Speak replies aloud" aria-label="Speak replies aloud"
                  style={MCVoice.speakOn() ? { color: 'var(--acc)', borderColor: 'rgba(35,214,245,.4)' } : null}
                  onClick={(e) => { const on = MCVoice.toggleSpeak(); e.currentTarget.style.color = on ? 'var(--acc)' : ''; }}>
                  <Icon name="megaphone" size={14} />
                </button>
              )}
              <button className="mc-composer__send" onClick={send} aria-label="Send"><Icon name="send" size={15} /></button>
            </div>
          </div>

          {/* ===== 4 · SIDE STACK ===== */}
          <div className="war-stack">

            {/* a — tactical radar */}
            <WarPanel icon="orbit" title="TACTICAL RADAR">
              <div className="v3w-radar-row">
                <div className="war-radar" aria-hidden="true">
                  {present.map(ag => {
                    const ang = (v3wHash(ag.id) % 360) * Math.PI / 180;
                    const rr = 16 + (v3wHash(ag.id + ':r') % 29);
                    const cls = pendingBy[ag.id] ? 'warn' : (!ag.status || ag.status === 'offline') ? 'idle' : 'good';
                    return <span key={ag.id} className={'blip ' + cls} title={ag.name + ' · ' + (ag.statusLabel || ag.status || '')}
                      style={{ left: (50 + Math.cos(ang) * rr).toFixed(1) + '%', top: (50 + Math.sin(ang) * rr).toFixed(1) + '%' }} />;
                  })}
                </div>
                <div className="v3w-legend">
                  <span><i style={{ background: '#34D399', boxShadow: '0 0 6px #34D399' }} />active</span>
                  <span><i style={{ background: '#E8C766', boxShadow: '0 0 6px #E8C766' }} />needs approval</span>
                  <span><i style={{ background: '#64748B' }} />offline</span>
                </div>
              </div>
            </WarPanel>

            {/* b — mission objectives */}
            <WarPanel icon="target" title="MISSION OBJECTIVES" chip={<span className="v3w-pct">{mission.progress + '%'}</span>}>
              <div className="v3w-mission-name">{mission.name}</div>
              {mission.phase ? <div className="v3w-mission-phase">{mission.phase}</div> : null}
              <div className="v3w-bar"><i style={{ width: mission.progress + '%' }} /></div>
              <div className="v3w-objectives">
                {(mission.steps || []).map((s, i) => (
                  <div key={i} className={'war-objective' + (s.done ? ' done' : '') + (s.active ? ' active' : '')}>
                    <span className="st">{s.done ? <Icon name="check" size={9} /> : s.active ? '›' : ''}</span>
                    <span className="v3w-obj-t">{s.t}</span>
                  </div>
                ))}
              </div>
              {mission.next && <div className="v3w-next"><Icon name="corner-down-right" size={12} />{mission.next.text}</div>}
            </WarPanel>

            {/* c — approval board (live) */}
            <WarPanel icon="shield-check" title="APPROVAL BOARD" variant="holo--gold"
              chip={pending.length ? <span className="mc-chip gold"><span className="dot" />{pending.length + ' WAITING'}</span> : null}>
              {pending.length === 0
                ? <div className="v3w-empty">Queue clear.</div>
                : pending.map(ap => (
                  <div key={ap.id} className="v3w-appr">
                    <div className="v3w-appr__top">
                      <span className="v3w-appr__subj">{ap.subject}</span>
                      <span className={'mc-chip ' + (ap.risk === 'high' ? 'crimson' : ap.risk === 'med' ? 'gold' : 'slate')}><span className="dot" />{ap.risk}</span>
                    </div>
                    <div className="v3w-appr__meta">{'by ' + warName(ap.by) + (ap.age ? ' · ' + ap.age : '')}</div>
                    <div className="v3w-appr__act">
                      <Btn variant="gold" size="sm" icon="check" onClick={() => decide(ap.id, 'approve')}>Approve</Btn>
                      <Btn variant="quiet" size="sm" icon="pause" onClick={() => decide(ap.id, 'hold')}>Hold</Btn>
                    </div>
                  </div>
                ))}
              <div className="v3w-rule">{AUTONOMY_RULES[mode] || AUTONOMY_RULES.manual}</div>
            </WarPanel>

            {/* d — presence (the roster, kept + restyled) */}
            <WarPanel icon="users-round" title="PRESENCE">
              <div className="mc-war__present">
                <div className="mc-war__pres">
                  <div className="av" style={{ background: 'linear-gradient(145deg,#A87B2E,#F3D27A)' }}>L</div>
                  <span className="nm">Lew</span><span className="st">you</span>
                </div>
                {present.map(ag => (
                  <div key={ag.id} className="mc-war__pres">
                    <AgentAv agent={ag} size={26} />
                    <span className="nm">{ag.name}</span>
                    {ag.connectedVia && <span className="v3w-tag">{ag.connectedVia}</span>}
                    <span className={'v3w-pchip' + (ag.status && ag.status !== 'offline' ? ' on' : '')}>{ag.statusLabel}</span>
                  </div>
                ))}
              </div>
            </WarPanel>

            {/* quick orders — kept from the original side panel */}
            <WarPanel icon="zap" title="QUICK ORDERS">
              <div className="mc-order-chips">
                {quickOrders.map((q, i) => <button key={i} className="mc-order-chip" onClick={() => { setVal(q); }}>{q}</button>)}
              </div>
              <div className="v3w-rule" style={{ marginTop: 12 }}>Sage logs every order and routes it to the right agent — even while you’re at work.</div>
            </WarPanel>

          </div>
        </div>
      </div>
    </div>
  );
}

// ============ CONNECTORS (create real connections) ============
const CONN_LS_KEY = 'mc_connections_v1';
function loadConns() {
  try { const s = JSON.parse(localStorage.getItem(CONN_LS_KEY)); if (Array.isArray(s)) return s; } catch (e) {}
  // Fallback: seed from window.MC.connections. Live-backend rows ({id,name,method,live})
  // are normalized into the card shape the page stores; seed rows pass through as-is.
  return (window.MC.connections || []).map(c => (c.catId ? c : {
    id: 'cx-' + c.id, catId: c.id, name: c.name, method: c.method || 'API Key',
    status: c.live ? 'live' : 'idle', meta: c.live ? 'backend · live' : (c.keyPresent ? 'key present' : 'not connected'),
  }));
}
function methodIco(m) {
  return ({ 'API Key': 'key-round', 'MCP': 'plug', 'CLI': 'terminal', 'OAuth': 'log-in', 'Bot Token': 'key-round', 'Webhook': 'link' })[m] || 'plug';
}
const METHOD_INFO = {
  'MCP': 'Model Context Protocol — agents call tools directly (best)',
  'API Key': 'Server-side key, set in environment',
  'OAuth': 'Browser sign-in authorization',
  'CLI': 'Command-line login/session',
  'Bot Token': 'Bot account token',
  'Webhook': 'Push events to a URL you host',
};
// Plug-and-play paths — one line each, copy-ready.
const PLUG_PATHS = [
  {
    id: 'mcp', tag: 'MCP', hint: METHOD_INFO.MCP,
    line: 'register mcp.config.example.json → tools mc_status / chat_post / agent_set_status …',
    copy: '{ "mcpServers": { "mission-control": { "command": "node", "args": ["server/mcp.js"], "cwd": "/path/to/legacy-mission-control", "env": { "MC_API": "http://127.0.0.1:8754" } } } }',
  },
  {
    id: 'cli', tag: 'CLI', hint: METHOD_INFO.CLI,
    line: './bin/mc say "Reporting in." --as kratos',
    copy: './bin/mc say "Reporting in." --as kratos',
  },
  {
    id: 'rest', tag: 'REST', hint: 'HTTP POST — anything that speaks JSON can report in',
    line: 'POST /api/chat {channel,from,text}',
    copy: 'curl -X POST http://127.0.0.1:8754/api/chat -H "Content-Type: application/json" -d \'{"channel":"warroom","from":"kratos","text":"Reporting in."}\'',
  },
];

function Connectors() {
  const [conns, setConns] = useS(loadConns);
  const [modal, setModal] = useS(false);
  const [copied, setCopied] = useS(null);
  const [, setTick] = useS(0);
  // honesty refresh: re-read live MC.connections whenever the backend patches it
  useE(() => {
    const bump = () => setTick(n => n + 1);
    window.addEventListener('mc:live', bump);
    return () => window.removeEventListener('mc:live', bump);
  }, []);

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

  // live honesty: a connector only shows LIVE when the backend itself says so
  const liveEntry = (catId) => (window.MC.connections || []).find(x => x.id === catId && typeof x.live === 'boolean');
  const liveFor = (catId) => { const e = liveEntry(catId); return !!(e && e.live === true); };
  const liveCount = (window.MC.connections || []).filter(x => x.live === true).length;
  const connFor = (catId) => conns.find(c => c.catId === catId && c.status === 'live') || conns.find(c => c.catId === catId);

  const doCopy = (id, text) => {
    try { navigator.clipboard && navigator.clipboard.writeText(text); } catch (e) {}
    setCopied(id);
    setTimeout(() => setCopied(c => (c === id ? null : c)), 1400);
  };
  // catalog method chip click: switch the stored method when connected,
  // otherwise open the New Connection flow preselected on this service+method
  const pickMethod = (entry, m) => {
    const cn = connFor(entry.id);
    if (cn) { if (cn.method !== m) persist(conns.map(c => (c.id === cn.id ? { ...c, method: m } : c))); }
    else setModal({ sel: entry.id, method: m });
  };

  return (
    <div className="fade-up">
      <div className="mc-section__head">
        <div className="mc-page-head" style={{ marginBottom: 0 }}>
          <h2>Connectors</h2>
          <p>{liveCount + ' live connection' + (liveCount === 1 ? '' : 's') + ' (backend-verified). Add models, agents, channels, and apps — API key, MCP, CLI, OAuth, bot token, or webhook per service.'}</p>
        </div>
        <Btn variant="cyan" size="sm" icon="plus" onClick={() => setModal(true)}>New connection</Btn>
      </div>

      {/* ===== HOW AGENTS PLUG IN ===== */}
      <div className="holo holo--gold v3w-plug">
        <div className="holo-sheen" />
        <div className="v3w-panel__head">
          <span className="v3w-panel__t v3w-panel__t--gold"><Icon name="plug" size={13} />HOW AGENTS PLUG IN</span>
          <span className="hud-chip">3 PATHS · PLUG-AND-PLAY</span>
        </div>
        {PLUG_PATHS.map(p => (
          <div key={p.id} className="v3w-plug__row">
            <span className="v3w-plug__tag">{p.tag}</span>
            <code className="v3w-plug__line" title={p.hint}>{p.line}</code>
            <button className={'v3w-copy' + (copied === p.id ? ' is-copied' : '')} onClick={() => doCopy(p.id, p.copy)} aria-label={'Copy ' + p.tag + ' snippet'}>
              <Icon name={copied === p.id ? 'check' : 'save'} size={12} />{copied === p.id ? 'copied' : 'copy'}
            </button>
          </div>
        ))}
      </div>

      {/* ===== CATALOG — every connect method per app ===== */}
      <div className="mc-section">
        <div className="mc-section__title" style={{ fontSize: 12, marginBottom: 12 }}>Catalog · every connect method per app</div>
        <div className="v3w-cat-grid">
          {window.MC.connectorCatalog.map(entry => {
            const cn = connFor(entry.id);
            const isLive = liveFor(entry.id);
            const le = liveEntry(entry.id);
            const onMethod = cn ? cn.method : (isLive && le ? le.method : null);
            return (
              <div key={entry.id} className="holo v3w-cat">
                <div className="holo-sheen" />
                <div className="v3w-cat__top">
                  <div className="mc-conn__ico"><Icon name={entry.glyph} size={17} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mc-conn__nm">{entry.name}</div>
                    <div className="mc-conn__note">{entry.cat + ' · ' + entry.blurb}</div>
                  </div>
                  {isLive
                    ? <span className="mc-chip good"><span className="dot" />Live</span>
                    : (cn && cn.status === 'live' ? <span className="mc-chip gold"><span className="dot" />Configured</span> : null)}
                </div>
                <div className="conn-methods">
                  {entry.methods.map(m => (
                    <button key={m} className={'conn-method' + (onMethod === m ? ' is-on' : '')} title={METHOD_INFO[m] || m} onClick={() => pickMethod(entry, m)}>
                      <Icon name={methodIco(m)} size={11} />{m}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== CONNECTED LIST (existing flow, honesty chips) ===== */}
      {groups.map(g => (
        <div key={g} className="mc-section">
          <div className="mc-section__title" style={{ fontSize: 12, marginBottom: 12 }}>{g}</div>
          <div className="mc-conn-grid">
            {byCat[g].map(c => {
              const ct = cat(c.catId);
              const cfg = c.status === 'live';
              const isLive = liveFor(c.catId);
              return (
                <div key={c.id} className="mc-conn">
                  <div className="mc-conn__top">
                    <div className="mc-conn__ico"><Icon name={ct.glyph} size={19} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mc-conn__nm">{c.name}</div>
                      <div className="mc-conn__note">{c.meta}</div>
                    </div>
                    <span className={'mc-chip ' + (isLive ? 'good' : cfg ? 'gold' : 'slate')}><span className="dot" />{isLive ? 'Live' : cfg ? 'Configured' : 'Idle'}</span>
                  </div>
                  <div className="mc-conn__field" style={{ marginTop: 4 }}>
                    <i><Icon name={methodIco(c.method)} size={14} /></i>
                    <span style={{ flex: 1, color: 'var(--fg-2)' }} title={METHOD_INFO[c.method] || c.method}>{'via ' + c.method}</span>
                    <span className="mono" style={{ fontSize: 10, color: isLive ? '#4fe3b5' : 'var(--fg-3)' }} title={isLive ? 'Backend reports this connection live' : 'Not verified live by the backend'}>{isLive ? '●' : '○'}</span>
                  </div>
                  <div className="mc-conn__foot">
                    <Btn variant={cfg ? 'ghost' : 'cyan'} size="sm" icon={cfg ? 'check' : 'plug'} onClick={() => reconnect(c.id)}>{cfg ? 'Reconnect' : 'Connect'}</Btn>
                    <button className="mc-conn__del" onClick={() => remove(c.id)} aria-label="Remove connection"><Icon name="x" size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {modal && <NewConnectionModal onClose={() => setModal(false)} onCreate={create}
        initialSel={(modal && modal.sel) || null} initialMethod={(modal && modal.method) || null} />}
    </div>
  );
}

function NewConnectionModal({ onClose, onCreate, initialSel = null, initialMethod = null }) {
  const [sel, setSel] = useS(initialSel);
  const [method, setMethod] = useS(initialMethod);
  const [name, setName] = useS(() => {
    const c0 = initialSel ? window.MC.connectorCatalog.find(c => c.id === initialSel) : null;
    return c0 ? c0.name : '';
  });
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
          React.createElement('div', { className: 'mc-conn__methods wrap' }, ...cat.methods.map(m => React.createElement('button', { key: m, className: 'mc-method' + (method === m ? ' is-active' : ''), title: METHOD_INFO[m] || m, onClick: () => setMethod(m) }, m))),
          method && React.createElement('div', { className: 'v3w-minfo' }, METHOD_INFO[method] || ''),
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
      ...window.MC.personas.map(p => React.createElement('div', { key: p.id, className: 'mc-conn holo' },
        React.createElement('div', { className: 'holo-sheen' }),
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
    React.createElement('div', { className: 'mc-conn holo', style: { borderStyle: 'dashed', borderColor: 'rgba(35,214,245,0.3)' } },
      React.createElement('div', { className: 'holo-sheen' }),
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
    React.createElement('div', { className: 'holo v3w-ph' },
      React.createElement('div', { className: 'holo-sheen' }),
      React.createElement('div', { className: 'mc-placeholder__ico' }, React.createElement(Icon, { name: glyph || 'circle-dot', size: 30 })),
      React.createElement('h3', null, title),
      React.createElement('p', null, desc || 'This workspace is wired into the operating system and ready for its first build.')),
  );
}

Object.assign(window, { AgentPage, WarRoom, Connectors, Pantheon, Placeholder });
