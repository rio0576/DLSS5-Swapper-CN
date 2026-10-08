// Exercises the real language menu in the running app and reports what the
// main window and the in-game panel window say afterwards.
const http = require('http');
const WebSocket = require(process.argv[3] || 'ws');
const port = Number(process.argv[2] || 9333);
const wanted = process.argv[4] || 'en';

const get = (p) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path: p }, (res) => {
    let body = '';
    res.on('data', (c) => { body += c; });
    res.on('end', () => resolve(JSON.parse(body)));
  }).on('error', reject);
});

const evaluate = (url, expression) => new Promise((resolve, reject) => {
  const socket = new WebSocket(url, { maxPayload: 32 * 1024 * 1024 });
  const timer = setTimeout(() => { socket.terminate(); reject(Error('timeout')); }, 15000);
  socket.on('open', () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true, awaitPromise: true } })));
  socket.on('message', (raw) => {
    const message = JSON.parse(raw);
    if (message.id !== 1) return;
    clearTimeout(timer); socket.close();
    if (message.result?.exceptionDetails) return reject(Error(message.result.exceptionDetails.text));
    resolve(message.result?.result?.value);
  });
  socket.on('error', (e) => { clearTimeout(timer); reject(e); });
});

const clickMenu = (code) => `(async () => {
  const menu = document.getElementById('langMenu');
  if (menu.classList.contains('hidden')) document.getElementById('langBtn').click();
  await new Promise((r) => setTimeout(r, 250));
  const item = menu.querySelector('.lang-item[data-lang="${code}"]');
  if (!item) return 'item not found';
  item.click();
  await new Promise((r) => setTimeout(r, 1800));
  return 'html=' + document.documentElement.lang
    + ' i18n=' + window.i18n.getLang()
    + ' label=' + document.getElementById('langLabel').textContent
    + ' nav=' + document.querySelector('[data-i18n=navHome]').textContent;
})()`;
const probe = 'JSON.stringify({ lang: window.overlayI18n ? window.overlayI18n.lang() : null, eyebrow: (document.querySelector(".ol-eyebrow")||{}).textContent, first: (document.body.innerText||"").replace(/\\s+/g," ").slice(0,90) })';

(async () => {
  const targets = await get('/json/list');
  const main = targets.find((t) => t.url.endsWith('index.html')).webSocketDebuggerUrl;
  const panel = targets.find((t) => t.url.endsWith('overlay-panel.html')).webSocketDebuggerUrl;
  console.log('panel before :', await evaluate(panel, probe));
  console.log(`switch to ${wanted}:`, await evaluate(main, clickMenu(wanted)));
  console.log('panel after  :', await evaluate(panel, probe));
})().catch((e) => { console.error('failed:', e.message); process.exit(1); });
