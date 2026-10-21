import fs from 'node:fs';
import path from 'node:path';
const root='dist',origin='https://viswanathan-portfolio-iota.vercel.app';
const pages=JSON.parse(fs.readFileSync('src/data/sitePages.json','utf8'));
const routes=new Set(pages.map(p=>p.path)),errors=[],titles=new Set(),descriptions=new Set();
const escape=value=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const attr=(tag,name)=>tag.match(new RegExp('\\b'+name+'="([^"]*)"'))?.[1];
const fileFor=route=>route==='/'?'index.html':`case-study-pages/${route.split('/').pop()}.html`;
const documents=new Map();
for(const page of pages){
 const file=fileFor(page.path),p=path.join(root,file);
 if(!fs.existsSync(p)){errors.push('Missing '+p);continue}
 const html=fs.readFileSync(p,'utf8');documents.set(page.path,html);
 const fail=message=>errors.push(file+': '+message);
 const tags=[...html.matchAll(/<(?:meta|link)\b[^>]*>/g)].map(m=>m[0]);
 const meta=(key,value)=>tags.filter(t=>t.startsWith('<meta')&&attr(t,key)===value).map(t=>attr(t,'content'));
 const titlesInPage=[...html.matchAll(/<title>(.*?)<\/title>/g)].map(m=>m[1]);
 if(titlesInPage.length!==1||titlesInPage[0]!==escape(page.title))fail('title differs from page registry');
 if(titles.has(page.title))fail('duplicate page title');titles.add(page.title);
 if(meta('name','description').length!==1||meta('name','description')[0]!==escape(page.description))fail('description differs from page registry');
 if(descriptions.has(page.description))fail('duplicate description');descriptions.add(page.description);
 const canonical=tags.filter(t=>attr(t,'rel')==='canonical');
 if(canonical.length!==1||attr(canonical[0],'href')!==origin+page.path)fail('canonical is not the public route');
 for(const [key,value] of [['og:title',escape(page.title)],['og:description',escape(page.description)],['og:url',origin+page.path],['og:type',page.path==='/'?'website':'article'],['og:image',`${origin}/social/${page.slug}.png`]])if(meta('property',key)[0]!==value)fail('incorrect '+key);
 for(const [key,value] of [['twitter:card','summary_large_image'],['twitter:title',escape(page.title)],['twitter:description',escape(page.description)],['twitter:image',`${origin}/social/${page.slug}.png`],['theme-color',page.background]])if(meta('name',key)[0]!==value)fail('incorrect '+key);
 if(meta('name','robots').some(value=>/noindex/i.test(value)))fail('public page blocks indexing');
 const h1=[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
 if(h1.length!==1)fail('expected one rendered H1, got '+h1.length);
 if(page.path!=='/'&&h1.length===1&&!h1[0][1].replace(/<[^>]+>/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase().includes(page.slug.replaceAll('-','')))fail('rendered H1 is for another project');
 if(html.includes('<div id="root"></div>')||!html.includes('<!--$-->'))fail('missing prerendered React content');
 const body=html.split('<body>')[1]?.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,'').trim()||'';
 if(body.length<500)fail('main content is missing before JavaScript');
 if(!/<main\b/.test(html))fail('missing main landmark');
 for(const image of html.matchAll(/<img\b[^>]*>/g))if(attr(image[0],'alt')===undefined)fail('image is missing alt text');
 try{
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  if(schemas.length!==1||schemas[0].url!==origin+page.path||schemas[0]['@type']!==(page.path==='/'?'ProfilePage':'CreativeWork'))fail('incorrect structured data');
 }catch{fail('invalid JSON-LD')}
 const image=path.join(root,'social',page.slug+'.png');
 if(!fs.existsSync(image))fail('missing social preview');
 else{const png=fs.readFileSync(image);if(png.readUInt32BE(16)!==1200||png.readUInt32BE(20)!==630)fail('social image dimensions disagree with metadata')}
 for(const tag of html.matchAll(/<(?:script|link|img)\b[^>]*>/g)){
  const source=attr(tag[0],'src')||(tag[0].startsWith('<link')?attr(tag[0],'href'):undefined);
  if(source?.startsWith('/')&&!source.startsWith('//')&&!fs.existsSync(path.join(root,source.split(/[?#]/)[0])))fail('missing local resource '+source);
 }
}
// Crawl every internal HTML link, including fragment destinations and all ten projects.
for(const [route,html] of documents)for(const tag of html.matchAll(/<a\b[^>]*>/g)){
 const href=attr(tag[0],'href');if(!href||!href.startsWith('/')&& !href.startsWith('#'))continue;
 const url=new URL(href,origin+route),target=url.pathname;
 if(routes.has(target)){
  if(url.hash){const id=decodeURIComponent(url.hash.slice(1));if(id&&!documents.get(target)?.includes(`id="${id}"`))errors.push(route+': broken anchor '+href)}
 }else if(!fs.existsSync(path.join(root,target)))errors.push(route+': broken internal link '+href);
}
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
const sitemapRoutes=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
if(sitemapRoutes.length!==pages.length||pages.some(p=>!sitemapRoutes.includes(origin+p.path)))errors.push('Sitemap does not match all public pages');
if(!robots.includes('Sitemap: '+origin+'/sitemap.xml')||/Disallow:\s*\/\s*$/m.test(robots))errors.push('Robots discovery rules are incorrect');
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
if(config.trailingSlash!==false)errors.push('Trailing-slash variants are not consolidated');
for(const page of pages.slice(1))if(!config.redirects?.some(r=>r.source===`/case-study-pages/${page.slug}.html`&&r.destination===page.path&&r.permanent))errors.push('Missing internal HTML redirect '+page.slug);
if(errors.length){console.error('SEO BUILD QA FAILED\n'+errors.join('\n'));process.exit(1)}
console.log(`SEO BUILD QA PASSED: ${pages.length} complete HTML pages; unique metadata, JSON-LD, social images, internal links, anchors, local assets and discovery files verified.`);
