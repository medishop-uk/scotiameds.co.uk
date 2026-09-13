const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const base = 'http://localhost/scotiameds.co.uk/';
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    if (entry.name.startsWith('.') || entry.name === 'tools') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith('.html')) files.push(file);
  }
}
walk(root);
const pattern = /(<a\b[^>]*\bhref\s*=\s*["'])(https?:\/\/(?:www\.)?scotiameds\.co\.uk[^"']*)/gi;
(async () => {
  const targets = new Map();
  for (const file of files) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(pattern)) {
      const original = match[2];
      if (targets.has(original)) continue;
      const url = new URL(original.replaceAll('&amp;', '&'));
      const response = await fetch(base + url.pathname.replace(/^\//, '') + url.search);
      if (!response.ok || !response.url.startsWith(base)) throw new Error('Invalid local destination: ' + original + ' -> ' + response.url);
      targets.set(original, response.url.slice(base.length) + url.hash);
    }
  }
  let count = 0;
  for (const file of files) {
    const prefix = '../'.repeat(path.relative(root, file).split(path.sep).length - 1);
    const original = fs.readFileSync(file, 'utf8');
    const updated = original.replace(pattern, (_, opening, url) => {
      count++;
      return opening + (prefix + targets.get(url) || './');
    });
    if (updated !== original) fs.writeFileSync(file, updated);
  }
  console.log(`Normalized ${count} internal links to current, deployment-portable routes.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
