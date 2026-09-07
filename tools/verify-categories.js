const fs=require('fs');
const slugs=['anxiety-and-panic-disorders','anxiety-and-seizure-disorders','sleep-and-insomnia-medication','short-term-sedation','nerve-pain-and-anxiety-related-medicines','moderate-severe-pain','adhd-and-wakefulness'];
const base='http://localhost/scotiameds.co.uk/';
const failures=[];

async function request(path,redirect='follow'){
  try{return await fetch(new URL(path,base),{redirect})}catch(error){failures.push(`${path}: ${error.message}`);return null}
}

(async()=>{
  for(const slug of slugs){
    const route=`shop/category/${slug}`;
    const response=await request(route);
    if(!response||response.status!==200){failures.push(`${route}: expected 200, got ${response&&response.status}`);continue}
    const html=await response.text();
    const checks=[
      [/<h1\b[^>]*>[^<]+<\/h1>/i,'H1'],
      [/class="[^"]*\bcategory-layout\b[^"]*"/,'two-column layout'],
      [/id="category-select"/,'category dropdown'],
      [/class="category-product-grid"/,'medicine grid'],
      [/\.\.\/medicine\//,'medicine links'],
      [/class="category-reading"/,'supporting content']
    ];
    for(const [pattern,label] of checks)if(!pattern.test(html))failures.push(`${route}: missing ${label}`);
    const htmlRedirect=await request(route+'.html','manual');
    if(!htmlRedirect||![301,302].includes(htmlRedirect.status)||!htmlRedirect.headers.get('location')?.includes('/scotiameds.co.uk/'+route))failures.push(`${route}.html: incorrect local redirect (${htmlRedirect&&htmlRedirect.status} ${htmlRedirect&&htmlRedirect.headers.get('location')})`);
  }
  const legacy=[
    ['shop/category/adhd-%26-wakefulness','adhd-and-wakefulness'],
    ['shop/category/sleep-%26-insomnia-medication','sleep-and-insomnia-medication'],
    ['shop/category/nerve-pain-%26-anxiety-related-medicines','nerve-pain-and-anxiety-related-medicines']
  ];
  for(const [oldPath,newSlug] of legacy){
    const response=await request(oldPath,'manual'),location=response&&response.headers.get('location');
    if(!response||response.status!==301||!location?.includes('/scotiameds.co.uk/shop/category/'+newSlug))failures.push(`${oldPath}: incorrect legacy redirect (${response&&response.status} ${location})`);
  }
  const productLegacy=await request('shop/diazepam-sedil-5mg','manual');
  if(!productLegacy||productLegacy.status!==301||!productLegacy.headers.get('location')?.includes('/scotiameds.co.uk/shop/medicine/diazepam-sedil-5mg'))failures.push('Existing product redirect is not local/deployment portable');
  const sitemap=fs.readFileSync('sitemap.xml','utf8');
  for(const slug of slugs)if(!sitemap.includes(`<loc>https://www.scotiameds.co.uk/shop/category/${slug}</loc>`))failures.push(`sitemap missing ${slug}`);
  console.log(JSON.stringify({categoryRoutes:slugs.length,passed:failures.length===0,failures},null,2));
  process.exitCode=failures.length?1:0;
})().catch(error=>{console.error(error);process.exitCode=1});
