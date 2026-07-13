// Checks the shelf packer that index.html ships. Run: node test-layout.js
// ponytail: evals the packer straight out of the page so the test can't drift from what renders.
const assert = require('assert');
const fs = require('fs');

const src = fs.readFileSync(__dirname + '/index.html', 'utf8');
const geometry = src.match(/\/\/ print geometry[\s\S]*?\n\n/)[0].split('\n').filter(l => l.startsWith('const NAME_H')).join('\n');
const packer = src.match(/function layout\(players\)\{[\s\S]*?\n\}/)[0];

const load = filmW => eval(`(() => { ${geometry}; const filmW = ${filmW}; ${packer}; return layout; })()`);

const roster = Array.from({length: 100}, (_, i) => ({name: 'ABDULRAHMAN'.slice(0, (i % 9) + 3), num: String(i % 100)}));

for (const w of [22, 24, 30]) {
  const {blocks, len, used} = load(w)(roster);

  assert.strictEqual(blocks.length, 100, 'every player gets a block');

  for (const b of blocks) {
    assert.ok(b.x + b.w <= w - 0.5 + 1e-9, `block ${b.id} runs off the ${w}" film`);
    assert.ok(b.y + b.h <= len + 1e-9, `block ${b.id} runs past the sheet end`);
  }

  for (let i = 0; i < blocks.length; i++)
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i], b = blocks[j];
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      assert.ok(!overlap, `blocks ${a.id} and ${b.id} overlap — that is a reprint`);
    }

  const eff = used / (w * len);
  assert.ok(eff > 0 && eff <= 1, `efficiency out of range on ${w}" film: ${eff}`);
  console.log(`${w}" film — 100 players, ${len.toFixed(1)}" of film, ${Math.round(eff * 100)}% efficient, no overlaps`);
}

console.log('OK');
