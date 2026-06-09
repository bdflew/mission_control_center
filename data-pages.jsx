// data-pages.jsx — extends window.MC with integrations + workspace-page data
// Loaded after data.jsx. Realistic mid-build mock data for Legacy Automations.
(function () {
const MC = window.MC;

// ===================== GMAIL (10 latest threads) =====================
MC.gmail = {
  account: 'lew@legacyautomations.com',
  status: 'connected',
  unread: 4,
  threads: [
    { id: 'g1', from: 'Sage · Mission Control', initials: 'S', grad: 'linear-gradient(145deg,#0E8FA8,#23D6F5)', subject: 'Morning brief — 3 approvals waiting', snippet: 'Good morning Lew. Overnight the team cleared 11 tasks. 3 items need your sign-off before they ship — Q3 page, staging deploy, key rotation.', time: '7:58 AM', unread: true, star: true, label: 'Brief', labelTone: 'cyan', count: 1 },
    { id: 'g2', from: 'Stripe', initials: 'St', grad: 'linear-gradient(145deg,#5433FF,#8B5CF6)', subject: 'Your payout of $4,820.00 is on the way', snippet: 'Nice work. A payout of $4,820.00 was initiated to your bank account ending in 4417 and should arrive in 1–2 business days.', time: '7:21 AM', unread: true, star: false, label: 'Finance', labelTone: 'gold', count: 1 },
    { id: 'g3', from: 'Mara Chen', initials: 'MC', grad: 'linear-gradient(145deg,#0E8F66,#34D399)', subject: 'Re: Lead Recovery onboarding — go live Thursday?', snippet: 'This looks great. We are ready to flip it on Thursday. One question on the approval gate before our team touches it…', time: 'Yesterday', unread: true, star: true, label: 'Clients', labelTone: 'emerald', count: 4 },
    { id: 'g4', from: 'Kratos · Security', initials: 'K', grad: 'linear-gradient(145deg,#7A1528,#F4516B)', subject: 'P1 patched — ChatRoom race condition closed', snippet: 'Reproduced, fixed, and proved with a regression test. Namespaced the war_room storage keys. Ready for your approval to merge.', time: 'Yesterday', unread: false, star: false, label: 'QA', labelTone: 'crimson', count: 2 },
    { id: 'g5', from: 'Notion', initials: 'N', grad: 'linear-gradient(145deg,#2F2F2F,#6B7280)', subject: 'Chloe shared "Q3 Offer — Chaos to Control"', snippet: 'Chloe invited you to collaborate on a page in the Legacy Automations workspace. Comments are open for your review.', time: 'Yesterday', unread: false, star: false, label: 'Notion', labelTone: 'slate', count: 1 },
    { id: 'g6', from: 'David Okafor', initials: 'DO', grad: 'linear-gradient(145deg,#A87B2E,#F3D27A)', subject: 'Proposal follow-up — automation audit', snippet: 'Thanks for the walkthrough of the dashboard. The team was impressed. Can you send over the system audit scope and timeline?', time: 'Mon', unread: false, star: true, label: 'Sales', labelTone: 'gold', count: 3 },
    { id: 'g7', from: 'Faye · Builder', initials: 'F', grad: 'linear-gradient(145deg,#0B5F45,#34D399)', subject: 'Memory Galaxy at 78% — preview link inside', snippet: 'Orbit + zoom feel great. Wired the note panel to the vault. Staging preview is behind a flag — want a look before Kratos reviews?', time: 'Mon', unread: false, star: false, label: 'Build', labelTone: 'emerald', count: 1 },
    { id: 'g8', from: 'Google Calendar', initials: 'C', grad: 'linear-gradient(145deg,#1A73E8,#4285F4)', subject: 'Invitation: Weekly AI Ops Review @ Wed 2pm', snippet: 'You have been invited to "Weekly AI Ops Review" with the Legacy team. Wednesday 2:00–2:45 PM. Agenda attached.', time: 'Sun', unread: false, star: false, label: 'Calendar', labelTone: 'cyan', count: 1 },
    { id: 'g9', from: 'OpenRouter', initials: 'OR', grad: 'linear-gradient(145deg,#334155,#64748B)', subject: 'Usage summary — you used 41% of your plan', snippet: 'Your monthly usage is tracking below cap. At the current rate you will finish the month around 58% utilization.', time: 'Sun', unread: false, star: false, label: 'Billing', labelTone: 'slate', count: 1 },
    { id: 'g10', from: 'Chloe · Brand', initials: 'C', grad: 'linear-gradient(145deg,#7A5410,#E8C766)', subject: '5 thumbnail headlines for Lead Recovery', snippet: 'Stop Losing Leads · From Chaos to Control · AI Employee Explained · Dashboard Deep Dive · Recover Every Lead. Which direction?', time: 'Sat', unread: false, star: false, label: 'Brand', labelTone: 'gold', count: 2 },
  ],
};
// reading-pane messages for the top thread
MC.gmailThread = {
  g1: [
    { from: 'Sage', grad: 'linear-gradient(145deg,#0E8FA8,#23D6F5)', time: '7:58 AM', body: 'Good morning, Lew. Overnight the team cleared 11 tasks and logged everything to the vault.\n\n3 items need your sign-off before they ship:\n1. Q3 offer page — "From Chaos to Control" (Chloe, low risk)\n2. Deploy Memory Galaxy to staging (Faye, med risk)\n3. Rotate Codex API key (Kratos, high risk)\n\nReply "approve all" and I will route each to the right agent. Otherwise open the Approvals queue in Mission Control.' },
  ],
};

// ===================== GOOGLE CALENDAR =====================
MC.calendar = {
  status: 'connected',
  account: 'lew@legacyautomations.com',
  today: 'Wed · Jun 10',
  hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  events: [
    { id: 'c1', title: 'Morning brief w/ Sage', start: 8, end: 8.5, day: 0, tone: 'cyan', loc: 'Mission Control' },
    { id: 'c2', title: 'Client — Mara Chen (Lead Recovery)', start: 10, end: 11, day: 0, tone: 'emerald', loc: 'Google Meet' },
    { id: 'c3', title: 'Deep work — review approvals', start: 11.5, end: 13, day: 0, tone: 'gold', loc: 'Focus' },
    { id: 'c4', title: 'Weekly AI Ops Review', start: 14, end: 14.75, day: 0, tone: 'cyan', loc: 'War Room' },
    { id: 'c5', title: 'Sales call — David Okafor', start: 16, end: 16.5, day: 0, tone: 'gold', loc: 'Zoom' },
    { id: 'c6', title: 'Studio — record walkthrough', start: 9, end: 10, day: 1, tone: 'crimson', loc: 'Studio' },
    { id: 'c7', title: 'Kratos — security review', start: 13, end: 14, day: 1, tone: 'crimson', loc: 'Mission Control' },
    { id: 'c8', title: 'Content batch w/ Chloe', start: 15, end: 16.5, day: 2, tone: 'gold', loc: 'Studio' },
    { id: 'c9', title: 'Galaxy ship gate', start: 11, end: 12, day: 3, tone: 'emerald', loc: 'War Room' },
  ],
  days: ['Wed 10', 'Thu 11', 'Fri 12', 'Sat 13'],
};

// ===================== GOOGLE DRIVE =====================
MC.drive = {
  status: 'connected',
  used: 47, usedLabel: '47.2 GB of 100 GB',
  files: [
    { id: 'd1', name: 'Legacy — Brand Kit v1.0', kind: 'pdf', size: '12.4 MB', time: '2h ago', owner: 'You', glyph: 'file-text', tone: 'crimson' },
    { id: 'd2', name: 'Q3 Offer — Chaos to Control', kind: 'doc', size: '248 KB', time: '4h ago', owner: 'Chloe', glyph: 'file-text', tone: 'cyan' },
    { id: 'd3', name: 'Lead Recovery — System Audit', kind: 'sheet', size: '1.1 MB', time: 'Yesterday', owner: 'You', glyph: 'kanban', tone: 'emerald' },
    { id: 'd4', name: 'Mission Control walkthrough', kind: 'video', size: '184 MB', time: 'Yesterday', owner: 'Faye', glyph: 'video', tone: 'gold' },
    { id: 'd5', name: 'Client folder — Mara Chen', kind: 'folder', size: '8 items', time: 'Mon', owner: 'You', glyph: 'folder-sync', tone: 'cyan' },
    { id: 'd6', name: 'Memory Galaxy — key visual', kind: 'image', size: '4.8 MB', time: 'Mon', owner: 'Faye', glyph: 'image', tone: 'emerald' },
    { id: 'd7', name: 'SEO keyword research', kind: 'sheet', size: '720 KB', time: 'Tue', owner: 'Mercury', glyph: 'search', tone: 'gold' },
    { id: 'd8', name: 'Proposals', kind: 'folder', size: '14 items', time: 'Wed', owner: 'You', glyph: 'folder-sync', tone: 'cyan' },
  ],
};

// ===================== NOTION WORKSPACE =====================
MC.notion = {
  status: 'connected',
  workspace: 'Legacy Automations',
  sidebar: [
    { id: 'n1', name: 'Company OS', glyph: 'box', kids: ['Goals & OKRs', 'Org Chart', 'Playbooks'] },
    { id: 'n2', name: 'Clients', glyph: 'users-round', kids: ['Mara Chen', 'David Okafor', 'Pipeline'] },
    { id: 'n3', name: 'Content', glyph: 'pen-line', kids: ['Q3 Offer', 'Thumbnails', 'Scripts'] },
    { id: 'n4', name: 'Engineering', glyph: 'code', kids: ['QA Repairs', 'Specs', 'Releases'] },
  ],
  page: {
    crumb: 'Content / Q3 Offer',
    title: 'Q3 Offer — From Chaos to Control',
    cover: 'linear-gradient(120deg,#0E2038,#102544)',
    blocks: [
      { t: 'callout', icon: 'target', text: 'Goal: reposition Lead Recovery as the calm, approval-gated way out of operational chaos. Every line ties to an outcome.' },
      { t: 'h', text: 'The promise' },
      { t: 'p', text: 'Stop losing leads to slow follow-up. Recover every missed opportunity with an AI operating system you actually control.' },
      { t: 'h', text: 'Offer structure' },
      { t: 'todo', done: true, text: 'Hero headline — "Stop Losing Leads. Start Scaling."' },
      { t: 'todo', done: true, text: 'Three outcome pillars — recover, control, grow' },
      { t: 'todo', done: false, text: 'Pricing table — founder + done-for-you tiers' },
      { t: 'todo', done: false, text: 'Proof strip — client results' },
      { t: 'quote', text: 'Approval-gated beats fully autonomous. Owners want control, not magic.' },
    ],
  },
};

// ===================== OBSIDIAN VAULT =====================
MC.obsidian = {
  status: 'connected via MCP',
  vault: 'Legacy Second Brain',
  stats: { notes: 1284, links: 4117, clusters: 5, written7d: 63 },
  recent: [
    { id: 'o1', title: 'Meta-Framework — Combined Agent OS', tag: 'synthesis', ago: '6 min ago', by: 'Sage', glow: 1.0 },
    { id: 'o2', title: 'P1 ChatRoom race — root cause', tag: 'qa', ago: '22 min ago', by: 'Kratos', glow: 0.92 },
    { id: 'o3', title: 'Q3 positioning — chaos to control', tag: 'brand', ago: '1 hr ago', by: 'Chloe', glow: 0.85 },
    { id: 'o4', title: 'Galaxy view — interaction spec', tag: 'build', ago: '2 hr ago', by: 'Faye', glow: 0.8 },
    { id: 'o5', title: 'Lew approval patterns', tag: 'ops', ago: '3 hr ago', by: 'Sage', glow: 0.42 },
    { id: 'o6', title: 'Cost review — daily cap $24', tag: 'ops', ago: '5 hr ago', by: 'Vulcan', glow: 0.65 },
  ],
  layers: [
    { n: '01', name: 'Stars', glyph: 'star', text: 'Every note becomes a point of light — your whole knowledge visible at a glance.' },
    { n: '02', name: 'Constellations', glyph: 'git-branch', text: 'Every link draws a line. Clusters reveal your real focus areas.' },
    { n: '03', name: 'Glow', glyph: 'zap', text: 'Recent notes burn brightest, so your "now" surfaces itself automatically.' },
    { n: '04', name: 'Fly-through', glyph: 'orbit', text: 'Orbit, zoom, click a star to open the note. Recall by sight, not search.' },
    { n: '05', name: 'Improvements', glyph: 'trending-up', text: 'Every note your agents write makes the galaxy richer. A compounding loop.' },
  ],
};

// ===================== HERMES KANBAN (self-driving board) =====================
MC.kanban = {
  columns: [
    { id: 'capture', name: 'Idea Capture', glyph: 'plus', tone: 'cyan', desc: 'Drop one idea' },
    { id: 'classify', name: 'Classifying', glyph: 'git-branch', tone: 'cyan', desc: 'Agents shape & plan' },
    { id: 'approval', name: 'Human Approval', glyph: 'shield-check', tone: 'gold', desc: 'You approve or reject' },
    { id: 'building', name: 'Building', glyph: 'hammer', tone: 'emerald', desc: 'PM + sub-agents build' },
    { id: 'shipped', name: 'Shipped & Filed', glyph: 'check-circle', tone: 'emerald', desc: 'Preview live' },
  ],
  cards: [
    { id: 'k1', col: 'classify', title: 'SEO blog for OpenClaw', kind: 'website', plan: ['Research target keywords', 'Design a clean blog', 'Build on a modern stack', 'Internal linking strategy', 'Set up analytics'], agents: ['mercury', 'faye', 'chloe'], progress: 0, classify: 'Website · SEO' },
    { id: 'k2', col: 'approval', title: 'Habit tracker app', kind: 'app', plan: ['Define streak logic', 'Design calm UI', 'Build with local storage', 'Self-check + ship'], agents: ['faye', 'kratos'], progress: 0, classify: 'App · Productivity' },
    { id: 'k3', col: 'building', title: 'Lead Recovery landing page', kind: 'website', plan: ['Hero + outcome pillars', 'Proof strip', 'Approval-gated CTA', 'Deploy to staging'], agents: ['chloe', 'faye'], progress: 64, classify: 'Website · Marketing' },
    { id: 'k4', col: 'building', title: 'Meditation timer', kind: 'app', plan: ['Breathing animation', 'Session log', 'Ambient audio'], agents: ['faye'], progress: 38, classify: 'App · Wellness' },
    { id: 'k5', col: 'shipped', title: 'Cost dashboard widget', kind: 'tool', plan: ['Pull spend by model', 'Daily cap meter', 'Downgrade suggestions'], agents: ['vulcan', 'faye'], progress: 100, classify: 'Tool · Ops', preview: 'cost' },
    { id: 'k6', col: 'shipped', title: 'Thumbnail generator', kind: 'tool', plan: ['Headline bank', 'Brand palette lock', 'Export presets'], agents: ['chloe'], progress: 100, classify: 'Tool · Brand', preview: 'thumb' },
    { id: 'k7', col: 'shipped', title: 'Client intake form', kind: 'tool', plan: ['Qualifying questions', 'Route to CRM', 'Auto-reply'], agents: ['sage', 'faye'], progress: 100, classify: 'Tool · Sales', preview: 'form' },
  ],
};

// ===================== PAPERCLIP (AI employees) =====================
MC.paperclip = {
  teams: [
    { id: 'labs', name: 'Goldie Labs', focus: 'Build & ship products', tone: 'emerald', lead: 'faye' },
    { id: 'agency', name: 'Goldie Agency', focus: 'SEO & growth delivery', tone: 'gold', lead: 'mercury' },
  ],
  seoSwarm: [
    { id: 's1', role: 'Scout', task: 'Keyword research', glyph: 'search', model: 'gemini-2.5-pro', status: 'working' },
    { id: 's2', role: 'Writer', task: 'Draft content', glyph: 'pen-line', model: 'claude-sonnet-4.5', status: 'working' },
    { id: 's3', role: 'Optimizer', task: 'On-page SEO', glyph: 'sliders', model: 'gpt-5', status: 'idle' },
    { id: 's4', role: 'Link Builder', task: 'Outreach 5/day', glyph: 'link', model: 'claude-opus-4.1', status: 'working' },
    { id: 's5', role: 'Publisher', task: 'Deploy to site', glyph: 'rocket', model: 'claude-sonnet-4.5', status: 'idle' },
    { id: 's6', role: 'Citations', task: 'Get cited in AI search', glyph: 'sparkles', model: 'gpt-5', status: 'working' },
    { id: 's7', role: 'Analyst', task: 'Track rankings', glyph: 'trending-up', model: 'gemini-2.5-pro', status: 'idle' },
  ],
  built: [
    { id: 'p1', title: 'OpenClaw SEO blog — 8 posts', by: 'agency', time: '2h ago', metric: '206 clicks/day peak' },
    { id: 'p2', title: 'Keyword map — 140 terms', by: 'agency', time: '5h ago', metric: '32 ranking' },
    { id: 'p3', title: 'Backlink outreach batch', by: 'agency', time: 'Yesterday', metric: '5 sent' },
    { id: 'p4', title: 'Lead Recovery landing', by: 'labs', time: 'Yesterday', metric: 'staging' },
  ],
};

// ===================== STUDIO (Hyperframes) =====================
MC.studio = {
  status: 'Hyperframes · connected',
  pipeline: [
    { id: 1, name: 'Script', glyph: 'pen-line', note: 'Agent writes the full script' },
    { id: 2, name: 'Voice', glyph: 'activity', note: 'Text-to-speech narration' },
    { id: 3, name: 'Scenes', glyph: 'code', note: 'HTML scenes, built one by one' },
    { id: 4, name: 'Render', glyph: 'video', note: 'Compose into MP4' },
    { id: 5, name: 'Self-check', glyph: 'shield-check', note: 'Reviews its own output' },
  ],
  videos: [
    { id: 'v1', title: 'How AI automation saves owners time', scenes: 7, len: '1:48', time: '8 min ago', by: 'faye', status: 'ready', kw: 'AI automation', accent: '#23D6F5' },
    { id: 'v2', title: 'From Chaos to Control — explainer', scenes: 6, len: '2:10', time: '1h ago', by: 'chloe', status: 'ready', kw: 'lead recovery', accent: '#E8C766' },
    { id: 'v3', title: 'AI Employee, explained in 90s', scenes: 5, len: '1:30', time: '3h ago', by: 'mercury', status: 'ready', kw: 'AI employee', accent: '#34D399' },
    { id: 'v4', title: 'Mission Control — product tour', scenes: 8, len: '3:04', time: 'Yesterday', by: 'faye', status: 'rendering', kw: 'dashboard', accent: '#F4516B' },
  ],
};

// ===================== HERMES (command page) =====================
MC.hermes = {
  version: 'Hermes 3.2 · local',
  host: 'MacBook Pro M3 · coding plan',
  activations: 412,
  memoryHits: '1,284 notes',
  connections: [
    { name: 'Obsidian Vault', glyph: 'box', method: 'MCP', status: 'live' },
    { name: 'Claude / Claude Code', glyph: 'sparkles', method: 'API', status: 'live' },
    { name: 'Codex', glyph: 'binary', method: 'API', status: 'live' },
    { name: 'OpenClaw', glyph: 'cpu', method: 'CLI', status: 'live' },
    { name: 'Antigravity', glyph: 'rocket', method: 'CLI', status: 'live' },
    { name: 'Telegram', glyph: 'message-circle', method: 'API', status: 'live' },
    { name: 'Gmail', glyph: 'message-square', method: 'OAuth', status: 'live' },
    { name: 'n8n', glyph: 'workflow', method: 'API', status: 'idle' },
  ],
  models: [
    { name: 'claude-opus-4.1', use: 'Reasoning · planning', share: 38 },
    { name: 'claude-sonnet-4.5', use: 'Building · writing', share: 34 },
    { name: 'gpt-5-codex', use: 'Review · QA', share: 18 },
    { name: 'gemini-2.5-pro', use: 'Research · multimodal', share: 10 },
  ],
  conversations: [
    { id: 'h1', title: 'Galaxy view build', time: '6m', active: true },
    { id: 'h2', title: 'Q3 offer positioning', time: '1h' },
    { id: 'h3', title: 'Security — key rotation', time: '3h' },
    { id: 'h4', title: 'SEO swarm setup', time: 'Yesterday' },
    { id: 'h5', title: 'Cost review', time: 'Yesterday' },
  ],
  seed: [
    { me: false, t: 'Hermes online. Local on your M3, plugged into the vault and the full team. What are we running, Lew?' },
    { me: true, t: 'What did the team get done overnight?' },
    { me: false, t: 'Cleared 11 tasks. Kratos closed the P1 race condition, Faye pushed Memory Galaxy to 78%, Chloe drafted the Q3 page. 3 items are waiting on your approval — want me to open the gate?' },
  ],
};

// ===================== DREAMING (overnight intelligence) =====================
MC.dreamingPage = {
  lastRun: '03:14 · 6 hrs ago',
  nextRun: 'Tonight · 03:00',
  sources: ['Hermes', 'Claude', 'Codex', 'Gemini', 'Obsidian'],
  insights: [
    { id: 'di1', tone: 'cyan', glyph: 'trending-down', title: 'Downgrade Gemini plan', text: "You're using 20% of your Gemini plan. Dropping a tier saves ~$40/mo with no impact on current workloads.", from: 'Cost analysis', save: '$40/mo' },
    { id: 'di2', tone: 'gold', glyph: 'save', title: '3 artifacts unsaved', text: 'Three artifacts from yesterday were never written back to the vault. Want me to file them under Build?', from: 'Loop check', save: '3 files' },
    { id: 'di3', tone: 'crimson', glyph: 'shield-alert', title: 'Recurring ChatRoom race', text: 'Pattern detected across 4 sessions — queued a repair for Kratos and logged the root cause to the vault.', from: 'Pattern surface', save: 'P1 queued' },
    { id: 'di4', tone: 'cyan', glyph: 'target', title: 'Goal drift — YouTube', text: "You set a 1,000-subscriber goal but haven't shipped a video in 4 days. Studio has 3 scripts ready to render.", from: 'Goal tracking', save: '3 ready' },
    { id: 'di5', tone: 'emerald', glyph: 'zap', title: 'Skill underused', text: 'The Hyperframes video skill has only run twice this week. Scheduling a daily 9am render could compound your reach.', from: 'Skill audit', save: 'auto' },
  ],
};

})();
