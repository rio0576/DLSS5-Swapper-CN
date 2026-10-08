// Walks every page of the running app over the DevTools protocol and prints
// what is on it, so a missing translation cannot hide behind a tab you did not
// open by hand.
const http = require('http');
const WebSocket = require(process.argv[3] || 'ws');
const port = Number(process.argv[2] || 9333);
const target = process.argv[4] || 'index.html';

const get = (path) => new Promise((resolve, reject) => {
  http.get({ host: '127.0.0.1', port, path }, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
  }).on('error', reject);
});

const expression = process.argv[5] || `(async () => {
  const out = {};
  for (const item of [...document.querySelectorAll('.nav-item')]) {
    item.click();
    await new Promise((r) => setTimeout(r, 500));
    const view = document.querySelector('.view.active');
    out[item.dataset.view] = (view ? view.innerText : '(none)').replace(/\\s+/g, ' ').trim().slice(0, 700);
  }
  return JSON.stringify(out, null, 1);
})()`;

(async () => {
  const page = (await get('/json/list')).find((t) => t.url.endsWith(target));
  if (!page) throw Error(`no target ${target}`);
  const socket = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
  await new Promise((resolve, reject) => { socket.on('open', resolve); socket.on('error', reject); });
  const result = await new Promise((resolve, reject) => {
    socket.on('message', (raw) => {
      const message = JSON.parse(raw);
      if (message.id !== 1) return;
      if (message.result?.exceptionDetails) return reject(Error(message.result.exceptionDetails.text));
      resolve(message.result?.result?.value);
    });
    socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, returnByValue: true, awaitPromise: true } }));
    setTimeout(() => reject(Error('timeout')), 30000);
  });
  socket.close();
  console.log(result);
})().catch((error) => { console.error('views failed:', error.message); process.exit(1); });
