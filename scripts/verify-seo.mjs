import fs from "node:fs";
import path from "node:path";
const root="dist";
const slugs=["ai-design-studio","content-studio","social-media-intelligence","content-tracker","splitmate","clip-studio","nation-building","telangana-manifesto","led-rath-yatra","samvidhan"];
const pages=[["index.html","/"],...slugs.map(s=>[`case-study-pages/${s}.html`,`/work/${s}`])];
const origin="https://viswanathan-portfolio-iota.vercel.app";
const errors=[];
for(const [file,route] of pages){
  const p=path.join(root,file);
  if(!fs.existsSync(p)){errors.push("Missing "+p);continue}
  const html=fs.readFileSync(p,"utf8");
  for(const [name,test] of [
    ["title",/<title>[^<]+<\/title>/],
    ["description",/<meta\s+name="description"\s+content="[^"]+"/],
    ["canonical",new RegExp('<link rel="canonical" href="'+origin.replaceAll(".","\\.")+route.replaceAll("/","\\/")+'"')],
    ["OG title",/<meta property="og:title" content="[^"]+"/],
    ["OG image",/<meta property="og:image" content="[^"]+"/],
    ["JSON-LD",/<script type="application\/ld\+json">/]
  ])if(!test.test(html))errors.push(file+": missing "+name);
}
const xml=path.join(root,"sitemap.xml"),robots=path.join(root,"robots.txt");
if(!fs.existsSync(xml)||!fs.existsSync(robots))errors.push("Missing SEO discovery files");
else{
  const sitemap=fs.readFileSync(xml,"utf8");
  for(const [,route] of pages)if(!sitemap.includes("<loc>"+origin+route+"</loc>"))errors.push("Sitemap missing "+route);
}
if(errors.length){console.error("SEO BUILD QA FAILED\n"+errors.join("\n"));process.exit(1)}
console.log("SEO BUILD QA PASSED: 11 prerendered HTML pages, metadata and discovery files verified.");
