// google.js — real Google integrations (read-only): Gmail, Calendar, Drive.
// Brings these surfaces live once Lew authorizes them (one consent covers all
// three). Honest until then: with no token, each reports connected:false and
// the dashboard shows a sample/not-connected state — it never fabricates data.
//
// Token lifecycle:
//   - server/state/google-token.json holds { access_token, refresh_token, expiry_date }
//     (written by `npm run google-auth`; gitignored — never committed)
//   - client id/secret come from env GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET only
//   - access tokens are refreshed automatically when expired
const fs = require('fs');
const path = require('path');
const config = require('./config');

const TOKEN_FILE = path.join(config.stateDir, 'google-token.json');

function readToken() {
  try { return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8')); }
  catch {
    // allow a raw access token via env as a fallback (no refresh)
    if (process.env.GOOGLE_OAUTH_TOKEN) return { access_token: process.env.GOOGLE_OAUTH_TOKEN.trim(), expiry_date: 0 };
    return null;
  }
}
function writeToken(tok) {
  fs.mkdirSync(config.stateDir, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tok, null, 2));
}
function hasToken() { return !!readToken(); }

async function freshAccessToken() {
  const tok = readToken();
  if (!tok) throw new Error('not authorized — run `npm run google-auth`');
  const notExpired = tok.expiry_date && Date.now() < tok.expiry_date - 60000;
  if (tok.access_token && (notExpired || !tok.refresh_token)) return tok.access_token;
  // refresh
  const id = process.env.GOOGLE_CLIENT_ID, secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!tok.refresh_token || !id || !secret) {
    if (tok.access_token) return tok.access_token; // best effort with possibly-stale token
    throw new Error('token expired and cannot refresh (set GOOGLE_CLIENT_ID/SECRET)');
  }
  const body = new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: tok.refresh_token, grant_type: 'refresh_token' });
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body });
  const j = await r.json();
  if (!r.ok) throw new Error('refresh failed: ' + (j.error_description || j.error || r.status));
  tok.access_token = j.access_token;
  tok.expiry_date = Date.now() + (j.expires_in || 3600) * 1000;
  writeToken(tok);
  return tok.access_token;
}

const GRADS = [
  'linear-gradient(145deg,#0E8FA8,#23D6F5)', 'linear-gradient(145deg,#7A1528,#F4516B)',
  'linear-gradient(145deg,#0B5F45,#34D399)', 'linear-gradient(145deg,#7A5410,#E8C766)',
  'linear-gradient(145deg,#334155,#64748B)', 'linear-gradient(145deg,#5433FF,#8B5CF6)',
];
function gradFor(s) { let h = 0; for (const c of (s || '')) h = (h * 31 + c.charCodeAt(0)) % GRADS.length; return GRADS[h]; }
function initialsFor(name) {
  const parts = (name || '?').replace(/<.*>/, '').trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?';
}
function header(headers, name) { const h = (headers || []).find(x => x.name.toLowerCase() === name.toLowerCase()); return h ? h.value : ''; }
function senderName(from) { const m = from.match(/^\s*"?([^"<]+?)"?\s*</); return (m ? m[1] : from).trim() || from; }
function fmtTime(dateStr) {
  const d = new Date(dateStr); if (isNaN(d)) return '';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if ((now - d) < 7 * 864e5) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function api(pathUrl, token) {
  const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me' + pathUrl, { headers: { Authorization: 'Bearer ' + token } });
  if (!r.ok) { const e = await r.text(); throw new Error('gmail ' + r.status + ': ' + e.slice(0, 140)); }
  return r.json();
}
async function gapi(urlStr, token) {
  const r = await fetch(urlStr, { headers: { Authorization: 'Bearer ' + token } });
  if (!r.ok) { const e = await r.text(); throw new Error('google ' + r.status + ': ' + e.slice(0, 140)); }
  return r.json();
}

// Returns { connected, account, unread, threads:[...] } in the MC.gmail shape.
async function gmail(max = 10) {
  if (!hasToken()) return { connected: false };
  const token = await freshAccessToken();
  const profile = await api('/profile', token).catch(() => ({}));
  const list = await api('/messages?maxResults=' + max + '&labelIds=INBOX', token);
  const ids = (list.messages || []).map(m => m.id);
  const threads = [];
  for (const id of ids) {
    const m = await api('/messages/' + id + '?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date', token);
    const hs = m.payload && m.payload.headers;
    const from = senderName(header(hs, 'From'));
    const labels = m.labelIds || [];
    threads.push({
      id, from, initials: initialsFor(from), grad: gradFor(from),
      subject: header(hs, 'Subject') || '(no subject)',
      snippet: (m.snippet || '').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
      time: fmtTime(header(hs, 'Date')),
      unread: labels.includes('UNREAD'), star: labels.includes('STARRED'),
      label: 'Inbox', labelTone: 'cyan', count: 1,
    });
  }
  return {
    connected: true,
    account: profile.emailAddress || 'connected',
    unread: threads.filter(t => t.unread).length,
    threads,
  };
}

// ---- Google Calendar (read-only) → MC.calendar shape ----
const TONES = ['cyan', 'emerald', 'gold', 'crimson', 'violet'];
function toneFor(s) { let h = 0; for (const c of (s || '')) h = (h * 31 + c.charCodeAt(0)) % TONES.length; return TONES[h]; }
function hourOf(d) { return d.getHours() + d.getMinutes() / 60; }

async function calendar(daysAhead = 4) {
  if (!hasToken()) return { connected: false };
  const token = await freshAccessToken();
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const timeMin = dayStart.toISOString();
  const timeMax = new Date(dayStart.getTime() + daysAhead * 864e5).toISOString();
  const j = await gapi('https://www.googleapis.com/calendar/v3/calendars/primary/events?' +
    new URLSearchParams({ timeMin, timeMax, singleEvents: 'true', orderBy: 'startTime', maxResults: '50' }), token);
  const days = [], dayKeys = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(dayStart.getTime() + i * 864e5);
    days.push(d.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + d.getDate());
    dayKeys.push(d.toDateString());
  }
  let minH = 8, maxH = 18;
  const events = [];
  for (const ev of (j.items || [])) {
    if (ev.status === 'cancelled') continue;
    const isAllDay = !!(ev.start && ev.start.date && !ev.start.dateTime);
    const s = new Date(ev.start.dateTime || ev.start.date + 'T09:00:00');
    const e = new Date(ev.end && (ev.end.dateTime || ev.end.date + 'T10:00:00') || s.getTime() + 36e5);
    const di = dayKeys.indexOf(new Date(s.getFullYear(), s.getMonth(), s.getDate()).toDateString());
    if (di < 0) continue;
    const start = isAllDay ? 9 : hourOf(s);
    const end = isAllDay ? 10 : Math.max(start + 0.25, hourOf(e) || start + 1);
    minH = Math.min(minH, Math.floor(start));
    maxH = Math.max(maxH, Math.ceil(end));
    events.push({
      id: ev.id, title: ev.summary || '(no title)', start, end, day: di,
      tone: toneFor(ev.summary || ev.id), loc: ev.location || (ev.hangoutLink ? 'Meet' : (isAllDay ? 'All day' : '')),
    });
  }
  const hours = []; for (let h = minH; h <= maxH; h++) hours.push(h);
  return {
    connected: true,
    account: j.summary || '',
    today: now.toLocaleDateString('en-US', { weekday: 'short' }) + ' · ' + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    days, hours, events,
    nowHour: hourOf(now),
  };
}

// ---- Google Drive (read-only metadata) → MC.drive shape ----
function humanSize(n) {
  n = Number(n); if (!n) return '—';
  if (n > 1e9) return (n / 1e9).toFixed(1) + ' GB';
  if (n > 1e6) return (n / 1e6).toFixed(1) + ' MB';
  return Math.max(1, Math.round(n / 1e3)) + ' KB';
}
function relTime(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 36e5);
  if (h < 1) return Math.max(1, Math.floor(ms / 6e4)) + 'm ago';
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24); if (d < 7) return d + 'd ago';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function driveKind(mime, name) {
  if (mime === 'application/vnd.google-apps.folder') return { kind: 'folder', glyph: 'folder-sync', tone: 'cyan' };
  if (mime.includes('spreadsheet') || /\.(xlsx?|csv)$/i.test(name)) return { kind: 'sheet', glyph: 'kanban', tone: 'emerald' };
  if (mime.includes('document') || /\.(docx?|txt|md)$/i.test(name)) return { kind: 'doc', glyph: 'file-text', tone: 'cyan' };
  if (mime === 'application/pdf') return { kind: 'pdf', glyph: 'file-text', tone: 'crimson' };
  if (mime.startsWith('image/')) return { kind: 'image', glyph: 'image', tone: 'emerald' };
  if (mime.startsWith('video/')) return { kind: 'video', glyph: 'video', tone: 'gold' };
  return { kind: 'doc', glyph: 'file-text', tone: 'gold' };
}

async function drive(max = 12) {
  if (!hasToken()) return { connected: false };
  const token = await freshAccessToken();
  const [about, list] = await Promise.all([
    gapi('https://www.googleapis.com/drive/v3/about?fields=storageQuota,user', token),
    gapi('https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
      pageSize: String(max), orderBy: 'modifiedTime desc',
      fields: 'files(id,name,mimeType,size,modifiedTime,owners(displayName,me))',
      q: 'trashed = false',
    }), token),
  ]);
  const q = about.storageQuota || {};
  const used = Number(q.usage || 0), limit = Number(q.limit || 0);
  return {
    connected: true,
    account: (about.user && about.user.emailAddress) || '',
    used: limit ? Math.round(used / limit * 100) : 0,
    usedLabel: limit ? (humanSize(used) + ' of ' + humanSize(limit)) : humanSize(used) + ' used',
    files: (list.files || []).map(f => {
      const k = driveKind(f.mimeType || '', f.name || '');
      const owner = (f.owners && f.owners[0]) || {};
      return {
        id: f.id, name: f.name, kind: k.kind, glyph: k.glyph, tone: k.tone,
        size: f.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : humanSize(f.size),
        time: relTime(f.modifiedTime), owner: owner.me ? 'You' : (owner.displayName || ''),
      };
    }),
  };
}

module.exports = { gmail, calendar, drive, hasToken, readToken, writeToken, TOKEN_FILE };
