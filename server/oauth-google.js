#!/usr/bin/env node
// oauth-google.js — one-time Google authorization (loopback OAuth 2.0).
// Run: npm run google-auth
//
// Prereqs (Lew does this once, ~3 min):
//   1. console.cloud.google.com → create/pick a project
//   2. Enable the "Gmail API", "Google Calendar API", and "Google Drive API"
//   3. APIs & Services → Credentials → Create OAuth client ID → type "Desktop app"
//   4. export GOOGLE_CLIENT_ID=...  GOOGLE_CLIENT_SECRET=...   (then run this)
//
// Saves tokens to server/state/google-token.json (gitignored). No secret is
// ever written to the repo. All scopes are READ-ONLY; one consent covers
// Gmail + Calendar + Drive.
const http = require('http');
const { spawn } = require('child_process');
const { writeToken } = require('./google');

const PORT = parseInt(process.env.GOOGLE_OAUTH_PORT || '8765', 10);
const REDIRECT = `http://127.0.0.1:${PORT}/oauth2callback`;
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
].join(' ');

const ID = process.env.GOOGLE_CLIENT_ID, SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!ID || !SECRET) {
  console.error('\n  Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.\n' +
    '  Create a "Desktop app" OAuth client in Google Cloud, then:\n' +
    '    export GOOGLE_CLIENT_ID=...\n    export GOOGLE_CLIENT_SECRET=...\n    npm run google-auth\n');
  process.exit(1);
}

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: ID, redirect_uri: REDIRECT, response_type: 'code',
  scope: SCOPES, access_type: 'offline', prompt: 'consent',
});

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/oauth2callback')) { res.writeHead(404); return res.end(); }
  const code = new URL(req.url, REDIRECT).searchParams.get('code');
  if (!code) { res.writeHead(400); return res.end('no code'); }
  try {
    const body = new URLSearchParams({ code, client_id: ID, client_secret: SECRET, redirect_uri: REDIRECT, grant_type: 'authorization_code' });
    const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error_description || j.error || r.status);
    writeToken({ access_token: j.access_token, refresh_token: j.refresh_token, expiry_date: Date.now() + (j.expires_in || 3600) * 1000, scope: j.scope });
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<body style="font-family:system-ui;background:#0A0E1A;color:#6EE7B7;padding:40px"><h2>✅ Gmail authorized.</h2><p>You can close this tab and return to Mission Control.</p></body>');
    console.log('\n  ✅ Authorized. Token saved. Restart the backend (npm start) and Gmail goes live.\n');
    setTimeout(() => process.exit(0), 500);
  } catch (e) {
    res.writeHead(500); res.end('error: ' + e.message);
    console.error('  ✗ token exchange failed:', e.message); process.exit(1);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n  Opening Google consent screen…\n  If it doesn\'t open, paste this URL:\n\n  ' + authUrl + '\n');
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  try { spawn(opener, [authUrl], { stdio: 'ignore', detached: true }).unref(); } catch {}
});
