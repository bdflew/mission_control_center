// AgentPage.jsx — per-agent detail, distinct theme, switchable panels
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const AG_TABS = [
  { id: 'goals', label: 'Goals', glyph: 'flag' },
  { id: 'health', label: 'Health', glyph: 'activity' },
  { id: 'chat', label: 'Chat', glyph: 'message-square' },
  { id: 'improvements', label: 'Improvements', glyph: 'trending-up' },
];

// canned per-agent reply flavor
function agentReply(agent, text) {
  const t = text.toLowerCase();
  const map = {
    sage: [
      "Copy that. Routing it now — I'll have the right agent on it within the minute.",
      "Logged and prioritized. I'll surface it in tonight's brief if it's not closed by EOD.",
      "On it. I'll keep the queue balanced and ping you only if something needs your call.",
    ],
    kratos: [
      "Understood. I'll prove it works before it ships — running an adversarial pass first.",
      "Noted. Security check + QA review queued. Nothing goes out without an approval gate.",
      "On it. I'll reproduce, repair, and hand you a clean diff to sign off on.",
    ],
    faye: [
      "Got it. I'll build it layer by layer and screenshot each step before handing to Kratos.",
      "On it — keeping it within the design tokens, no palette drift. First cut shortly.",
      "Building now. I'll wire the interactions and leave the approval gate for you.",
    ],
    chloe: [
      "Love it. I'll tie every line to a business outcome and keep it premium.",
      "On it. Drafting now — I'll flag anything that drifts cheap or hypey.",
      "Got it. I'll have positioning options for your sign-off shortly.",
    ],
  };
  const pool = map[agent.id] || ["On it."];
  if (t.includes('status') || t.includes('what') ) return `Right now I'm ${agent.statusLabel.toLowerCase()}: ${agent.task}.`;
  if (t.includes('thank')) return "Anytime, Lew. That's what the system's for.";
  return pool[Math.floor(Math.random() * pool.length)];
}

function GoalsPanel({ agent }) {
  return (
    <div className="ag__cols ag__panel">
      <div className="mc-panel">
        <div className="mc-phead"><div className="mc-ptitle"><i style={{ color: agent.accent }}><Icon name="flag" /></i>Active Goals</div></div>
        {agent.goals.map((g, i) => (
          <div key={i} className="ag-goal">
            <div className="ag-goal__top">
              <span className="ag-goal__t">{g.t}</span>
              <span className="ag-goal__due">{g.due}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div className="ag-goal__meter" style={{ flex: 1 }}><div className="ag-goal__fill" style={{ width: g.p + '%' }}></div></div>
              <span className="ag-goal__pct">{g.p}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mc-panel">
        <div className="mc-phead"><div className="mc-ptitle"><i style={{ color: agent.accent }}><Icon name="target" /></i>Current Focus</div></div>
        <div style={{ padding: '8px 2px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.6 }}>{agent.task}</div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)' }}><span className="muted">Model</span><span>{agent.model}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)' }}><span className="muted">Status</span><span style={{ color: agent.accent }}>{agent.statusLabel}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)' }}><span className="muted">Tasks today</span><span>{agent.tasksToday}</span></div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
            <button className="mc-btn mc-btn--ghost mc-btn--sm" style={{ '--acc': agent.accent }} onClick={rippleClick}><Icon name="plus" />Set goal</button>
            <button className="mc-btn mc-btn--quiet mc-btn--sm" onClick={rippleClick}>Reassign</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthPanel({ agent }) {
  const health = Math.round(parseFloat(agent.uptime));
  const stats = [
    { l: 'Uptime', v: agent.uptime, pct: parseFloat(agent.uptime) },
    { l: 'Token budget used', v: agent.tokens, pct: 64 },
    { l: 'Tasks today', v: String(agent.tasksToday), pct: Math.min(100, agent.tasksToday * 2.2) },
    { l: 'Spend today', v: agent.spend, pct: 40 },
  ];
  return (
    <div className="ag__cols ag__panel">
      <div className="mc-panel ag-health">
        <div className="mc-phead" style={{ width: '100%' }}><div className="mc-ptitle"><i style={{ color: agent.accent }}><Icon name="heart-pulse" /></i>Vitals</div></div>
        <ProgressRing pct={health} color={agent.accent} size={150}>
          <div className="ag-ring__n" style={{ color: agent.accent }}>{health}<span style={{ fontSize: 16 }}>%</span></div>
          <div className="ag-ring__l">Health</div>
        </ProgressRing>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <span className="mc-chip" style={{ background: 'rgba(43,216,160,.12)', color: '#4fe3b5', border: '1px solid rgba(43,216,160,.34)' }}><span className="pulse-dot good" style={{ width: 6, height: 6 }}></span>Operational</span>
        </div>
      </div>
      <div className="mc-panel">
        <div className="mc-phead"><div className="mc-ptitle"><i style={{ color: agent.accent }}><Icon name="gauge" /></i>Telemetry</div></div>
        <div className="ag-hstats">
          {stats.map((s, i) => (
            <div key={i} className="ag-hstat">
              <div className="ag-hstat__top"><span className="l">{s.l}</span><span className="v">{s.v}</span></div>
              <div className="ag-hstat__bar"><div className="ag-hstat__fill" style={{ width: s.pct + '%' }}></div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImprovementsPanel({ agent }) {
  return (
    <div className="ag__panel">
      <div className="mc-panel">
        <div className="mc-phead">
          <div className="mc-ptitle"><i style={{ color: agent.accent }}><Icon name="sparkles" /></i>What {agent.name} learned</div>
          <span className="muted mono" style={{ fontSize: 10 }}>the loop · write-back</span>
        </div>
        {agent.improvements.map((im, i) => (
          <div key={i} className="ag-imp">
            <span className="ag-imp__ico"><Icon name="arrow-up-right" /></span>
            <div className="ag-imp__txt">{im}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPanel({ agent, thread, onSend }) {
  const [draft, setDraft] = useStateA('');
  const [typing, setTyping] = useStateA(false);
  const feedRef = useRefA(null);
  useEffectA(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [thread, typing]);

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const text = draft.trim();
    onSend({ from: 'me', text, time: nowTime() });
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      onSend({ from: agent.id, text: agentReply(agent, text), time: nowTime() });
      setTyping(false);
    }, 900 + Math.random() * 700);
  };

  return (
    <div className="ag__panel">
      <div className="mc-panel">
        <div className="mc-phead">
          <div className="mc-ptitle"><i style={{ color: agent.accent }}><Icon name="message-square" /></i>Direct line — {agent.name}</div>
          <span className="mc-chip" style={{ background: agent.line, color: agent.accent, border: `1px solid ${agent.accent}55` }}><span className="pulse-dot" style={{ width: 6, height: 6, background: agent.accent }}></span>{agent.statusLabel}</span>
        </div>
        <div className="ag-chat">
          <div className="ag-chat__feed" ref={feedRef}>
            {thread.map((m, i) => (
              <div key={i} className={`ag-bubble ${m.from === 'me' ? 'me' : 'them'}`}>
                <div className="ag-bubble__txt">{m.text}</div>
                <div className="ag-bubble__meta">{m.from === 'me' ? 'You' : agent.name} · {m.time}</div>
              </div>
            ))}
            {typing ? <div className="ag-bubble them"><div className="ag-bubble__txt typing" style={{ padding: 0 }}><span className="typing"><span></span><span></span><span></span></span></div></div> : null}
          </div>
          <form className="mc-composer ag-chat__composer" onSubmit={submit} style={{ '--acc': agent.accent }}>
            <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={`Message ${agent.name}…`} />
            <button type="submit" className="mc-composer__send" style={{ background: agent.avatarGrad }} aria-label="Send"><Icon name="arrow-up" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AgentPage({ agent, tab, onTab, thread, onSend }) {
  const glow = agent.theme === 'gold' ? 'rgba(216,167,74,.4)' : agent.theme === 'crimson' ? 'rgba(244,81,107,.4)' : agent.theme === 'emerald' ? 'rgba(52,211,153,.4)' : 'rgba(35,214,245,.4)';
  return (
    <div className={`ag theme-${agent.theme}`}>
      <div className="ag__hero">
        <div className="ag__herorow">
          <div className="ag__bigav" style={{ background: agent.avatarGrad }}>
            {agent.name[0]}
            <span className="live" style={{ background: agent.status === 'working' ? '#2BD8A0' : agent.status === 'approval' ? '#D8A74A' : '#64748B', boxShadow: `0 0 10px ${agent.status === 'working' ? '#2BD8A0' : '#D8A74A'}` }}></span>
          </div>
          <div className="ag__id">
            <div className="ag__name">{agent.name}</div>
            <div className="ag__role">{agent.role}</div>
            <div className="ag__blurb">{agent.blurb}</div>
            <div className="ag__metas">
              <span className="mc-chip" style={{ background: agent.line, color: agent.accent, border: `1px solid ${agent.accent}55` }}><span className="dot" style={{ background: agent.accent }}></span>{agent.statusLabel}</span>
              <span className="mc-modeltag">{agent.model}</span>
              <span className="mc-modeltag">{agent.task}</span>
            </div>
          </div>
          <div className="ag__heroside">
            <div className="ag__stat"><div className="n" style={{ color: agent.accent }}>{agent.uptime}</div><div className="l">Uptime</div></div>
            <div className="ag__stat"><div className="n">{agent.tasksToday}</div><div className="l">Tasks today</div></div>
            <div className="ag__stat"><div className="n">{agent.spend}</div><div className="l">Spend today</div></div>
          </div>
        </div>
      </div>

      <div className="ag__tabs">
        {AG_TABS.map(tb => (
          <button key={tb.id} className={`ag__tab ${tab === tb.id ? 'is-active' : ''}`} onClick={() => onTab(tb.id)}>
            <Icon name={tb.glyph} />{tb.label}
          </button>
        ))}
      </div>

      {tab === 'goals' && <GoalsPanel agent={agent} />}
      {tab === 'health' && <HealthPanel agent={agent} />}
      {tab === 'chat' && <ChatPanel agent={agent} thread={thread} onSend={onSend} />}
      {tab === 'improvements' && <ImprovementsPanel agent={agent} />}
    </div>
  );
}

window.AgentPage = AgentPage;
