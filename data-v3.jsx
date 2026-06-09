// data-v3.jsx — extends window.MC with skills, workflows, reports, briefing,
// goals, content engine, connector catalog, subagent templates, dream findings, agent brains.
(function () {
const MC = window.MC;

// ===================== CONNECTOR CATALOG (for "New Connection") =====================
MC.connectorCatalog = [
  { id: 'hermes', name: 'Hermes Agent', glyph: 'send', cat: 'Agents', methods: ['CLI', 'API Key', 'MCP'], blurb: 'Add another Hermes agent instance or profile.' },
  { id: 'claude', name: 'Claude / Claude Code', glyph: 'sparkles', cat: 'Models', methods: ['API Key', 'CLI'], blurb: 'Anthropic build + reasoning engine.' },
  { id: 'codex', name: 'Codex', glyph: 'binary', cat: 'Models', methods: ['API Key'], blurb: 'OpenAI review / QA engine.' },
  { id: 'gemini', name: 'Gemini', glyph: 'gem', cat: 'Models', methods: ['API Key'], blurb: 'Google multimodal model.' },
  { id: 'antigravity', name: 'Antigravity', glyph: 'rocket', cat: 'Agents', methods: ['CLI'], blurb: "Faye's builder harness." },
  { id: 'discord', name: 'Discord', glyph: 'message-circle', cat: 'Channels', methods: ['Bot Token', 'Webhook', 'OAuth'], blurb: 'Team server, alerts, and slash-command orders.' },
  { id: 'notion', name: 'Notion', glyph: 'box', cat: 'Apps', methods: ['OAuth', 'API Key'], blurb: 'Workspace, docs, and databases.' },
  { id: 'hyperframes', name: 'Hyperframes', glyph: 'clapperboard', cat: 'Production', methods: ['API Key', 'CLI'], blurb: 'One-prompt video generation engine.' },
  { id: 'elevenlabs', name: 'ElevenLabs', glyph: 'activity', cat: 'Production', methods: ['API Key'], blurb: 'Realistic AI voice for video + audio.' },
  { id: 'obsidian', name: 'Obsidian', glyph: 'box', cat: 'Memory', methods: ['MCP'], blurb: 'The second-brain vault.' },
  { id: 'telegram', name: 'Telegram', glyph: 'message-circle', cat: 'Channels', methods: ['Bot Token', 'API Key'], blurb: 'Orders and briefs on the go.' },
  { id: 'n8n', name: 'n8n', glyph: 'workflow', cat: 'Automation', methods: ['API Key', 'Webhook'], blurb: 'Workflow automation flows.' },
  { id: 'slack', name: 'Slack', glyph: 'messages-square', cat: 'Channels', methods: ['OAuth', 'Webhook'], blurb: 'Team channels + notifications.' },
  { id: 'heygen', name: 'HeyGen', glyph: 'video', cat: 'Production', methods: ['API Key'], blurb: 'AI avatar presenter for video.' },
];
// connections the operator already has (live)
MC.connections = [
  { id: 'cx1', catId: 'hermes', name: 'Hermes · Primary', method: 'CLI', status: 'live', meta: 'local · M3' },
  { id: 'cx2', catId: 'hermes', name: 'Hermes · Jarvis (voice)', method: 'CLI', status: 'live', meta: 'voice profile' },
  { id: 'cx3', catId: 'claude', name: 'Claude / Claude Code', method: 'API Key', status: 'live', meta: 'opus + sonnet' },
  { id: 'cx4', catId: 'codex', name: 'Codex', method: 'API Key', status: 'live', meta: 'gpt-5-codex' },
  { id: 'cx5', catId: 'obsidian', name: 'Obsidian Vault', method: 'MCP', status: 'live', meta: '1,284 notes' },
  { id: 'cx6', catId: 'discord', name: 'Discord · Legacy Server', method: 'Bot Token', status: 'live', meta: '6 channels' },
  { id: 'cx7', catId: 'notion', name: 'Notion', method: 'OAuth', status: 'live', meta: 'workspace' },
  { id: 'cx8', catId: 'hyperframes', name: 'Hyperframes', method: 'API Key', status: 'live', meta: 'video engine' },
  { id: 'cx9', catId: 'elevenlabs', name: 'ElevenLabs', method: 'API Key', status: 'idle', meta: 'voice' },
  { id: 'cx10', catId: 'n8n', name: 'n8n · Automations', method: 'API Key', status: 'live', meta: '14 flows' },
];

// ===================== SKILLS =====================
MC.skillCategories = ['Build', 'Content', 'Research', 'Ops', 'Security'];
MC.skills = [
  { id: 'sk1', name: 'Hyperframes Video', glyph: 'clapperboard', cat: 'Content', desc: 'Turn one prompt into a rendered, scene-by-scene video.', agents: ['faye', 'chloe'], runs: 34, level: 'Expert' },
  { id: 'sk2', name: 'SEO Swarm', glyph: 'search', cat: 'Content', desc: 'Keyword → content → links → rank, run by 7 sub-agents.', agents: ['mercury', 'chloe'], runs: 88, level: 'Expert' },
  { id: 'sk3', name: 'Code Review', glyph: 'binary', cat: 'Security', desc: 'Adversarial Codex pass on every build before it ships.', agents: ['kratos'], runs: 121, level: 'Expert' },
  { id: 'sk4', name: 'Vault Write-back', glyph: 'box', cat: 'Ops', desc: 'Log every output to Obsidian as linked markdown.', agents: ['sage', 'faye', 'kratos', 'chloe'], runs: 412, level: 'Core' },
  { id: 'sk5', name: 'Mission Planner', glyph: 'target', cat: 'Build', desc: 'Decompose a goal into milestones + agent assignments.', agents: ['sage'], runs: 56, level: 'Expert' },
  { id: 'sk6', name: 'Voice (ElevenLabs)', glyph: 'activity', cat: 'Content', desc: 'Narrate scripts with realistic AI voice.', agents: ['faye'], runs: 12, level: 'Learning' },
  { id: 'sk7', name: 'Approval Gate', glyph: 'shield-check', cat: 'Security', desc: 'Surface irreversible actions for human sign-off.', agents: ['sage', 'kratos'], runs: 73, level: 'Core' },
  { id: 'sk8', name: 'Brand Voice Guard', glyph: 'gem', cat: 'Content', desc: 'Flag copy that drifts cheap, hypey, or off-brand.', agents: ['chloe'], runs: 41, level: 'Expert' },
];

// ===================== WORKFLOWS =====================
MC.workflows = [
  { id: 'wf1', name: 'Nightly Vault Write-back', status: 'active', trigger: 'Cron · 03:00 daily', agent: 'sage', runs: 142, last: '6h ago', steps: ['Collect outputs', 'Summarize', 'Write to Obsidian', 'Link to clusters'], tone: 'cyan' },
  { id: 'wf2', name: 'SEO Content Pipeline', status: 'active', trigger: 'On new keyword', agent: 'mercury', runs: 88, last: '22m ago', steps: ['Research', 'Draft', 'Optimize', 'Publish', 'Track'], tone: 'gold' },
  { id: 'wf3', name: 'Backlink Outreach', status: 'active', trigger: 'Cron · 5/day', agent: 'mercury', runs: 64, last: '1h ago', steps: ['Find sites', 'Personalize', 'Send', 'Log replies'], tone: 'gold' },
  { id: 'wf4', name: 'P1 Auto-Triage', status: 'active', trigger: 'On QA failure', agent: 'kratos', runs: 19, last: 'Yesterday', steps: ['Reproduce', 'Root cause', 'Queue repair', 'Notify Lew'], tone: 'crimson' },
  { id: 'wf5', name: 'Daily Video Render', status: 'paused', trigger: 'Cron · 09:00 daily', agent: 'faye', runs: 3, last: '3d ago', steps: ['Pick topic', 'Script', 'Voice', 'Render', 'Publish'], tone: 'emerald' },
  { id: 'wf6', name: 'Morning Brief', status: 'active', trigger: 'Cron · 06:00 daily', agent: 'sage', runs: 61, last: '8h ago', steps: ['Scan overnight', 'Summarize', 'Email + Telegram'], tone: 'cyan' },
];

// ===================== REPORTS =====================
MC.reports = [
  { id: 'rp1', agent: 'sage', title: 'Orchestration — Weekly', period: 'This week', time: '2h ago', summary: 'Routed 287 tasks across the team with a 1.2-task average backlog. Zero approvals aged past 1 hour.', metrics: [{ l: 'Routed', v: '287' }, { l: 'Avg backlog', v: '1.2' }, { l: 'Uptime', v: '99.98%' }] },
  { id: 'rp2', agent: 'kratos', title: 'Security & QA — Weekly', period: 'This week', time: '3h ago', summary: 'Closed 5 P1/P2 repairs, ran 121 review passes, shipped the markdown allow-list. One regression caught + reverted.', metrics: [{ l: 'Repairs', v: '5' }, { l: 'Reviews', v: '121' }, { l: 'Escaped', v: '0' }] },
  { id: 'rp3', agent: 'faye', title: 'Build Output — Weekly', period: 'This week', time: '5h ago', summary: 'Shipped 9 artifacts including Memory Galaxy + Command Palette. Every build proven by Kratos before merge.', metrics: [{ l: 'Shipped', v: '9' }, { l: 'Tokens', v: '3.1M' }, { l: 'Spend', v: '$0.61' }] },
  { id: 'rp4', agent: 'chloe', title: 'Brand & Content — Weekly', period: 'This week', time: 'Yesterday', summary: 'Drafted the Q3 offer page and 5 thumbnail headlines. Voice-guard flagged 3 lines that drifted off-brand.', metrics: [{ l: 'Pieces', v: '14' }, { l: 'Flags', v: '3' }, { l: 'Approved', v: '11' }] },
];

// ===================== DAILY BRIEFING =====================
MC.dailyBriefing = {
  date: 'Wednesday · June 10',
  summary: '4 agents online, 7 tasks moving, 3 approvals waiting. Build is in QA hardening — ship gate Friday.',
  rows: [
    { agent: 'sage', doing: 'Routing the overnight queue + keeping approvals under 1h', did: ['Cleared 11 tasks', 'Sent morning brief'], next: 'Escalate Q3 page' },
    { agent: 'kratos', doing: 'Closing the last 2 P1/P2 repairs before the ship gate', did: ['Patched ChatRoom race', 'Shipped allow-list'], next: 'Review Faye’s galaxy' },
    { agent: 'faye', doing: 'Shipping the Memory Galaxy view + Command Palette', did: ['Galaxy to 78%', 'Wired note panel'], next: 'Responsive pass' },
    { agent: 'chloe', doing: 'Q3 positioning — awaiting your sign-off', did: ['Drafted offer page', '5 headlines'], next: 'Onboarding emails' },
  ],
};

// ===================== BUSINESS GOALS =====================
MC.businessGoals = [
  { id: 'bg1', title: 'Recover 200 missed leads / month', metric: 'leads', current: 142, target: 200, due: 'Jun 30', owner: 'sage', tone: 'cyan', trend: [80, 96, 110, 124, 142] },
  { id: 'bg2', title: 'Grow YouTube by 1,000 subscribers', metric: 'subs', current: 340, target: 1000, due: 'Aug 1', owner: 'faye', tone: 'crimson', trend: [40, 120, 190, 270, 340] },
  { id: 'bg3', title: 'Rank 50 keywords on page 1', metric: 'keywords', current: 32, target: 50, due: 'Jul 15', owner: 'chloe', tone: 'gold', trend: [8, 15, 21, 27, 32] },
  { id: 'bg4', title: 'Cut AI spend 20% via routing', metric: 'saved', current: 14, target: 20, due: 'Jun 30', owner: 'sage', tone: 'emerald', trend: [3, 6, 9, 11, 14] },
];

// ===================== LEGACY CONTENT ENGINE =====================
MC.contentEngine = {
  stages: [
    { id: 'capture', name: 'Capture', glyph: 'plus', desc: 'Idea or source in' },
    { id: 'research', name: 'Research', glyph: 'search', desc: 'Mine vault + web' },
    { id: 'draft', name: 'Draft', glyph: 'pen-line', desc: 'Write the piece' },
    { id: 'optimize', name: 'Optimize', glyph: 'sliders', desc: 'SEO + brand voice' },
    { id: 'produce', name: 'Produce', glyph: 'clapperboard', desc: 'Render media' },
    { id: 'distribute', name: 'Distribute', glyph: 'send', desc: 'Publish everywhere' },
  ],
  types: [
    { id: 'blog', name: 'Blog post', glyph: 'file-text', tone: 'cyan' },
    { id: 'video', name: 'Video', glyph: 'video', tone: 'crimson' },
    { id: 'thumb', name: 'Thumbnail', glyph: 'image', tone: 'gold' },
    { id: 'social', name: 'Social post', glyph: 'message-square', tone: 'emerald' },
    { id: 'email', name: 'Email', glyph: 'send', tone: 'cyan' },
    { id: 'script', name: 'Script', glyph: 'pen-line', tone: 'gold' },
  ],
  pieces: [
    { id: 'ce1', type: 'blog', title: '7 ways AI recovers lost leads', stage: 'optimize', by: 'chloe', kw: 'lead recovery', progress: 72 },
    { id: 'ce2', type: 'video', title: 'From Chaos to Control explainer', stage: 'produce', by: 'faye', kw: 'AI operating system', progress: 88 },
    { id: 'ce3', type: 'thumb', title: 'Stop Losing Leads — 5 variants', stage: 'draft', by: 'chloe', kw: 'thumbnails', progress: 40 },
    { id: 'ce4', type: 'social', title: 'Carousel: the 7-layer AI OS', stage: 'research', by: 'mercury', kw: 'agent OS', progress: 22 },
    { id: 'ce5', type: 'email', title: 'Onboarding sequence — rewrite', stage: 'distribute', by: 'chloe', kw: 'onboarding', progress: 100 },
  ],
};

// ===================== DREAM FINDINGS (per employee) =====================
MC.dreamFindings = {
  sage: [{ t: 'Lew approves low-risk outbound 94% of the time', a: 'Auto-batching those for one-tap review' }, { t: 'Routing latency spikes at 4pm', a: 'Pre-warming the capability map at 3:45' }],
  kratos: [{ t: 'ChatRoom race recurs across 4 sessions', a: 'Queued a permanent fix + regression test' }, { t: '2 deps have known CVEs', a: 'Flagged for the next security window' }],
  faye: [{ t: 'Galaxy view re-renders too often on zoom', a: 'Memoized the node layout — 31% smoother' }, { t: 'Bento grid breaks under 720px', a: 'Drafted a responsive pass' }],
  chloe: [{ t: '"Chaos to Control" outperforms other angles', a: 'Leading the Q3 page with it' }, { t: 'Thumbnails with 3 words get more clicks', a: 'Trimming all headlines to ≤3 words' }],
};

// ===================== AGENT SECOND BRAINS =====================
MC.agentBrains = {
  sage: { notes: 1284, focus: ['Routing rules', 'Approval patterns', 'Team capability map'], recent: ['Lew approval patterns', 'Routing latency log', 'Daily brief template'] },
  kratos: { notes: 642, focus: ['Threat models', 'QA repairs', 'Review checklists'], recent: ['P1 ChatRoom race', 'Markdown allow-list', 'Keyboard a11y audit'] },
  faye: { notes: 918, focus: ['Build specs', 'Component library', 'Perf notes'], recent: ['Galaxy interaction spec', 'Bento responsive pass', 'Token usage log'] },
  chloe: { notes: 506, focus: ['Brand voice', 'Offer angles', 'Headline bank'], recent: ['Q3 positioning', 'Voice & tone rules', 'Thumbnail headlines'] },
};

// ===================== SUBAGENT PERSONA TEMPLATES =====================
MC.subagentHosts = [
  { id: 'claude', name: 'Claude', glyph: 'sparkles', accent: '#23D6F5', models: ['claude-opus-4.1', 'claude-sonnet-4.5', 'claude-haiku-4'] },
  { id: 'antigravity', name: 'Antigravity', glyph: 'rocket', accent: '#34D399', models: ['gemini-2.5-pro', 'gemini-2.5-flash'] },
  { id: 'hermes', name: 'Hermes', glyph: 'send', accent: '#E8C766', models: ['claude-opus-4.1', 'gpt-5', 'gpt-5-codex', 'local-llama'] },
];
MC.subagents = [
  { id: 'sa1', name: 'Scribe', host: 'claude', model: 'claude-sonnet-4.5', job: 'Long-form drafting', parent: 'chloe' },
  { id: 'sa2', name: 'Auditor', host: 'hermes', model: 'gpt-5-codex', job: 'Adversarial review', parent: 'kratos' },
  { id: 'sa3', name: 'Forge', host: 'antigravity', model: 'gemini-2.5-pro', job: 'Rapid prototyping', parent: 'faye' },
];

})();
