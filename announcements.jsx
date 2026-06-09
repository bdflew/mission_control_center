// announcements.jsx — team broadcasts, task assignment, brain dump
const { useState: useSan, useRef: useRan, useEffect: useEan } = React;

const ANN_MODES = [
  { id: 'announce', label: 'Announce', glyph: 'megaphone', tone: 'cyan' },
  { id: 'task', label: 'Assign task', glyph: 'flag', tone: 'cyan' },
  { id: 'braindump', label: 'Brain dump', glyph: 'sparkles', tone: 'gold' },
];
const ANN_ICON = { announce: { g: 'megaphone', c: '#23D6F5' }, task: { g: 'flag', c: '#34D399' }, braindump: { g: 'sparkles', c: '#E8C766' } };

function AnnouncementsPage({ onNav, onAction }) {
  const [mode, setMode] = useSan('announce');
  const [text, setText] = useSan('');
  const [to, setTo] = useSan('faye');
  const [items, setItems] = useSan(() => { try { return JSON.parse(localStorage.getItem('mc_announcements')) || window.MC.announcements; } catch (e) { return window.MC.announcements; } });
  const persist = (next) => { setItems(next); try { localStorage.setItem('mc_announcements', JSON.stringify(next)); } catch (e) {} };
  const agents = window.MC.agents;
  const post = () => {
    if (!text.trim()) return;
    const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const item = { id: 'an' + Date.now(), kind: mode, text: text.trim(), time: t };
    if (mode === 'task') item.to = to;
    persist([item, ...items]);
    setText('');
    onAction && onAction('toast', mode === 'announce' ? 'Broadcast to the whole team.' : mode === 'task' ? 'Task assigned to ' + agByA(to).name + '.' : 'Brain dump saved to the vault.');
  };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-page-head' },
      React.createElement('h2', null, 'Announcements'),
      React.createElement('p', null, 'Your channel to the whole team. Broadcast an announcement, assign a task to an agent, or brain-dump an idea — it’s logged to the vault for everyone.')),
    React.createElement('div', { className: 'mc-ann' },
      React.createElement('div', { className: 'mc-ann__main' },
        React.createElement('div', { className: 'mc-ann__composer' },
          React.createElement('div', { className: 'mc-ann__modes' },
            ...ANN_MODES.map(m => React.createElement('button', { key: m.id, className: 'mc-ann__mode' + (m.tone === 'gold' ? ' gold' : '') + (mode === m.id ? ' is-active' : ''), onClick: () => setMode(m.id) },
              React.createElement(Icon, { name: m.glyph, size: 14 }), m.label))),
          React.createElement('textarea', { className: 'mc-ann__ta', value: text, onChange: e => setText(e.target.value), placeholder: mode === 'announce' ? 'Announce something to the whole team…' : mode === 'task' ? 'Describe the task to assign…' : 'Dump whatever’s on your mind — the team can pick it up…', onKeyDown: e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) post(); } }),
          React.createElement('div', { className: 'mc-ann__row' },
            mode === 'task' && React.createElement(React.Fragment, null,
              React.createElement('span', { className: 'mono', style: { fontSize: 10, color: 'var(--fg-3)' } }, 'ASSIGN TO'),
              React.createElement('div', { style: { display: 'flex', gap: 5, flexWrap: 'wrap' } }, ...agents.map(a => React.createElement('button', { key: a.id, className: 'mc-method' + (to === a.id ? ' is-active' : ''), onClick: () => setTo(a.id) }, a.name)))),
            React.createElement(Btn, { variant: mode === 'braindump' ? 'gold' : 'cyan', size: 'sm', icon: mode === 'announce' ? 'megaphone' : mode === 'task' ? 'flag' : 'sparkles', onClick: post, className: 'mc-ann__send' }, mode === 'announce' ? 'Broadcast' : mode === 'task' ? 'Assign' : 'Save dump'))),
        React.createElement('div', { className: 'mc-ann__feed' },
          ...items.map(it => { const ic = ANN_ICON[it.kind]; const who = it.to ? agByA(it.to) : null;
            return React.createElement('div', { key: it.id, className: 'mc-annitem' + (it.pin ? ' pin' : '') },
              React.createElement('div', { className: 'mc-annitem__ico', style: { background: ic.c + '22', color: ic.c, borderColor: ic.c + '55' } }, React.createElement(Icon, { name: ic.g, size: 17 })),
              React.createElement('div', { className: 'mc-annitem__b' },
                React.createElement('div', { className: 'mc-annitem__meta' },
                  React.createElement('span', { className: 'mc-annitem__kind', style: { color: ic.c } }, it.kind === 'braindump' ? 'BRAIN DUMP' : it.kind.toUpperCase()),
                  it.pin && React.createElement('span', { className: 'mc-chip gold', style: { fontSize: 8 } }, 'PINNED'),
                  React.createElement('span', { className: 'mono', style: { fontSize: 9.5, color: 'var(--fg-3)', marginLeft: 'auto' } }, it.time)),
                React.createElement('div', { className: 'mc-annitem__txt' }, it.text),
                who && React.createElement('button', { className: 'mc-annitem__to', onClick: () => onNav('agent:' + it.to), style: { cursor: 'pointer', background: 'none', border: 'none' } },
                  React.createElement('span', { className: 'av', style: { background: who.avatarGrad } }, who.name[0]), 'Assigned to ' + who.name)),
              React.createElement('button', { className: 'mc-conn__del', onClick: () => persist(items.filter(x => x.id !== it.id)), 'aria-label': 'Remove' }, React.createElement(Icon, { name: 'x', size: 14 }))); }))),
      React.createElement('div', { className: 'mc-ann__side' },
        React.createElement('div', { className: 'mc-war__sidepanel' },
          React.createElement('div', { className: 'mc-ptitle', style: { marginBottom: 14 } }, React.createElement('i', null, React.createElement(Icon, { name: 'users-round', size: 15 })), 'Team'),
          React.createElement('div', { className: 'mc-war__present' },
            ...agents.map(a => React.createElement('button', { key: a.id, className: 'mc-war__pres', onClick: () => onNav('agent:' + a.id), style: { all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11 } },
              React.createElement('div', { className: 'av', style: { background: a.avatarGrad } }, a.name[0], React.createElement('span', { style: { position: 'absolute', right: -2, bottom: -2, width: 8, height: 8, borderRadius: '50%', border: '2px solid #1a2030', background: '#2BD8A0' } })),
              React.createElement('span', { className: 'nm' }, a.name), React.createElement('span', { className: 'st' }, a.statusLabel))))),
        React.createElement('div', { className: 'mc-war__sidepanel' },
          React.createElement('div', { className: 'mc-ptitle', style: { marginBottom: 12 } }, React.createElement('i', null, React.createElement(Icon, { name: 'sun', size: 15 })), 'Quick Broadcasts'),
          React.createElement('div', { className: 'mc-order-chips' },
            ...['Standup in 10', 'Ship gate is Friday', 'Great work today, team', 'Pause non-critical work'].map((q, i) => React.createElement('button', { key: i, className: 'mc-order-chip', onClick: () => { setMode('announce'); setText(q); } }, q)))))),
  );
}
function agByA(id) { return window.MC.agents.find(a => a.id === id) || { name: id, avatarGrad: 'linear-gradient(145deg,#334155,#64748B)' }; }

window.AnnouncementsPage = AnnouncementsPage;
