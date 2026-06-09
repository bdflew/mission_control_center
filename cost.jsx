// cost.jsx — Usage & Spend (dynamic line / bar / donut graphs + savings tips)
const { useState: useScost } = React;

function agByCost(id) { return window.MC.agents.find(a => a.id === id) || { name: id, avatarGrad: 'linear-gradient(145deg,#334155,#64748B)', accent: '#64748B' }; }

// ---- LINE chart (stacked total across agents) ----
function LineChart({ datasets, labels, w = 560, h = 200 }) {
  const pad = { l: 34, r: 10, t: 12, b: 22 };
  const n = labels.length;
  const totals = labels.map((_, i) => datasets.reduce((s, d) => s + d.data[i], 0));
  const max = Math.max(...totals, ...datasets.flatMap(d => d.data)) * 1.1;
  const xx = (i) => pad.l + (i / (n - 1)) * (w - pad.l - pad.r);
  const yy = (v) => h - pad.b - (v / max) * (h - pad.t - pad.b);
  const path = (data) => data.map((v, i) => (i ? 'L' : 'M') + xx(i).toFixed(1) + ' ' + yy(v).toFixed(1)).join(' ');
  const gridY = [0, 0.25, 0.5, 0.75, 1];
  return React.createElement('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', height: h, preserveAspectRatio: 'none' },
    ...gridY.map((g, i) => React.createElement('line', { key: 'gl' + i, x1: pad.l, x2: w - pad.r, y1: pad.t + g * (h - pad.t - pad.b), y2: pad.t + g * (h - pad.t - pad.b), stroke: 'rgba(206,214,224,0.08)', strokeWidth: 1 })),
    ...gridY.map((g, i) => React.createElement('text', { key: 'l' + i, x: 4, y: pad.t + g * (h - pad.t - pad.b) + 4, fill: 'rgba(159,176,196,0.6)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }, Math.round(max * (1 - g)))),
    ...datasets.map((d, di) => React.createElement('path', { key: 'ds' + di, d: path(d.data), fill: 'none', stroke: d.color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { filter: `drop-shadow(0 0 4px ${d.color})` } })),
    ...labels.map((lb, i) => React.createElement('text', { key: 'x' + i, x: xx(i), y: h - 6, fill: 'rgba(159,176,196,0.6)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', textAnchor: 'middle' }, lb)),
  );
}

// ---- BAR chart (total per bucket) ----
function BarChart({ values, labels, color = '#23D6F5', w = 560, h = 200 }) {
  const pad = { l: 34, r: 10, t: 12, b: 22 };
  const max = Math.max(...values) * 1.15;
  const bw = (w - pad.l - pad.r) / values.length;
  const id = 'bg' + Math.round(color.charCodeAt(1) * 7);
  return React.createElement('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', height: h, preserveAspectRatio: 'none' },
    React.createElement('defs', null, React.createElement('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 },
      React.createElement('stop', { offset: '0%', stopColor: color, stopOpacity: 0.95 }),
      React.createElement('stop', { offset: '100%', stopColor: color, stopOpacity: 0.35 }))),
    ...[0, 0.5, 1].map((g, i) => React.createElement('line', { key: 'bgl' + i, x1: pad.l, x2: w - pad.r, y1: pad.t + g * (h - pad.t - pad.b), y2: pad.t + g * (h - pad.t - pad.b), stroke: 'rgba(206,214,224,0.08)' })),
    ...values.map((v, i) => { const bh = (v / max) * (h - pad.t - pad.b); return React.createElement('rect', { key: 'b' + i, x: pad.l + i * bw + bw * 0.18, y: h - pad.b - bh, width: bw * 0.64, height: bh, rx: 3, fill: `url(#${id})` }); }),
    ...labels.map((lb, i) => React.createElement('text', { key: 'x' + i, x: pad.l + i * bw + bw / 2, y: h - 6, fill: 'rgba(159,176,196,0.6)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', textAnchor: 'middle' }, lb)),
  );
}

// ---- DONUT chart (per-model share) ----
function DonutChart({ items, size = 168 }) {
  const r = size / 2 - 12, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  let acc = 0;
  return React.createElement('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size },
    React.createElement('circle', { cx, cy, r, fill: 'none', stroke: 'rgba(206,214,224,0.08)', strokeWidth: 18 }),
    ...items.map((it, i) => { const len = (it.share / 100) * circ; const el = React.createElement('circle', { key: i, cx, cy, r, fill: 'none', stroke: it.tone, strokeWidth: 18, strokeDasharray: `${len} ${circ - len}`, strokeDashoffset: -acc, transform: `rotate(-90 ${cx} ${cy})`, style: { filter: `drop-shadow(0 0 3px ${it.tone})` } }); acc += len; return el; }),
    React.createElement('text', { x: cx, y: cy - 3, fill: '#fff', fontSize: 22, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, textAnchor: 'middle' }, '$4.27'),
    React.createElement('text', { x: cx, y: cy + 15, fill: 'rgba(159,176,196,0.7)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', textAnchor: 'middle', letterSpacing: 1 }, 'TODAY'),
  );
}

function CostPage() {
  const U = window.MC.usage;
  const [range, setRange] = useScost('day');
  const agents = window.MC.agents;
  const labelsFor = { hour: ['-11h', '-9h', '-7h', '-5h', '-3h', '-1h'], day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], week: ['6w', '5w', '4w', '3w', '2w', 'now'] };
  // pick every other hour for readability
  const sample = (arr, range) => range === 'hour' ? arr.filter((_, i) => i % 2 === 1) : arr;
  const datasets = agents.map(a => ({ color: a.accent, label: a.name, data: sample(U.perAgent[a.id][range], range) }));
  const labels = labelsFor[range];
  const totals = labels.map((_, i) => datasets.reduce((s, d) => s + (d.data[i] || 0), 0));
  const grandToday = agents.reduce((s, a) => s + parseFloat(U.perAgent[a.id].today), 0).toFixed(2);
  const toneCol = { gold: 'var(--la-gold)', cyan: 'var(--la-cyan)', emerald: '#34D399', crimson: '#F4516B' };
  return React.createElement('div', { className: 'fade-up' },
    React.createElement('div', { className: 'mc-page-head' },
      React.createElement('h2', null, 'Usage & Spend'),
      React.createElement('p', null, 'Tokens and cost across every agent — by hour, day, and week — with tips on where you’re overspending.')),
    React.createElement('div', { className: 'mc-usage__cards' },
      React.createElement('div', { className: 'mc-ucard' }, React.createElement('div', { className: 'l' }, 'Spend Today'), React.createElement('div', { className: 'v', style: { color: 'var(--la-gold)' } }, '$' + U.spendToday), React.createElement('div', { className: 's' }, Math.round(U.spendToday / U.capDaily * 100) + '% of $' + U.capDaily + ' cap')),
      React.createElement('div', { className: 'mc-ucard' }, React.createElement('div', { className: 'l' }, 'Tokens Today'), React.createElement('div', { className: 'v' }, grandToday + 'M'), React.createElement('div', { className: 's' }, 'across 5 agents')),
      React.createElement('div', { className: 'mc-ucard' }, React.createElement('div', { className: 'l' }, 'This Week'), React.createElement('div', { className: 'v' }, '$' + U.spendWeek), React.createElement('div', { className: 's' }, 'on track')),
      React.createElement('div', { className: 'mc-ucard' }, React.createElement('div', { className: 'l' }, 'This Month'), React.createElement('div', { className: 'v' }, '$' + U.spendMonth), React.createElement('div', { className: 's' }, '58% projected util'))),
    React.createElement('div', { className: 'mc-usage__top' },
      // line: total tokens over range, per agent
      React.createElement('div', { className: 'mc-chart' },
        React.createElement('div', { className: 'mc-chart__head' },
          React.createElement('div', { className: 'mc-ptitle' }, React.createElement('i', null, React.createElement(Icon, { name: 'activity', size: 15 })), 'Tokens per Agent'),
          React.createElement('div', { className: 'mc-chart__tabs' },
            ...['hour', 'day', 'week'].map(rr => React.createElement('button', { key: rr, className: 'mc-chart__tab' + (range === rr ? ' is-active' : ''), onClick: () => setRange(rr) }, rr === 'hour' ? 'Hourly' : rr === 'day' ? 'Daily' : 'Weekly')))),
        React.createElement(LineChart, { datasets, labels }),
        React.createElement('div', { className: 'mc-legend' },
          ...agents.map(a => React.createElement('div', { key: a.id, className: 'mc-legend__i' }, React.createElement('span', { className: 'mc-legend__sw', style: { background: a.accent } }), a.name)))),
      // donut: per-model split
      React.createElement('div', { className: 'mc-chart' },
        React.createElement('div', { className: 'mc-ptitle', style: { marginBottom: 16 } }, React.createElement('i', null, React.createElement(Icon, { name: 'cpu', size: 15 })), 'By Model'),
        React.createElement('div', { className: 'mc-donut-wrap' },
          React.createElement(DonutChart, { items: U.byModel }),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 9, flex: 1 } },
            ...U.byModel.map(m => React.createElement('div', { key: m.name, style: { display: 'flex', alignItems: 'center', gap: 9 } },
              React.createElement('span', { className: 'mc-legend__sw', style: { background: m.tone, borderRadius: '50%' } }),
              React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-1)' } }, m.name),
                React.createElement('div', { style: { fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)' } }, m.share + '% · $' + m.spend)))))))),
    // total bar chart
    React.createElement('div', { className: 'mc-chart', style: { marginBottom: 'var(--gap-grid)' } },
      React.createElement('div', { className: 'mc-ptitle', style: { marginBottom: 16 } }, React.createElement('i', null, React.createElement(Icon, { name: 'wallet', size: 15 })), 'Total Tokens · ' + (range === 'hour' ? 'Hourly' : range === 'day' ? 'Daily' : 'Weekly')),
      React.createElement(BarChart, { values: totals, labels, color: '#23D6F5' })),
    // per-agent usage cards
    React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, marginBottom: 12 } }, React.createElement('i', null, React.createElement(Icon, { name: 'users-round', size: 15 })), 'Per-Agent Usage'),
    React.createElement('div', { className: 'mc-agentusage', style: { marginBottom: 'var(--gap-grid)' } },
      ...agents.map(a => { const u = U.perAgent[a.id]; return React.createElement('div', { key: a.id, className: 'mc-au' },
        React.createElement('div', { className: 'mc-au__top' },
          React.createElement('div', { className: 'mc-au__av', style: { background: a.avatarGrad } }, a.name[0]),
          React.createElement('div', { style: { flex: 1 } }, React.createElement('div', { className: 'mc-au__nm' }, a.name), React.createElement('div', { className: 'mc-au__md' }, u.model)),
          React.createElement(Sparkline, { data: u.day, color: a.accent, w: 90, h: 30 })),
        React.createElement('div', { className: 'mc-au__nums' },
          React.createElement('div', { className: 'mc-au__num' }, React.createElement('div', { className: 'v', style: { color: a.accent } }, u.today), React.createElement('div', { className: 'l' }, 'Tokens today')),
          React.createElement('div', { className: 'mc-au__num' }, React.createElement('div', { className: 'v' }, '$' + u.spend), React.createElement('div', { className: 'l' }, 'Spend today')),
          React.createElement('div', { className: 'mc-au__num' }, React.createElement('div', { className: 'v' }, Math.round(u.week.reduce((s, x) => s + x, 0) / 1000) + 'M'), React.createElement('div', { className: 'l' }, 'This week')))); })),
    // savings tips
    React.createElement('div', { className: 'mc-section__title', style: { fontSize: 12, marginBottom: 12 } }, React.createElement('i', null, React.createElement(Icon, { name: 'trending-down', size: 15 })), 'Savings & Improvements'),
    ...U.tips.map(t => React.createElement('div', { key: t.id, className: 'mc-dreaminsight' },
      React.createElement('div', { className: 'mc-dreaminsight__ico tone-' + t.tone }, React.createElement(Icon, { name: t.glyph, size: 18 })),
      React.createElement('div', { className: 'mc-dreaminsight__b' },
        React.createElement('div', { className: 'mc-dreaminsight__t' }, t.title),
        React.createElement('div', { className: 'mc-dreaminsight__x' }, t.text),
        React.createElement('div', { style: { display: 'flex', gap: 8 } }, React.createElement(Btn, { variant: 'ghost', size: 'sm', icon: 'check' }, 'Apply'), React.createElement(Btn, { variant: 'quiet', size: 'sm' }, 'Dismiss'))),
      React.createElement('div', { className: 'mc-dreaminsight__save', style: { color: toneCol[t.tone] } }, t.save))),
  );
}

window.CostPage = CostPage;
