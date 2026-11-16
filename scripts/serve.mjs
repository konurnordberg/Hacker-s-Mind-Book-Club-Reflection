// Zero-dependency preview server. Bind locally and serve only project files.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = Number(portIndex >= 0 ? args[portIndex + 1] : process.env.PORT || 4173);
const root = args.includes('--dist') ? path.join(projectRoot, 'dist') : projectRoot;
const allowed = new Set(['index.html', 'styles.css']);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8' };
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  try {
    const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    // The allowlist keeps source metadata and local files off the preview server.
    if (!allowed.has(relative) && !/^(src|assets)\/[a-zA-Z0-9_./-]+$/.test(relative)) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const target = path.resolve(root, relative);
    const within = path.relative(root, target);
    if (within.startsWith('..') || path.isAbsolute(within) || !(await stat(target)).isFile()) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? 'Port ' + port + ' is busy. Try: node scripts/serve.mjs --port 4174' : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log('Mind the Loophole → http://127.0.0.1:' + port));
