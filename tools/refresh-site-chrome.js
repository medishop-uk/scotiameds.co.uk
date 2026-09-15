const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => fs.writeFileSync(path.join(root, file), value);
const categoryFiles = fs.readdirSync(path.join(root, 'shop/category')).filter(x => x.endsWith('.html'));
const categories = categoryFiles.map(file => {
  const html = read('shop/category/' + file);
  return [file.replace('.html', ''), html.match(/<title>(.*?) UK \|/)[1]];
});
function navigation(prefix, home = false) {
  return `<a href="${prefix || './'}">Home</a><details class="nav-categories"><summary>All Categories <span aria-hidden="true">&#8964;</span></summary><div class="nav-category-menu">${categories.map(([slug, name]) => `<a href="${prefix}shop/category/${slug}">${name}</a>`).join('')}</div></details><a href="${prefix}shop/">Shop</a><a href="${prefix}blog/">Blog</a><a href="${prefix}about-us/">About Us</a><a href="${prefix}contact-us/">Contact Us</a><button type="button" class="nav-basket" ${home ? 'data-cart-open' : 'data-commerce-open'}>Basket <b ${home ? 'data-cart-count' : 'data-commerce-count'}>0</b></button><a class="nav-whatsapp" href="https://wa.me/447438135064" target="_blank" rel="noopener">WhatsApp</a><a class="nav-telegram" href="https://t.me/BenzoAddy" target="_blank" rel="noopener">Telegram</a>`;
}
function headers(value, prefix, home = false) {
  value = value.replace(/(<nav class=['"](?:desktop-nav|page-nav|mobile-nav|page-mobile-nav)['"]>)[\s\S]*?<\/nav>/g, (_, open) => open + navigation(prefix, home) + '</nav>');
  value = value.replace(/(<div class=['"](?:header-actions|page-actions)['"]>)[\s\S]*?(<button class=['"](?:menu-button|page-menu)['"])/g, '$1$2');
  return value;
}
// Empty mappings keep the existing full-size placeholder panels and fallback rendering.
for (const file of ['assets/js/site.js', 'assets/js/category.js', 'assets/js/pages.js', 'assets/js/product.js', 'tools/build-categories.js']) {
  let value = read(file).replace(/((?:var|const) (?:medicineImages|productImages)=)\{[\s\S]*?\};/g, '$1{};');
  if (file === 'assets/js/pages.js') value = headers(value, '${root}/');
  if (file === 'tools/build-categories.js') value = headers(value, '../../');
  write(file, value);
}
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name.startsWith('.') || entry.name === 'tools') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith('.html')) files.push(file);
  }
}
walk(root);
for (const file of files) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const prefix = '../'.repeat(relative.split('/').length - 1);
  const home = relative === 'index.html';
  let value = headers(fs.readFileSync(file, 'utf8'), prefix, home);
  value = value.replace(/(<nav data-source-navigation[^>]*>)[\s\S]*?<\/nav>/, (_, open) => open + navigation(prefix) + '</nav>');
  value = value.replace(/(assets\/img\/)medicine\/[^"'<>\s]+/g, '$1medicine-product.svg');
  if (!home) {
    const scripts = ['config', 'commerce'].filter(name => !value.includes('assets/js/' + name + '.js')).map(name => `<script defer src="${prefix}assets/js/${name}.js"></script>`).join('');
    value = value.replace(/(<script defer src=["'][^"']*assets\/js\/site\.js[^"']*["'][^>]*>)/, scripts + '$1');
  }
  value = value.replace(/(assets\/(?:js|css)\/[^\s"'<>?]+\.(?:js|css))\?v=[^\s"'<>]+/g, '$1');
  if (!value.includes('assets/css/navigation.css')) value = value.replace('</head>', `<link rel="stylesheet" href="${prefix}assets/css/navigation.css">\n</head>`);
  fs.writeFileSync(file, value);
}
console.log(`Updated navigation and medicine placeholders on ${files.length} pages.`);
