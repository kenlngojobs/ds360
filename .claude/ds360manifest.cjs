const crypto = require('crypto'), fs = require('fs'), path = require('path');
const dist = 'C:/Users/kenln/Cowork/DS360/dist';
const manifest = {};
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else {
      const rel = path.relative(dist, full).split(path.sep).join('/');
      manifest[rel] = crypto.createHash('md5').update(fs.readFileSync(full)).digest('hex');
    }
  }
}
walk(dist);
fs.writeFileSync('C:/Users/kenln/Cowork/DS360/.claude/ds360sync-manifest.json', JSON.stringify(manifest, null, 2));
console.log('Manifest updated: ' + Object.keys(manifest).length + ' files.');
