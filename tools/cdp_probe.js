// Reads the text a person would see, straight out of the running app, over the
// DevTools protocol. This is how the panel is checked without a game.
const http = require('http');
const WebSocket = require(process.argv[3] || 'ws');
const port = Number(process.argv[2] || 9333);

const get = (path) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path }, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
  }).on('error', reject);
});

const evaluate = (url, expression) => new Promise((resolve, reject) => {
  const socket = new WebSocket(url, { maxPayload: 64 * 1024 * 1024 });
  const timer = setTimeout(() => { socket.terminate(); reject(Error('timeout')); }, 8000);
  socket.on('open', () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true, awaitPromise: true } })));
  socket.on('message', (raw) => {
    const message = JSON.parse(raw);
    if (message.id !== 1) return;
    clearTimeout(timer);
    socket.close();
    if (message.error) return reject(Error(message.error.message));
    const result = message.result?.result;
    if (message.result?.exceptionDetails) return reject(Error(message.result.exceptionDetails.text + ' ' + (result?.description || '')));
    resolve(result?.value);
  });
  socket.on('error', (error) => { clearTimeout(timer); reject(error); });
});

(async () => {
  const targets = (await get('/json/list')).filter((t) => t.type === 'page' || t.type === 'other');
  console.log('targets:', targets.map((t) => `${t.type}:${t.url.split('/').pop()}`).join(' | '));
  for (const target of targets) {
    let text;
    try {
      text = await evaluate(target.webSocketDebuggerUrl, 'document.body ? document.body.innerText : ""');
    } catch (error) {
      console.log(`\n--- ${target.url} ---\nprobe failed: ${error.message}`);
      continue;
    }
    const flat = String(text || '').replace(/\s+/g, ' ').trim();
    const cjk = (flat.match(/[\u4e00-\u9fff]/g) || []).length;
    console.log(`\n--- ${target.url} ---`);
    console.log(`cjk glyphs: ${cjk}`);
    console.log(flat.slice(0, 900));
  }
})().catch((error) => { console.error('probe failed:', error.message); process.exit(1); });
