const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

const categories = [
  ['Anxiety & Panic Disorder Medicines','Anxiety & Panic','AP','anxiety-and-panic-disorders'],
  ['Anxiety & Seizure Disorder Medicines','Anxiety & Seizures','SZ','anxiety-and-seizure-disorders'],
  ['Sleep & Insomnia Medication','Sleep & Insomnia','ZZ','sleep-and-insomnia-medication'],
  ['Short-term Sedation Medicines','Short-term Sedation','ST','short-term-sedation'],
  ['Nerve Pain & Neuropathy Medicines','Nerve Pain','NP','nerve-pain-and-anxiety-related-medicines'],
  ['Moderate to Severe Pain Medicines','Pain Management','PM','moderate-severe-pain'],
  ['ADHD & Wakefulness Medicines','ADHD & Wakefulness','AW','adhd-and-wakefulness']
];

function dropdown(prefix) {
  return `<details class="nav-categories"><summary>All Categories <span aria-hidden="true">⌄</span></summary><div class="nav-category-menu">${categories.map(x=>`<a href="${prefix}shop/category/${x[3]}">${x[0]}</a>`).join('')}</div></details>`;
}

function updatePagesJs() {
  const file=path.join(root,'assets','js','pages.js');
  let js=fs.readFileSync(file,'utf8');
  const replacement=`function header(){const active=x=>(kind.startsWith(x)||(kind==='product'&&x==='shop'))?' class="active"':'';return \`<a class="page-skip" href="#page-content">Skip to content</a><div class="page-notice"><div class="page-container"><p>Private UK-wide delivery</p><p>Prescription medicines require a valid prescription · <a href="\${root}/#how-it-works">How requests work</a></p></div></div><header class="page-header"><div class="page-container page-header-inner"><a class="page-brand" href="\${root}/"><img src="\${root}/assets/img/logo.svg" alt="ScotiaMeds"></a><nav class="page-nav">${dropdown('${root}/')}<a href="\${root}/">Home</a><a\${active('shop')} href="\${root}/shop/">Shop</a><a\${active('blog')} href="\${root}/blog/">Blog</a><a\${active('about')} href="\${root}/about-us/">About Us</a><a\${active('contact')} href="\${root}/contact-us/">Contact Us</a></nav><div class="page-actions"><a class="page-cta" href="\${whatsapp}" target="_blank" rel="noopener">Contact on WhatsApp</a><button class="page-menu" aria-label="Open menu" aria-expanded="false"><i></i><i></i><i></i></button></div></div><nav class="page-mobile-nav">${dropdown('${root}/')}<a href="\${root}/">Home</a><a href="\${root}/shop/">Shop</a><a href="\${root}/blog/">Blog</a><a href="\${root}/about-us/">About Us</a><a href="\${root}/contact-us/">Contact Us</a></nav></header>\`}`;
  if(!/function header\(\)\{[\s\S]*?\nfunction footer/.test(js))throw new Error('pages.js header not found');
  js=js.replace(/function header\(\)\{[\s\S]*?\nfunction footer/,replacement+'\nfunction footer');
  fs.writeFileSync(file,js,'utf8');
}

function updateHomepage() {
  const file=path.join(root,'index.html');
  let html=fs.readFileSync(file,'utf8');
  const desktop=`<nav class='desktop-nav'>${dropdown('').replaceAll('"',"'")}<a href='./' aria-current='page'>Home</a><a href='shop/'>Shop</a><a href='blog/'>Blog</a><a href='about-us/'>About Us</a><a href='contact-us/'>Contact Us</a></nav>`;
  html=html.replace(/<nav class='desktop-nav'>[\s\S]*?<\/nav>/,desktop);
  html=html.replace(/<div class='header-actions'>[\s\S]*?<button class='menu-button'/,`<div class='header-actions'><button class='basket-button' data-cart-open>Basket <b data-cart-count>0</b></button><button class='menu-button'`);
  html=html.replace(/<nav class='mobile-nav'>[\s\S]*?<\/nav>/,`<nav class='mobile-nav'>${dropdown('')}<a href='./' aria-current='page'>Home</a><a href='shop/'>Shop</a><a href='blog/'>Blog</a><a href='about-us/'>About Us</a><a href='contact-us/'>Contact Us</a></nav>`);
  fs.writeFileSync(file,html,'utf8');
}

function updateHomepageCatalog() {
  const file=path.join(root,'assets','js','main.js');
  let js=fs.readFileSync(file,'utf8');
  js=js.replace(/^const categories=.*?;\r?\n/,`const categories=${JSON.stringify(categories)};\n`);
  const assignments={
    clonazepam:[1],alprazolam:[0],midazolam:[3],diazepam:[0,1,3],lorazepam:[0,3],tapentadol:[5],tramadol:[5],nitrazepam:[2],zopiclone:[2],pregabalin:[4],ritalin:[6],etizolam:[0,3],modifinal:[6],cocodamol:[5],bromazepam:[0,3],benzit:[1],clobazam:[1],mirtazapine:[2],temazepam:[2],zolpidem:[2]
  };
  const marker="let active='all'";
  if(!js.includes(marker))throw new Error('main.js state marker missing');
  if(!js.includes('const categoryAssignments='))js=js.replace(marker,`const categoryAssignments=${JSON.stringify(assignments)};medicines.forEach(m=>m.c=categoryAssignments[m.id]||[]);\n${marker}`);
  js=js.replace(/function renderCategories\(\)\{[^\n]+/,`function renderCategories(){catGrid.innerHTML=categories.map((x,i)=>'<a class="category-card" href="shop/category/'+x[3]+'"><span class="category-icon">'+x[2]+'</span><h3>'+x[0]+'</h3><p><span>'+medicines.filter(m=>m.c.includes(i)).length+' medicines</span><b>→</b></p></a>').join('');filters.innerHTML='<button class="filter-chip active" data-category="all">All medicines</button>'+categories.map((x,i)=>'<button class="filter-chip" data-category="'+i+'">'+x[1]+'</button>').join('')}`);
  fs.writeFileSync(file,js,'utf8');
}

function updateProgressiveNavigation() {
  const files=[];
  (function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory()){if(!['.git','tools'].includes(entry.name))walk(full)}else if(entry.name.endsWith('.html'))files.push(full)}})(root);
  for(const file of files){
    let html=fs.readFileSync(file,'utf8');
    if(!/<nav data-source-navigation/.test(html))continue;
    const rel=path.relative(root,file).replace(/\\/g,'/');
    const depth=rel.split('/').length-1;
    const prefix='../'.repeat(depth);
    const nav=`<nav data-source-navigation aria-label="Primary navigation"><details><summary>All Categories</summary>${categories.map(x=>`<a href="${prefix}shop/category/${x[3]}">${x[0]}</a>`).join('')}</details><a href="${prefix || './'}">Home</a><a href="${prefix}shop/">Shop</a> <a href="${prefix}blog/">Blog</a> <a href="${prefix}about-us/">About Us</a> <a href="${prefix}contact-us/">Contact Us</a></nav>`;
    html=html.replace(/<nav data-source-navigation[\s\S]*?<\/nav>/,nav);
    fs.writeFileSync(file,html,'utf8');
  }
}

updatePagesJs();
updateHomepage();
updateHomepageCatalog();
updateProgressiveNavigation();
console.log('Updated shared navigation, homepage navigation and category taxonomy.');
