// data-v5.jsx — usage/spend, announcements, per-agent custom role configs.
(function () {
const MC = window.MC;

// ===================== USAGE / SPEND =====================
// hourly (last 12h), daily (last 7d), weekly (last 6w) token series per agent (in K tokens)
function series(base, spread, n) { const a = []; let v = base; for (let i = 0; i < n; i++) { v = Math.max(4, v + (Math.random() - 0.45) * spread); a.push(Math.round(v)); } return a; }
MC.usage = {
  capDaily: 24.0, spendToday: 4.27, spendWeek: 26.4, spendMonth: 94.1,
  perAgent: {
    sage:      { hour: series(120, 60, 12), day: series(900, 300, 7), week: series(5200, 1400, 6), today: '1.84M', spend: 1.92, model: 'claude-opus-4.1' },
    kratos:    { hour: series(150, 70, 12), day: series(1100, 320, 7), week: series(6100, 1500, 6), today: '2.20M', spend: 1.41, model: 'gpt-5-codex' },
    faye:      { hour: series(180, 80, 12), day: series(1300, 360, 7), week: series(7400, 1700, 6), today: '3.10M', spend: 0.61, model: 'claude-sonnet-4.5' },
    chloe:     { hour: series(70, 40, 12), day: series(520, 200, 7), week: series(3000, 900, 6), today: '0.92M', spend: 0.33, model: 'gemini-2.5-pro' },
    legacylew: { hour: series(90, 45, 12), day: series(680, 220, 7), week: series(3900, 1000, 6), today: '1.31M', spend: 0.74, model: 'claude-opus-4.1' },
  },
  byModel: [
    { name: 'claude-opus-4.1', share: 38, spend: 2.10, tone: '#23D6F5' },
    { name: 'claude-sonnet-4.5', share: 30, spend: 0.72, tone: '#6FE8FB' },
    { name: 'gpt-5-codex', share: 20, spend: 1.05, tone: '#F4516B' },
    { name: 'gemini-2.5-pro', share: 12, spend: 0.40, tone: '#E8C766' },
  ],
  tips: [
    { id: 'ut1', tone: 'gold', glyph: 'trending-down', title: 'Kratos runs on Opus for routine reviews', text: 'Routine QA passes don’t need Opus. Route them to Sonnet or Codex and save ~$0.90/day with no quality drop.', save: '$0.90/day' },
    { id: 'ut2', tone: 'cyan', glyph: 'zap', title: 'Faye’s drafts could use Haiku', text: 'First-pass scaffolds are 62% of Faye’s spend. Draft on Haiku, finish on Sonnet — same output, ~40% cheaper.', save: '~40%' },
    { id: 'ut3', tone: 'emerald', glyph: 'gem', title: 'Gemini plan is underused', text: 'You’re at 12% of the Gemini tier. Downgrade one level — no workload is near the cap.', save: '$40/mo' },
    { id: 'ut4', tone: 'crimson', glyph: 'activity', title: '4pm spend spike', text: 'Token use spikes every day at 4pm from overlapping research jobs. Stagger them 15 min to flatten the peak.', save: 'smoother' },
  ],
};

// ===================== ANNOUNCEMENTS =====================
MC.announcements = [
  { id: 'an1', kind: 'announce', text: 'Ship gate is Friday. Everything for the launch goes through Kratos for review first — no exceptions.', time: '08:10', pin: true },
  { id: 'an2', kind: 'task', text: 'Pull 20 long-tail keywords for the Lead Recovery page', to: 'chloe', time: '08:12' },
  { id: 'an3', kind: 'task', text: 'Harden the war_room storage before staging', to: 'kratos', time: '08:13' },
  { id: 'an4', kind: 'braindump', text: 'Idea: a "client health" widget that flags accounts going quiet. Maybe Sage watches reply gaps and pings me.', time: '08:20' },
];

// ===================== PER-AGENT CUSTOM ROLE PAGES =====================
// Each gets a signature tab (label + glyph) with a dashboard + tools tailored to their role.
MC.agentCustom = {
  sage: {
    tab: 'Operations', glyph: 'git-branch', headline: 'Chief of Operations',
    sub: 'Routing the whole team in real time',
    stats: [{ l: 'Routed today', v: '41' }, { l: 'Avg backlog', v: '1.2' }, { l: 'Unrouted', v: '0' }],
    board: { title: 'Routing Board', rows: [
      { who: 'kratos', task: 'P1 ChatRoom race — repair', state: 'working' },
      { who: 'faye', task: 'Memory Galaxy view', state: 'working' },
      { who: 'chloe', task: 'Q3 offer page', state: 'approval' },
      { who: 'legacylew', task: 'Cover the inbox', state: 'working' },
    ] },
    tools: ['Re-route a task', 'Set team priority', 'Open the queue', 'Pause routing'],
  },
  kratos: {
    tab: 'Security Desk', glyph: 'shield-half', headline: 'CTO · Security & QA',
    sub: 'Proving everything works before it ships',
    stats: [{ l: 'Reviews · 7d', v: '121' }, { l: 'Open P1/P2', v: '2' }, { l: 'Escaped', v: '0' }],
    board: { title: 'Review Queue', rows: [
      { who: 'faye', task: 'Galaxy build — adversarial read', state: 'working' },
      { who: 'chloe', task: 'Q3 page — link safety scan', state: 'approval' },
      { who: 'sage', task: 'Key rotation — awaiting Lew', state: 'approval' },
    ] },
    tools: ['Run security scan', 'Rotate a key', 'Open allow-list', 'Force review gate'],
  },
  faye: {
    tab: 'Build Bench', glyph: 'hammer', headline: 'Lead Builder · Antigravity',
    sub: 'Shipping real, runnable artifacts',
    stats: [{ l: 'Shipped · 7d', v: '9' }, { l: 'In progress', v: '2' }, { l: 'Reverted', v: '0' }],
    board: { title: 'Build Queue', rows: [
      { who: 'faye', task: 'Memory Galaxy — note panel', state: 'working' },
      { who: 'faye', task: 'Command Palette ⌘K', state: 'working' },
      { who: 'faye', task: 'Responsive bento pass', state: 'idle' },
    ] },
    tools: ['New build', 'Open Antigravity', 'Hand to Kratos', 'Deploy to staging'],
  },
  chloe: {
    tab: 'Brand Studio', glyph: 'gem', headline: 'Positioning · Brand',
    sub: 'Turning the system into language owners feel',
    stats: [{ l: 'Pieces · 7d', v: '14' }, { l: 'Voice flags', v: '3' }, { l: 'Approved', v: '11' }],
    board: { title: 'Content Pipeline', rows: [
      { who: 'chloe', task: 'Q3 offer — "Chaos to Control"', state: 'approval' },
      { who: 'chloe', task: '5 thumbnail headlines', state: 'working' },
      { who: 'chloe', task: 'Onboarding email rewrite', state: 'idle' },
    ] },
    tools: ['Open Content Engine', 'Run voice-guard', 'Headline bank', 'New offer'],
  },
  legacylew: {
    tab: 'Standing In', glyph: 'sparkles', headline: 'Digital Twin · Founder Voice',
    sub: 'Representing you while you’re at work',
    stats: [{ l: 'Handled today', v: '22' }, { l: 'Auto-approved', v: '14' }, { l: 'Escalated', v: '3' }],
    board: { title: 'Acting As You', rows: [
      { who: 'legacylew', task: 'Replied to 6 client emails', state: 'working' },
      { who: 'legacylew', task: 'Approved low-risk design tweaks', state: 'working' },
      { who: 'legacylew', task: 'Flagged billing question for Lew', state: 'approval' },
    ] },
    tools: ['Review my replies', 'Tune the voice', 'Set escalation rules', 'Daily recap'],
  },
};

})();
