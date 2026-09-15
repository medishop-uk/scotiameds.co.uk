const fs=require('fs');
const path=require('path');
const {spawn}=require('child_process');
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile=path.join(__dirname,'.chrome-image-check');
const port=9346;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
class Cdp{constructor(url){this.id=0;this.pending=new Map();this.ws=new WebSocket(url)}async open(){await new Promise((ok,bad)=>{this.ws.addEventListener('open',ok,{once:true});this.ws.addEventListener('error',bad,{once:true})});this.ws.addEventListener('message',e=>{const m=JSON.parse(e.data),p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result)})}send(method,params={},sessionId){const id=++this.id,payload={id,method,params};if(sessionId)payload.sessionId=sessionId;this.ws.send(JSON.stringify(payload));return new Promise((resolve,reject)=>this.pending.set(id,{resolve,reject}))}}
async function endpoint(){for(let i=0;i<50;i++){try{const r=await fetch(`http://127.0.0.1:${port}/json/version`);if(r.ok)return(await r.json()).webSocketDebuggerUrl}catch(_){}await sleep(200)}throw new Error('Chrome did not start')}
async function evaluate(cdp,sid,expression){const r=await cdp.send('Runtime.evaluate',{expression,returnByValue:true},sid);return r.result.value}
(async()=>{if(fs.existsSync(profile))fs.rmSync(profile,{recursive:true,force:true});const child=spawn(chrome,['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+profile,'--disable-gpu','--no-sandbox'],{stdio:'ignore'}),failures=[];try{const cdp=new Cdp(await endpoint());await cdp.open();const target=await cdp.send('Target.createTarget',{url:'about:blank'}),attached=await cdp.send('Target.attachToTarget',{targetId:target.targetId,flatten:true}),sid=attached.sessionId;await cdp.send('Page.enable',{},sid);
async function visit(pathname,width,height,shot){await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600},sid);await cdp.send('Page.navigate',{url:'http://localhost/scotiameds.co.uk/'+pathname},sid);for(let i=0;i<35;i++){await sleep(150);if(await evaluate(cdp,sid,"document.readyState==='complete'"))break}await sleep(350);if(shot){const data=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},sid);fs.writeFileSync(path.join(__dirname,shot),Buffer.from(data.data,'base64'))}}

let d;
const expected='Home|All Categories|Shop|Blog|About Us|Contact Us|Basket|WhatsApp|Telegram';
const routes=['','shop/','shop/category/anxiety-and-panic-disorders','shop/medicine/alprazolam-alprax-2mg','blog/','about-us/','contact-us/'];
for(const route of routes){for(const width of [390,1024,1440]){
 await visit(route,width,900);
 const mobile=width<=1200;
 if(mobile){await evaluate(cdp,sid,"document.querySelector('.page-menu,.menu-button').click()");await sleep(250)}
 d=await evaluate(cdp,sid,`(()=>{const nav=document.querySelector('${mobile?'.page-mobile-nav,.mobile-nav':'.page-nav,.desktop-nav'}'),labels=[...nav.children].map(x=>x.tagName==='DETAILS'?'All Categories':x.matches('button')?'Basket':x.textContent.trim()),ys=[...nav.children].map(x=>{const r=x.getBoundingClientRect();return r.top+r.height/2}),icons=document.querySelector('.floating-contact'),r=icons.getBoundingClientRect();return{labels:labels.join('|'),visible:nav.getBoundingClientRect().height>0,delta:Math.max(...ys)-Math.min(...ys),overflow:document.documentElement.scrollWidth>innerWidth,icons:icons.querySelectorAll('a').length,fixed:getComputedStyle(icons).position,right:innerWidth-r.right,bottom:innerHeight-r.bottom}})()`);
 if(d.labels!==expected||!d.visible||(!mobile&&d.delta>3)||d.overflow||d.icons!==2||d.fixed!=='fixed'||d.right<0||d.bottom<0)failures.push(route+' width '+width+' '+JSON.stringify(d));
 await evaluate(cdp,sid,`document.querySelector('${mobile?'.page-mobile-nav,.mobile-nav':'.page-nav,.desktop-nav'}').querySelector('button').click()`);
 d=await evaluate(cdp,sid,"!!document.querySelector('.commerce-drawer.open,.drawer.open')");if(!d)failures.push(route+' Basket did not open '+width);
 await evaluate(cdp,sid,"document.querySelector('[data-commerce-close],.drawer.open .drawer-close').click()");
 if(mobile)await evaluate(cdp,sid,"document.querySelector('.page-menu,.menu-button').click()");
 if(route===''||route.startsWith('shop/')){
 await evaluate(cdp,sid,"document.querySelectorAll('.medicine-image-link img,.shop-card img,.category-product-image img,.product-main-image img').forEach(i=>i.loading='eager')");await sleep(200);
 d=await evaluate(cdp,sid,"(()=>{const imgs=[...document.querySelectorAll('.medicine-image-link img,.shop-card img,.category-product-image img,.product-main-image img')];return {count:imgs.length,valid:imgs.every(i=>i.src.endsWith('/medicine-product.svg')&&i.complete&&i.naturalWidth>0)}})()");if(!d.count||!d.valid)failures.push(route+' placeholder failure '+JSON.stringify(d));
 }
 if(width===1440||route==='contact-us/'){const shot=await cdp.send('Page.captureScreenshot',{format:'png'},sid);fs.writeFileSync(path.join(__dirname,'chrome-'+(route.replaceAll('/','-')||'home')+'-'+width+'.png'),Buffer.from(shot.data,'base64'))}
}}
for(const route of ['','assets/css/navigation.css','assets/js/site.js','sitemap.xml']){const r=await fetch('http://localhost/scotiameds.co.uk/'+route);if(!r.ok||!r.headers.get('cache-control')?.includes('no-store'))failures.push('Cache headers '+route)}
const map=await(await fetch('http://localhost/scotiameds.co.uk/sitemap.xml')).text();for(const match of map.matchAll(/<loc>(.*?)<\/loc>/g)){const r=await fetch(match[1]);if(r.status!==200)failures.push('Route failed '+match[1])}
cdp.ws.close()}finally{child.kill();await sleep(300);if(fs.existsSync(profile))fs.rmSync(profile,{recursive:true,force:true})}console.log(JSON.stringify({passed:!failures.length,failures},null,2));process.exitCode=failures.length?1:0})().catch(e=>{console.error(e);process.exitCode=1});
