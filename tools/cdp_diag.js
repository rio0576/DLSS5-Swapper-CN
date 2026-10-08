// One-off diagnostics: what the panel window believes its language is, and
// what the main window's language menu actually contains.
const http = require('http');
const WebSocket = require(process.argv[3] || 'ws');
const port = Number(process.argv[2] || 9333);

const get = (p) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path: p }, (res) => {
    let body = '';
    res.on('data', (c) => { body += c; });
    res.on('end', () => resolve(JSON.parse(body)));
  }).on('error', reject);
});

const evaluate = (url, expression) => new Promise((resolve, reject) => {
  const socket = new WebSocket(url, { maxPayload: 32 * 1024 * 1024 });
  const timer = setTimeout(() => { socket.terminate(); reject(Error('timeout')); }, 12000);
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

(async () => {
  const targets = await get('/json/list');
  const panel = targets.find((t) => t.url.endsWith('overlay-panel.html')).webSocketDebuggerUrl;
  const main = targets.find((t) => t.url.endsWith('index.html')).webSocketDebuggerUrl;
  console.log('panel  overlayI18n.lang():', await evaluate(panel, 'window.overlayI18n.lang()'));
  console.log('panel  eyebrow text      :', await evaluate(panel, 'document.querySelector(".ol-eyebrow").textContent'));
  console.log('main   i18n.getLang()    :', await evaluate(main, 'window.i18n.getLang()'));
  console.log('main   documentElement   :', await evaluate(main, 'document.documentElement.lang'));
  console.log('main   navChat           :', await evaluate(main, 'document.getElementById("navChat").textContent'));
  console.log('main   langMenu items    :', await evaluate(main, '(function(){document.getElementById("langBtn").click();var a=[].slice.call(document.querySelectorAll("#langMenu .lang-item"));return a.length+" items; first: "+a.slice(0,3).map(function(e){return e.dataset.lang+"="+e.textContent.trim()}).join(",")})()'));
})().catch((e) => { console.error('diag failed:', e.message); process.exit(1); });
