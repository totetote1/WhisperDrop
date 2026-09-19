import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = new URL('../dist/', import.meta.url);
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/worker.js', ['worker.js', 'text/javascript; charset=utf-8']],
  ['/format.js', ['format.js', 'text/javascript; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
]);
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const entry = files.get((req.url || '/').split('?')[0]);
  if (!entry) { res.writeHead(404).end('Not found'); return; }
  try {
    const data = await readFile(new URL(entry[0], root));
    res.writeHead(200, {
      'Content-Type': entry[1],
      'Content-Length': data.length,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(500).end('必要なファイルを読み込めません。ZIPを解凍し直してください。');
  }
});
let fallback = false;
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE' && !fallback) {
    fallback = true;
    server.listen(0, '127.0.0.1');
    return;
  }
  console.error('起動できませんでした：', error.message);
  process.exitCode = 1;
});
server.once('listening', () => {
  const url = `http://127.0.0.1:${server.address().port}`;
  console.log(`WhisperDrop: ${url}`);
  console.log('使用中はこのターミナルを開いたままにしてください。');
  console.log('終了するときは、結果を保存してからこの画面で Control + C を押してください。');
  console.log('ブラウザが開かない場合は、上のURLをブラウザで開いてください。\n');
  if (process.env.WHISPERDROP_NO_OPEN !== '1' && process.platform === 'darwin') {
    const open = spawn('/usr/bin/open', ['-a', 'Google Chrome', url], { stdio: 'ignore' });
    open.on('error', () => console.log('上のURLをブラウザで開いてください。'));
    open.on('exit', (code) => {
      if (code !== 0) {
        const defaultBrowser = spawn('/usr/bin/open', [url], { stdio: 'ignore' });
        defaultBrowser.on('error', () => console.log('上のURLをブラウザで開いてください。'));
      }
    });
  }
});
function stop() {
  server.close(() => process.exit(0));
  server.closeAllConnections();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('SIGHUP', stop);
// Fail before opening a browser when the distribution is incomplete.
await readFile(fileURLToPath(new URL('index.html', root)));
server.listen(4173, '127.0.0.1');
