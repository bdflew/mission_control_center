// data-v4.jsx — Legacy Lew (digital twin), security, content specs,
// email frameworks, webhook defaults. Loaded after data-v3.jsx.
(function () {
const MC = window.MC;

// ===================== LEGACY LEW (digital-twin AI employee) =====================
MC.agents.push({
  id: 'legacylew', name: 'Legacy Lew', role: 'Digital Twin · Founder Voice',
  theme: 'violet', accent: '#A78BFA', accent2: '#C4B5FD', deep: '#6D28D9',
  glyph: 'sparkles', model: 'claude-opus-4.1',
  status: 'working', statusLabel: 'Representing',
  task: 'Answering as you while you’re at work',
  avatarGrad: 'linear-gradient(145deg,#5B21B6,#A78BFA 58%,#C4B5FD)',
  blurb: 'Your digital twin. Legacy Lew speaks in your voice, holds your context, and stands in for you — answering the team, approving the obvious, and flagging only what truly needs the real you.',
  uptime: '99.99%', tasksToday: 22, tokens: '1.31M', spend: '$0.74',
  goals: [
    { t: 'Hold the founder voice across every reply', p: 92, due: 'rolling' },
    { t: 'Auto-approve only low-risk, defer the rest', p: 100, due: 'today' },
    { t: 'Daily "as-you" recap to the real Lew', p: 70, due: 'tonight' },
  ],
  improvements: [
    'Learned your phrasing — replies now pass the voice-guard 97% of the time.',
    'Knows what you always escalate (billing, security, anything irreversible).',
    'Mirrors your standup style: outcome first, then the one blocker.',
  ],
});
MC.agentBrains.legacylew = { notes: 740, focus: ['Your voice & tone', 'Decisions you’d make', 'What to escalate'], recent: ['Founder voice profile', 'Approval patterns', 'Standup recap template'] };
MC.dreamFindings.legacylew = [
  { t: 'You always soften "no" with a next step', a: 'Adopted that pattern in declines' },
  { t: 'You approve design tweaks instantly', a: 'Auto-approving low-risk design changes' },
];

// ===================== SECURITY =====================
MC.security = {
  score: 92,
  posture: 'Hardened',
  guardedBy: 'kratos',
  stats: [
    { l: 'Open issues', v: '1', tone: 'gold' },
    { l: 'Approval gates', v: '7', tone: 'cyan' },
    { l: 'Keys rotated · 30d', v: '4', tone: 'emerald' },
    { l: 'Blocked attempts', v: '12', tone: 'crimson' },
  ],
  reports: [
    { id: 'se1', title: 'Weekly security review', time: '3h ago', tone: 'emerald', summary: 'No breaches. 121 review passes clean. Markdown link allow-list holding — 12 javascript: injections blocked.' },
    { id: 'se2', title: 'Dependency audit', time: 'Yesterday', tone: 'gold', summary: '2 transitive deps carry known CVEs (low severity). Patches queued for the next window.' },
    { id: 'se3', title: 'Access & key audit', time: '2d ago', tone: 'emerald', summary: 'All API keys scoped + rotated on schedule. No stale tokens. OAuth grants reviewed.' },
  ],
  improvements: [
    'Added an independent Codex review on every build before it can ship.',
    'Namespaced war_room localStorage keys — closed the ChatRoom race.',
    'Locked the markdown link scheme allow-list to https / mailto / obsidian.',
    'Every irreversible action now hits a human approval gate by default.',
  ],
  events: [
    { id: 'ev1', t: 'Blocked javascript: link in a draft', who: 'kratos', sev: 'med', time: '1h ago' },
    { id: 'ev2', t: 'Codex flagged unsafe regex, auto-fixed', who: 'kratos', sev: 'low', time: '4h ago' },
    { id: 'ev3', t: 'Approval gate held a key rotation for Lew', who: 'sage', sev: 'high', time: '52m ago' },
    { id: 'ev4', t: 'Rate-limit tripped on outbound — paused + logged', who: 'kratos', sev: 'low', time: 'Yesterday' },
  ],
};

// ===================== CONTENT TYPE SPECS =====================
MC.contentSpecs = {
  blog: { title: 'Blog Post', glyph: 'file-text', tone: 'cyan', specs: [
    { k: 'Length', v: '1,200–1,800 words' }, { k: 'Structure', v: 'Hook → 3 outcome pillars → CTA' },
    { k: 'SEO', v: 'Primary keyword in H1, URL, first 100 words' }, { k: 'Voice', v: 'Simple · strategic · premium' },
  ], steps: ['Pull target keyword + 3 angles from the vault', 'Outline with outcome-driven H2s', 'Draft in brand voice', 'Optimize: meta, internal links, schema', 'Publish + log to vault'] },
  video: { title: 'Video', glyph: 'video', tone: 'crimson', specs: [
    { k: 'Length', v: '60–180s · 5–8 scenes' }, { k: 'Engine', v: 'Hyperframes (HTML scenes)' },
    { k: 'Voice', v: 'ElevenLabs · Legacy voice' }, { k: 'Aspect', v: '16:9 + 9:16 cut' },
  ], steps: ['Write the script (hook → beats → CTA)', 'Generate voice narration', 'Build HTML scenes', 'Render MP4 + self-check', 'Publish across platforms'] },
  thumb: { title: 'Thumbnail', glyph: 'image', tone: 'gold', specs: [
    { k: 'Headline', v: '2–5 words, uppercase' }, { k: 'Palette', v: 'Navy + gold + cyan (locked)' },
    { k: 'Variants', v: '5 per concept' }, { k: 'Face', v: 'Avatar on a third, never center' },
  ], steps: ['Pull headline from the bank', 'Lock brand palette', 'Generate 5 variants', 'Pick + export presets'] },
  social: { title: 'Social Post', glyph: 'message-square', tone: 'emerald', specs: [
    { k: 'Formats', v: 'Carousel · single · thread' }, { k: 'Hook', v: 'First line stops the scroll' },
    { k: 'CTA', v: 'One clear next step' }, { k: 'Cadence', v: '1/day from the engine' },
  ], steps: ['Repurpose a blog or video', 'Write the hook', 'Design the carousel', 'Schedule + cross-post'] },
  email: { title: 'Email', glyph: 'send', tone: 'cyan', specs: [
    { k: 'Subject', v: '≤ 6 words, outcome-led' }, { k: 'Length', v: '90–150 words' },
    { k: 'CTA', v: 'Single button' }, { k: 'Tone', v: 'Helpful, never pushy' },
  ], steps: ['Define the one outcome', 'Write subject + preview', 'Draft body in voice', 'Add CTA + send/schedule'] },
  script: { title: 'Script', glyph: 'pen-line', tone: 'gold', specs: [
    { k: 'Format', v: 'Scene-by-scene' }, { k: 'Hook', v: 'First 3 seconds' },
    { k: 'Length', v: 'Matches target video' }, { k: 'Read', v: 'Spoken-word cadence' },
  ], steps: ['Define the angle', 'Write the hook', 'Beat out each scene', 'Mark pauses + emphasis'] },
};

// ===================== EMAIL RESPONSE FRAMEWORKS =====================
MC.emailFrameworks = [
  { id: 'ef1', name: 'Client — warm & clear', glyph: 'users-round', tone: 'emerald', body: 'Open with appreciation → confirm understanding → give the outcome → one clear next step. Keep it under 120 words. Always offer a call if it’s complex.' },
  { id: 'ef2', name: 'Sales — qualify & book', glyph: 'wallet', tone: 'gold', body: 'Thank them → restate their goal → tie to a result we’ve delivered → propose a specific time. Never discount in the first reply. End with the booking link.' },
  { id: 'ef3', name: 'Support — calm & fix', glyph: 'shield-check', tone: 'cyan', body: 'Acknowledge → take ownership → state the fix + timeline → confirm when done. No jargon. If it touches billing or security, escalate to Lew first.' },
  { id: 'ef4', name: 'Cold — short & specific', glyph: 'send', tone: 'crimson', body: 'One-line relevance → one outcome → one ask. Under 60 words. No "just checking in". Reference something specific to them.' },
];

// ===================== WEBHOOK DEFAULTS (autonomous trigger) =====================
MC.autoHooks = { content: null, studio: null };

})();
