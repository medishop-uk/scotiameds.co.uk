const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'shop', 'category');
const productImage = '../../assets/img/medicine-product.svg';
const medicineImages={'alprazolam-alprax-2mg':'alprax-xr2.jpg','bromazepam':'broze.jpg','co-codamol':'co-codamol.jpg','lorazepam-ativan-2mg':'lorazepam.jpg','nitrazepam-noctin-5mg':'noctin.jpg','clonazepam-rivotril-2mg':'rivotril-2.jpg','diazepam-sedil-5mg':'sedil.jpg','diazepam-martin-dow-10mg':'valium.jpg','zopiclone-7-5mg':'zopiclone-tablets.jpg'};

const categories = [
  {
    slug: 'adhd-and-wakefulness', source: 'adhd-and-wakefulness.html',
    name: 'ADHD & Wakefulness Medicines', short: 'ADHD & Wakefulness',
    h1: 'ADHD & Wakefulness Medicines in the UK',
    fallback: 'Explore information about ADHD and wakefulness medicines, including available options for eligible patients who have completed the appropriate clinical checks.',
    products: ['ritalin-alaradate-10mg', 'modafinil']
  },
  {
    slug: 'anxiety-and-panic-disorders', source: 'anxiety-and-panic-disorders.html',
    name: 'Anxiety & Panic Disorder Medicines', short: 'Anxiety & Panic',
    h1: 'Anxiety & Panic Disorder Medicines in the UK',
    fallback: 'Explore medicine information for anxiety and panic disorders. Suitability depends on individual symptoms, medical history and professional assessment.',
    products: ['alprazolam-alprax-2mg', 'alprazolam-alprax-1mg', 'alprazolam-rlam-1mg', 'lorazepam-ativan-2mg', 'bromazepam', 'diazepam-martin-dow-10mg', 'diazepam-easium-10mg', 'diazepam-sedil-5mg', 'etizolam']
  },
  {
    slug: 'anxiety-and-seizure-disorders', source: 'anxiety-and-seizure-disorders.html',
    name: 'Anxiety & Seizure Disorder Medicines', short: 'Anxiety & Seizures',
    h1: 'Anxiety & Seizure Disorder Medicines in the UK',
    fallback: 'Review medicine information for selected anxiety and seizure disorders. Treatment choice and dosage must be determined through appropriate medical assessment.',
    products: ['clonazepam-pase-2mg', 'clonazepam-rivotril-2mg', 'clobazam', 'diazepam-martin-dow-10mg', 'benzit']
  },
  {
    slug: 'moderate-severe-pain', source: 'moderate-severe-pain.html',
    name: 'Moderate to Severe Pain Medicines', short: 'Pain Management',
    h1: 'Moderate to Severe Pain Medicines in the UK',
    fallback: 'Review medicine information for moderate to severe pain. These medicines require careful suitability, interaction and prescription checks.',
    products: ['tapentadol-100mg', 'tramadol-100mg', 'co-codamol']
  },
  {
    slug: 'nerve-pain-and-anxiety-related-medicines', source: 'nerve-pain-and-anxiety-related-medicines.html',
    name: 'Nerve Pain & Neuropathy Medicines', short: 'Nerve Pain & Neuropathy',
    h1: 'Nerve Pain & Neuropathy Medicines in the UK',
    fallback: 'Explore information about medicines used for neuropathic or nerve-related pain. A clinician should assess the cause of symptoms and treatment suitability.',
    products: ['pregabalin-pregacare-nt']
  },
  {
    slug: 'short-term-sedation', source: 'short-term-sedation.html',
    name: 'Short-term Sedation Medicines', short: 'Short-term Sedation',
    h1: 'Short-term Sedation Medicines in the UK',
    fallback: 'Review information about short-term sedation medicines. These treatments require professional assessment because they may cause drowsiness, interactions and dependence.',
    products: ['midazolam-midolam-7-5mg', 'lorazepam-ativan-2mg', 'diazepam-martin-dow-10mg', 'bromazepam']
  },
  {
    slug: 'sleep-and-insomnia-medication', source: 'sleep-and-insomnia-medication.html',
    name: 'Sleep & Insomnia Medication', short: 'Sleep & Insomnia',
    h1: 'Sleep & Insomnia Medication in the UK',
    fallback: 'Explore information about medicines used for short-term sleep difficulties and insomnia. Treatment should follow an assessment of symptoms, risks and other medicines.',
    products: ['nitrazepam-noctin-5mg', 'zopiclone-7-5mg', 'temazepam', 'zolpidem', 'mirtazapine-miramind']
  }
];

const categoryOrder = ['anxiety-and-panic-disorders','anxiety-and-seizure-disorders','sleep-and-insomnia-medication','short-term-sedation','nerve-pain-and-anxiety-related-medicines','moderate-severe-pain','adhd-and-wakefulness'];
categories.sort((a,b) => categoryOrder.indexOf(a.slug) - categoryOrder.indexOf(b.slug));

const products = {
  'alprazolam-alprax-2mg': ['Alprax Alprazolam 2mg', 'Anxiety & panic', 20],
  'alprazolam-alprax-1mg': ['Alprazolam Alprax 1mg', 'Anxiety & panic', 20],
  'alprazolam-rlam-1mg': ['Rlam Alprazolam 1mg', 'Anxiety & panic', 20],
  'benzit': ['Benzit', 'Specialist medicine', 25],
  'bromazepam': ['Bromazepam', 'Short-term anxiety', 25],
  'clobazam': ['Clobazam', 'Anxiety & seizures', 25],
  'clonazepam-pase-2mg': ['Pase Clonazepam 2mg', 'Anxiety & seizures', 20],
  'clonazepam-rivotril-2mg': ['Rivotril Clonazepam 2mg', 'Anxiety & seizures', 20],
  'co-codamol': ['Co-codamol', 'Pain management', 25],
  'diazepam-easium-10mg': ['Easium Diazepam', 'Anxiety & sedative', 50],
  'diazepam-martin-dow-10mg': ['Diazepam Martin Dow 10mg', 'Anxiety & sedative', 20],
  'diazepam-sedil-5mg': ['Sedil Diazepam 5mg', 'Anxiety & sedative', 30],
  'etizolam': ['Etizolam', 'Anxiety & sedative', 25],
  'lorazepam-ativan-2mg': ['Lorazepam Ativan 2mg', 'Short-term anxiety', 20],
  'midazolam-midolam-7-5mg': ['Midolam Midazolam 7.5mg', 'Sedation', 20],
  'mirtazapine-miramind': ['Miramind Mirtazapine', 'Mental health & sleep', 25],
  'modafinil': ['Modafinil', 'Wakefulness', 25],
  'nitrazepam-noctin-5mg': ['Noctin Nitrazepam 5mg', 'Sleep & insomnia', 20],
  'pregabalin-pregacare-nt': ['Pregabalin Pregacare', 'Nerve pain', 30],
  'ritalin-alaradate-10mg': ['Ritalin Alaradate 10mg', 'ADHD & wakefulness', 40],
  'tapentadol-100mg': ['Tapentadol 100mg', 'Pain management', 25],
  'temazepam': ['Temazepam', 'Sleep & insomnia', 28],
  'tramadol-100mg': ['Tramadol 100mg', 'Pain management', 20],
  'zolpidem': ['Zolpidem', 'Sleep & insomnia', 25],
  'zopiclone-7-5mg': ['Zopiclone 7.5mg', 'Sleep & insomnia', 20]
};

function text(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&rsquo;/gi, "'").replace(/\s+/g, ' ').trim();
}

function neutral(value) {
  return value.replace(/ScotiamedsUK/gi, 'ScotiaMeds').replace(/Scotiameds/gi, 'ScotiaMeds').replace(/\bordering\b/gi, 'requesting').replace(/\borders\b/gi, 'requests').replace(/\bordered\b/gi, 'requested').replace(/\border\b/gi, 'request');
}

function cleanSource(html) {
  let body = (html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i) || [])[1] || '';
  body = neutral(body);
  body = body.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (all, inner) => /^(?:type|meta title|meta description)\s*:|^=+$/i.test(text(inner)) || !text(inner) ? '' : all);
  body = body.replace(/<span\b([^>]*)>([\s\S]*?)<\/span>/gi, (_, attrs, inner) => /font-weight\s*:\s*700/i.test(attrs) ? `<strong>${inner}</strong>` : inner);
  body = body.replace(/\s(?:style|class|id)=(?:"[^"]*"|'[^']*')/gi, '');
  body = body.replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, '');
  body = body.replace(/<h3>(\s*<strong>)?(Why[^<]+)(<\/strong>\s*)?<\/h3>/gi, '<h2>$1$2$3</h2>');
  return body.trim();
}

function contentParts(category) {
  const raw = fs.readFileSync(path.join(sourceDir, category.source), 'utf8');
  if (/class=\"[^\"]*category-layout/.test(raw)) {
    const headings=[...raw.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi)];
    const lastHeading=headings[headings.length-1];
    let lead=category.fallback;
    if(lastHeading){const after=raw.slice(lastHeading.index+lastHeading[0].length),match=after.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);if(match)lead=neutral(text(match[1]))}
    const faqIndex=raw.toLowerCase().lastIndexOf('faq about');
    const contentMarker=faqIndex>=0?faqIndex:raw.toLowerCase().lastIndexOf('frequently asked questions');
    if(contentMarker>=0){const articleStart=raw.lastIndexOf('<article',contentMarker),open=raw.indexOf('>',articleStart)+1,close=raw.indexOf('</article>',open);if(articleStart>=0&&open>0&&close>open)return{lead,content:raw.slice(open,close).trim()}}
    const genericContent='<h2>Why review '+category.short.toLowerCase()+' options carefully?</h2><p>Medicine suitability depends on your symptoms, health history, current treatments and potential interactions. Review the medicine information and speak with an appropriate healthcare professional before making a request.</p><h2>Frequently asked questions</h2><h3>How do I choose a suitable medicine?</h3><p>Use the category list to compare relevant medicine information. A qualified professional should confirm whether a treatment is appropriate for you.</p><h3>Are these medicines suitable for long-term use?</h3><p>That depends on the medicine and your circumstances. Some treatments are intended only for short-term use and should not be stopped suddenly without medical advice.</p><h3>Where can I find prices and pack options?</h3><p>Open an individual medicine page to review its available price tiers and further product information.</p>';
    return {lead,content:genericContent};
  }
  let content = cleanSource(raw);
  content = content.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, '');
  let lead = '';
  content = content.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/i, (all, inner) => { lead = text(inner); return ''; });
  lead = neutral(lead || category.fallback);
  if (!/<h2\b/i.test(content)) {
    content += `<h2>Why review ${category.short.toLowerCase()} options carefully?</h2><p>Medicine suitability depends on your symptoms, health history, current treatments and potential interactions. Review the medicine information and speak with an appropriate healthcare professional before making a request.</p><h2>Frequently asked questions</h2><h3>How do I choose a suitable medicine?</h3><p>Use the category list to compare relevant medicine information. A qualified professional should confirm whether a treatment is appropriate for you.</p><h3>Are these medicines suitable for long-term use?</h3><p>That depends on the medicine and your circumstances. Some treatments are intended only for short-term use and should not be stopped suddenly without medical advice.</p><h3>Where can I find prices and pack options?</h3><p>Open an individual medicine page to review its available price tiers and further product information.</p>`;
  }
  return { lead, content };
}

function categoryLinks(active) {
  return categories.map(item => `<a${item.slug === active ? ' class="active" aria-current="page"' : ''} href="${item.slug}">${item.name}</a>`).join('');
}

function cards(category) {
  return category.products.map(slug => {
    const item = products[slug];
    if (!item) throw new Error(`Unknown product ${slug}`);
    return `<article class="category-product-card"><a class="category-product-image" href="../medicine/${slug}" aria-label="View ${item[0]}"><img src="${medicineImages[slug]?'../../assets/img/medicine/'+medicineImages[slug]:productImage}" alt="${item[0]}"></a><div class="category-product-body"><p class="category-product-label">${item[1]}</p><h2><a href="../medicine/${slug}">${item[0]}</a></h2><p>Review medicine information, available pack options and important safety guidance.</p><div class="category-product-footer"><span><small>Prices from</small><strong>£${item[2]}</strong></span><a class="page-cta" href="../medicine/${slug}">View medicine</a></div></div></article>`;
  }).join('');
}

function navDropdown(prefix, active) {
  const links = categories.map(item => `<a${item.slug === active ? ' class="active"' : ''} href="${prefix}shop/category/${item.slug}">${item.name}</a>`).join('');
  return `<details class="nav-categories"><summary>All Categories <span aria-hidden="true">⌄</span></summary><div class="nav-category-menu">${links}</div></details>`;
}

function page(category) {
  const parts = contentParts(category);
  const title = `${category.name} UK | ScotiaMeds`;
  const description = `Browse ${category.name.toLowerCase()}, relevant product information, available prices and safety guidance from ScotiaMeds in the UK.`;
  const canonical = `https://www.scotiameds.co.uk/shop/category/${category.slug}`;
  const schema = JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:category.name,description,url:canonical});
  const options = categories.map(item => `<option value="${item.slug}"${item.slug === category.slug ? ' selected' : ''}>${item.name}</option>`).join('');
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description.replace(/"/g, '&quot;')}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:site_name" content="ScotiaMeds"><meta property="og:title" content="${title}"><meta property="og:description" content="${description.replace(/"/g, '&quot;')}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary">
<meta name="google-site-verification" content="e1CFyKVjQFKUBnqoAai2y5UcGnuRVNiNf8-Hx8d7iEo">
<script type="application/ld+json">${schema}</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Z3FTZ8S5H9"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-Z3FTZ8S5H9');</script>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f)})(window,document,'script','dataLayer','GTM-WR9Q2B6H');</script>
<link rel="stylesheet" href="../../assets/css/pages.css"><link rel="stylesheet" href="../../assets/css/category.css">
<script defer src="../../assets/js/category.js"></script><script defer src="../../assets/js/site.js"></script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WR9Q2B6H" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<a class="page-skip" href="#page-content">Skip to content</a><div class="page-notice"><div class="page-container"><p>Private UK-wide delivery</p><p><a href="../../#how-it-works">How requests work</a></p></div></div>
<header class="page-header"><div class="page-container page-header-inner"><a class="page-brand" href="../../"><img src="../../assets/img/logo.svg" alt="ScotiaMeds"></a><nav class="page-nav">${navDropdown('../../', category.slug)}<a href="../../">Home</a><a class="active" href="../">Shop</a><a href="../../blog/">Blog</a><a href="../../about-us/">About Us</a><a href="../../contact-us/">Contact Us</a></nav><div class="page-actions"><a class="nav-contact nav-whatsapp" href="https://wa.me/447438135064" target="_blank" rel="noopener">WhatsApp</a><a class="nav-contact nav-telegram" href="https://t.me/BenzoAddy" target="_blank" rel="noopener">Telegram</a><button class="page-menu" aria-label="Open menu" aria-expanded="false"><i></i><i></i><i></i></button></div></div><nav class="page-mobile-nav">${navDropdown('../../', category.slug)}<a href="../../">Home</a><a href="../">Shop</a><a href="../../blog/">Blog</a><a href="../../about-us/">About Us</a><a href="../../contact-us/">Contact Us</a></nav></header>
<main id="page-content"><section class="category-hero"><div class="page-container"><nav class="category-breadcrumb" aria-label="Breadcrumb"><a href="../../">Home</a><span>›</span><a href="../">Shop</a><span>›</span><span>${category.name}</span></nav><p class="page-kicker">MEDICINE CATEGORY</p><h1>${category.h1}</h1><p>${parts.lead}</p></div></section>
<section class="category-catalogue"><div class="page-container category-layout"><aside class="category-sidebar"><label for="category-select">Browse categories</label><select id="category-select">${options}</select><nav aria-label="Medicine categories">${categoryLinks(category.slug)}</nav></aside><div class="category-results"><div class="category-results-head"><div><p class="page-kicker">RELEVANT MEDICINES</p><h2>${category.name}</h2></div><span>${category.products.length} option${category.products.length === 1 ? '' : 's'}</span></div><div class="category-product-grid">${cards(category)}</div></div></div></section>
<section class="category-reading"><article class="page-container article-content">${parts.content}</article></section></main>
<footer class="page-footer"><div class="page-container footer-grid"><div class="footer-brand"><img src="../../assets/img/logo.svg" alt="ScotiaMeds"><p>Private, convenient access to healthcare support across the United Kingdom.</p></div><div><h2>EXPLORE</h2><a href="../">Medicines</a><a href="../../blog/">Blog</a><a href="../../about-us/">About Us</a></div><div><h2>SUPPORT</h2><a href="../../contact-us/">Contact Us</a><a href="https://wa.me/447438135064">WhatsApp</a><a href="https://t.me/BenzoAddy">Telegram</a></div><div><h2>IMPORTANT</h2><p class="footer-note">Always read the patient information leaflet and follow professional medical advice.</p></div></div><div class="page-container footer-bottom"><span>© ${new Date().getFullYear()} ScotiaMeds. All rights reserved.</span><span>Keep medicines out of reach of children.</span></div></footer>
</body></html>`;
}

for (const category of categories) fs.writeFileSync(path.join(sourceDir, `${category.slug}.html`), page(category), 'utf8');
console.log(`Built ${categories.length} consistent category pages.`);

