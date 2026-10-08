// Renders the compact panel's DOM outside Electron and reports what a person
// would read, in both languages. Catches a broken template or a missing key.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require(process.argv[3] || 'jsdom');

const renderer = process.argv[2];
const dom = new JSDOM('<!doctype html><html lang="en"><body><div id="panel"></div></body></html>', { runScripts: 'outside-only' });
const w = dom.window;
let language = 'zh';
w.i18n = { getLang: () => language, t: (k) => k, LANGS: [], S: {} };
w.ResizeObserver = class { observe() {} disconnect() {} };
// The panel never talks to the game in this check.
for (const file of ['overlay-i18n.js', 'overlay-panel.js', 'overlay-live.js']) {
  w.eval(fs.readFileSync(path.join(renderer, file), 'utf8'));
}

function text() {
  const root = w.document.getElementById('panel');
  w.mountOverlayLive(root, { designOnly: true });
  return root.textContent.replace(/\s+/g, ' ').trim();
}

const zh = text();
language = 'en';
const en = text();
console.log('=== ZH ===');
console.log(zh);
console.log('=== EN (first 200) ===');
console.log(en.slice(0, 200));
const cjk = (zh.match(/[\u4e00-\u9fff]/g) || []).length;
console.log('=== summary ===');
console.log('chinese glyphs:', cjk);
console.log('ascii words left in zh:', [...new Set((zh.match(/[A-Za-z][A-Za-z .\/()#-]{3,}/g) || []).map((s) => s.trim()))].join(' | '));
console.log('english mode still english:', /Preview only|Waiting for game connection|Preview only/.test(en));
