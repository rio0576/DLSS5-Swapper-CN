// Switches the running app's language the way a person would (through the
// language menu) and reads the in-game panel window before and after. This is
// the one mechanism that cannot be checked without the app running.
const http = require('http');
const WebSocket = require(process.argv[3] || 'ws');
const port = Number(process.argv[2] || 9333);

const get = (path) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path }, (res) => {
    let body = '';
    res.on('data', (c) => { body += c; });
    res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
  }).on('error', reject);
});

const evaluate = (url, expression) => new Promise((resolve, reject) => {
  const socket = new WebSocket(url, { maxPayload: 64 * 1024 * 1024 });
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

const target = (targets, name) => targets.find((t) => t.url.endsWith(name)).webSocketDebuggerUrl;
const switchTo = (code) => `(async () => {
  document.getElementById('langBtn').click();
  await new Promise((r) => setTimeout(r, 300));
  const item = document.querySelector('#langMenu .lang-item[data-lang="${code}"]');
  if (!item) return 'no such language item';
  item.click();
  await new Promise((r) => setTimeout(r, 1500));
  return document.documentElement.lang + ' / nav=' + document.querySelector('[data-i18n=navHome]').textContent;
})()`;
const panelText = 'document.body ? document.body.innerText.replace(/\\s+/g, " ").slice(0, 160) : ""';

(async () => {
  const targets = await get('/json/list');
  const main = target(targets, 'index.html');
  const panel = target(targets, 'overlay-panel.html');
  console.log('panel before switching:', await evaluate(panel, panelText));
  console.log('\n-> switching to English:', await evaluate(main, switchTo('en')));
  console.log('panel now:', await evaluate(panel, panelText));
  console.log('\n-> switching back to Chinese:', await evaluate(main, switchTo('zh')));
  console.log('panel now:', await evaluate(panel, panelText));
})().catch((e) => { console.error('lang check failed:', e.message); process.exit(1); });
