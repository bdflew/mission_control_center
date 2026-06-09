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
    setMsgs(p => [...p, { me: true, t: val }]); const q = val; setVal(''); setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs(p => [...p, { me: false, t: 'On it. I have full context from the vault — routing this through the team and logging it back. I will surface the result in your next brief.' }]); }, 1300);
  };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-integ__bar', style: { marginBottom: 16 } },
      React.createElement('div', { className: 'mc-integ__id' },
        React.createElement('div', { className: 'mc-integ__logo', style: { background: 'linear-gradient(145deg,#A87B2E,#F3D27A)' } }, React.createElement(Icon, { name: 'send', size: 22, style: { color: '#06121A' } })),
        React.createElement('div', null,
          React.createElement('div', { className: 'mc-integ__name' }, 'Hermes'),
          React.createElement('div', { className: 'mc-integ__acct' }, H.version + ' · ' + H.host))),
      React.createElement('span', { className: 'mc-chip good' }, React.createElement('span', { className: 'dot' }), 'Online')),
    React.createElement('div', { className: 'mc-hermes' },
      React.createElement('div', { className: 'mc-hermes__convos' },
        React.createElement('div', { className: 'mc-ptitle', style: { marginBottom: 12, fontSize: 11 } }, React.createElement('i', null, React.createElement(Icon, { name: 'message-square', size: 14 })), 'Conversations'),
        ...H.conversations.map(c => React.createElement('button', { key: c.id, className: 'mc-hconvo' + (convo === c.id ? ' active' : ''), onClick: () => setConvo(c.id) },
          React.createElement('span', { className: 'mc-hconvo__t' }, c.title),
          React.createElement('span', { className: 'mc-hconvo__time' }, c.time)))),
      React.createElement('div', { className: 'mc-hermes__main' },
        // stats
        React.createElement('div', { className: 'mc-hermes__statgrid' },
          React.createElement('div', { className: 'mc-obs__stat' }, React.createElement('div', { className: 'v' }, H.activations), React.createElement('div', { className: 'l' }, 'Activations · 7d')),
          React.createElement('div', { className: 'mc-obs__stat' }, React.createElement('div', { className: 'v' }, H.connections.filter(c => c.status === 'live').length), React.createElement('div', { className: 'l' }, 'Live Connections')),
          React.createElement('div', { className: 'mc-obs__stat' }, React.createElement('div', { className: 'v' }, '4'), React.createElement('div', { className: 'l' }, 'Models')),
          React.createElement('div', { className: 'mc-obs__stat' }, React.createElement('div', { className: 'v' }, '1.2K'), React.createElement('div', { className: 'l' }, 'Memory Hits'))),
        // chat
        React.createElement('div', { className: 'mc-tpanel mc-agent theme-gold', style: { padding: 16 } },
          React.createElement('div', { className: 'mc-phead' },
            React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', { style: { color: 'var(--la-gold)' } }, React.createElement(Icon, { name: 'send', size: 15 })), 'Chat with Hermes'),
            React.createElement('span', { className: 'mc-chip gold' }, React.createElement('span', { className: 'dot' }), 'Local')),
          React.createElement('div', { className: 'mc-achat', style: { height: 300 } },
            React.createElement('div', { className: 'mc-achat__feed', ref: feedRef },
              ...msgs.map((m, i) => React.createElement('div', { key: i, className: 'mc-bubble ' + (m.me ? 'me' : 'them') },
                React.createElement('div', { className: 'mc-bubble__meta' }, m.me ? 'You' : 'Hermes'), m.t)),
              typing && React.createElement('div', { className: 'mc-bubble them' }, React.createElement('div', { className: 'mc-typing' }, React.createElement('span'), React.createElement('span'), React.createElement('span')))),
            React.createElement('div', { className: 'mc-composer' },
              React.createElement('input', { value: val, onChange: e => setVal(e.target.value), onKeyDown: e => e.key === 'Enter' && send(), placeholder: 'Ask Hermes anything…', 'aria-label': 'Message Hermes' }),
              React.createElement('button', { className: 'mc-composer__send', onClick: send, 'aria-label': 'Send' }, React.createElement(Icon, { name: 'send', size: 15 }))))),
        // connections + models
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-grid)' } },
          React.createElement('div', { className: 'mc-panel' },
            React.createElement('div', { className: 'mc-phead' }, React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'plug', size: 15 })), 'Connections')),
            React.createElement('div', { className: 'mc-conngrid' },
              ...H.connections.map(c => React.createElement('div', { key: c.name, className: 'mc-conn-mini' },
                React.createElement('div', { className: 'mc-conn-mini__ico' }, React.createElement(Icon, { name: c.glyph, size: 14 })),
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { className: 'mc-conn-mini__n' }, c.name),
                  React.createElement('div', { className: 'mc-conn-mini__m' }, c.method)),
                React.createElement('span', { className: 'pulse-dot ' + (c.status === 'live' ? 'good' : 'slate'), style: { width: 7, height: 7 } }))))),
          React.createElement('div', { className: 'mc-panel' },
            React.createElement('div', { className: 'mc-phead' }, React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'cpu', size: 15 })), 'Model Routing')),
            ...H.models.map(m => React.createElement('div', { key: m.name, className: 'mc-modelbar' },
              React.createElement('div', { className: 'mc-modelbar__top' }, React.createElement('span', { style: { color: 'var(--fg-1)' } }, m.name), React.createElement('span', { style: { color: 'var(--fg-3)' } }, m.share + '%')),
              React.createElement('div', { className: 'mc-modelbar__track' }, React.createElement('div', { className: 'mc-modelbar__fill', style: { width: m.share + '%' } })),
              React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)', marginTop: 3 } }, m.use))))),
        // mission control goal
        React.createElement('div', { className: 'mc-hgoal' },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 } },
            React.createElement(Icon, { name: 'target', size: 16, style: { color: 'var(--la-gold)' } }),
            React.createElement('span', { style: { fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' } }, 'Mission Control Goal')),
          React.createElement('div', { style: { fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.5, marginBottom: 10 } }, 'Grow the YouTube channel by 1,000 subscribers. Hermes drafts the plan, assigns the team, and you keep the approval gate.'),
          React.createElement('div', { style: { display: 'flex', gap: 8 } },
            React.createElement(Btn, { variant: 'gold', size: 'sm', icon: 'arrow-right', onClick: () => onNav('ws:kanban') }, 'Open the plan'),
            React.createElement(Btn, { variant: 'quiet', size: 'sm', icon: 'plus' }, 'Set new goal')))),
    ),
  );
}

// ===================== DREAMING PAGE =====================
function DreamGalaxyBg() {
  const ref = useRb(null);
  useEb(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const S = { t: 0, raf: 0, stars: [] };
    const init = () => { const w = cv.clientWidth, h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; S.stars = []; for (let i = 0; i < 90; i++) S.stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.4 + 0.2, tw: Math.random() * 6.28, c: Math.random() > 0.7 ? '#6FE8FB' : '#cfeaff' }); };
    init();
    const paint = () => {
      const w = cv.clientWidth, h = cv.clientHeight; const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'screen';
      const bx = w * 0.85, by = h * 0.2;
      const ng = ctx.createRadialGradient(bx, by, 0, bx, by, 220);
      ng.addColorStop(0, 'rgba(35,214,245,0.14)'); ng.addColorStop(1, 'rgba(35,214,245,0)');
      ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(bx, by, 220, 0, 6.2832); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      S.stars.forEach(st => { const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(S.t * 1.4 + st.tw)); ctx.globalAlpha = tw; ctx.fillStyle = st.c; ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.2832); ctx.fill(); });
      ctx.globalAlpha = 1;
    };
    const loop = () => { S.t += 0.016; paint(); S.raf = requestAnimationFrame(loop); };
    paint(); S.raf = requestAnimationFrame(loop);
    window.addEventListener('resize', init);
    return () => { cancelAnimationFrame(S.raf); window.removeEventListener('resize', init); };
  }, []);
  return React.createElement('canvas', { ref, className: 'mc-dreamgalaxy' });
}

function DreamingPage({ onNav }) {
  const D = window.MC.dreamingPage;
  const [items, setItems] = useSb(D.insights);
  const findings = window.MC.dreamFindings || {};
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-dreampage__hero cosmic' },
      React.createElement(DreamGalaxyBg),
      React.createElement('div', { className: 'mc-dreampage__moon' }),
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('div', { style: { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '.03em', textTransform: 'uppercase' } }, 'Dreaming'),
        React.createElement('p', { style: { fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', margin: '6px 0 0', maxWidth: 560 } }, 'While you sleep, the system reads across Hermes, Claude, Codex, Gemini and your vault — surfacing patterns, savings, and the next move. A morning brief, every day.')),
      React.createElement('div', { style: { textAlign: 'right' } },
        React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' } }, 'LAST RUN'),
        React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--la-cyan)' } }, D.lastRun))),
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' } },
      React.createElement('span', { className: 'mono', style: { fontSize: 10, color: 'var(--fg-3)' } }, 'READS FROM'),
      ...D.sources.map(s => React.createElement('span', { key: s, className: 'mc-chip cyan', style: { fontSize: 9 } }, s)),
      React.createElement('span', { style: { marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' } }, 'Next run: ' + D.nextRun)),
    React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, marginBottom: 12 } }, React.createElement('i', null, React.createElement(Icon, { name: 'sparkles', size: 15 })), 'System Insights'),
    ...items.map(d => React.createElement('div', { key: d.id, className: 'mc-dreaminsight' },
      React.createElement('div', { className: 'mc-dreaminsight__ico tone-' + d.tone }, React.createElement(Icon, { name: d.glyph, size: 18 })),
      React.createElement('div', { className: 'mc-dreaminsight__b' },
        React.createElement('div', { className: 'mc-dreaminsight__t' }, d.title),
        React.createElement('div', { className: 'mc-dreaminsight__x' }, d.text),
        React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
          React.createElement('span', { className: 'mc-dreaminsight__from' }, '◆ ' + d.from),
          React.createElement(Btn, { variant: 'ghost', size: 'sm', onClick: () => { onNav && onNav('home'); } }, 'Act on it'),
          React.createElement(Btn, { variant: 'quiet', size: 'sm', onClick: () => setItems(p => p.filter(x => x.id !== d.id)) }, 'Dismiss'))),
      React.createElement('div', { className: 'mc-dreaminsight__save', style: { color: d.tone === 'gold' ? 'var(--la-gold)' : d.tone === 'crimson' ? '#F4516B' : d.tone === 'emerald' ? '#34D399' : 'var(--la-cyan)' } }, d.save))),
    items.length === 0 && React.createElement('div', { className: 'mc-placeholder', style: { minHeight: 160 } },
      React.createElement('div', null, React.createElement('div', { className: 'mc-placeholder__ico' }, React.createElement(Icon, { name: 'check-circle', size: 30 })), React.createElement('h3', null, 'Brief cleared'), React.createElement('p', null, 'You acted on every overnight insight. The system keeps dreaming tonight.'))),
    React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, margin: '24px 0 12px' } }, React.createElement('i', null, React.createElement(Icon, { name: 'cpu', size: 15 })), 'What each employee found overnight'),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--gap-grid)' } },
      ...window.MC.agents.map(a => { const fs = findings[a.id] || [];
        return React.createElement('div', { key: a.id, className: 'mc-dreamfind' },
          React.createElement('div', { className: 'mc-dreamfind__top' },
            React.createElement('button', { onClick: () => onNav('agent:' + a.id), style: { all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11 } },
              React.createElement('div', { className: 'mc-dreamfind__av', style: { background: a.avatarGrad } }, a.name[0]),
              React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 600 } }, a.name),
                React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)' } }, fs.length + ' findings'))),
            React.createElement('span', { className: 'mc-chip ' + a.theme, style: { marginLeft: 'auto' } }, React.createElement('span', { className: 'dot' }), 'Dreamt')),
          ...fs.map((f, i) => React.createElement('button', { key: i, className: 'mc-dreamfind__row', onClick: () => onNav('agent:' + a.id), style: { all: 'unset', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' } },
            React.createElement('span', { className: 'mc-dreamfind__star' }),
            React.createElement('div', null,
              React.createElement('div', { className: 'mc-dreamfind__found' }, f.t),
              React.createElement('div', { className: 'mc-dreamfind__act' }, React.createElement(Icon, { name: 'corner-down-right', size: 11 }), f.a))))); })),
  );
}

Object.assign(window, { StudioPage, HermesPage, DreamingPage });
