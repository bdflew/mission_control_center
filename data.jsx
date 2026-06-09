// data.jsx — Legacy Automations · Mission Control mock data
// One source of truth for the whole operating system. Realistic mid-build crunch.

const MC = {};

// ============ OPERATOR ============
MC.operator = {
  name: 'Lew',
  full: 'Lew',
  role: 'Founder · CEO',
  avatar: 'assets/avatar-headshot.png',
  profile: 'Evening — At Work',
};

// ============ AGENTS ============
// Each agent gets a distinct, on-brand theme accent.
//  sage=cyan (orchestrator)  kratos=crimson (security/QA)
//  faye=emerald (builder)    chloe=gold (brand)
MC.agents = [
  {
    id: 'sage', name: 'Sage', role: 'COO · Command Router',
    theme: 'cyan', accent: '#23D6F5', accent2: '#6FE8FB', deep: '#0E8FA8', line: 'rgba(35,214,245,0.13)',
    glyph: 'git-branch', model: 'claude-opus-4.1',
    status: 'working', statusLabel: 'Orchestrating',
    task: 'Routing 7 tasks across the team',
    avatarGrad: 'linear-gradient(145deg,#0E8FA8,#23D6F5 55%,#6FE8FB)',
    blurb: 'The nervous system. Sage logs everything, routes work, and keeps the team in sync — the one agent that never sleeps on the queue.',
    uptime: '99.98%', tasksToday: 41, tokens: '1.84M', spend: '$1.92',
    goals: [
      { t: 'Keep every agent under 2-task backlog', p: 86, due: 'rolling' },
      { t: 'Zero unrouted approvals older than 1h', p: 100, due: 'today' },
      { t: 'Nightly standup digest to Lew by 6am', p: 64, due: 'tonight' },
    ],
    improvements: [
      'Learned Lew approves "low-risk" outbound 94% of the time — auto-batching those for one-tap review.',
      'Routing latency down 31% after caching agent capability map.',
      'New rule: escalate anything touching billing to Kratos first.',
    ],
  },
  {
    id: 'kratos', name: 'Kratos', role: 'CTO · Security / QA',
    theme: 'crimson', accent: '#F4516B', accent2: '#FF8095', deep: '#B0253C', line: 'rgba(244,81,107,0.13)',
    glyph: 'shield-half', model: 'gpt-5-codex',
    status: 'working', statusLabel: 'Repairing',
    task: 'Fixing P1 — ChatRoom race condition',
    avatarGrad: 'linear-gradient(145deg,#7A1528,#F4516B 60%,#FF8095)',
    blurb: 'The adversarial critic. Kratos reviews what Faye builds, hardens security, and proves it works before anything ships. Claude builds, Codex reviews.',
    uptime: '99.91%', tasksToday: 28, tokens: '2.20M', spend: '$1.41',
    goals: [
      { t: 'Close all 5 open P1/P2 QA repairs', p: 60, due: 'today' },
      { t: 'Markdown link scheme allow-list shipped', p: 100, due: 'done' },
      { t: 'Full keyboard-a11y audit on dashboard', p: 45, due: 'fri' },
    ],
    improvements: [
      'Added an independent review pass: every Faye build gets a Codex adversarial read before approval.',
      'war_room localStorage collision patched — namespaced keys per channel.',
      'Caught + reverted a duplicate-header regression in pulseGlow color bleed.',
    ],
  },
  {
    id: 'faye', name: 'Faye', role: 'Lead Builder · Antigravity',
    theme: 'emerald', accent: '#34D399', accent2: '#6EE7B7', deep: '#0E8F66', line: 'rgba(52,211,153,0.13)',
    glyph: 'hammer', model: 'claude-sonnet-4.5',
    status: 'working', statusLabel: 'Building',
    task: 'Shipping the Memory Galaxy view',
    avatarGrad: 'linear-gradient(145deg,#0B5F45,#34D399 60%,#6EE7B7)',
    blurb: 'The hands. Faye builds in Antigravity — fast, real, runnable artifacts — then hands them to Kratos to prove. Ships layer by layer, never one blob.',
    uptime: '99.86%', tasksToday: 33, tokens: '3.10M', spend: '$0.61',
    goals: [
      { t: 'Memory Galaxy interactive build', p: 78, due: 'today' },
      { t: 'Command Palette ⌘K overlay', p: 52, due: 'today' },
      { t: 'Responsive collapse pass on bento grid', p: 30, due: 'tue' },
    ],
    improvements: [
      'Now self-screenshots each build and diffs against the spec before handoff.',
      'Component split: nothing over 1k lines, every layer proven before stacking.',
      'Reuses the design-system tokens instead of inventing colors — zero palette drift.',
    ],
  },
  {
    id: 'chloe', name: 'Chloe', role: 'Positioning · Brand',
    theme: 'gold', accent: '#E8C766', accent2: '#F3D27A', deep: '#A87B2E', line: 'rgba(216,167,74,0.15)',
    glyph: 'gem', model: 'gemini-2.5-pro',
    status: 'approval', statusLabel: 'Awaiting Approval',
    task: 'Q3 offer positioning — needs your sign-off',
    avatarGrad: 'linear-gradient(145deg,#7A5410,#E8C766 60%,#F3D27A)',
    blurb: 'The voice. Chloe owns positioning, brand, and the offer — turning what the system does into language a business owner feels. Premium, never cheap.',
    uptime: '99.94%', tasksToday: 19, tokens: '0.92M', spend: '$0.33',
    goals: [
      { t: 'Q3 "From Chaos to Control" offer page', p: 70, due: 'awaiting' },
      { t: '5 thumbnail headlines for Lead Recovery', p: 100, due: 'done' },
      { t: 'Rewrite onboarding email sequence', p: 25, due: 'thu' },
    ],
    improvements: [
      'Built a voice-guard: flags any copy that drifts cheap, hypey, or robot-replacement.',
      'Learned the brand 35/30/20/10/5 color ratio — checks every asset against it.',
      'Now ties every headline to a business outcome before drafting.',
    ],
  },
];

// Summonable personas (Pantheon)
MC.personas = [
  { id: 'athena', name: 'Athena', role: 'Strategy', model: 'claude-opus-4.1', glyph: 'compass', accent: '#23D6F5' },
  { id: 'mercury', name: 'Mercury', role: 'Research', model: 'gpt-5', glyph: 'telescope', accent: '#34D399' },
  { id: 'vulcan', name: 'Vulcan', role: 'Data / Ops', model: 'gemini-2.5-pro', glyph: 'database', accent: '#E8C766' },
];

// ============ PROGRAMS ============
MC.programs = [
  { id: 'hermes', name: 'Hermes', glyph: 'send', method: 'CLI', status: 'live', note: 'Central agent harness' },
  { id: 'claude', name: 'Claude / Claude Code', glyph: 'sparkles', method: 'API Key', status: 'live', note: 'Build engine' },
  { id: 'antigravity', name: 'Antigravity', glyph: 'rocket', method: 'CLI', status: 'live', note: "Faye's builder" },
  { id: 'codex', name: 'Codex', glyph: 'binary', method: 'API Key', status: 'live', note: "Kratos's reviewer" },
  { id: 'gemini', name: 'Gemini', glyph: 'gem', method: 'API Key', status: 'idle', note: 'Multimodal' },
  { id: 'notebooklm', name: 'NotebookLM', glyph: 'notebook-pen', method: 'OAuth', status: 'idle', note: 'Research synthesis' },
  { id: 'obsidian', name: 'Obsidian', glyph: 'box', method: 'MCP', status: 'live', note: 'Memory vault' },
  { id: 'n8n', name: 'n8n · Automations', glyph: 'workflow', method: 'API Key', status: 'live', note: '14 active flows' },
  { id: 'dropbox', name: 'Dropbox Routing', glyph: 'folder-sync', method: 'OAuth', status: 'live', note: 'Artifact storage' },
  { id: 'telegram', name: 'Telegram', glyph: 'message-circle', method: 'API Key', status: 'live', note: 'Orders on the go' },
];

// ============ CHANNELS ============
MC.channels = [
  { id: 'warroom', name: 'War Room', glyph: 'messages-square' },
  { id: 'announcements', name: 'Announcements', glyph: 'megaphone' },
  { id: 'standup', name: 'Daily Standup', glyph: 'sun' },
  { id: 'approval', name: 'Approval Needed', glyph: 'shield-check', badge: 3 },
];

// ============ WORKSPACES ============
MC.workspaces = [
  { id: 'goals', name: 'Goals', glyph: 'flag' },
  { id: 'kanban', name: 'Kanban · Projects', glyph: 'kanban' },
  { id: 'studio', name: 'Studio', glyph: 'clapperboard' },
  { id: 'seo', name: 'SEO', glyph: 'search' },
  { id: 'content', name: 'Content', glyph: 'pen-line' },
  { id: 'notebook', name: 'Notebook · Research', glyph: 'notebook-text' },
  { id: 'galaxy', name: 'Memory Galaxy', glyph: 'orbit' },
  { id: 'cost', name: 'Cost · Spend', glyph: 'wallet' },
];

// ============ HERO METRICS ============
MC.heroMetrics = [
  { id: 'agents', label: 'Active Agents', value: '4', suffix: '/ 4', glyph: 'users-round', spark: [3,4,3,4,4,4,4], tone: 'cyan', delta: 'all online' },
  { id: 'tasks', label: 'Tasks In Progress', value: '7', glyph: 'list-checks', spark: [4,5,6,5,7,6,7], tone: 'cyan', delta: '+2 since 4pm' },
  { id: 'approvals', label: 'Approvals Waiting', value: '3', glyph: 'shield-alert', spark: [1,2,2,3,2,3,3], tone: 'gold', delta: 'oldest 14m', featured: true },
  { id: 'spend', label: "Today's AI Spend", value: '$4.27', glyph: 'wallet', spark: [0.8,1.5,2.2,2.9,3.4,3.9,4.27], tone: 'cyan', delta: '18% of daily cap' },
];

// ============ ACTIVE MISSION ============
MC.mission = {
  name: 'Mission Control Center',
  phase: 'Build · QA Hardening',
  progress: 72,
  steps: [
    { t: 'L1–L4 foundation verified', done: true },
    { t: 'Command Center shell shipped', done: true },
    { t: 'Memory Galaxy + ⌘K palette', done: false, active: true },
    { t: 'QA repairs + a11y audit', done: false },
  ],
  next: { agent: 'kratos', text: 'Kratos: repair P1 ChatRoom race condition before launch gate' },
};

// ============ APPROVALS QUEUE ============
MC.approvals = [
  { id: 'a1', subject: 'Q3 offer page — "From Chaos to Control"', by: 'chloe', risk: 'low', age: '14m', detail: 'New positioning + pricing copy for the Lead Recovery offer.' },
  { id: 'a2', subject: 'Deploy Memory Galaxy to staging', by: 'faye', risk: 'med', age: '31m', detail: 'Pushes the new galaxy view behind a feature flag on staging.' },
  { id: 'a3', subject: 'Rotate Codex API key', by: 'kratos', risk: 'high', age: '52m', detail: 'Security rotation — invalidates the current key immediately.' },
];

// ============ DREAMING BRIEF ============
MC.dreaming = [
  { id: 'd1', text: "You're using 20% of your Gemini plan — downgrade could save $40/mo.", glyph: 'trending-down', time: '03:14', tone: 'cyan' },
  { id: 'd2', text: '3 artifacts from yesterday are unsaved to the vault. Want me to file them?', glyph: 'save', time: '03:02', tone: 'gold' },
  { id: 'd3', text: 'Kratos found a recurring race in ChatRoom — queued a repair for review.', glyph: 'shield-alert', time: '02:41', tone: 'crimson' },
];

// ============ MEMORY PULSE (recent vault writes) ============
MC.memoryPulse = [
  { id: 'm1', title: 'Meta-Framework — Combined Agent OS', tag: 'synthesis', glow: 1.0, time: '6m ago' },
  { id: 'm2', title: 'P1 ChatRoom race — root cause', tag: 'qa', glow: 0.82, time: '22m ago' },
  { id: 'm3', title: 'Q3 positioning — chaos to control', tag: 'brand', glow: 0.61, time: '1h ago' },
  { id: 'm4', title: 'Galaxy view — interaction spec', tag: 'build', glow: 0.4, time: '2h ago' },
];

// ============ RECENT ARTIFACTS ============
MC.artifacts = [
  { id: 'r1', kind: 'html', title: 'Mission Control home view', summary: 'Bento command center, 8 live panels, fully responsive.', by: 'faye', time: '8m' },
  { id: 'r2', kind: 'doc', title: 'Q3 offer positioning draft', summary: 'From-chaos-to-control narrative for Lead Recovery.', by: 'chloe', time: '24m' },
  { id: 'r3', kind: 'code', title: 'ChatRoom race condition fix', summary: 'Namespaced localStorage, guarded async write order.', by: 'kratos', time: '41m' },
  { id: 'r4', kind: 'image', title: 'Memory Galaxy key visual', summary: 'Cinematic starfield concept for the wow screen.', by: 'faye', time: '1h' },
  { id: 'r5', kind: 'video', title: 'System walkthrough — 90s', summary: 'Screen capture of the full operator flow.', by: 'mercury', time: '2h' },
  { id: 'r6', kind: 'doc', title: 'Nightly dream brief — overnight', summary: 'Cost, unsaved artifacts, one repair surfaced.', by: 'sage', time: '5h' },
];

// ============ WAR ROOM SEED MESSAGES ============
MC.warRoomSeed = [
  { id: 'w1', from: 'sage', text: "Morning brief is in. 3 approvals waiting, P1 repair queued. Lew's at work until 6 — routing accordingly.", time: '08:02' },
  { id: 'w2', from: 'kratos', text: 'On the ChatRoom race. Reproduced it — two writers hitting war_room storage at once. Fix + test by noon.', time: '08:05' },
  { id: 'w3', from: 'faye', text: 'Galaxy view is at 78%. Orbit + zoom feel good. Want a Kratos review before I wire the note panel.', time: '09:31' },
  { id: 'w4', from: 'sage', text: '@kratos take Faye’s galaxy build after the P1. @chloe the Q3 page is the only thing blocking Lew’s sign-off.', time: '09:33' },
  { id: 'w5', from: 'chloe', text: 'Q3 page drafted — "From Chaos to Control." Tied every line to an outcome. Pushed for approval.', time: '10:12' },
  { id: 'w6', from: 'lew', text: 'Good work team. Approving the offer page now. Kratos — security first, then help Faye land the galaxy.', time: '10:20' },
];

// ============ MEMORY GALAXY — vault notes ============
// clusters become spatial groups; recency drives brightness.
MC.galaxyClusters = [
  { id: 'aios',  name: 'AI Operating System', color: '#23D6F5', cx: 0.30, cy: 0.40 },
  { id: 'brand', name: 'Brand & Positioning', color: '#E8C766', cx: 0.70, cy: 0.34 },
  { id: 'qa',    name: 'Security & QA',        color: '#F4516B', cx: 0.66, cy: 0.70 },
  { id: 'build', name: 'Build & Engineering',  color: '#34D399', cx: 0.34, cy: 0.72 },
  { id: 'ops',   name: 'Ops & Growth',         color: '#6FE8FB', cx: 0.52, cy: 0.52 },
];

MC.galaxyNotes = [
  // AI OS
  { id: 'n1', cluster: 'aios', title: 'Meta-Framework — Combined Agent OS', recency: 1.0, links: ['n2','n3','n13'], excerpt: 'Synthesis of the 7-layer AOS and the visual intelligence layer. Agreement = signal.' },
  { id: 'n2', cluster: 'aios', title: '7-Layer Architecture', recency: 0.7, links: ['n1','n4'], excerpt: 'Foundation → Memory → Brain → Agents → Command → Production → Loop.' },
  { id: 'n3', cluster: 'aios', title: 'Decision Points', recency: 0.5, links: ['n1'], excerpt: 'Where the sources diverge: OMI vs Pinecone, free-tier specifics, unverified claims.' },
  { id: 'n4', cluster: 'aios', title: 'Obsidian = Second Brain', recency: 0.6, links: ['n2','n14'], excerpt: 'Plain markdown, local, multi-agent read/write via MCP. Highest-leverage layer.' },
  { id: 'n13', cluster: 'aios', title: 'Autonomous Goal Mode', recency: 0.35, links: ['n1'], excerpt: 'Set a long-horizon objective, walk away, agent returns finished work — sandboxed.' },
  // brand
  { id: 'n5', cluster: 'brand', title: 'Q3 positioning — chaos to control', recency: 0.85, links: ['n6','n7'], excerpt: 'From Chaos to Control. Every line ties to a business outcome.' },
  { id: 'n6', cluster: 'brand', title: 'Voice & Tone rules', recency: 0.45, links: ['n5'], excerpt: 'Simple, strategic, premium, trustworthy, motivational. No robot-replacement language.' },
  { id: 'n7', cluster: 'brand', title: 'Thumbnail headline bank', recency: 0.3, links: ['n5'], excerpt: 'Stop Losing Leads · From Chaos to Control · AI Employee Explained.' },
  // qa
  { id: 'n8', cluster: 'qa', title: 'P1 ChatRoom race — root cause', recency: 0.92, links: ['n9','n10'], excerpt: 'Two writers hit war_room storage simultaneously. Namespaced + guarded.' },
  { id: 'n9', cluster: 'qa', title: 'Markdown link allow-list', recency: 0.5, links: ['n8'], excerpt: 'Only https/mailto/obsidian schemes pass. Blocks javascript: injection.' },
  { id: 'n10', cluster: 'qa', title: 'Keyboard a11y audit', recency: 0.4, links: ['n8'], excerpt: 'Real buttons, aria-expanded, Enter/Space on every accordion + tile.' },
  // build
  { id: 'n11', cluster: 'build', title: 'Galaxy view — interaction spec', recency: 0.8, links: ['n12','n8'], excerpt: 'Drag to orbit, scroll to zoom, brightest = most recent. Bloom + parallax.' },
  { id: 'n12', cluster: 'build', title: 'Command Palette ⌘K spec', recency: 0.55, links: ['n11'], excerpt: 'Blurred scrim, spring-in, search agents/programs/actions.' },
  { id: 'n15', cluster: 'build', title: 'Bento grid responsive pass', recency: 0.3, links: ['n11'], excerpt: 'Graceful collapse: 3-col → 2-col → stacked. Sidebar → rail → drawer.' },
  // ops
  { id: 'n14', cluster: 'ops', title: 'Cost review — daily cap $24', recency: 0.65, links: ['n4'], excerpt: 'Spend at $4.27 today. Gemini underused — downgrade candidate.' },
  { id: 'n16', cluster: 'ops', title: 'Loop write-back protocol', recency: 0.5, links: ['n14','n1'], excerpt: 'Every output written back to the vault nightly. The compounding engine.' },
  { id: 'n17', cluster: 'ops', title: 'Lew approval patterns', recency: 0.42, links: ['n16'], excerpt: 'Approves low-risk outbound 94%. Auto-batch those for one-tap review.' },
];

window.MC = MC;
