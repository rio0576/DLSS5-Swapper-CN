// Compares translation key coverage between English and the other languages.
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const files = ['i18n.js', 'i18n-extra.js'];

global.window = {};
for (const file of files) {
  const code = fs.readFileSync(path.join(dir, file), 'utf8');
  new Function(code)();
}

const { S, LANGS } = global.window.i18n;
const en = new Set(Object.keys(S.en));
console.log('languages:', LANGS.map((l) => l.code).join(', '));
console.log('en keys:', en.size);
const rows = [];
for (const lang of LANGS) {
  const code = lang.code;
  const keys = new Set(Object.keys(S[code] || {}));
  const missing = [...en].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !en.has(k));
  rows.push({ code, total: keys.size, missing: missing.length, extra: extra.length });
  if (missing.length && missing.length < 25) console.log(` ${code} missing:`, missing.join(', '));
  if (extra.length) console.log(` ${code} extra:`, extra.join(', '));
}
console.table(rows);
// Also report which langs the renderer lists but have no strings at all.
for (const lang of LANGS) if (!S[lang.code]) console.log('NO STRINGS for', lang.code);
