// palette.jsx — Command Palette (⌘K)
const { useState: useSP, useEffect: useEP, useRef: useRP, useMemo: useMP } = React;

function CommandPalette({ open, onClose, onNav, onAction }) {
  const [q, setQ] = useSP('');
  const [sel, setSel] = useSP(0);
  const inputRef = useRP(null);

  useEP(() => { if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); } }, [open]);

  const commands = useMP(() => {
    const list = [];
    // actions
    list.push({ group: 'Actions', icon: 'flag', label: 'Set a goal', hint: 'goal', run: () => onAction('toast', 'Goal mode armed — tell Sage your objective.') });
    list.push({ group: 'Actions', icon: 'shield-check', label: 'Approve all pending', hint: 'approve', run: () => onAction('toast', 'All 3 approvals signed off.') });
    list.push({ group: 'Actions', icon: 'plus', label: 'Capture an idea (Kanban)', hint: 'build', run: () => onNav('kanban') });
    list.push({ group: 'Actions', icon: 'video', label: 'Generate a video (Studio)', hint: 'studio', run: () => onNav('studio') });
    list.push({ group: 'Actions', icon: 'messages-square', label: 'Open War Room', hint: 'chat', run: () => onNav('warroom') });
    list.push({ group: 'Actions', icon: 'orbit', label: 'Open Memory Galaxy', hint: 'vault', run: () => onNav('galaxy') });
    list.push({ group: 'Actions', icon: 'moon-star', label: 'Read the dreaming brief', hint: 'brief', run: () => onNav('dreaming') });
    // pages / integrations
    [['Hermes', 'send', 'hermes', 'central agent'], ['Paperclip · Teams', 'workflow', 'paperclip', 'AI employees'], ['Obsidian Vault', 'box', 'obsidian', 'memory'], ['Gmail', 'message-square', 'gmail', '4 unread'], ['Calendar', 'sun', 'calendar', 'schedule'], ['Drive', 'folder-sync', 'drive', 'files'], ['Notion', 'box', 'notion', 'workspace'], ['Connectors', 'plug', 'connectors', 'API · MCP · CLI']].forEach(([label, icon, v, sub]) =>
      list.push({ group: 'Go to', icon, label, sub, hint: 'open', run: () => onNav(v) }));
    // agents
    window.MC.agents.forEach(a => list.push({ group: 'Agents', icon: null, agent: a, label: a.name, sub: a.role, hint: 'agent', run: () => onNav('agent:' + a.id) }));
    window.MC.personas.forEach(p => list.push({ group: 'Agents', icon: p.glyph, label: 'Summon ' + p.name, sub: p.role, hint: 'persona', run: () => onNav('pantheon') }));
    // programs
    window.MC.programs.forEach(p => list.push({ group: 'Programs', icon: p.glyph, label: p.name, sub: p.note, hint: 'program', run: () => onNav('connectors') }));
    // workspaces
    window.MC.workspaces.forEach(w => list.push({ group: 'Workspaces', icon: w.glyph, label: w.name, hint: 'go', run: () => onNav(w.id === 'galaxy' ? 'galaxy' : 'ws:' + w.id) }));
    return list;
  }, [onNav, onAction]);

  const filtered = useMP(() => {
    if (!q.trim()) return commands;
    const s = q.toLowerCase();
    return commands.filter(c => (c.label + ' ' + (c.sub || '') + ' ' + c.group).toLowerCase().includes(s));
  }, [q, commands]);

  useEP(() => { setSel(0); }, [q]);

  useEP(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, filtered.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); const c = filtered[sel]; if (c) { c.run(); onClose(); } }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, sel, onClose]);

  if (!open) return null;

  // group results preserving order
  const groups = [];
  filtered.forEach((c) => {
    let g = groups.find(x => x.name === c.group);
    if (!g) { g = { name: c.group, items: [] }; groups.push(g); }
    g.items.push(c);
  });
  let idx = -1;

  return React.createElement('div', { className: 'mc-cmd-scrim', onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
    React.createElement('div', { className: 'mc-cmd', role: 'dialog', 'aria-label': 'Command palette' },
      React.createElement('div', { className: 'mc-cmd__input' },
        React.createElement('i', null, React.createElement(Icon, { name: 'command', size: 19 })),
        React.createElement('input', { ref: inputRef, value: q, onChange: e => setQ(e.target.value), placeholder: 'Search agents, programs, workspaces, actions…', 'aria-label': 'Command input' }),
        React.createElement('span', { className: 'mc-cmd__esc' }, 'ESC')),
      React.createElement('div', { className: 'mc-cmd__results' },
        filtered.length === 0
          ? React.createElement('div', { className: 'mc-cmd__empty' }, 'No matches for “' + q + '”')
          : groups.map(g => React.createElement('div', { key: g.name },
            React.createElement('div', { className: 'mc-cmd__group' }, g.name),
            ...g.items.map(c => {
              idx++; const myIdx = idx;
              return React.createElement('div', {
                key: c.label + myIdx, className: 'mc-cmd__item' + (sel === myIdx ? ' is-sel' : ''),
                onMouseEnter: () => setSel(myIdx), onClick: () => { c.run(); onClose(); },
              },
                c.agent
                  ? React.createElement('div', { className: 'mc-cmd__ico', style: { background: c.agent.avatarGrad, border: 'none', color: '#06121A', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 } }, c.agent.name[0])
                  : React.createElement('div', { className: 'mc-cmd__ico' }, React.createElement(Icon, { name: c.icon || 'circle-dot', size: 15 })),
                React.createElement('div', { className: 'mc-cmd__lbl' }, c.label, c.sub && React.createElement('small', null, c.sub)),
                React.createElement('span', { className: 'mc-cmd__hint' }, sel === myIdx ? '↵' : c.hint));
            }))))),
  );
}

window.CommandPalette = CommandPalette;
