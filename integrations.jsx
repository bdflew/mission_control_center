// integrations.jsx — Gmail, Google Calendar, Google Drive, Notion
const { useState: useSi, useMemo: useMi } = React;

function IntegHeader({ logo, grad, name, acct, status }) {
  return React.createElement('div', { className: 'mc-integ__bar' },
    React.createElement('div', { className: 'mc-integ__id' },
      React.createElement('div', { className: 'mc-integ__logo', style: { background: grad } }, React.createElement(Icon, { name: logo, size: 22, style: { color: '#fff' } })),
      React.createElement('div', null,
        React.createElement('div', { className: 'mc-integ__name' }, name),
        React.createElement('div', { className: 'mc-integ__acct' }, acct))),
    React.createElement('div', { style: { display: 'flex', gap: 9, alignItems: 'center' } },
      React.createElement('span', { className: 'mc-chip good' }, React.createElement('span', { className: 'dot' }), status || 'Connected'),
      React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'cog' }, 'Manage')),
  );
}

// ===================== GMAIL =====================
function GmailPage({ onAction }) {
  const G = window.MC.gmail;
  const [active, setActive] = useSi(G.threads[0].id);
  const [stars, setStars] = useSi(() => Object.fromEntries(G.threads.map(t => [t.id, t.star])));
  const [read, setRead] = useSi({});
  const [frames, setFrames] = useSi(false);
  const [reframe, setReframe] = useSi(null);
  const thread = G.threads.find(t => t.id === active);
  const open = (id) => { setActive(id); setRead(r => ({ ...r, [id]: true })); };
  const body = (window.MC.gmailThread[active] || [{ from: thread.from.split(' · ')[0], grad: thread.grad, time: thread.time, body: thread.snippet + '\n\n— sent from ' + G.account }]);
  return React.createElement('div', { className: 'mc-integ fade-up' },
    React.createElement('div', { className: 'mc-integ__bar' },
      React.createElement('div', { className: 'mc-integ__id' },
        React.createElement('div', { className: 'mc-integ__logo', style: { background: 'linear-gradient(145deg,#EA4335,#FBBC05)' } }, React.createElement(Icon, { name: 'message-square', size: 22, style: { color: '#fff' } })),
        React.createElement('div', null,
          React.createElement('div', { className: 'mc-integ__name' }, 'Gmail'),
          React.createElement('div', { className: 'mc-integ__acct' }, G.account))),
      React.createElement('div', { style: { display: 'flex', gap: 9, alignItems: 'center' } },
        React.createElement('span', { className: 'mc-chip good' }, React.createElement('span', { className: 'dot' }), G.unread + ' unread · Connected'),
        React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'corner-down-right', onClick: () => setFrames(true) }, 'Response Frameworks'))),
    React.createElement('div', { className: 'mc-mail' },
      React.createElement('div', { className: 'mc-maillist' },
        React.createElement('div', { className: 'mc-maillist__head' },
          React.createElement('div', { className: 'mc-maillist__title' }, React.createElement(Icon, { name: 'message-square', size: 14, style: { color: 'var(--acc)' } }), 'Inbox — 10 latest'),
          React.createElement('span', { className: 'mono', style: { fontSize: 10, color: 'var(--fg-3)' } }, 'Primary')),
        ...G.threads.map(t => {
          const isUnread = t.unread && !read[t.id];
          return React.createElement('button', { key: t.id, className: 'mc-mailrow' + (isUnread ? ' unread' : '') + (active === t.id ? ' is-active' : ''), onClick: () => open(t.id) },
            React.createElement('div', { className: 'mc-mailrow__av', style: { background: t.grad } }, t.initials),
            React.createElement('div', { className: 'mc-mailrow__body' },
              React.createElement('div', { className: 'mc-mailrow__top' },
                React.createElement('span', { className: 'mc-mailrow__from' }, t.from),
                React.createElement('span', { className: 'mc-mailrow__time' }, t.time)),
              React.createElement('div', { className: 'mc-mailrow__subj' }, t.subject),
              React.createElement('div', { className: 'mc-mailrow__snip' }, t.snippet),
              React.createElement('div', { className: 'mc-mailrow__meta' },
                React.createElement('span', { onClick: (e) => { e.stopPropagation(); setStars(s => ({ ...s, [t.id]: !s[t.id] })); }, className: 'mc-mailrow__star' + (stars[t.id] ? ' on' : ''), role: 'button', 'aria-label': 'Star' }, React.createElement(Icon, { name: 'star', size: 13 })),
                React.createElement('span', { className: 'mc-chip ' + t.labelTone, style: { padding: '2px 8px', fontSize: 9 } }, t.label),
                t.count > 1 && React.createElement('span', { className: 'mc-mailrow__cnt' }, t.count))));
        })),
      React.createElement('div', { className: 'mc-mailread' },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 } },
          React.createElement('span', { className: 'mc-chip ' + thread.labelTone }, React.createElement('span', { className: 'dot' }), thread.label),
          React.createElement('span', { className: 'mono', style: { fontSize: 10, color: 'var(--fg-3)' } }, thread.time)),
        React.createElement('div', { className: 'mc-mailread__subj' }, thread.subject),
        ...body.map((m, i) => React.createElement('div', { key: i, className: 'mc-mailread__msg' },
          React.createElement('div', { className: 'mc-mailread__av', style: { background: m.grad || thread.grad } }, (m.from || thread.from)[0]),
          React.createElement('div', { className: 'mc-mailread__b' },
            React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', gap: 8 } },
              React.createElement('span', { className: 'mc-mailread__from' }, m.from || thread.from.split(' · ')[0]),
              React.createElement('span', { className: 'mc-mailread__time' }, m.time)),
            React.createElement('div', { className: 'mc-mailread__to' }, 'to me'),
            React.createElement('div', { className: 'mc-mailread__txt' }, m.body)))),
        React.createElement('div', { className: 'mc-mailread__actions' },
          React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'corner-down-right' }, 'Reply'),
          React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'zap', onClick: () => setFrames(true) }, 'Agent reply'),
          React.createElement(Btn, { variant: 'quiet', size: 'sm', icon: 'box' }, 'Save to Vault')),
        React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 } },
          React.createElement('span', { className: 'mono', style: { fontSize: 9.5, color: 'var(--fg-3)', alignSelf: 'center' } }, 'REPLY USING'),
          ...window.MC.emailFrameworks.map(f => React.createElement('button', { key: f.id, className: 'mc-art__filter', onClick: () => { onAction && onAction('toast', 'Sage will reply using “' + f.name + '”.'); } }, f.name))))
    ),
    frames && React.createElement(FrameworksModal, { onClose: () => setFrames(false) }),
  );
}

function FrameworksModal({ onClose }) {
  const [frames, setFramesState] = useSi(window.MC.emailFrameworks);
  const tone = { emerald: '#34D399', gold: '#E8C766', cyan: '#23D6F5', crimson: '#F4516B' };
  const upd = (id, body) => setFramesState(p => p.map(f => f.id === id ? { ...f, body } : f));
  return React.createElement('div', { className: 'mc-modal-scrim', onMouseDown: e => e.target === e.currentTarget && onClose() },
    React.createElement('div', { className: 'mc-modal' },
      React.createElement('div', { className: 'mc-modal__head' },
        React.createElement('div', { className: 'mc-catalog__ico' }, React.createElement(Icon, { name: 'corner-down-right', size: 17 })),
        React.createElement('div', { className: 'mc-modal__t' }, 'Email Response Frameworks'),
        React.createElement('button', { className: 'mc-modal__x', onClick: onClose, 'aria-label': 'Close' }, React.createElement(Icon, { name: 'x', size: 17 }))),
      React.createElement('div', { className: 'mc-modal__body' },
        React.createElement('div', { style: { fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.5, marginBottom: 14 } }, 'Tell your agents exactly how to reply. They follow these frameworks when drafting on your behalf.'),
        ...frames.map(f => React.createElement('div', { key: f.id, className: 'mc-frame' },
          React.createElement('div', { className: 'mc-frame__ico', style: { background: tone[f.tone] + '22', color: tone[f.tone], borderColor: tone[f.tone] + '55' } }, React.createElement(Icon, { name: f.glyph, size: 18 })),
          React.createElement('div', { style: { flex: 1 } },
            React.createElement('div', { className: 'mc-frame__n' }, f.name),
            React.createElement('textarea', { value: f.body, onChange: e => upd(f.id, e.target.value), 'aria-label': f.name, style: { all: 'unset', boxSizing: 'border-box', width: '100%', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5, marginTop: 2 } })))),
        React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'plus' }, 'Add framework')),
      React.createElement('div', { className: 'mc-modal__foot' },
        React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'check', onClick: onClose }, 'Save frameworks'))),
  );
}

// ===================== CALENDAR =====================
function CalendarPage({ onAction }) {
  const C = window.MC.calendar;
  const startH = C.hours[0], endH = C.hours[C.hours.length - 1];
  const span = endH - startH;
  const pxPerHr = 48;
  const nowTop = (14.3 - startH) * pxPerHr;
  const [events, setEvents] = useSi(() => { try { return JSON.parse(localStorage.getItem('mc_cal_events')) || C.events; } catch (e) { return C.events; } });
  const [modal, setModal] = useSi(null); // {day,start}
  const persist = (next) => { setEvents(next); try { localStorage.setItem('mc_cal_events', JSON.stringify(next)); } catch (e) {} };
  const add = (ev) => { persist([...events, { ...ev, id: 'cu' + Date.now() }]); setModal(null); onAction && onAction('toast', (ev.by ? window.MC.agents.find(a => a.id === ev.by).name + ' scheduled' : 'Added') + ' “' + ev.title + '”.'); };
  const agentSchedule = () => { const slots = [{ day: 1, start: 11, end: 11.5, title: 'Sage — sync block', loc: 'auto', tone: 'cyan', by: 'sage' }, { day: 2, start: 10, end: 11, title: 'Faye — build review', loc: 'auto', tone: 'emerald', by: 'faye' }]; const s = slots[Math.floor(Math.random() * slots.length)]; add(s); };
  return React.createElement('div', { className: 'mc-integ fade-up' },
    React.createElement('div', { className: 'mc-integ__bar' },
      React.createElement('div', { className: 'mc-integ__id' },
        React.createElement('div', { className: 'mc-integ__logo', style: { background: 'linear-gradient(145deg,#1A73E8,#4285F4)' } }, React.createElement(Icon, { name: 'sun', size: 22, style: { color: '#fff' } })),
        React.createElement('div', null,
          React.createElement('div', { className: 'mc-integ__name' }, 'Google Calendar'),
          React.createElement('div', { className: 'mc-integ__acct' }, C.account))),
      React.createElement('div', { style: { display: 'flex', gap: 9, alignItems: 'center' } },
        React.createElement('span', { className: 'mc-chip good' }, React.createElement('span', { className: 'dot' }), 'Connected'),
        React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'zap', onClick: agentSchedule }, 'Let an agent schedule'),
        React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plus', onClick: () => setModal({ day: 0, start: 9 }) }, 'Add event'))),
    React.createElement('div', { className: 'mc-cal' },
      React.createElement('div', { className: 'mc-cal__grid' },
        React.createElement('div', { className: 'mc-cal__corner' }),
        ...C.days.map((d, i) => React.createElement('div', { key: d, className: 'mc-cal__dayhead' + (i === 0 ? ' today' : '') }, i === 0 ? React.createElement(React.Fragment, null, 'Wed', React.createElement('span', null, '10')) : d)),
        React.createElement('div', { className: 'mc-cal__hours' },
          ...C.hours.slice(0, -1).map(h => React.createElement('div', { key: h, className: 'mc-cal__hr' }, (h > 12 ? h - 12 : h) + (h >= 12 ? 'p' : 'a')))),
        ...C.days.map((d, di) => React.createElement('div', { key: di, className: 'mc-cal__col', style: { minHeight: span * pxPerHr }, onClick: (e) => { const rect = e.currentTarget.getBoundingClientRect(); const hr = Math.max(startH, Math.min(endH - 1, Math.round((e.clientY - rect.top) / pxPerHr) + startH)); setModal({ day: di, start: hr }); } },
          C.hours.slice(0, -1).map((h, hi) => React.createElement('div', { key: hi, className: 'mc-cal__line', style: { top: (h - startH) * pxPerHr } })),
          di === 0 && React.createElement('div', { className: 'mc-cal__now', style: { top: nowTop, left: 0 } }),
          ...events.filter(e => e.day === di).map(e => React.createElement('div', {
            key: e.id, className: 'mc-cal__ev ev-' + e.tone + (e.by ? ' by-agent' : ''),
            style: { top: (e.start - startH) * pxPerHr + 1, height: (e.end - e.start) * pxPerHr - 3, color: e.tone === 'cyan' ? '#23D6F5' : e.tone === 'gold' ? '#E8C766' : e.tone === 'emerald' ? '#34D399' : e.tone === 'violet' ? '#A78BFA' : '#F4516B' },
            title: e.title, onClick: (ev) => ev.stopPropagation(),
          },
            React.createElement('span', { className: 't' }, e.title),
            e.by ? React.createElement('span', { className: 'agent-tag' }, '◆ ' + window.MC.agents.find(a => a.id === e.by).name) : React.createElement('span', { className: 'l' }, e.loc))))),
    )),
    modal && React.createElement(CalEventModal, { init: modal, onClose: () => setModal(null), onAdd: add }),
  );
}
function CalEventModal({ init, onClose, onAdd }) {
  const [title, setTitle] = useSi('');
  const [day, setDay] = useSi(init.day);
  const [start, setStart] = useSi(init.start);
  const [dur, setDur] = useSi(1);
  const [loc, setLoc] = useSi('');
  const days = window.MC.calendar.days;
  const tones = ['cyan', 'gold', 'emerald', 'crimson', 'violet'];
  const [tone, setTone] = useSi('cyan');
  const fmt = (h) => (h > 12 ? h - 12 : h) + (h >= 12 ? 'pm' : 'am');
  return React.createElement('div', { className: 'mc-modal-scrim', onMouseDown: e => e.target === e.currentTarget && onClose() },
    React.createElement('div', { className: 'mc-modal' },
      React.createElement('div', { className: 'mc-modal__head' },
        React.createElement('div', { className: 'mc-catalog__ico' }, React.createElement(Icon, { name: 'sun', size: 17 })),
        React.createElement('div', { className: 'mc-modal__t' }, 'Schedule an Event'),
        React.createElement('button', { className: 'mc-modal__x', onClick: onClose, 'aria-label': 'Close' }, React.createElement(Icon, { name: 'x', size: 17 }))),
      React.createElement('div', { className: 'mc-modal__body' },
        React.createElement('div', { className: 'mc-field-label', style: { marginTop: 0 } }, 'Title'),
        React.createElement('div', { className: 'mc-conn__field' }, React.createElement('i', null, React.createElement(Icon, { name: 'pen-line', size: 14 })), React.createElement('input', { value: title, onChange: e => setTitle(e.target.value), placeholder: 'e.g. Client call — Mara', 'aria-label': 'Event title' })),
        React.createElement('div', { className: 'mc-field-label' }, 'Day'),
        React.createElement('div', { className: 'mc-conn__methods wrap' }, ...days.map((d, i) => React.createElement('button', { key: i, className: 'mc-method' + (day === i ? ' is-active' : ''), onClick: () => setDay(i) }, d))),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 12 } },
          React.createElement('div', null, React.createElement('div', { className: 'mc-field-label', style: { marginTop: 0 } }, 'Start'),
            React.createElement('div', { className: 'mc-conn__methods wrap' }, ...[8, 9, 10, 11, 13, 14, 15, 16].map(h => React.createElement('button', { key: h, className: 'mc-method' + (start === h ? ' is-active' : ''), onClick: () => setStart(h) }, fmt(h))))),
          React.createElement('div', null, React.createElement('div', { className: 'mc-field-label', style: { marginTop: 0 } }, 'Length'),
            React.createElement('div', { className: 'mc-conn__methods wrap' }, ...[[0.5, '30m'], [1, '1h'], [1.5, '1.5h'], [2, '2h']].map(([v, l]) => React.createElement('button', { key: v, className: 'mc-method' + (dur === v ? ' is-active' : ''), onClick: () => setDur(v) }, l))))),
        React.createElement('div', { className: 'mc-field-label' }, 'Color'),
        React.createElement('div', { style: { display: 'flex', gap: 8 } }, ...tones.map(t => React.createElement('button', { key: t, onClick: () => setTone(t), 'aria-label': t, style: { all: 'unset', cursor: 'pointer', width: 26, height: 26, borderRadius: 8, background: t === 'cyan' ? '#23D6F5' : t === 'gold' ? '#E8C766' : t === 'emerald' ? '#34D399' : t === 'violet' ? '#A78BFA' : '#F4516B', outline: tone === t ? '2px solid #fff' : 'none', outlineOffset: 2 } })))),
      React.createElement('div', { className: 'mc-modal__foot' },
        React.createElement(Btn, { variant: 'quiet', size: 'sm', onClick: onClose }, 'Cancel'),
        React.createElement(Btn, { variant: 'cyan', size: 'sm', icon: 'plus', onClick: () => title.trim() && onAdd({ title: title.trim(), day, start, end: start + dur, loc: loc || 'Mission Control', tone }) }, 'Add to calendar'))),
  );
}

// ===================== DRIVE =====================
function DrivePage() {
  const D = window.MC.drive;
  const [filter, setFilter] = useSi('all');
  const kinds = ['all', 'folder', 'doc', 'sheet', 'pdf', 'image', 'video'];
  const shown = D.files.filter(f => filter === 'all' || f.kind === filter);
  return React.createElement('div', { className: 'mc-integ fade-up' },
    React.createElement(IntegHeader, { logo: 'folder-sync', grad: 'linear-gradient(145deg,#1FA463,#FFCF63)', name: 'Google Drive', acct: D.status === 'connected' ? window.MC.gmail.account : '', status: 'Connected' }),
    React.createElement('div', { className: 'mc-drive__bar' },
      React.createElement('div', { className: 'mc-art__filters' },
        ...kinds.map(k => React.createElement('button', { key: k, className: 'mc-art__filter' + (filter === k ? ' is-active' : ''), onClick: () => setFilter(k) }, k))),
      React.createElement('div', { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 } },
        React.createElement('span', { className: 'mono', style: { fontSize: 10, color: 'var(--fg-3)' } }, D.usedLabel),
        React.createElement('div', { className: 'mc-drive__meter' }, React.createElement('div', { className: 'mc-drive__fill', style: { width: D.used + '%' } })))),
    React.createElement('div', { className: 'mc-drive__grid' },
      ...shown.map(f => React.createElement('button', { key: f.id, className: 'mc-drivefile' },
        React.createElement('div', { className: 'mc-drivefile__ico tone-' + f.tone }, React.createElement(Icon, { name: f.glyph, size: 21 })),
        React.createElement('div', { className: 'mc-drivefile__name' }, f.name),
        React.createElement('div', { className: 'mc-drivefile__meta' },
          React.createElement('span', null, f.size),
          React.createElement('span', null, f.time))))),
  );
}

// ===================== NOTION =====================
function NotionPage() {
  const N = window.MC.notion;
  const [activeKid, setActiveKid] = useSi('Q3 Offer');
  const P = N.page;
  return React.createElement('div', { className: 'mc-integ fade-up' },
    React.createElement(IntegHeader, { logo: 'box', grad: 'linear-gradient(145deg,#2F2F2F,#000)', name: 'Notion', acct: N.workspace + ' workspace', status: 'Connected' }),
    React.createElement('div', { className: 'mc-notion' },
      React.createElement('div', { className: 'mc-notion__side' },
        React.createElement('div', { className: 'mc-notion__ws' },
          React.createElement('div', { className: 'badge' }, 'L'), N.workspace),
        ...N.sidebar.map(s => React.createElement('div', { key: s.id },
          React.createElement('button', { className: 'mc-notion__item' }, React.createElement(Icon, { name: s.glyph, size: 14 }), s.name),
          ...s.kids.map(k => React.createElement('button', { key: k, className: 'mc-notion__kid' + (activeKid === k ? ' active' : ''), onClick: () => setActiveKid(k) }, k))))),
      React.createElement('div', { className: 'mc-notion__page' },
        React.createElement('div', { className: 'mc-notion__cover', style: { background: P.cover } }),
        React.createElement('div', { className: 'mc-notion__crumb' }, P.crumb),
        React.createElement('div', { className: 'mc-notion__title' }, P.title),
        React.createElement('div', { className: 'mc-notion__blocks' },
          ...P.blocks.map((b, i) => {
            if (b.t === 'h') return React.createElement('div', { key: i, className: 'mc-nb h' }, b.text);
            if (b.t === 'p') return React.createElement('div', { key: i, className: 'mc-nb p' }, b.text);
            if (b.t === 'quote') return React.createElement('div', { key: i, className: 'mc-nb quote' }, b.text);
            if (b.t === 'callout') return React.createElement('div', { key: i, className: 'mc-nb callout' }, React.createElement('i', null, React.createElement(Icon, { name: b.icon, size: 16 })), b.text);
            if (b.t === 'todo') return React.createElement('div', { key: i, className: 'mc-nb todo' + (b.done ? ' done' : '') }, React.createElement('span', { className: 'box' }, b.done && React.createElement(Icon, { name: 'check', size: 11 })), React.createElement('span', null, b.text));
            return null;
          }))),
    ),
  );
}

Object.assign(window, { GmailPage, CalendarPage, DrivePage, NotionPage });
