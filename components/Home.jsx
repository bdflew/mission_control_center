// Home.jsx — Mission Control home (bento grid)
const { useState: useStateH } = React;

function MetricCard({ m }) {
  const color = m.tone === 'gold' ? '#E8C766' : '#23D6F5';
  return (
    <div className={`mc-metric ${m.featured ? 'is-featured' : ''}`}>
      <div className="mc-metric__top">
        <span className={`mc-metric__ico ${m.tone === 'gold' ? 'gold' : ''}`}><Icon name={m.glyph} /></span>
        <span className="mc-metric__label">{m.label}</span>
      </div>
      <div className="mc-metric__val">{m.value}{m.suffix ? <span className="sfx">{m.suffix}</span> : null}</div>
      <div className="mc-metric__foot">
        <span className={`mc-metric__delta ${m.tone === 'gold' ? 'gold' : ''}`}>{m.delta}</span>
        <Sparkline data={m.spark} color={color} />
      </div>
    </div>
  );
}

function HeroBanner({ metrics }) {
  return (
    <div className="mc-panel" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', padding: '4px 6px' }}>
      {metrics.map((m, i) => {
        const color = m.tone === 'gold' ? '#E8C766' : '#23D6F5';
        return (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 200px', padding: '16px 20px', borderRight: i < metrics.length - 1 ? '1px solid rgba(206,214,224,0.07)' : 'none' }}>
            <span className={`mc-metric__ico ${m.tone === 'gold' ? 'gold' : ''}`} style={{ width: 38, height: 38 }}><Icon name={m.glyph} size={18} /></span>
            <div style={{ minWidth: 0 }}>
              <div className="mc-metric__label" style={{ marginBottom: 3 }}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="mc-metric__val" style={{ fontSize: 26 }}>{m.value}{m.suffix ? <span className="sfx">{m.suffix}</span> : null}</span>
                <span className={`mc-metric__delta ${m.tone === 'gold' ? 'gold' : ''}`} style={{ fontSize: 10.5 }}>{m.delta}</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}><Sparkline data={m.spark} color={color} w={60} h={24} /></div>
          </div>
        );
      })}
    </div>
  );
}

function AgentGrid({ style, onOpen }) {
  const agents = window.MC.agents;
  if (style === 'roster') {
    return (
      <div className="mc-roster">
        {agents.map(a => (
          <button key={a.id} className={`mc-roster__row theme-${a.theme}`} onClick={() => onOpen(a.id)}>
            <AgentAvatar agent={a} size={34} live />
            <div className="mc-roster__id">
              <div className="mc-roster__name">{a.name} <span className="muted" style={{ fontWeight: 400, fontSize: 11 }}>· {a.role}</span></div>
              <div className="mc-roster__task">{a.task}</div>
            </div>
            <span className={`mc-chip ${a.status === 'approval' ? 'gold' : a.status === 'working' ? 'good' : 'slate'}`}><span className="dot"></span>{a.statusLabel}</span>
            <span className="mc-modeltag">{a.model}</span>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="mc-agents">
      {agents.map(a => (
        <button key={a.id} className={`mc-agentcard theme-${a.theme}`} onClick={() => onOpen(a.id)}
          style={{ '--ag-acc': a.accent, '--ag-glow': a.theme === 'gold' ? 'rgba(216,167,74,.4)' : a.theme === 'crimson' ? 'rgba(244,81,107,.4)' : a.theme === 'emerald' ? 'rgba(52,211,153,.4)' : 'rgba(35,214,245,.4)' }}>
          <div className="mc-agentcard__top">
            <AgentAvatar agent={a} size={40} live />
            <div className="mc-agentcard__id">
              <div className="mc-agentcard__name">{a.name}</div>
              <div className="mc-agentcard__role">{a.role}</div>
            </div>
            <span className={`mc-chip ${a.status === 'approval' ? 'gold' : a.status === 'working' ? 'good' : 'slate'}`}><span className="dot"></span>{a.statusLabel}</span>
          </div>
          <div className="mc-agentcard__task">{a.task}</div>
          <div className="mc-agentcard__foot">
            <span className="mc-modeltag">{a.model}</span>
            <ActivityBars active={a.status === 'working'} />
          </div>
        </button>
      ))}
    </div>
  );
}

function Home({ t, onNavigate, onOpenGalaxy, warMessages, onSendWar }) {
  const MC = window.MC;
  const [approvals, setApprovals] = useStateH(MC.approvals);
  const [dreams, setDreams] = useStateH(MC.dreaming);
  const [artFilter, setArtFilter] = useStateH('all');
  const [artifacts, setArtifacts] = useStateH(MC.artifacts);
  const [draft, setDraft] = useStateH('');

  const resolve = (id) => setApprovals(approvals.filter(a => a.id !== id));
  const dismiss = (id) => setDreams(dreams.filter(d => d.id !== id));
  const delArt = (id) => setArtifacts(artifacts.filter(a => a.id !== id));
  const kinds = ['all', 'doc', 'html', 'code', 'image', 'video'];
  const shownArt = artFilter === 'all' ? artifacts : artifacts.filter(a => a.kind === artFilter);

  const send = (e) => { e && e.preventDefault(); if (!draft.trim()) return; onSendWar(draft.trim()); setDraft(''); };

  return (
    <div className="fade-up">
      {/* HERO */}
      <div className="mc-hero">
        <div>
          <div className="mc-hero__greet">Good evening, <span className="accent">{MC.operator.name}</span>.</div>
          <div className="mc-hero__sum">Your operating system is <b>running clean</b>. <b>4 agents</b> online, <b>7 tasks</b> in motion, and <b>3 approvals</b> waiting on you. Current build phase: <b>{MC.mission.phase}</b>.</div>
        </div>
        <div className="mc-hero__meta">
          <span className="mc-chip good"><span className="dot"></span>All systems nominal</span>
          <span className="mc-chip gold"><span className="dot"></span>{MC.operator.profile}</span>
        </div>
      </div>

      {t.heroLayout === 'banner'
        ? <HeroBanner metrics={MC.heroMetrics} />
        : <div className="mc-metrics">{MC.heroMetrics.map(m => <MetricCard key={m.id} m={m} />)}</div>}

      {/* ROW 1: agents (span2) + mission */}
      <div className="mc-bento" style={{ marginBottom: 16 }}>
        <div className="mc-panel span2">
          <div className="mc-phead">
            <div className="mc-ptitle"><i><Icon name="users-round" /></i>Agent Status</div>
            <button className="mc-link" onClick={() => onNavigate({ name: 'warroom', chan: 'warroom' })}>War Room <Icon name="arrow-right" /></button>
          </div>
          <AgentGrid style={t.agentStyle} onOpen={(id) => onNavigate({ name: 'agent', id })} />
        </div>

        <div className="mc-panel mc-panel--gold">
          <div className="mc-phead">
            <div className="mc-ptitle"><i style={{ color: 'var(--la-gold)' }}><Icon name="crosshair" /></i>Active Mission</div>
            <span className="mc-chip gold"><span className="dot"></span>{MC.mission.progress}%</span>
          </div>
          <div className="mc-mission__name">{MC.mission.name}</div>
          <div className="muted" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 4 }}>{MC.mission.phase}</div>
          <div className="mc-mission__meter"><div className="mc-mission__fill" style={{ width: MC.mission.progress + '%' }}></div></div>
          <div className="mc-mission__steps">
            {MC.mission.steps.map((s, i) => (
              <div key={i} className={`mc-step ${s.done ? 'done' : ''} ${s.active ? 'active' : ''}`}>
                <span className="mc-step__bullet">{s.done ? <Icon name="check" /> : null}</span>{s.t}
              </div>
            ))}
          </div>
          <div className="mc-next">
            <span className="mc-next__ico"><Icon name="arrow-right" /></span>
            <div className="mc-next__txt">Next move — <b>{MC.mission.next.text}</b></div>
          </div>
        </div>
      </div>

      {/* ROW 2: approvals + dreaming + memory pulse */}
      <div className="mc-bento" style={{ marginBottom: 16 }}>
        <div className="mc-panel mc-panel--gold">
          <div className="mc-phead">
            <div className="mc-ptitle"><i style={{ color: 'var(--la-gold)' }}><Icon name="shield-check" /></i>Approvals</div>
            <span className="mc-chip gold"><span className="dot"></span>{approvals.length} waiting</span>
          </div>
          <div className="mc-approve">
            {approvals.length === 0
              ? <div className="mc-approve__done"><Icon name="check-circle-2" /><div>All clear — nothing needs your sign-off.</div></div>
              : approvals.map(a => {
                const by = agentById(a.by);
                return (
                  <div key={a.id} className="mc-approve__row">
                    <div className="mc-approve__top">
                      <div className="mc-approve__subj">{a.subject}</div>
                      <span className={`mc-chip ${a.risk === 'high' ? 'crimson' : a.risk === 'med' ? 'gold' : 'good'}`}><span className="dot"></span>{a.risk}</span>
                    </div>
                    <div className="mc-approve__detail">{a.detail}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div className="mc-approve__by"><span className="av" style={{ background: by.avatarGrad }}>{by.name[0]}</span>{by.name} · {a.age}</div>
                      <div className="mc-approve__act">
                        <button className="mc-btn mc-btn--quiet mc-btn--sm" onClick={(e) => { rippleClick(e); resolve(a.id); }}>Hold</button>
                        <button className="mc-btn mc-btn--gold mc-btn--sm" onClick={(e) => { rippleClick(e); resolve(a.id); }}>Approve</button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="mc-panel">
          <div className="mc-phead">
            <div className="mc-dream__head"><Icon name="moon-star" size={15} style={{ color: 'var(--la-cyan)' }} /> <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '.06em', textTransform: 'uppercase', fontSize: 13 }}>Dreaming Brief</span></div>
            <span className="muted mono" style={{ fontSize: 10 }}>overnight</span>
          </div>
          <div className="mc-dream">
            {dreams.length === 0
              ? <div className="mc-approve__done"><Icon name="moon" /><div>Brief cleared. Sleep easy.</div></div>
              : dreams.map(d => (
                <div key={d.id} className="mc-dream__row">
                  <span className={`mc-dream__ico ${d.tone}`}><Icon name={d.glyph} /></span>
                  <div className="mc-dream__body">
                    <div className="mc-dream__txt">{d.text}</div>
                    <div className="mc-dream__time">surfaced {d.time}</div>
                  </div>
                  <button className="mc-dream__x" onClick={() => dismiss(d.id)} aria-label="Dismiss"><Icon name="x" /></button>
                </div>
              ))}
          </div>
        </div>

        <div className="mc-panel">
          <div className="mc-phead">
            <div className="mc-ptitle"><i><Icon name="brain-circuit" /></i>Memory Pulse</div>
            <button className="mc-link" onClick={onOpenGalaxy}>Galaxy <Icon name="arrow-up-right" /></button>
          </div>
          <div className="mc-mempulse">
            {MC.memoryPulse.map(m => (
              <div key={m.id} className="mc-mem__row" onClick={onOpenGalaxy}>
                <span className="mc-mem__star" style={{ opacity: 0.35 + m.glow * 0.65, boxShadow: `0 0 ${4 + m.glow * 10}px rgba(35,214,245,${m.glow})` }}></span>
                <div className="mc-mem__id">
                  <div className="mc-mem__title">{m.title}</div>
                  <div className="mc-mem__tag">#{m.tag}</div>
                </div>
                <div className="mc-mem__time">{m.time}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(206,214,224,0.06)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', display: 'flex', justifyContent: 'space-between' }}>
            <span>vault: 248 notes</span><span>17 written today</span>
          </div>
        </div>
      </div>

      {/* ROW 3: artifacts (span2) + war room mini */}
      <div className="mc-bento">
        <div className="mc-panel span2">
          <div className="mc-phead">
            <div className="mc-ptitle"><i><Icon name="layers" /></i>Recent Outputs</div>
            <div className="mc-art__filters">
              {kinds.map(k => (
                <button key={k} className={`mc-art__filter ${artFilter === k ? 'is-active' : ''}`} onClick={() => setArtFilter(k)}>{k}</button>
              ))}
            </div>
          </div>
          <div className="mc-art__grid">
            {shownArt.map(a => {
              const by = agentById(a.by);
              return (
                <div key={a.id} className="mc-tile">
                  <div className={`mc-tile__prev k-${a.kind}`}>
                    <span className="mc-tile__kind">{a.kind}</span>
                    <span className="mc-tile__glyph"><Icon name={KIND_GLYPH[a.kind]} /></span>
                    <button className="mc-tile__del" onClick={() => delArt(a.id)} aria-label="Delete"><Icon name="trash-2" /></button>
                  </div>
                  <div className="mc-tile__body">
                    <div className="mc-tile__title">{a.title}</div>
                    <div className="mc-tile__sum">{a.summary}</div>
                    <div className="mc-tile__foot"><span>{by.name}</span><span>{a.time} ago</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mc-panel mc-warmini">
          <div className="mc-phead">
            <div className="mc-ptitle"><i><Icon name="messages-square" /></i>War Room</div>
            <button className="mc-link" onClick={() => onNavigate({ name: 'warroom', chan: 'warroom' })}>Open <Icon name="arrow-right" /></button>
          </div>
          <div className="mc-warmini__feed">
            {warMessages.slice(-5).map(m => {
              const a = agentById(m.from);
              return (
                <div key={m.id} className="mc-msg">
                  {m.from === 'lew'
                    ? <span className="mc-msg__av" style={{ background: 'url(assets/avatar-headshot.png) center/118% #11192A', border: '1px solid rgba(216,167,74,.4)' }}></span>
                    : <span className="mc-msg__av" style={{ background: a.avatarGrad }}>{a.name[0]}</span>}
                  <div className="mc-msg__body">
                    <div className="mc-msg__head"><span className="mc-msg__name" style={{ color: m.from === 'lew' ? '#ecca78' : a.accent }}>{m.from === 'lew' ? 'Lew' : a.name}</span><span className="mc-msg__time">{m.time}</span></div>
                    <div className="mc-msg__txt">{m.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <form className="mc-composer" onSubmit={send}>
            <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Message the team…" />
            <button type="submit" className="mc-composer__send" aria-label="Send"><Icon name="arrow-up" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}

window.Home = Home;
