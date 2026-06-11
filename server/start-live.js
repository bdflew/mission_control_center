#!/usr/bin/env node
/**
 * Mission Control local live supervisor.
 *
 * Starts the backend if needed, then starts the live agent loops so the dashboard
 * chat boxes stay responsive from one supported command:
 *
 *   npm run live:all
 *
 * Localhost only. No credentials are read, printed, or modified here.
 */
const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const API = (process.env.MC_API || 'http://127.0.0.1:8754').replace(/\/$/, '');
const children = new Set();
let stopping = false;

async function health() {
  try {
    const res = await fetch(API + '/api/health');
    if (!res.ok) return false;
    const body = await res.json();
    return Boolean(body && body.ok);
  } catch {
    return false;
  }
}

function start(name, args, env = {}) {
  const child = spawn(process.execPath, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.add(child);
  child.stdout.on('data', chunk => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on('data', chunk => process.stderr.write(`[${name}] ${chunk}`));
  child.on('exit', (code, signal) => {
    children.delete(child);
    const reason = signal || code;
    console.log(`[${name}] exited ${reason}`);
    if (!stopping && code) process.exitCode = code;
  });
  return child;
}

async function waitForBackend(timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await health()) return true;
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

function stopAll(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    try { child.kill(signal); } catch {}
  }
}
process.on('SIGINT', () => stopAll('SIGINT'));
process.on('SIGTERM', () => stopAll('SIGTERM'));

(async function main() {
  console.log(`MISSION_CONTROL_LIVE_SUPERVISOR api=${API}`);
  if (await health()) {
    console.log('BACKEND_ALREADY_LIVE');
  } else {
    console.log('STARTING_BACKEND');
    start('backend', ['server/server.js']);
    const ok = await waitForBackend();
    if (!ok) {
      console.error('BACKEND_START_FAILED');
      stopAll();
      process.exit(1);
    }
    console.log('BACKEND_READY');
  }

  console.log('STARTING_AGENT_LOOPS');
  start('agents', ['server/live-agent-loops.js']);

  // Keep supervisor alive while any child is alive. If backend was already live,
  // this process owns only the agent-loop child.
  setInterval(() => {}, 1 << 30);
})().catch(err => {
  console.error('MISSION_CONTROL_LIVE_SUPERVISOR_FAILED', err.message);
  stopAll();
  process.exit(1);
});
