const crypto = require('crypto'), fs = require('fs'), path = require('path');
const dist = 'C:/Users/kenln/Cowork/DS360/dist';
const mf = 'C:/Users/kenln/Cowork/DS360/.claude/ds360sync-manifest.json';
const old = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')) : {};
const changed = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else {
      const rel = path.relative(dist, full).split(path.sep).join('/');
      const hash = crypto.createHash('md5').update(fs.readFileSync(full)).digest('hex');
      if (old[rel] !== hash) changed.push(rel);
    }
  }
}
walk(dist);
console.log(JSON.stringify(changed));
