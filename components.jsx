// components.jsx — shared primitives, Sidebar, CommandBar
const { useState, useEffect, useRef, useCallback } = React;

// ---- ripple button (premium press feedback) ----
function Btn({ variant = 'ghost', size, icon, iconRight, children, onClick, className = '', ...rest }) {
  const ref = useRef(null);
  const handle = (e) => {
    const el = ref.current; if (el) {
      const r = el.getBoundingClientRect();
      const s = document.createElement('span');
      s.className = 'ripple';
      const d = Math.max(r.width, r.height);
      s.style.width = s.style.height = d + 'px';
      s.style.left = (e.clientX - r.left - d / 2) + 'px';
      s.style.top = (e.clientY - r.top - d / 2) + 'px';
      el.appendChild(s); setTimeout(() => s.remove(), 560);
    }
    onClick && onClick(e);
  };
  return React.createElement('button', {
    ref, onClick: handle,
    className: `mc-btn mc-btn--${variant}${size ? ' mc-btn--' + size : ''} ${className}`,
    ...rest,
  },
    icon && React.createElement(Icon, { name: icon, size: size === 'sm' ? 13 : 14 }),
    children,
    iconRight && React.createElement(Icon, { name: iconRight, size: size === 'sm' ? 13 : 14 }),
  );
}

// ---- sparkline ----
function Sparkline({ data, w = 74, h = 26, color = '#23D6F5', fill = true }) {
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * w, h - 4 - ((v - min) / rng) * (h - 8) ]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  const id = 'sg' + Math.round(color.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  return React.createElement('svg', { className: 'mc-spark', viewBox: `0 0 ${w} ${h}`, width: w, height: h, preserveAspectRatio: 'none' },
    React.createElement('defs', null,
      React.createElement('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 },
        React.createElement('stop', { offset: '0%', stopColor: color, stopOpacity: 0.35 }),
        React.createElement('stop', { offset: '100%', stopColor: color, stopOpacity: 0 }))),
    fill && React.createElement('path', { d: area, fill: `url(#${id})` }),
    React.createElement('path', { d: line, fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }),
    React.createElement('circle', { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 2.2, fill: color }),
  );
}

// ---- progress ring ----
function Ring({ pct, color, label, value }) {
  const r = 50, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return React.createElement('div', { className: 'mc-ring' },
    React.createElement('svg', { viewBox: '0 0 120 120', width: 120, height: 120 },
      React.createElement('circle', { cx: 60, cy: 60, r, fill: 'none', stroke: 'rgba(206,214,224,0.1)', strokeWidth: 9 }),
      React.createElement('circle', { cx: 60, cy: 60, r, fill: 'none', stroke: color, strokeWidth: 9, strokeLinecap: 'round',
        strokeDasharray: c, strokeDashoffset: off, transform: 'rotate(-90 60 60)', style: { transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)', filter: `drop-shadow(0 0 6px ${color})` } })),
    React.createElement('div', { className: 'mc-ring__c' },
      React.createElement('div', { className: 'mc-ring__n' }, value),
      React.createElement('div', { className: 'mc-ring__l' }, label)),
  );
}

// ---- agent avatar (gradient + initial + live dot) ----
function AgentAv({ agent, size = 40, live = true, cls = 'mc-av' }) {
  return React.createElement('div', { className: cls, style: { width: size, height: size, background: agent.avatarGrad, fontSize: size * 0.38 } },
    agent.name[0],
    live && agent.status && React.createElement('span', { className: 'live ' + agent.status }),
  );
}

// initial-only mini avatar
function MiniAv({ agent, size = 22, radius = 7 }) {
  return React.createElement('div', { style: { width: size, height: size, borderRadius: radius, background: agent.avatarGrad, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.42, color: '#06121A', flexShrink: 0 } }, agent.name[0]);
}

// ====================== SIDEBAR ======================
function Sidebar({ view, onNav, rail, onToggleRail }) {
  const A = window.MC.agents;
  const navItem = (key, label, glyph, opts = {}) => {
    const active = view === key;
    return React.createElement('button', {
      key: opts.k || key, className: `mc-item${active ? ' is-active' : ''}${opts.gold ? ' acc-gold' : ''}`,
      onClick: () => onNav(key), title: rail ? label : undefined,
      'aria-current': active ? 'page' : undefined,
    },
      opts.avatar
        ? React.createElement('div', { className: 'mc-item__av', style: { background: opts.avatar.avatarGrad } },
            opts.avatar.name[0],
            React.createElement('span', { className: 'live', style: { background: opts.avatar.status === 'working' ? '#2BD8A0' : opts.avatar.status === 'approval' ? '#D8A74A' : '#64748B', boxShadow: `0 0 6px currentColor` } }))
        : React.createElement('span', { className: 'mc-item__ico' }, React.createElement(Icon, { name: glyph, size: 17 })),
      React.createElement('span', { className: 'mc-item__label' }, label),
      opts.tag && React.createElement('span', { className: 'mc-item__tag' }, opts.tag),
      opts.badge && React.createElement('span', { className: 'mc-item__badge' }, opts.badge),
    );
  };

  return React.createElement('aside', { className: 'mc-side' },
    // top brand
    React.createElement('div', { className: 'mc-side__top' },
      React.createElement('img', { className: 'mc-logo', src: 'assets/la-symbol.png', alt: 'Legacy Automations' }),
      React.createElement('div', { className: 'mc-wm' },
        React.createElement('span', { className: 'g' }, 'MISSION'), ' ',
        React.createElement('span', { className: 'c' }, 'CONTROL'),
        React.createElement('small', null, 'LEGACY AUTOMATIONS')),
      !rail && React.createElement('button', { className: 'mc-collapse', onClick: onToggleRail, title: 'Collapse', 'aria-label': 'Collapse sidebar' },
        React.createElement(Icon, { name: 'chevrons-left', size: 16 })),
    ),
    rail && React.createElement('button', { className: 'mc-collapse', onClick: onToggleRail, title: 'Expand', 'aria-label': 'Expand sidebar', style: { margin: '8px auto 0' } },
      React.createElement(Icon, { name: 'chevrons-right', size: 16 })),
    // status pill
    React.createElement('div', { className: 'mc-side__status' },
      React.createElement('span', { className: 'pulse-dot good' }),
      React.createElement('div', null,
        React.createElement('div', { className: 'mc-side__status-txt' }, 'All systems nominal'),
        React.createElement('div', { className: 'mc-side__status-sub' }, '7 layers · online'))),
    // scrollable nav
    React.createElement('div', { className: 'mc-side__scroll' },
      React.createElement('div', { className: 'mc-sec' }, 'Workspace'),
      React.createElement('div', { className: 'mc-nav' },
        navItem('home', 'Mission Control', 'layout-dashboard'),
        navItem('hermes', 'Hermes', 'send'),
        navItem('briefing', 'Daily Briefing', 'sun'),
        navItem('dreaming', 'Dreaming', 'moon-star')),

      React.createElement('div', { className: 'mc-sec' }, 'Agents'),
      React.createElement('div', { className: 'mc-nav' },
        ...A.map(a => navItem('agent:' + a.id, a.name, null, { avatar: a, tag: a.model.split('-')[0] })),
        navItem('paperclip', 'Paperclip · Teams', 'workflow'),
        navItem('pantheon', 'Summon Persona', 'plus')),

      React.createElement('div', { className: 'mc-sec' }, 'Build'),
      React.createElement('div', { className: 'mc-nav' },
        navItem('kanban', 'Hermes Kanban', 'kanban'),
        navItem('content', 'Content Engine', 'pen-line'),
        navItem('studio', 'Studio', 'clapperboard'),
        navItem('galaxy', 'Memory Galaxy', 'orbit', { gold: true })),

      React.createElement('div', { className: 'mc-sec' }, 'System'),
      React.createElement('div', { className: 'mc-nav' },
        navItem('goals', 'Business Goals', 'flag'),
        navItem('skills', 'Skills', 'zap'),
        navItem('workflows', 'Workflows', 'workflow'),
        navItem('security', 'Security', 'shield-half'),
        navItem('reports', 'Reports', 'file-text')),

      React.createElement('div', { className: 'mc-sec' }, 'Integrations'),
      React.createElement('div', { className: 'mc-nav' },
        navItem('gmail', 'Gmail', 'message-square', { badge: window.MC.gmail.unread }),
        navItem('calendar', 'Calendar', 'sun'),
        navItem('drive', 'Drive', 'folder-sync'),
        navItem('notion', 'Notion', 'box'),
        navItem('obsidian', 'Obsidian', 'box', { k: 'obs' }),
        navItem('connectors', 'All Connectors', 'plug')),

      React.createElement('div', { className: 'mc-sec' }, 'Channels'),
      React.createElement('div', { className: 'mc-nav' },
        ...window.MC.channels.map(c => navItem(c.id === 'warroom' ? 'warroom' : 'channel:' + c.id, c.name, c.glyph, { badge: c.badge }))),

      React.createElement('div', { className: 'mc-sec' }, 'Workspaces'),
      React.createElement('div', { className: 'mc-nav' },
        ...window.MC.workspaces.filter(w => !['galaxy', 'kanban', 'studio', 'goals', 'content'].includes(w.id)).map(w => navItem('ws:' + w.id, w.name, w.glyph))),
    ),
    // owner
    React.createElement('div', { className: 'mc-side__foot' },
      React.createElement('button', { className: 'mc-owner', onClick: () => onNav('home') },
        React.createElement('div', { className: 'mc-owner__av' }),
        React.createElement('div', { style: { minWidth: 0 } },
          React.createElement('div', { className: 'mc-owner__name' }, window.MC.operator.name),
          React.createElement('div', { className: 'mc-owner__role' }, window.MC.operator.role)))),
  );
}

// ====================== COMMAND BAR ======================
const VIEW_TITLES = {
  home: ['Mission Control', 'Layer 5 · Command Center'],
  warroom: ['War Room', 'Team Channel · Live'],
  galaxy: ['Memory Galaxy', 'Layer 2 · The Vault'],
  connectors: ['Connectors', 'Programs · Hosts · APIs'],
  pantheon: ['Pantheon', 'Summon a Persona'],
  hermes: ['Hermes', 'Layer 4 · Central Agent'],
  dreaming: ['Dreaming', 'Layer 7 · Overnight Loop'],
  paperclip: ['Paperclip', 'AI Employees · Teams'],
  kanban: ['Hermes Kanban', 'Self-Driving Board'],
  studio: ['Studio', 'Hyperframes · Video'],
  gmail: ['Gmail', 'Integration · Inbox'],
  calendar: ['Calendar', 'Integration · Schedule'],
  drive: ['Drive', 'Integration · Files'],
  notion: ['Notion', 'Integration · Workspace'],
  obsidian: ['Obsidian', 'Layer 2 · Vault'],
  goals: ['Business Goals', 'Outcomes that matter'],
  skills: ['Skills', 'Agent Capabilities'],
  workflows: ['Workflows', 'Active Automations'],
  reports: ['Reports', 'Agent Output'],
  briefing: ['Daily Briefing', 'What the team is doing'],
  content: ['Content Engine', 'Legacy Content System'],
  security: ['Security', 'Posture · Reports · Events'],
};
function CommandBar({ view, onOpenPalette, onNav }) {
  let title = 'Mission Control', eyebrow = 'Layer 5 · Command Center';
  if (view.startsWith('agent:')) {
    const a = window.MC.agents.find(x => x.id === view.split(':')[1]);
    if (a) { title = a.name; eyebrow = a.role; }
  } else if (VIEW_TITLES[view]) { [title, eyebrow] = VIEW_TITLES[view]; }
  else if (view.startsWith('ws:')) { title = window.MC.workspaces.find(w => 'ws:' + w.id === view)?.name || 'Workspace'; eyebrow = 'Workspace'; }
  else if (view.startsWith('channel:')) { title = window.MC.channels.find(c => 'channel:' + c.id === view)?.name || 'Channel'; eyebrow = 'Channel'; }

  const [eve] = useState(() => { const h = new Date().getHours(); return h; });
  return React.createElement('header', { className: 'mc-bar' },
    React.createElement('div', { className: 'mc-bar__crumb' },
      React.createElement('div', { className: 'mc-bar__ey' }, React.createElement('span', { className: 'cy' }, 'LEGACY'), ' / ', eyebrow),
      React.createElement('div', { className: 'mc-bar__title' }, title)),
    React.createElement('button', { className: 'mc-kbar', onClick: onOpenPalette, 'aria-label': 'Open command palette' },
      React.createElement('i', null, React.createElement(Icon, { name: 'command', size: 16 })),
      React.createElement('span', { className: 'mc-kbar__ph' }, 'Command anything…'),
      React.createElement('span', { className: 'mc-kbar__kbd' }, '⌘K')),
    React.createElement('div', { className: 'mc-bar__right' },
      // Autonomy ladder — the operator's master control (manual / semi / full),
      // replaces the old hardcoded Context/Spend gauges (they were sample data)
      window.AutonomyControl && React.createElement(window.AutonomyControl, { compact: true }),
      React.createElement('button', { className: 'mc-iconbtn', onClick: () => onNav('home'), title: 'Dreaming brief', 'aria-label': 'Dreaming brief' },
        React.createElement(Icon, { name: 'moon-star', size: 17 }),
        React.createElement('span', { className: 'mc-iconbtn__dot' })),
      React.createElement('button', { className: 'mc-bar__av', onClick: () => onNav('home'), title: 'Lew', 'aria-label': 'Operator profile' }),
    ),
  );
}

// shared color util
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

Object.assign(window, { Btn, Sparkline, Ring, AgentAv, MiniAv, Sidebar, CommandBar, hexA });
