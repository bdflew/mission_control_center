// pages-b.jsx — Studio (Hyperframes) · Hermes · Dreaming · Pantheon
const { useState: useSb, useEffect: useEb, useRef: useRb } = React;

function agentByIdB(id) {
  return window.MC.agents.find(a => a.id === id) || window.MC.personas.find(p => p.id === id) ||
    { name: id.charAt(0).toUpperCase() + id.slice(1), avatarGrad: 'linear-gradient(145deg,#334155,#64748B)', accent: '#64748B' };
}

// ===================== STUDIO (Hyperframes) =====================
// A real, playable video built from HTML/canvas "scenes" — faithful to how Hyperframes renders.
function HyperVideo({ video }) {
  const cvRef = useRb(null);
  const [playing, setPlaying] = useSb(false);
  const stateRef = useRb({ t: 0.07, raf: 0 });
  const scenes = video._scenes;

  useEb(() => {
    const cv = cvRef.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const paint = (tNorm) => {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = scenes.length;
      const idx = Math.min(n - 1, Math.floor(tNorm * n));
      const local = (tNorm * n) - idx; // 0..1 within scene
      const sc = scenes[idx];
      // bg
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0A1426'); g.addColorStop(1, '#06101e');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // accent bloom
      const bx = w * (0.3 + 0.4 * Math.sin(tNorm * 6));
      const bg2 = ctx.createRadialGradient(bx, h * 0.4, 0, bx, h * 0.4, w * 0.6);
      bg2.addColorStop(0, video.accent + '22'); bg2.addColorStop(1, video.accent + '00');
      ctx.fillStyle = bg2; ctx.fillRect(0, 0, w, h);
      // grid
      ctx.strokeStyle = video.accent + '18'; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 34) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      // scene number
      ctx.globalAlpha = 0.5; ctx.fillStyle = video.accent;
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText('SCENE ' + (idx + 1) + ' / ' + n, 18, 26);
      ctx.globalAlpha = 1;
      // animated headline (fade/slide in)
      const ease = Math.min(1, local * 3);
      ctx.globalAlpha = ease;
      ctx.fillStyle = '#fff';
      ctx.font = '800 ' + Math.round(w * 0.058) + 'px Orbitron, sans-serif';
      ctx.textBaseline = 'middle';
      wrapText(ctx, sc.toUpperCase(), 24, h / 2 - 6 + (1 - ease) * 12, w - 48, w * 0.075);
      ctx.globalAlpha = 1;
      // accent underline
      ctx.fillStyle = video.accent;
      ctx.fillRect(24, h - 30, (w - 48) * (0.3 + 0.7 * local), 3);
      // bottom brand
      ctx.globalAlpha = 0.6; ctx.fillStyle = '#9fb0c4';
      ctx.font = '500 10px Manrope, sans-serif';
      ctx.fillText('LEGACY AUTOMATIONS · HYPERFRAMES', 24, h - 16);
      ctx.globalAlpha = 1;
    };
    const S = stateRef.current;
    const dur = 6; // seconds total loop for preview
    let last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000; last = now;
      if (playing) { S.t += dt / dur; if (S.t >= 1) S.t = 0; }
      paint(S.t);
      const fill = cvRef.current?.parentElement?.querySelector('.mc-vid__scrubfill');
      if (fill) fill.style.width = (S.t * 100) + '%';
      S.raf = requestAnimationFrame(loop);
    };
    paint(S.t); // sync first frame (works even when rAF paused)
    S.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(S.raf);
  }, [playing]);

  if (video.status === 'rendering') {
    return React.createElement('div', { className: 'mc-vid__stage' },
      React.createElement('canvas', { className: 'mc-vid__canvas', ref: cvRef }),
      React.createElement('span', { className: 'mc-vid__badge' }, video.scenes + ' scenes'),
      React.createElement('div', { className: 'mc-vid__rendering' },
        React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement('div', { className: 'mc-typing', style: { justifyContent: 'center' } }, React.createElement('span'), React.createElement('span'), React.createElement('span')),
          React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', marginTop: 8 } }, 'Rendering scenes…'))));
  }
  return React.createElement('div', { className: 'mc-vid__stage', onClick: () => setPlaying(p => !p) },
    React.createElement('canvas', { className: 'mc-vid__canvas', ref: cvRef }),
    React.createElement('span', { className: 'mc-vid__badge' }, video.scenes + ' HTML scenes'),
    React.createElement('span', { className: 'mc-vid__len' }, video.len),
    React.createElement('div', { className: 'mc-vid__scrub' }, React.createElement('div', { className: 'mc-vid__scrubfill' })),
    React.createElement('div', { className: 'mc-vid__play' + (playing ? ' hide' : '') },
      React.createElement('div', { className: 'mc-vid__playbtn' }, React.createElement(Icon, { name: playing ? 'pause' : 'arrow-right', size: 22 }))));
}
function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = '', lines = [];
  for (const w of words) { const test = line + w + ' '; if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w + ' '; } else line = test; }
  lines.push(line);
  const startY = y - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l.trim(), x, startY + i * lh));
}

const VIDEO_SCENES = {
  v1: ['Your time is your business', 'AI agents work while you sleep', 'One operating system', 'Recover every lead', 'Approval-gated, always', 'From chaos to control', 'Start building today'],
  v2: ['Leads slip through the cracks', 'Follow-up breaks down', 'You lose revenue', 'Until now', 'One system recovers them', 'From chaos to control'],
  v3: ['What is an AI employee?', 'It never forgets', 'It works in your stack', 'It ships real work', 'You stay in control'],
  v4: ['Mission Control', 'Command your AI team', 'Memory Galaxy', 'Self-driving Kanban', 'Studio + Hyperframes', 'War Room', 'All in one screen', 'This is the operating system'],
};
const STUDIO_FLOW = {
  Script: { glyph: 'pen-line', rows: ['Hook: "Your time is your business."', 'Beat 1 — the chaos of scattered tools', 'Beat 2 — one operating system', 'Beat 3 — recover every lead, approval-gated', 'CTA: "Start building today."'] },
  Voice: { glyph: 'activity', rows: ['Engine: ElevenLabs · "Legacy" voice', 'Tone: confident, calm, premium', 'Pace: 0.95x · 2 pauses for emphasis', 'Render: 7 narration clips, stitched'] },
  Scenes: { glyph: 'code', rows: ['7 HTML scenes built one by one', 'Brand palette locked · Orbitron + Manrope', 'Animated headline + accent underline per scene', 'Lower-third: LEGACY AUTOMATIONS'] },
  Render: { glyph: 'video', rows: ['Compose scenes + voice → MP4', '1920×1080 · 30fps', 'Keyword stamped in title + description', 'Saved to Drive + logged to vault'] },
  'Self-check': { glyph: 'shield-check', rows: ['Reviews its own output before handoff', 'Checks pacing, readability, brand fit', 'Flags + re-renders any weak scene', 'Marks ready only when it passes'] },
};
function StudioPage({ onAction }) {
  const S = window.MC.studio;
  const [prompt, setPrompt] = useSb('');
  const [auto, setAuto] = useSb(false);
  const [flow, setFlow] = useSb('Script');
  const [hook, setHook] = useSb(() => { try { return JSON.parse(localStorage.getItem('mc_hook_studio')) || null; } catch (e) { return null; } });
  const [hookModal, setHookModal] = useSb(false);
  const agOf = (id) => window.MC.agents.find(a => a.id === id) || { name: 'Faye', avatarGrad: 'linear-gradient(145deg,#0B5F45,#34D399)' };
  const persistHook = (h) => { setHook(h); try { localStorage.setItem('mc_hook_studio', JSON.stringify(h)); } catch (e) {} };
  const toggleAuto = () => { const next = !auto; setAuto(next); if (next) { if (!hook) setHookModal(true); else onAction && onAction('toast', 'Webhook fired → ' + agOf(hook.agent).name + ' is producing video autonomously.'); } };
  const videos = S.videos.map(v => ({ ...v, _scenes: VIDEO_SCENES[v.id] || ['Scene'] }));
  const flowKeys = Object.keys(STUDIO_FLOW);
  const fp = STUDIO_FLOW[flow];
  const go = () => { if (!prompt.trim()) return; onAction && onAction('toast', auto ? 'Faye is producing the video end-to-end…' : 'Hyperframes queued — writing the script now.'); setPrompt(''); };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-section__head' },
      React.createElement('div', { className: 'mc-page-head', style: { marginBottom: 0 } },
        React.createElement('h2', null, 'Studio — Hyperframes'),
        React.createElement('p', null, 'One prompt → script → voice → HTML scenes → rendered video. Click any step to see and tune it, or let an agent produce the whole thing.')),
      React.createElement('div', { className: 'mc-ce__toggle' },
        React.createElement('span', { style: { fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: auto ? '#34D399' : 'var(--fg-3)' } }, 'Autonomous'),
        React.createElement('button', { className: 'mc-switch ' + (auto ? 'on' : ''), onClick: toggleAuto, 'aria-label': 'Autonomous', style: auto ? { background: '#34D399' } : null }, React.createElement('span', { className: 'mc-switch__knob' })))),
    auto && React.createElement('div', { className: 'mc-hookbar ' + (hook ? 'armed' : 'unset'), style: { marginTop: 16 } },
      React.createElement('div', { className: 'mc-hookbar__ico', style: { background: hook ? 'rgba(52,211,153,0.14)' : 'rgba(216,167,74,0.14)', color: hook ? '#34D399' : 'var(--la-gold)' } }, React.createElement(Icon, { name: hook ? 'zap' : 'circle-help', size: 18 })),
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('div', { className: 'mc-hookbar__t' }, hook ? agOf(hook.agent).name + ' is armed — webhook fires on each render' : 'No agent connected yet'),
        React.createElement('div', { className: 'mc-hookbar__d' }, hook ? (hook.url === 'manual' ? 'manual setup' : hook.url) + ' · script · voice · scenes · render' : 'Connect an agent so autonomous mode can trigger it')),
      React.createElement(Btn, { variant: hook ? 'ghost' : 'gold', size: 'sm', icon: 'link', onClick: () => setHookModal(true) }, hook ? 'Edit connection' : 'Configure agent')),
    React.createElement('div', { className: 'mc-studio__prompt' },
      React.createElement('i', { style: { color: 'var(--acc)', display: 'grid', placeItems: 'center' } }, React.createElement(Icon, { name: auto ? 'zap' : 'video', size: 18 })),
      React.createElement('input', { value: prompt, onChange: e => setPrompt(e.target.value), placeholder: auto ? 'Tell Faye what video to make — she runs the whole pipeline…' : 'Create a video about how AI automation helps business owners save time…', onKeyDown: e => e.key === 'Enter' && go() }),
      React.createElement(Btn, { variant: auto ? 'gold' : 'cyan', size: 'sm', icon: 'zap', onClick: go }, auto ? 'Produce it for me' : 'Generate')),
    // clickable flow tabs
    React.createElement('div', { className: 'mc-studio__flowtabs' },
      ...flowKeys.map((k, i) => React.createElement('button', { key: k, className: 'mc-flowtab' + (flow === k ? ' is-active' : ''), onClick: () => setFlow(k) },
        React.createElement('div', { className: 'mc-flowtab__num' }, i + 1),
        React.createElement('div', { className: 'mc-flowtab__b' },
          React.createElement('div', { className: 'mc-flowtab__t' }, k),
          React.createElement('div', { className: 'mc-flowtab__d' }, STUDIO_FLOW[k].rows.length + ' steps'))))),
    // flow panel
    React.createElement('div', { className: 'mc-flowpanel' },
      React.createElement('div', { className: 'mc-phead' },
        React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: fp.glyph, size: 15 })), flow),
        flow === 'Voice' && React.createElement('span', { className: 'mc-chip cyan' }, React.createElement('span', { className: 'dot' }), 'ElevenLabs')),
      flow === 'Voice' && React.createElement('div', { className: 'mc-waveform', style: { marginBottom: 12 } }, ...Array.from({ length: 40 }).map((_, i) => React.createElement('span', { key: i, style: { animationDelay: (i * 0.05) + 's' } }))),
      flow === 'Scenes'
        ? React.createElement('div', { className: 'mc-scene-strip' }, ...(VIDEO_SCENES.v1).map((s, i) => React.createElement('div', { key: i, className: 'mc-scene-cell' }, React.createElement('span', { className: 'sn' }, 'S' + (i + 1)), s)))
        : fp.rows.map((r, i) => React.createElement('div', { key: i, className: 'mc-flowpanel__row' }, React.createElement('span', { className: 'mc-flowpanel__num' }, '0' + (i + 1)), r))),
    React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, marginBottom: 12 } }, React.createElement('i', null, React.createElement(Icon, { name: 'clapperboard', size: 15 })), 'Rendered Videos'),
    React.createElement('div', { className: 'mc-vidgrid' },
      ...videos.map(v => { const by = agentByIdB(v.by); return React.createElement('div', { key: v.id, className: 'mc-vid' },
        React.createElement(HyperVideo, { video: v }),
        React.createElement('div', { className: 'mc-vid__body' },
          React.createElement('div', { className: 'mc-vid__title' }, v.title),
          React.createElement('div', { className: 'mc-vid__meta' },
            React.createElement('span', null, 'by ' + by.name + ' · #' + v.kw),
            React.createElement('span', null, v.status === 'rendering' ? 'rendering…' : v.time)))); })),
    hookModal && React.createElement(window.WebhookModal, { surface: 'the Studio', onClose: () => setHookModal(false), onSave: (h) => { persistHook(h); setHookModal(false); onAction && onAction('toast', 'Connected → ' + agOf(h.agent).name + ' will produce video autonomously.'); } }),
  );
}

// ===================== HERMES PAGE =====================
// "MESSENGER OF THE GODS" — premium Greek-mythology theme (v3).
// Every section of the previous page survives, re-dressed: identity bar → temple
// hero, the four stats → gold HoloStat tally, conversations rail + local mock
// chat (honest 'Local' chip) → Oracle Line, connections/models → Divine Channels
// + Pantheon of Models, Mission Control goal → Decree of the House. Logic intact.
function HermesPage({ onNav }) {
  const H = window.MC.hermes;
  const [convo, setConvo] = useSb('h1');
  const [msgs, setMsgs] = useSb(() => H.seed.slice());
  const [val, setVal] = useSb('');
  const [typing, setTyping] = useSb(false);
  const feedRef = useRb(null);
  useEb(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [msgs, typing]);
  const send = () => {
    if (!val.trim()) return;
    setMsgs(p => [...p, { me: true, t: val }]); setVal(''); setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs(p => [...p, { me: false, t: 'On it. I have full context from the vault — routing this through the team and logging it back. I will surface the result in your next brief.' }]); }, 1300);
  };
  const liveConns = H.connections.filter(c => c.status === 'live').length;
  const memHits = (H.memoryHits || '1.2K').split(' ')[0];
  return (
    <div className="sci-wrap myth-wrap">
      <SciFiBackdrop variant="myth" />
      <div className="sci-fg fade-up">

        {/* 1 · HERO — the temple lintel */}
        <div className="myth-hero v3m-hero">
          <div className="myth-sub">⚚ MESSENGER OF THE GODS ⚚</div>
          <h1 className="myth-title v3m-title">HERMES</h1>
          <div className="myth-divider v3m-wingline">
            <span className="myth-wing"><Icon name="send" size={26} /></span>
          </div>
          <div className="v3m-hero-meta">
            <span className="v3m-host">{H.version + ' · ' + H.host}</span>
            <span className="mc-chip good"><span className="dot" />Online</span>
          </div>
          <div className="v3m-tagline">Carries every word of the house · keeper of memory</div>
        </div>

        {/* 2 · STATS — the gold tally */}
        <div className="myth-panel v3m-panel">
          <div className="v3m-ptitle"><span className="myth-laurel">❧</span><span>Tally of the Messenger</span><span className="myth-laurel">❧</span></div>
          <div className="v3m-stats">
            <HoloStat label="Activations · 7d" value={H.activations} tone="gold" size={30} />
            <HoloStat label="Live Connections" value={liveConns} tone="gold" size={30} />
            <HoloStat label="Models" value={H.models.length} tone="gold" size={30} />
            <HoloStat label="Memory Hits" value={memHits} suffix="notes" tone="gold" size={30} />
          </div>
        </div>

        {/* 3 · CONVERSATIONS rail + ORACLE LINE chat (behavior unchanged) */}
        <div className="mc-hermes">
          <div className="mc-hermes__convos myth-panel v3m-rail">
            <div className="v3m-ptitle v3m-ptitle--left"><span className="myth-laurel">❧</span><span>Conversations</span></div>
            {H.conversations.map(c => (
              <button key={c.id} className={'mc-hconvo' + (convo === c.id ? ' active' : '')} onClick={() => setConvo(c.id)}>
                <span className="mc-hconvo__t">{c.title}</span>
                <span className="mc-hconvo__time">{c.time}</span>
              </button>
            ))}
          </div>
          <div className="mc-hermes__main">
            <div className="myth-panel mc-agent theme-gold v3m-chat" style={{ padding: 16 }}>
              <div className="mc-phead">
                <div className="mc-ptitle v3m-cinzel"><i style={{ color: 'var(--la-gold)' }}><Icon name="send" size={15} /></i>Oracle Line · ask Hermes</div>
                <span className="mc-chip gold"><span className="dot" />Local</span>
              </div>
              <div className="mc-achat" style={{ height: 300 }}>
                <div className="mc-achat__feed" ref={feedRef}>
                  {msgs.map((m, i) => (
                    <div key={i} className={'mc-bubble ' + (m.me ? 'me' : 'them')}>
                      <div className="mc-bubble__meta">{m.me ? 'You' : 'Hermes'}</div>{m.t}
                    </div>
                  ))}
                  {typing && <div className="mc-bubble them"><div className="mc-typing"><span /><span /><span /></div></div>}
                </div>
                <div className="mc-composer">
                  <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask Hermes anything…" aria-label="Message Hermes" />
                  <button className="mc-composer__send" onClick={send} aria-label="Send"><Icon name="send" size={15} /></button>
                </div>
              </div>
            </div>

            {/* 4 · DIVINE CHANNELS + PANTHEON OF MODELS (data/logic unchanged) */}
            <div className="v3m-grid2">
              <div className="mc-panel myth-panel v3m-conns">
                <div className="mc-phead"><div className="mc-ptitle v3m-cinzel"><i style={{ color: 'var(--la-gold)' }}><Icon name="plug" size={15} /></i>Divine Channels</div></div>
                <div className="mc-conngrid">
                  {H.connections.map(c => (
                    <div key={c.name} className="mc-conn-mini">
                      <div className="mc-conn-mini__ico"><Icon name={c.glyph} size={14} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="mc-conn-mini__n">{c.name}</div>
                        <div className="mc-conn-mini__m">{c.method}</div>
                      </div>
                      <span className={'pulse-dot ' + (c.status === 'live' ? 'good' : 'slate')} style={{ width: 7, height: 7 }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mc-panel myth-panel v3m-models">
                <div className="mc-phead"><div className="mc-ptitle v3m-cinzel"><i style={{ color: 'var(--la-gold)' }}><Icon name="cpu" size={15} /></i>Pantheon of Models</div></div>
                {H.models.map(m => (
                  <div key={m.name} className="mc-modelbar">
                    <div className="mc-modelbar__top"><span style={{ color: 'var(--fg-1)' }}>{m.name}</span><span style={{ color: 'var(--fg-3)' }}>{m.share + '%'}</span></div>
                    <div className="mc-modelbar__track"><div className="mc-modelbar__fill" style={{ width: m.share + '%' }} /></div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)', marginTop: 3 }}>{m.use}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 · DECREE OF THE HOUSE — the Mission Control goal, as a plaque */}
            <div className="myth-panel v3m-decree">
              <div className="v3m-decree__head">
                <Icon name="target" size={17} style={{ color: 'var(--la-gold)' }} />
                <span className="v3m-decree__h">Decree of the House</span>
              </div>
              <div className="v3m-decree__sub">Mission Control Goal</div>
              <div className="v3m-decree__text">Grow the YouTube channel by 1,000 subscribers. Hermes drafts the plan, assigns the team, and you keep the approval gate.</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn variant="gold" size="sm" icon="arrow-right" onClick={() => onNav('ws:kanban')}>Open the plan</Btn>
                <Btn variant="quiet" size="sm" icon="plus">Set new goal</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== DREAMING PAGE =====================
// A living dreamworld. The old DreamGalaxyBg canvas is gone — the page-wide
// SciFiBackdrop variant="dream" (aurora ribbons + drifting stars) replaces it.
// Everything from the previous page survives: hero (CSS moon + LAST RUN),
// sources row, every System Insight (Act on it / Dismiss), per-agent findings
// grid. New: HoloStat row, Dream Cycle SCHEDULE widget (honest — not live
// telemetry), and a "Tonight's focus" composer that queues to the vault when
// the backend is live, or saves to localStorage with an honest label when not.

const V3D_PHASES = [
  { ph: 'COLLECT', hrs: '00–02', from: 0, to: 2, d: 'Gather fresh notes, chats and logs from every connected source' },
  { ph: 'CROSS-READ', hrs: '02–04', from: 2, to: 4, d: 'Read across Hermes, Claude, Codex, Gemini and the vault' },
  { ph: 'PATTERN-MATCH', hrs: '04–05', from: 4, to: 5, d: 'Surface repeats, drifts, risks and savings hiding between tools' },
  { ph: 'COMPOSE BRIEF', hrs: '05–06', from: 5, to: 6, d: 'Write the morning brief and queue suggested moves for approval' },
];
const V3D_SEEDS = ['lead recovery', 'content angles', 'cost savings'];

function DreamingPage({ onNav }) {
  const D = window.MC.dreamingPage;
  const [items, setItems] = useSb(D.insights);
  const findings = window.MC.dreamFindings || {};
  const findingsTotal = Object.values(findings).reduce((n, fs) => n + (fs ? fs.length : 0), 0);
  // ---- tonight's-focus composer state ----
  const [focus, setFocus] = useSb('');
  const [queued, setQueued] = useSb(() => { try { return JSON.parse(localStorage.getItem('mcDreamQueue')) || []; } catch (e) { return []; } });
  const [note, setNote] = useSb(null);
  const [busy, setBusy] = useSb(false);
  const [isLive, setIsLive] = useSb(() => !!(window.MCLive && MCLive.online));
  useEb(() => {
    const sync = () => setIsLive(!!(window.MCLive && MCLive.online));
    window.addEventListener('mc:live', sync);
    return () => window.removeEventListener('mc:live', sync);
  }, []);
  const hour = new Date().getHours();
  const phaseNow = V3D_PHASES.findIndex(p => hour >= p.from && hour < p.to); // -1 → daytime, idle until tonight
  const queueFocus = () => {
    const text = focus.trim(); if (!text || busy) return;
    const entry = { t: text, at: new Date().toISOString() };
    if (window.MCLive && MCLive.online) {
      setBusy(true);
      MCLive.post('/api/vault/note', { path: 'Dream_Requests/' + new Date().toISOString().slice(0, 10) + '.md', content: '- ' + text + '\n', mode: 'append', by: 'lew' })
        .then(() => { setQueued(p => [...p, entry]); setFocus(''); setNote({ tone: 'ok', msg: 'Queued to the vault — the system dreams on it tonight.' }); })
        .catch(() => { setNote({ tone: 'err', msg: 'Vault write failed — nothing was queued. Try again.' }); })
        .finally(() => setBusy(false));
    } else {
      const next = [...queued, entry];
      try { localStorage.setItem('mcDreamQueue', JSON.stringify(next)); } catch (e) {}
      setQueued(next); setFocus('');
      setNote({ tone: 'local', msg: 'Saved locally — will queue when the backend is online.' });
    }
  };
  return (
    <div className="sci-wrap dream-wrap">
      <SciFiBackdrop variant="dream" />
      <div className="sci-fg fade-up">

        {/* 1 · HERO — moon, title, LAST RUN (backdrop is page-wide now) */}
        <div className="dream-hero v3d-hero">
          <div className="v3d-moon" aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <div className="hud-eyebrow">Overnight Intelligence</div>
            <h1 className="v3d-title dream-glow-text">DREAMING</h1>
            <p className="v3d-desc">While you sleep, the system reads across Hermes, Claude, Codex, Gemini and your vault — surfacing patterns, savings, and the next move. A morning brief, every day.</p>
          </div>
          <div className="v3d-lastrun">
            <div className="l">LAST RUN</div>
            <div className="v">{D.lastRun}</div>
          </div>
        </div>

        {/* 2 · SOURCES row + next run (kept) */}
        <div className="v3d-sources">
          <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>READS FROM</span>
          {D.sources.map(s => <span key={s} className="mc-chip violet" style={{ fontSize: 9 }}>{s}</span>)}
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>{'Next run: ' + D.nextRun}</span>
        </div>

        {/* 3 · HoloStat row (new) */}
        <div className="dream-card v3d-stats">
          <HoloStat label="Insights surfaced" value={items.length} size={28} />
          <HoloStat label="Sources read" value={D.sources.length} size={28} />
          <HoloStat label="Findings" value={findingsTotal} size={28} />
        </div>

        {/* 4 · Dream Cycle (SCHEDULE — honest) + Tonight's focus (new) */}
        <div className="v3d-grid2">
          <div className="dream-card v3d-cycle">
            <div className="mc-phead">
              <div className="mc-ptitle"><i><Icon name="moon-star" size={15} /></i>Dream Cycle</div>
              <span className="mc-chip violet" title="Nightly schedule — not live telemetry"><span className="dot" />Schedule</span>
            </div>
            {V3D_PHASES.map((p, i) => (
              <div key={p.ph} className={'dream-phase' + (phaseNow === i ? ' v3d-phase-now' : '')}>
                <span className="ph">{p.ph}</span>
                <span className="v3d-phase-hrs">{p.hrs}</span>
                <span style={{ flex: 1 }}>{p.d}</span>
                {phaseNow === i && <span className="v3d-now-dot" title="Local time is inside this scheduled window" />}
              </div>
            ))}
            <div className="v3d-cycle-foot">
              {phaseNow >= 0
                ? 'Local time sits in the ' + V3D_PHASES[phaseNow].ph + ' window — marked from the schedule, not live telemetry.'
                : 'Daytime — idle until tonight. Next run: ' + D.nextRun}
            </div>
          </div>

          <div className="dream-card v3d-focus">
            <div className="mc-phead">
              <div className="mc-ptitle"><i><Icon name="pen-line" size={15} /></i>Tonight's Focus</div>
              {isLive
                ? <span className="mc-chip good"><span className="dot" />Vault live</span>
                : <span className="mc-chip slate"><span className="dot" />Offline · saves locally</span>}
            </div>
            <textarea className="v3d-ta" rows={3} value={focus} onChange={e => setFocus(e.target.value)} placeholder="Tell the system what to dream on tonight — a question, a worry, a hunch…" aria-label="Tonight's focus" />
            <div className="v3d-seeds">
              {V3D_SEEDS.map(s => <button key={s} className="v3d-seed" onClick={() => setFocus(f => f.trim() ? f.trim() + ' · ' + s : s)}>{s}</button>)}
              <span style={{ marginLeft: 'auto' }} />
              <Btn variant="ghost" size="sm" icon="moon-star" onClick={queueFocus}>{busy ? 'Queuing…' : 'Queue for tonight'}</Btn>
            </div>
            {note && <div className={'v3d-note ' + note.tone}>{note.msg}</div>}
            {queued.length > 0 && (
              <div className="v3d-queue">
                <div className="v3d-queue__t">{'QUEUED TONIGHT · ' + queued.length}</div>
                {queued.map((q, i) => <div key={i} className="v3d-queue__row"><span className="v3d-queue__star" />{q.t}</div>)}
              </div>
            )}
          </div>
        </div>

        {/* 5 · SYSTEM INSIGHTS (kept — Act on it / Dismiss / tones) */}
        <div className="mc-section__title" style={{ fontSize: 12, marginBottom: 12 }}><i><Icon name="sparkles" size={15} /></i>System Insights</div>
        {items.map((d, i) => (
          <div key={d.id} className={'mc-dreaminsight dream-card v3d-insight dream-float' + (i % 3 === 1 ? ' d2' : i % 3 === 2 ? ' d3' : '')}>
            <div className={'mc-dreaminsight__ico tone-' + d.tone}><Icon name={d.glyph} size={18} /></div>
            <div className="mc-dreaminsight__b">
              <div className="mc-dreaminsight__t">{d.title}</div>
              <div className="mc-dreaminsight__x">{d.text}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="mc-dreaminsight__from">{'◆ ' + d.from}</span>
                <Btn variant="ghost" size="sm" onClick={() => { onNav && onNav('home'); }}>Act on it</Btn>
                <Btn variant="quiet" size="sm" onClick={() => setItems(p => p.filter(x => x.id !== d.id))}>Dismiss</Btn>
              </div>
            </div>
            <div className="mc-dreaminsight__save" style={{ color: d.tone === 'gold' ? 'var(--la-gold)' : d.tone === 'crimson' ? '#F4516B' : d.tone === 'emerald' ? '#34D399' : 'var(--la-cyan)' }}>{d.save}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="mc-placeholder" style={{ minHeight: 160 }}>
            <div>
              <div className="mc-placeholder__ico"><Icon name="check-circle" size={30} /></div>
              <h3>Brief cleared</h3>
              <p>You acted on every overnight insight. The system keeps dreaming tonight.</p>
            </div>
          </div>
        )}

        {/* 6 · PER-AGENT FINDINGS (kept — nav-to-agent clicks intact) */}
        <div className="mc-section__title" style={{ fontSize: 12, margin: '24px 0 12px' }}><i><Icon name="cpu" size={15} /></i>What each employee found overnight</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--gap-grid)' }}>
          {window.MC.agents.map(a => {
            const fs = findings[a.id] || [];
            return (
              <div key={a.id} className="mc-dreamfind dream-card v3d-find">
                <div className="mc-dreamfind__top">
                  <button onClick={() => onNav('agent:' + a.id)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div className="mc-dreamfind__av" style={{ background: a.avatarGrad }}>{a.name[0]}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)' }}>{fs.length + ' findings'}</div>
                    </div>
                  </button>
                  <span className={'mc-chip ' + a.theme} style={{ marginLeft: 'auto' }}><span className="dot" />Dreamt</span>
                </div>
                {fs.map((f, i) => (
                  <button key={i} className="mc-dreamfind__row" onClick={() => onNav('agent:' + a.id)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
                    <span className="mc-dreamfind__star" />
                    <div>
                      <div className="mc-dreamfind__found">{f.t}</div>
                      <div className="mc-dreamfind__act"><Icon name="corner-down-right" size={11} />{f.a}</div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StudioPage, HermesPage, DreamingPage });
