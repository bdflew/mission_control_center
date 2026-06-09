// security.jsx — Security command page
const { useState: useSsec } = React;

function SecurityPage({ onNav }) {
  const S = window.MC.security;
  const k = window.MC.agents.find(a => a.id === S.guardedBy) || { name: 'Kratos', avatarGrad: 'linear-gradient(145deg,#7A1528,#F4516B)' };
  const r = 44, c = 2 * Math.PI * r, off = c * (1 - S.score / 100);
  const sevTone = { high: '#F4516B', med: '#E8C766', low: '#34D399' };
  const repTone = { emerald: '#34D399', gold: '#E8C766', crimson: '#F4516B', cyan: '#23D6F5' };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-sec-hero' },
      React.createElement('div', { className: 'mc-sec-ring' },
        React.createElement('svg', { viewBox: '0 0 96 96', width: 96, height: 96 },
          React.createElement('circle', { cx: 48, cy: 48, r, fill: 'none', stroke: 'rgba(206,214,224,0.1)', strokeWidth: 8 }),
          React.createElement('circle', { cx: 48, cy: 48, r, fill: 'none', stroke: '#34D399', strokeWidth: 8, strokeLinecap: 'round', strokeDasharray: c, strokeDashoffset: off, transform: 'rotate(-90 48 48)', style: { filter: 'drop-shadow(0 0 6px #34D399)' } })),
        React.createElement('div', { className: 'mc-sec-ring__n' }, S.score)),
      React.createElement('div', { style: { flex: 1 } },
        React.createElement('div', { className: 'mc-sec-hero__t' }, 'Security'),
        React.createElement('p', { className: 'mc-sec-hero__p' }, 'Posture is ', React.createElement('b', { style: { color: '#4fe3b5' } }, S.posture), '. Kratos guards the build — independent review on every ship, approval gates on anything irreversible, and the vault logging it all.')),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' } },
        React.createElement('button', { onClick: () => onNav('agent:kratos'), style: { all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 } },
          React.createElement('div', { style: { width: 30, height: 30, borderRadius: 9, background: k.avatarGrad, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: '#06121A' } }, 'K'),
          React.createElement('span', { style: { fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--fg-1)' } }, 'Guarded by Kratos')),
        React.createElement('span', { className: 'mc-chip good' }, React.createElement('span', { className: 'dot' }), 'Monitoring'))),
    React.createElement('div', { className: 'mc-sec-stats' },
      ...S.stats.map((st, i) => React.createElement('div', { key: i, className: 'mc-sec-stat' },
        React.createElement('div', { className: 'v', style: { color: repTone[st.tone] } }, st.v),
        React.createElement('div', { className: 'l' }, st.l)))),
    React.createElement('div', { className: 'mc-sec-grid' },
      // reports
      React.createElement('div', null,
        React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, marginBottom: 12 } }, React.createElement('i', null, React.createElement(Icon, { name: 'file-text', size: 15 })), 'Security Reports'),
        ...S.reports.map(rep => React.createElement('div', { key: rep.id, className: 'mc-report', style: { '--rep-grad': 'linear-gradient(90deg,' + repTone[rep.tone] + ',transparent)', marginBottom: 12 } },
          React.createElement('div', { className: 'mc-report__top' },
            React.createElement('div', { className: 'mc-report__av', style: { background: 'rgba(244,81,107,0.14)', color: repTone[rep.tone], border: '1px solid ' + repTone[rep.tone] } }, React.createElement(Icon, { name: 'shield-check', size: 16 })),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('div', { className: 'mc-report__title' }, rep.title),
              React.createElement('div', { className: 'mc-report__period' }, rep.time))),
          React.createElement('div', { className: 'mc-report__summary', style: { marginBottom: 0 } }, rep.summary)))),
      // improvements + events
      React.createElement('div', null,
        React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, marginBottom: 12 } }, React.createElement('i', null, React.createElement(Icon, { name: 'trending-up', size: 15 })), 'Security Improvements'),
        React.createElement('div', { className: 'mc-improve', style: { marginBottom: 22 } },
          ...S.improvements.map((im, i) => React.createElement('div', { key: i, className: 'mc-improve__row', style: { background: 'rgba(244,81,107,0.06)', borderColor: 'rgba(244,81,107,0.2)' } },
            React.createElement('div', { className: 'mc-improve__ico', style: { background: 'rgba(244,81,107,0.14)', color: '#F4516B', borderColor: 'rgba(244,81,107,0.3)' } }, React.createElement(Icon, { name: 'shield-check', size: 13 })),
            React.createElement('div', { className: 'mc-improve__txt' }, im)))),
        React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, marginBottom: 12 } }, React.createElement('i', null, React.createElement(Icon, { name: 'activity', size: 15 })), 'Recent Events'),
        ...S.events.map(e => React.createElement('div', { key: e.id, className: 'mc-sevrow' },
          React.createElement('span', { className: 'mc-sevdot', style: { background: sevTone[e.sev], boxShadow: '0 0 6px ' + sevTone[e.sev] } }),
          React.createElement('span', { className: 'mc-sevrow__t' }, e.t),
          React.createElement('span', { className: 'mono', style: { fontSize: 9.5, color: 'var(--fg-3)' } }, e.who + ' · ' + e.time))))),
  );
}

window.SecurityPage = SecurityPage;
