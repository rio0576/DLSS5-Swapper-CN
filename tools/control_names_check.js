// Every label the add-on can send must be in the dictionary, or that control
// silently stays English in the game. The expected names are read straight out
// of the upstream sources, not from a list kept by hand.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dictFile = process.argv[2];
const upstream = process.argv[3];

const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(dictFile, 'utf8'), ctx);
const ZH = ctx.window.overlayI18n.strings;

const names = [];
const bridge = fs.readFileSync(path.join(upstream, 'renodx-ui-bridge.hpp'), 'utf8');
const fields = bridge.match(/std::array<field, 15> fields = \{\{([\s\S]*?)\}\};/)[1];
for (const match of fields.matchAll(/\{"([^"]+)",\s*\d\}/g)) names.push(['RenoDX', match[1]]);

const feeder = fs.readFileSync(path.join(upstream, 'feeder-controls.hpp'), 'utf8');
const schema = feeder.match(/schema\(\)\s*\{\s*return\s*\{\{([\s\S]*?)\}\};\s*\}/)[1];
for (const match of schema.matchAll(/\{"[^"]+","([^"]+)"/g)) names.push(['Feeder', match[1]]);

let bad = 0;
for (const [group, name] of names) {
  const ok = Object.prototype.hasOwnProperty.call(ZH, name);
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'MISS'} ${group.padEnd(7)} ${name}${ok ? '  ->  ' + ZH[name] : ''}`);
}
// The short names the panel swaps in for the four Feeder tri-states.
for (const name of ['HDR contract', 'Depth convention', 'Work upscale', 'HDR10 bridge']) {
  const ok = Object.prototype.hasOwnProperty.call(ZH, name);
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'MISS'} panel   ${name}`);
}
console.log(`\nlabels checked: ${names.length + 4}, missing: ${bad}`);
process.exit(bad ? 1 : 0);
