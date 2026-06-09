// shared.jsx — Mission Control shared helpers & primitives
// Exported to window for use across all component files.

const { useState, useEffect, useRef, useLayoutEffect, useCallback } = React;

/* ---- Lucide icon: render <i data-lucide>, debounced global createIcons ---- */
let _iconRaf = null;
function refreshIcons() {
  if (_iconRaf) return;
  _iconRaf = requestAnimationFrame(() => {
    _iconRaf = null;
    if (window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  });
}
function Icon({ name, size, className, style }) {
  useEffect(() => { refreshIcons(); });
  const st = Object.assign({}, style);
  if (size) { st.width = size; st.height = size; }
  return <i data-lucide={name} className={className} style={st}></i>;
}

/* ---- Ripple on press ---- */
function rippleClick(e) {
  const btn = e.currentTarget;
  const r = btn.getBoundingClientRect();
  const span = document.createElement('span');
  span.className = 'ripple';
  const size = Math.max(r.width, r.height);
  span.style.width = span.style.height = size + 'px';
  span.style.left = (e.clientX - r.left - size / 2) + 'px';
  span.style.top = (e.clientY - r.top - size / 2) + 'px';
  btn.appendChild(span);
  setTimeout(() => span.remove(), 560);
}

/* ---- Agent avatar (gradient + initial) ---- */
function AgentAvatar({ agent, size = 40, live, className = '', radius }) {
  const initial = agent.name[0];
  const r = radius != null ? radius : Math.round(size * 0.28);
  return (
    <div className={`mc-av ${className}`} style={{ width: size, height: size, background: agent.avatarGrad || agent.accent, borderRadius: r, fontSize: size * 0.38 }}>
      {initial}
      {live ? <span className={`live ${agent.status}`}></span> : null}
    </div>
  );
}

/* ---- Sparkline ---- */
function Sparkline({ data, color = '#23D6F5', w = 74, h = 26, fill = true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 3 - ((d - min) / rng) * (h - 6);
    return [x, y];
  });
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  const id = 'sg' + Math.round(color.charCodeAt(1) * w + h);
  const last = pts[pts.length - 1];
  return (
    <svg className="mc-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: w, height: h }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? <path d={area} fill={`url(#${id})`} /> : null}
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
    </svg>
  );
}

/* ---- Progress ring ---- */
function ProgressRing({ pct, color = '#23D6F5', size = 150, stroke = 9, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div className="ag-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(206,214,224,0.09)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)', filter: `drop-shadow(0 0 6px ${color}88)` }} />
      </svg>
      <div className="ag-ring__c">{children}</div>
    </div>
  );
}

/* ---- micro activity bars ---- */
function ActivityBars({ active = true, n = 5 }) {
  const heights = [60, 90, 45, 100, 70];
  return (
    <div className="mc-act" aria-hidden="true">
      {heights.slice(0, n).map((h, i) => (
        <span key={i} style={{ height: active ? undefined : h * 0.5 + '%', animationDelay: (i * 0.12) + 's', animationPlayState: active ? 'running' : 'paused' }}></span>
      ))}
    </div>
  );
}

/* ---- helpers ---- */
const AG_BY_ID = {};
(window.MC.agents || []).forEach(a => { AG_BY_ID[a.id] = a; });
window.MC.personas.forEach(p => { AG_BY_ID[p.id] = p; });
function agentById(id) { return AG_BY_ID[id] || { name: id, accent: '#64748B', avatarGrad: '#64748B', role: '', status: 'idle' }; }

function nowTime() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

const KIND_GLYPH = { html: 'code-xml', doc: 'file-text', code: 'braces', image: 'image', video: 'clapperboard' };

Object.assign(window, { Icon, rippleClick, AgentAvatar, Sparkline, ProgressRing, ActivityBars, agentById, nowTime, refreshIcons, KIND_GLYPH });
