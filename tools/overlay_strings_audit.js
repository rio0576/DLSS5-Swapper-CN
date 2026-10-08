// Counts user-visible English string literals in the overlay renderer files.
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const files = ['overlay-panel.js', 'overlay-live.js', 'overlay-surface.js', 'overlay-gallery.js'];
const literal = /(['"`])((?:[^'"`\\\n]|\\.)*?)\1/g;
const looksLikeText = (s) =>
  /[A-Za-z]/.test(s) && /[a-z]/.test(s) && s.trim().length > 2 &&
  !/^[a-z0-9_.\-/]+$/.test(s) && /[ A-Za-z]/.test(s);

let total = 0;
for (const file of files) {
  const source = fs.readFileSync(path.join(dir, file), 'utf8');
  const found = new Set();
  for (const match of source.matchAll(literal)) if (looksLikeText(match[2])) found.add(match[2]);
  total += found.size;
  console.log(`${file}: ${found.size}`);
  if (process.argv[3] === '--list') for (const s of found) console.log('   ', s);
}
console.log('total unique:', total);
