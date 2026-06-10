// home.jsx — Mission Control home · v3 ALIEN-TECH command bridge.
// Zero-build React 18 via Babel standalone — no imports, window globals only.
// Every original section + ALL live wiring preserved:
//   HeroStrip (greeting + honest LIVE/DEMO chips) · MetricCards (MC.heroMetrics)
//   AgentGrid ('cards' + 'roster' via agentVariant) · MissionCard
//   ApprovalsQueue (MCLive.resolveApproval + flash) · DreamingBrief
//   MemoryPulse · MemoryLoop · Artifacts (filters + delete) · WarRoomMini (live channel)
// Visual layer: holographic panels (.holo + sheen), HUD eyebrows/readouts,
// alien canvas backdrop, conduit-accented agent cards. Page CSS: styles/v3-home.css.
const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

// ---------- shared holo panel header: eyebrow + title (+ sub line, right slot) ----------
function HomePanelHead({ eyebrow, icon, iconColor, title, sub, right }) {
  return (
    <div className="mc-phead v3h-phead">
      <div className="v3h-phead__id">
        <div className="hud-eyebrow">{eyebrow}</div>
        <div className="mc-ptitle">
          {icon && <i style={iconColor ? { color: iconColor } : null}><Icon name={icon} size={15} /></i>}
          {title}
        </div>
        {sub || null}
      </div>
      {right || null}
    </div>
  );
}

// ---------- autonomy mode, live: re-reads MC.autonomy on 'mc:live' + SSE 'mode' events ----------
const HOME_AUTONOMY_HINTS = {
  manual: 'Every action waits for you.',
  semi: 'Low-risk auto-approves.',
  full: 'Only high-risk waits for you.',
};
function useAutonomyModeH() {
  const [mode, setMode] = useStateH(() => (window.MC && window.MC.autonomy) || 'manual');
  useEffectH(() => {
    const sync = () => setMode((window.MC && window.MC.autonomy) || 'manual');
    window.addEventListener('mc:live', sync);
    const off = (window.MCLive && window.MCLive.onEvent)
      ? window.MCLive.onEvent((e) => { if (e.type === 'mode' && e.mode) { window.MC.autonomy = e.mode; setMode(e.mode); } })
      : null;
    return () => { window.removeEventListener('mc:live', sync); if (off) off(); };
  }, []);
  return mode;
}

// ---------- hero: holographic command header ----------
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
  return (
    <header className="v3h-hero holo fade-up">
      <div className="holo-sheen" />
      <div className="v3h-hero__top">
        <div className="v3h-hero__id">
          <div className="hud-eyebrow">Legacy Automations · Command Bridge</div>
          <div className="mc-hero__greet v3h-hero__greet">
            Good {tod}, <span className="accent">{op.name}.</span>
          </div>
          <p className="mc-hero__sum v3h-hero__sum">
            {online > 0
              ? <>
                  <b>{online} of {agents.length} agents online</b>, <b>{working} working</b>, and{' '}
                  <b>{approvals} approval{approvals === 1 ? '' : 's'}</b> waiting on your sign-off.
                </>
              : 'Your command center is wired to the live backend and your vault. No agents have reported in yet — connect them via MCP or CLI (see the handoff) and their live status appears here.'}
          </p>
        </div>
        <div className="mc-hero__meta v3h-hero__meta">
          <span className={'mc-chip ' + (live ? 'good' : '')}>
            <span className="dot" />{live ? 'LIVE · VAULT CONNECTED' : 'DEMO · BACKEND OFFLINE'}
          </span>
          <span className="mc-chip cyan"><span className="dot" />{notes + ' NOTES IN VAULT'}</span>
        </div>
      </div>
      <div className="v3h-hero__stats">
        <div className="v3h-hero__stat"><HoloStat label="Agents Online" value={String(online)} suffix={'/ ' + agents.length} size={30} /></div>
        <div className="v3h-hero__stat"><HoloStat label="Working" value={String(working)} size={30} /></div>
        <div className="v3h-hero__stat"><HoloStat label="Approvals Waiting" value={String(approvals)} tone={approvals > 0 ? 'gold' : undefined} size={30} /></div>
        <div className="v3h-hero__stat"><HoloStat label="Vault Notes" value={String(notes)} size={30} /></div>
      </div>
      <div className="hud-rail v3h-hero__rail" />
    </header>
  );
}

// ---------- hero metric cards (live MC.heroMetrics) ----------
function MetricCards() {
  return (
    <div className="mc-metrics v3h-metrics">
      {window.MC.heroMetrics.map((m) => {
        const gold = m.tone === 'gold';
        const color = gold ? '#E8C766' : '#23D6F5';
        return (
          <div key={m.id} className={'mc-metric holo v3h-metric' + (m.featured ? ' is-featured holo--gold' : '') + ' fade-up'}>
            <div className="holo-sheen" />
            <div className="mc-metric__top">
              <div className={'mc-metric__ico' + (gold ? ' gold' : '')}><Icon name={m.glyph} size={15} /></div>
              <div className="mc-metric__label">{m.label}</div>
            </div>
            <div className={'mc-metric__val hud-readout' + (gold ? ' glow-gold' : '')}>
              {m.value}
              {m.suffix && <span className="sfx">{m.suffix}</span>}
            </div>
            <div className="mc-metric__foot">
              <span className={'mc-metric__delta' + (gold ? ' gold' : '')}>{m.delta}</span>
              <Sparkline data={m.spark} color={color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- agent grid (two variants via the agentVariant tweak) ----------
function AgentGrid({ variant, onNav }) {
  const A = window.MC.agents;
  const onlineN = window.MCLive ? window.MCLive.onlineCount() : 0;
  const onlineChip = (
    <span className={'mc-chip ' + (onlineN ? 'good' : '')}><span className="dot" />{onlineN + ' ONLINE'}</span>
  );
  if (variant === 'roster') {
    return (
      <div className="mc-panel holo v3h-panel fade-up">
        <div className="holo-sheen" />
        <HomePanelHead eyebrow="Crew · Live Telemetry" icon="cpu" title="Agent Roster" right={onlineChip} />
        <div className="mc-roster v3h-roster">
          {A.map(a => (
            <button key={a.id} className="mc-roster__row" style={{ '--ag-acc': a.accent }} onClick={() => onNav('agent:' + a.id)}>
              <AgentAv agent={a} size={34} />
              <div className="mc-roster__id">
                <div className="mc-roster__name">
                  {a.name} <span style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 400 }}>{'· ' + a.role}</span>
                </div>
                <div className="mc-roster__task">{a.task}</div>
              </div>
              <span className={'mc-chip ' + a.theme}><span className="dot" />{a.statusLabel}</span>
              <Icon name="chevron-right" size={15} style={{ color: 'var(--fg-3)' }} />
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mc-panel holo v3h-panel fade-up">
      <div className="holo-sheen" />
      <HomePanelHead eyebrow="Crew · Live Telemetry" icon="cpu" title="Agent Status" right={onlineChip} />
      <div className="mc-agents v3h-agents">
        {A.map(a => {
          const glow = a.theme === 'cyan' ? 'rgba(35,214,245,0.4)'
            : a.theme === 'crimson' ? 'rgba(244,81,107,0.4)'
            : a.theme === 'emerald' ? 'rgba(52,211,153,0.4)'
            : a.theme === 'violet' ? 'rgba(167,139,250,0.4)'
            : 'rgba(216,167,74,0.4)';
          return (
            <button
              key={a.id} className="mc-agentcard"
              style={{ '--ag-acc': a.accent, '--ag-line': `color-mix(in srgb, ${a.accent} 22%, transparent)`, '--ag-glow': glow, '--ag-grad': a.avatarGrad }}
              onClick={() => onNav('agent:' + a.id)}
            >
              <div className="mc-agentcard__top">
                <AgentAv agent={a} size={40} />
                <div className="mc-agentcard__id">
                  <div className="mc-agentcard__name">{a.name}</div>
                  <div className="mc-agentcard__role">{a.role}</div>
                </div>
                <span className={'mc-chip ' + a.theme}><span className="dot" />{a.statusLabel}</span>
              </div>
              <div className="mc-agentcard__task">{a.task}</div>
              <div className="mc-agentcard__foot">
                <span className="mc-modeltag">{a.model}</span>
                <div className="mc-act">
                  {[0, 1, 2, 3, 4].map(n => <span key={n} style={{ background: a.accent, animationDelay: (n * 0.12) + 's' }} />)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- active mission ----------
function MissionCard() {
  const m = window.MC.mission;
  return (
    <div className="mc-panel mc-panel--gold holo holo--gold v3h-panel fade-up">
      <div className="holo-sheen" />
      <HomePanelHead
        eyebrow="Directive · Priority One" icon="target" iconColor="var(--la-gold)" title="Active Mission"
        sub={<div className="mc-psub">{m.phase}</div>}
        right={<span className="mc-chip gold"><span className="dot" />{m.progress + '%'}</span>}
      />
      <div className="mc-mission__name">{m.name}</div>
      <div className="mc-mission__meter"><div className="mc-mission__fill" style={{ width: m.progress + '%' }} /></div>
      <div className="mc-mission__steps">
        {m.steps.map((s, i) => (
          <div key={i} className={'mc-step' + (s.done ? ' done' : '') + (s.active ? ' active' : '')}>
            <span className="mc-step__bullet">{s.done && <Icon name="check" size={10} />}</span>
            {s.t}
          </div>
        ))}
      </div>
      <div className="mc-next">
        <div className="mc-next__ico"><Icon name="corner-down-right" size={15} /></div>
        <div className="mc-next__txt">Next: <b>{m.next.text}</b></div>
      </div>
    </div>
  );
}

// ---------- approvals queue (interactive · live resolve) ----------
function ApprovalsQueue() {
  const [items, setItems] = useStateH(() => window.MC.approvals || []);
  const [flash, setFlash] = useStateH(null);
  const mode = useAutonomyModeH();
  // keep in sync with live approvals (live.js reassigns MC.approvals on SSE events)
  useEffectH(() => { setItems(window.MC.approvals || []); }, [window.MC.approvals]);
  const resolve = (id, ok) => {
    setFlash({ id, ok });
    if (window.MCLive && window.MCLive.online) window.MCLive.resolveApproval(id, ok ? 'approve' : 'hold');
    setTimeout(() => { setItems(p => p.filter(x => x.id !== id)); setFlash(null); }, 360);
  };
  const riskChip = { low: 'good', med: 'gold', high: 'crimson' };
  return (
    <div className={'mc-panel holo v3h-panel fade-up' + (items.length > 0 ? ' holo--gold' : '')}>
      <div className="holo-sheen" />
      <HomePanelHead
        eyebrow="Authority Gate" icon="shield-check" iconColor="var(--la-gold)" title="Approvals"
        sub={
          <div className="v3h-autohint">
            <span className={'v3h-autohint__mode is-' + mode}>{mode}</span>
            {HOME_AUTONOMY_HINTS[mode] || HOME_AUTONOMY_HINTS.manual}
          </div>
        }
        right={items.length > 0
          ? <span className="mc-chip gold"><span className="dot" />{items.length + ' WAITING'}</span>
          : null}
      />
      {items.length === 0
        ? <div className="mc-approve__done"><Icon name="check-circle" size={26} /><div>Queue clear. Nothing waiting on you.</div></div>
        : <div className="mc-approve">
            {items.map(a => {
              const by = window.MC.agents.find(x => x.id === a.by) || { name: a.by || 'system', avatarGrad: 'linear-gradient(145deg,#475569,#94A3B8)' };
              const f = flash && flash.id === a.id;
              return (
                <div key={a.id} className="mc-approve__row v3h-approve-row" style={f ? { opacity: 0, transform: 'translateX(' + (flash.ok ? '' : '-') + '12px)' } : null}>
                  <div className="mc-approve__top">
                    <div className="mc-approve__subj">{a.subject}</div>
                    <span className={'mc-chip ' + riskChip[a.risk]}><span className="dot" />{a.risk + ' risk'}</span>
                  </div>
                  <div className="mc-approve__detail">{a.detail}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div className="mc-approve__by">
                      <div className="av" style={{ background: by.avatarGrad }}>{by.name[0]}</div>
                      {by.name} · {a.age}
                    </div>
                    <div className="mc-approve__act">
                      <Btn variant="gold" size="sm" icon="check" onClick={() => resolve(a.id, true)}>Approve</Btn>
                      <Btn variant="quiet" size="sm" icon="pause" onClick={() => resolve(a.id, false)}>Hold</Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>}
    </div>
  );
}

// ---------- dreaming brief ----------
function DreamingBrief() {
  const [items, setItems] = useStateH(window.MC.dreaming);
  return (
    <div className="mc-panel holo v3h-panel fade-up">
      <div className="holo-sheen" />
      <HomePanelHead
        eyebrow="Night Cycle · Layer 7" icon="moon-star" title="Dreaming Brief"
        sub={<div className="mc-psub">Overnight · surfaced while you slept</div>}
        right={<span className="hud-chip">Night Loop</span>}
      />
      {items.length === 0
        ? <div className="mc-approve__done"><Icon name="check-circle" size={26} /><div>Brief clear — nothing waiting from the night loop.</div></div>
        : <div className="mc-dream">
            {items.map(d => (
              <div key={d.id} className="mc-dream__row">
                <div className={'mc-dream__ico ' + d.tone}><Icon name={d.glyph} size={14} /></div>
                <div className="mc-dream__body">
                  <div className="mc-dream__txt">{d.text}</div>
                  <div className="mc-dream__time">{d.time + ' · suggestion'}</div>
                </div>
                <button className="mc-dream__x" onClick={() => setItems(p => p.filter(x => x.id !== d.id))} aria-label="Dismiss">
                  <Icon name="x" size={13} />
                </button>
              </div>
            ))}
          </div>}
    </div>
  );
}

// ---------- memory pulse (live vault writes) ----------
function MemoryPulse({ onNav }) {
  const pulse = window.MC.memoryPulse || [];
  return (
    <div className="mc-panel holo v3h-panel fade-up">
      <div className="holo-sheen" />
      <HomePanelHead
        eyebrow="Vault Stream · Layer 2" icon="orbit" title="Memory Pulse"
        right={<button className="mc-link" onClick={() => onNav('galaxy')}>Open Galaxy<Icon name="arrow-right" size={13} /></button>}
      />
      {pulse.length === 0
        ? <div className="v3h-empty">No vault writes streamed yet — the pulse appears once the backend is connected to your vault.</div>
        : <div className="mc-mempulse">
            {pulse.map(m => (
              <button key={m.id} className="mc-mem__row" onClick={() => onNav('galaxy')} style={{ all: 'unset', cursor: 'pointer', display: 'flex' }}>
                <span className="mc-mem__star" style={{ background: `rgba(35,214,245,${0.3 + m.glow * 0.7})`, boxShadow: `0 0 ${4 + m.glow * 10}px rgba(35,214,245,${m.glow})` }} />
                <div className="mc-mem__id">
                  <div className="mc-mem__title">{m.title}</div>
                  <span className="mc-mem__tag">{'#' + m.tag}</span>
                </div>
                <span className="mc-mem__time">{m.time}</span>
              </button>
            ))}
          </div>}
    </div>
  );
}

// ---------- recent artifacts ----------
const KIND_GLYPH = { html: 'code', doc: 'file-text', code: 'terminal', image: 'image', video: 'video' };
function Artifacts() {
  const [filter, setFilter] = useStateH('all');
  const [items, setItems] = useStateH(window.MC.artifacts);
  // pick up live vault artifacts when live.js reassigns MC.artifacts
  useEffectH(() => { setItems(window.MC.artifacts || []); }, [window.MC.artifacts]);
  const kinds = ['all', 'doc', 'html', 'code', 'image', 'video'];
  const shown = items.filter(a => filter === 'all' || a.kind === filter);
  return (
    <div className="mc-panel holo v3h-panel fade-up">
      <div className="holo-sheen" />
      <HomePanelHead
        eyebrow="Production · Layer 6" icon="sparkles" title="Recent Outputs"
        right={
          <div className="mc-art__filters">
            {kinds.map(k => (
              <button key={k} className={'mc-art__filter' + (filter === k ? ' is-active' : '')} onClick={() => setFilter(k)}>{k}</button>
            ))}
          </div>
        }
      />
      {shown.length === 0
        ? <div className="v3h-empty">No outputs here yet — agent and vault artifacts land in this bay as they ship.</div>
        : <div className="mc-art__grid">
            {shown.map(a => {
              const by = window.MC.agents.find(x => x.id === a.by)
                || (window.MC.personas || []).find(x => x.id === a.by)
                || { name: a.by, avatarGrad: 'linear-gradient(145deg,#444,#888)' };
              return (
                <div key={a.id} className="mc-tile">
                  <div className={'mc-tile__prev k-' + a.kind}>
                    <span className="mc-tile__kind">{a.kind}</span>
                    <span className="mc-tile__glyph"><Icon name={KIND_GLYPH[a.kind]} size={26} /></span>
                    <button className="mc-tile__del" onClick={() => setItems(p => p.filter(x => x.id !== a.id))} aria-label="Delete artifact">
                      <Icon name="x" size={13} />
                    </button>
                  </div>
                  <div className="mc-tile__body">
                    <div className="mc-tile__title">{a.title}</div>
                    <div className="mc-tile__sum">{a.summary}</div>
                    <div className="mc-tile__foot">
                      <span>{by.name}</span>
                      <span>{a.time + ' ago'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>}
    </div>
  );
}

// ---------- war room mini (live channel) ----------
function WarRoomMini({ onNav }) {
  const { messages, send: postMsg, online } = window.MCLive.useChannel('warroom');
  const [val, setVal] = useStateH('');
  const feedRef = useRefH(null);
  useEffectH(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [messages]);
  const msgs = messages.slice(-6);
  const send = () => { if (!val.trim()) return; postMsg('lew', val); setVal(''); };
  return (
    <div className="mc-panel holo v3h-panel fade-up" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="holo-sheen" />
      <HomePanelHead
        eyebrow="Comms · Open Channel" icon="messages-square" title="War Room"
        right={<button className="mc-link" onClick={() => onNav('warroom')}>Full channel<Icon name="arrow-right" size={13} /></button>}
      />
      <div className="mc-warmini" style={{ flex: 1 }}>
        <div className="mc-warmini__feed" ref={feedRef}>
          {msgs.length === 0 && (
            <div style={{ opacity: .7, fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--fg-3)', padding: '6px 2px' }}>
              {online
                ? 'No messages yet — this channel is live. Post here, or your team can post via MCP / CLI.'
                : 'No messages yet. Backend offline — start the server to bring this channel live.'}
            </div>
          )}
          {msgs.map(mm => {
            const who = mm.from === 'lew'
              ? window.MC.operator
              : (window.MC.agents.find(x => x.id === mm.from) || { name: mm.from, accent: '#94A3B8', avatarGrad: 'linear-gradient(145deg,#475569,#94A3B8)' });
            const grad = mm.from === 'lew' ? 'linear-gradient(145deg,#A87B2E,#F3D27A)' : who.avatarGrad;
            return (
              <div key={mm.id} className="mc-msg">
                <div className="mc-msg__av" style={{ background: grad }}>{who.name[0]}</div>
                <div className="mc-msg__body">
                  <div className="mc-msg__head">
                    <span className="mc-msg__name" style={{ color: mm.from === 'lew' ? '#F3D27A' : who.accent }}>{who.name}</span>
                    <span className="mc-msg__time">{window.MCLive.fmtTime(mm.ts)}</span>
                  </div>
                  <div className="mc-msg__txt">{mm.text}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mc-composer">
          <input
            value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Message your team…" aria-label="Message the war room"
          />
          <button className="mc-composer__send" onClick={send} aria-label="Send"><Icon name="send" size={15} /></button>
        </div>
      </div>
    </div>
  );
}

// ---------- self-improving loop ----------
function MemoryLoop({ onNav }) {
  const steps = [
    { g: 'sparkles', t: 'Agents produce', d: 'builds, content, reviews' },
    { g: 'box', t: 'Write to vault', d: 'logged as linked notes' },
    { g: 'moon-star', t: 'Dream nightly', d: 'patterns + savings surface' },
    { g: 'trending-up', t: 'Improve', d: 'the loop compounds' },
  ];
  return (
    <div className="mc-panel holo v3h-panel fade-up">
      <div className="holo-sheen" />
      <HomePanelHead
        eyebrow="Flywheel · Layer 7" icon="trending-up" title="Self-Improving Loop"
        sub={<div className="mc-psub">Layer 7 · the compounding engine</div>}
        right={<button className="mc-link" onClick={() => onNav('dreaming')}>Dreaming<Icon name="arrow-right" size={13} /></button>}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'rgba(35,214,245,0.1)', border: '1px solid rgba(35,214,245,0.26)', color: 'var(--la-cyan)', flexShrink: 0 }}>
              <Icon name={s.g} size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{s.t}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>{s.d}</div>
            </div>
            {i < steps.length - 1 && <Icon name="arrow-right" size={12} style={{ color: 'var(--fg-3)', transform: 'rotate(90deg)', opacity: .5 }} />}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, padding: '9px 12px', borderRadius: 10, background: 'rgba(43,216,160,0.08)', border: '1px solid rgba(43,216,160,0.26)', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#4fe3b5', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="pulse-dot good" style={{ width: 7, height: 7 }} />
        {((window.MC.obsidian && window.MC.obsidian.stats ? window.MC.obsidian.stats.written7d : 0)) + ' notes written this week · system getting smarter'}
      </div>
    </div>
  );
}

// ---------- page ----------
function HomeView({ onNav, agentVariant, heroVariant }) {
  return (
    <div className="sci-wrap v3h-wrap" style={{ minHeight: '100%' }}>
      <SciFiBackdrop variant="alien" />
      <div className="sci-fg">
        <HeroStrip />
        <MetricCards />
        <div className="mc-bento v3h-bento">
          <div className="span2"><AgentGrid variant={agentVariant} onNav={onNav} /></div>
          <MissionCard />
          <ApprovalsQueue />
          <DreamingBrief />
          <MemoryPulse onNav={onNav} />
          <MemoryLoop onNav={onNav} />
          <div className="span2"><Artifacts /></div>
          <WarRoomMini onNav={onNav} />
        </div>
      </div>
    </div>
  );
}

window.HomeView = HomeView;
