import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.resolve(process.env.WHATNEXT_BACKEND_DIR || path.join(frontend, '../appsmovilesBACK'));
const backendOnly = process.argv.includes('--backend-only');
for (const file of ['package.json', '.env', 'node_modules/tsx/dist/cli.mjs', 'node_modules/.prisma/client/index.js', 'src/index.ts', 'src/worker.ts']) {
  if (!existsSync(path.join(backend, file))) {
    console.error(`Backend setup is missing ${file} in ${backend}. Follow that repository's README or set WHATNEXT_BACKEND_DIR.`);
    process.exit(1);
  }
}
const port = await new Promise(resolve => {
  const socket = net.connect({ host: '127.0.0.1', port: 3000 });
  socket.setTimeout(1000);
  socket.once('connect', () => { socket.destroy(); resolve(true); });
  socket.once('error', () => resolve(false));
  socket.once('timeout', () => { socket.destroy(); resolve(false); });
});
if (port) { console.error('Port 3000 is already in use. Stop the existing API before npm run dev.'); process.exit(1); }
console.log(`Backend: ${backend}`);
const children = [];
let stopping = false;
let forcedStop;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
  forcedStop = setTimeout(() => {
    for (const child of children) if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  }, 5000);
  forcedStop.unref();
}
function launch(label, args, cwd, interactive = false) {
  const child = spawn(process.execPath, args, { cwd, env: process.env, stdio: interactive ? 'inherit' : ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  if (!interactive) {
    const pipe = (stream, output) => {
      let pending = '';
      stream.on('data', chunk => {
        pending += chunk.toString();
        const lines = pending.split('\n'); pending = lines.pop();
        for (const line of lines) output.write(`[${label}] ${line}\n`);
      });
      stream.on('end', () => { if (pending) output.write(`[${label}] ${pending}\n`); });
    };
    pipe(child.stdout, process.stdout); pipe(child.stderr, process.stderr);
  }
  child.once('error', error => { console.error(`${label}: ${error.message}`); stop(1); });
  child.once('exit', code => {
    if (!stopping) stop(code ?? 1);
    if (children.every(item => item.exitCode !== null || item.signalCode !== null)) clearTimeout(forcedStop);
  });
}
const tsx = path.join(backend, 'node_modules/tsx/dist/cli.mjs');
launch('API', [tsx, 'watch', 'src/index.ts'], backend);
launch('WORKER', [tsx, 'src/worker.ts'], backend);
if (!backendOnly) launch('EXPO', [path.join(frontend, 'node_modules/expo/bin/cli'), 'start', process.argv.includes('--dev-client') ? '--dev-client' : '--go'], frontend, true);
process.once('SIGINT', () => stop(0));
process.once('SIGTERM', () => stop(0));
