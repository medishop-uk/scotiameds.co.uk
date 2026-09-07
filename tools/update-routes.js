const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const slugs=['anxiety-and-panic-disorders','anxiety-and-seizure-disorders','sleep-and-insomnia-medication','short-term-sedation','nerve-pain-and-anxiety-related-medicines','moderate-severe-pain','adhd-and-wakefulness'];

const htaccessFile=path.join(root,'.htaccess');
let rules=fs.readFileSync(htaccessFile,'utf8');
const redirectBlock=`# Legacy category slugs with ampersands -> portable SEO-friendly slugs.
RewriteRule ^shop/category/adhd-&-wakefulness(?:\\.html)?$ shop/category/adhd-and-wakefulness [R=301,L,NE]
RewriteRule ^shop/category/sleep-&-insomnia-medication(?:\\.html)?$ shop/category/sleep-and-insomnia-medication [R=301,L,NE]
RewriteRule ^shop/category/nerve-pain-&-anxiety-related-medicines(?:\\.html)?$ shop/category/nerve-pain-and-anxiety-related-medicines [R=301,L,NE]

`;
if(!rules.includes('# Legacy category slugs'))rules=rules.replace('# Canonicalise explicit index and .html requests.',redirectBlock+'# Canonicalise explicit index and .html requests.');
rules=rules.split(/\r?\n/).map(line=>{
  if(!/^RewriteRule\s/.test(line))return line;
  if(/\[R=301/i.test(line))return line.replace(/^(RewriteRule\s+\S+\s+)\//,'$1');
  return line;
}).join('\n');
rules=rules.replace('RewriteRule ^(.*/)?index\\.html$ /$1 [R=301,L,NE]','RewriteRule ^(.*/)?index\\.html$ $1 [R=301,L,NE]');
rules=rules.replace('RewriteRule ^(.+)\\.html$ /$1 [R=301,L,NE]','RewriteRule ^(.+)\\.html$ $1 [R=301,L,NE]');
fs.writeFileSync(htaccessFile,rules.trimEnd()+'\n','utf8');

const sitemapFile=path.join(root,'sitemap.xml');
let sitemap=fs.readFileSync(sitemapFile,'utf8').replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,'<lastmod>2026-09-07</lastmod>');
const entries=slugs.filter(slug=>!sitemap.includes(`/shop/category/${slug}</loc>`)).map(slug=>`  <url>
    <loc>https://www.scotiameds.co.uk/shop/category/${slug}</loc>
    <lastmod>2026-09-07</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');
if(entries)sitemap=sitemap.replace(/\s*<\/urlset>/,`\n${entries}\n</urlset>`);
fs.writeFileSync(sitemapFile,sitemap,'utf8');
console.log('Updated portable redirects and sitemap category entries.');
