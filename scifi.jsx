// scifi.jsx — shared alien-tech machinery for every page.
// • SciFiBackdrop: canvas atmosphere (variants: alien | myth | dream | grid)
//   — perf-safe: DPR ≤ 1.5, pauses when the tab is hidden, obeys the
//   motion tweak (--motion-scale) and prefers-reduced-motion.
// • AutonomyControl: the manual / semi / full ladder, wired to the backend
//   (/api/mode) with SSE sync; falls back to localStorage in DEMO.
// • HoloStat: big HUD readout used across pages.
(function () {
  const { useState, useEffect, useRef } = React;

  function motionScale() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion-scale'));
    return isNaN(v) ? 1 : v;
  }

  // ---------- the atmosphere engine ----------
  const VARIANTS = {
    alien: {
      stars: 110, hue: [180, 200], nebula: [
        { x: 0.82, y: 0.12, r: 0.42, c: 'rgba(35,214,245,0.10)' },
        { x: 0.10, y: 0.85, r: 0.5, c: 'rgba(232,199,102,0.05)' },
        { x: 0.45, y: 0.4, r: 0.6, c: 'rgba(20,80,140,0.07)' },
      ], grid: true, sweep: true, motes: 0,
    },
    myth: {
      stars: 34, hue: [42, 50], nebula: [
        { x: 0.5, y: 0.0, r: 0.7, c: 'rgba(232,199,102,0.07)' },
        { x: 0.85, y: 0.9, r: 0.5, c: 'rgba(232,199,102,0.045)' },
      ], grid: false, sweep: false, motes: 26, moteColor: '232,199,102', rays: true,
    },
    dream: {
      stars: 90, hue: [255, 280], nebula: [
        { x: 0.2, y: 0.15, r: 0.55, c: 'rgba(167,139,250,0.10)' },
        { x: 0.85, y: 0.7, r: 0.6, c: 'rgba(35,214,245,0.07)' },
        { x: 0.5, y: 1.0, r: 0.7, c: 'rgba(244,114,182,0.05)' },
      ], grid: false, sweep: false, motes: 18, moteColor: '196,181,253', aurora: true,
    },
    grid: { stars: 50, hue: [185, 200], nebula: [{ x: 0.5, y: 0.0, r: 0.7, c: 'rgba(35,214,245,0.06)' }], grid: true, sweep: false, motes: 0 },
  };

  function SciFiBackdrop({ variant = 'alien', opacity = 1 }) {
    const ref = useRef(null);
    useEffect(() => {
      const cv = ref.current; if (!cv) return;
      const V = VARIANTS[variant] || VARIANTS.alien;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      let raf = 0, running = true, t = Math.random() * 100;
      const S = { stars: [], motes: [], w: 0, h: 0, sweepX: -0.2 };

      const sizeUp = () => {
        const w = cv.clientWidth || cv.parentElement.clientWidth, h = cv.clientHeight || cv.parentElement.clientHeight;
        if (!w || !h) return;
        S.w = w; S.h = h; cv.width = w * dpr; cv.height = h * dpr;
        S.auroraCv = null; // re-render the cached aurora strip at the new size
        S.stars = [];
        for (let i = 0; i < V.stars; i++) S.stars.push({
          x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.25,
          tw: Math.random() * 6.28, sp: 0.2 + Math.random() * 0.8,
          warm: Math.random() > 0.82,
        });
        S.motes = [];
        for (let i = 0; i < (V.motes || 0); i++) S.motes.push({
          x: Math.random(), y: Math.random(), r: Math.random() * 2.2 + 0.8,
          vx: (Math.random() - 0.5) * 0.012, vy: -(0.004 + Math.random() * 0.012), ph: Math.random() * 6.28,
        });
      };

      const paint = (dt) => {
        const { w, h } = S; if (!w) return;
        const ctx = cv.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const ms = motionScale();

        // nebulae (slow drift)
        V.nebula.forEach((n, i) => {
          const ox = Math.sin(t * 0.05 + i * 2.1) * 30 * ms;
          const oy = Math.cos(t * 0.04 + i * 1.7) * 20 * ms;
          const g = ctx.createRadialGradient(n.x * w + ox, n.y * h + oy, 0, n.x * w + ox, n.y * h + oy, n.r * Math.max(w, h));
          g.addColorStop(0, n.c); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        });

        // aurora ribbons (dream) — bands are pre-blurred ONCE into an offscreen
        // canvas (per-frame ctx.filter blur was a CPU rasterize every frame);
        // per-frame work is just two transforms of the cached strip
        if (V.aurora) {
          if (!S.auroraCv || S.auroraCv.width !== Math.ceil(w)) {
            S.auroraCv = document.createElement('canvas');
            S.auroraCv.width = Math.max(2, Math.ceil(w)); S.auroraCv.height = Math.max(2, Math.ceil(h * 0.7));
            const ax = S.auroraCv.getContext('2d');
            const cols = ['rgba(167,139,250,', 'rgba(35,214,245,', 'rgba(244,114,182,'];
            for (let band = 0; band < 3; band++) {
              ax.beginPath();
              const baseY = S.auroraCv.height * (0.25 + band * 0.22);
              for (let x = 0; x <= w; x += 14) {
                const y = baseY + Math.sin(x * 0.006 + band * 2.1) * 26 + Math.sin(x * 0.0017) * 40;
                x === 0 ? ax.moveTo(x, y) : ax.lineTo(x, y);
              }
              ax.strokeStyle = cols[band] + '0.16)'; ax.lineWidth = 30; ax.filter = 'blur(14px)'; ax.stroke(); ax.filter = 'none';
            }
          }
          ctx.save(); ctx.globalCompositeOperation = 'screen';
          const drift = Math.sin(t * 0.22 * Math.max(ms, 0.0001)) * 24;
          const sway = Math.cos(t * 0.13 * Math.max(ms, 0.0001)) * 14;
          ctx.globalAlpha = 0.9; ctx.drawImage(S.auroraCv, drift, h * 0.08 + sway * 0.4);
          ctx.globalAlpha = 0.55; ctx.drawImage(S.auroraCv, -drift * 1.4, h * 0.18 - sway);
          ctx.globalAlpha = 1; ctx.restore();
        }

        // god rays (myth)
        if (V.rays) {
          ctx.save(); ctx.globalCompositeOperation = 'screen';
          for (let i = 0; i < 4; i++) {
            const cxr = w * (0.3 + i * 0.18) + Math.sin(t * 0.1 + i) * 18 * ms;
            const grad = ctx.createLinearGradient(cxr, 0, cxr + 80, h);
            grad.addColorStop(0, 'rgba(232,199,102,' + (0.05 + 0.02 * Math.sin(t * 0.4 + i)) + ')');
            grad.addColorStop(1, 'rgba(232,199,102,0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.moveTo(cxr, -10); ctx.lineTo(cxr + 46, -10); ctx.lineTo(cxr + 150, h); ctx.lineTo(cxr + 60, h); ctx.closePath(); ctx.fill();
          }
          ctx.restore();
        }

        // perspective grid (alien)
        if (V.grid) {
          ctx.save();
          ctx.strokeStyle = 'rgba(35,214,245,0.07)'; ctx.lineWidth = 1;
          const horizon = h * 0.62, vp = w / 2;
          for (let i = -10; i <= 10; i++) {
            ctx.beginPath(); ctx.moveTo(vp + i * 26, horizon); ctx.lineTo(vp + i * (w / 9), h); ctx.stroke();
          }
          const roll = ((t * 14 * ms) % 40);
          for (let row = 0; row < 9; row++) {
            const k = row / 9; const y = horizon + Math.pow(k, 2.1) * (h - horizon) + roll * Math.pow(k, 2.1);
            if (y > h) continue;
            ctx.globalAlpha = 0.5 + k * 0.5;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
          }
          ctx.restore();
        }

        // stars
        S.stars.forEach(st => {
          const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * st.sp * 1.6 * Math.max(ms, 0.12) + st.tw));
          ctx.globalAlpha = a;
          ctx.fillStyle = st.warm ? '#F3D27A' : '#CFEAFF';
          ctx.beginPath(); ctx.arc(st.x * w, st.y * h, st.r, 0, 6.2832); ctx.fill();
        });
        ctx.globalAlpha = 1;

        // floating motes
        if (S.motes.length) {
          S.motes.forEach(m => {
            m.x += m.vx * dt * ms; m.y += m.vy * dt * ms;
            if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); }
            if (m.x < -0.05) m.x = 1.05; if (m.x > 1.05) m.x = -0.05;
            const a = 0.18 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.9 + m.ph));
            ctx.fillStyle = 'rgba(' + (V.moteColor || '255,255,255') + ',' + a.toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(m.x * w, m.y * h, m.r, 0, 6.2832); ctx.fill();
          });
        }

        // scan sweep (alien) — a slow vertical light pass
        if (V.sweep && ms > 0) {
          S.sweepX += 0.0011 * dt * ms;
          if (S.sweepX > 1.25) S.sweepX = -0.25;
          const sx = S.sweepX * w;
          const g = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
          g.addColorStop(0, 'rgba(35,214,245,0)'); g.addColorStop(0.5, 'rgba(35,214,245,0.045)'); g.addColorStop(1, 'rgba(35,214,245,0)');
          ctx.fillStyle = g; ctx.fillRect(sx - 60, 0, 120, h);
        }
      };

      let last = performance.now();
      let stoppedForMotion = false;
      const loop = (now) => {
        if (!running) return;
        const dt = Math.min(3, (now - last) / 16.7); last = now;
        t += 0.016 * dt * Math.max(motionScale(), 0.0001);
        paint(dt);
        if (motionScale() === 0) {
          // static frame painted; park the loop but keep checking the tweak so
          // motion off→on resumes without a remount (audit P3)
          stoppedForMotion = true;
          const probe = setInterval(() => {
            if (!running) return clearInterval(probe);
            if (motionScale() > 0) { clearInterval(probe); stoppedForMotion = false; last = performance.now(); raf = requestAnimationFrame(loop); }
          }, 1500);
          return;
        }
        raf = requestAnimationFrame(loop);
      };
      const onVis = () => {
        if (document.hidden) { running = false; cancelAnimationFrame(raf); }
        else { running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
      };
      const ro = new ResizeObserver(() => { sizeUp(); paint(1); });
      ro.observe(cv.parentElement || cv);
      sizeUp(); paint(1); raf = requestAnimationFrame(loop);
      document.addEventListener('visibilitychange', onVis);
      return () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener('visibilitychange', onVis); };
    }, [variant]);
    return React.createElement('canvas', { ref, className: 'sci-bg', style: { opacity }, 'aria-hidden': true });
  }

  // ---------- autonomy ladder ----------
  const MODES = [
    { id: 'manual', label: 'Manual', gl: '✋', desc: 'Every action waits for your sign-off.' },
    { id: 'semi', label: 'Semi-Auto', gl: '⚡', desc: 'Low-risk actions auto-approve. Med/high wait for you.' },
    { id: 'full', label: 'Autonomous', gl: '🛰', desc: 'Agents operate the system. Only high-risk waits for you.' },
  ];
  function getMode() { return (window.MC && MC.autonomy) || localStorage.getItem('mcAutonomy') || 'manual'; }

  function AutonomyControl({ compact }) {
    const [mode, setMode] = useState(getMode);
    useEffect(() => {
      const sync = () => setMode(getMode());
      window.addEventListener('mc:live', sync);
      const off = window.MCLive && MCLive.onEvent ? MCLive.onEvent(e => { if (e.type === 'mode') { window.MC.autonomy = e.mode; setMode(e.mode); } }) : null;
      return () => { window.removeEventListener('mc:live', sync); off && off(); };
    }, []);
    const pick = (m) => {
      setMode(m);
      window.MC.autonomy = m;
      try { localStorage.setItem('mcAutonomy', m); } catch (e) {}
      if (window.MCLive && MCLive.online) MCLive.post('/api/mode', { mode: m }).catch(() => {});
    };
    const cur = MODES.find(x => x.id === mode) || MODES[0];
    return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
      React.createElement('div', { className: 'auto-ladder', role: 'radiogroup', 'aria-label': 'Autonomy mode', title: cur.desc },
        ...MODES.map(m => React.createElement('button', {
          key: m.id, className: 'auto-ladder__opt' + (mode === m.id ? ' is-active' : ''), 'data-mode': m.id,
          role: 'radio', 'aria-checked': mode === m.id, title: m.desc,
          onClick: () => pick(m.id),
        }, React.createElement('span', { className: 'gl' }, m.gl), m.label))),
      !compact && React.createElement('span', { style: { fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)', maxWidth: 200, lineHeight: 1.35 } }, cur.desc));
  }

  // ---------- HUD stat ----------
  function HoloStat({ label, value, suffix, tone, size = 26 }) {
    const col = tone === 'gold' ? '#F3D27A' : tone === 'crimson' ? '#F4516B' : tone === 'emerald' ? '#5BEFC3' : 'var(--acc2, #6FE8FB)';
    return React.createElement('div', { style: { minWidth: 86 } },
      React.createElement('div', { className: 'hud-readout', style: { fontSize: size, fontWeight: 700, color: col } }, value,
        suffix && React.createElement('span', { style: { fontSize: size * 0.45, opacity: .7, marginLeft: 2 } }, suffix)),
      React.createElement('div', { className: 'hud-eyebrow', style: { marginTop: 3 } }, label));
  }

  Object.assign(window, { SciFiBackdrop, AutonomyControl, HoloStat, MC_MODES: MODES });
})();
