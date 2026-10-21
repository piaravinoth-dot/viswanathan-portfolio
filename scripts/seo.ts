import {createServer,type Plugin} from "vite";
import fs from "node:fs/promises";
import path from "node:path";
import pages from "../src/data/sitePages.json";
import communicationProjects from "../src/data/communicationProjects.json";
const origin = "https://viswanathan-portfolio-iota.vercel.app";
const escapeHtml = (value: string) => value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function metadata(html: string, page: typeof pages[number]) {
  const url = origin + page.path;
  const image = `${origin}/social/${page.slug}.png`;
  const project = communicationProjects.find(project=>project.slug===page.slug);
  const heroPreload = project ? `<link rel="preload" as="image" href="${project.hero.src}" imagesrcset="${project.hero.src.replace('.webp','-800.webp')} 800w, ${project.hero.src} ${project.hero.width}w" imagesizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1333px) 90vw, 1200px" fetchpriority="high" />` : "";
  const schema = page.path === "/" ? {
    "@context":"https://schema.org", "@type":"ProfilePage", "url":url,
    "mainEntity":{"@type":"Person","name":"Viswanathan G","url":origin,"@id":origin+"/#person","jobTitle":"Senior Product & Visual Designer","description":"Creative Lead and Vibe Coder working across visual communication and digital products","sameAs":["https://www.linkedin.com/in/viswanathan-g-55a0176a/","https://github.com/piaravinoth-dot"]}
  } : {"@context":"https://schema.org","@type":"CreativeWork","name":page.title.split(" — ")[0],"description":page.description,"url":url,"image":image,"author":{"@type":"Person","name":"Viswanathan G","url":origin,"@id":origin+"/#person"}};
  const block = `<!--seo:start-->
${heroPreload}
<link rel="canonical" href="${url}" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta property="og:type" content="${page.path === "/" ? "website" : "article"}" />
<meta property="og:site_name" content="Viswanathan G — Design Portfolio" />
<meta property="og:title" content="${escapeHtml(page.title)}" />
<meta property="og:description" content="${escapeHtml(page.description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escapeHtml(page.lines.join(" "))} — Viswanathan G" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(page.title)}" />
<meta name="twitter:description" content="${escapeHtml(page.description)}" />
<meta name="twitter:image" content="${image}" />
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,"\\u003c")}</script>
<!--seo:end-->`;
  return html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/g,"")
    .replace(/<title>[\s\S]*?<\/title>/,"<title>"+escapeHtml(page.title)+"</title>")
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/,`<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace(/<meta name="theme-color" content="[^"]*"\s*\/?>/,`<meta name="theme-color" content="${page.background}" />`)
    .replace("</head>",block+"\n</head>");
}
export function portfolioSeo(): Plugin {
  let outputDir="",building=false;
  return {
    name:"portfolio-page-metadata", enforce:"post",
    configResolved(config){building=config.command==="build"&&!config.build.ssr;outputDir=path.resolve(config.root,config.build.outDir);},
    transformIndexHtml(html, context) {
      const path = new URL(context.originalUrl || context.path,"http://localhost").pathname.replace(/\/$/,"") || "/";
      return metadata(html,pages.find(page=>page.path===path) || pages[0]);
    },
    generateBundle(_, bundle) {
      const entry = bundle["index.html"];
      if (!entry || entry.type !== "asset") throw new Error("Missing Vite HTML entry");
      const html = String(entry.source);
      entry.source = metadata(html,pages[0]);
      for (const page of pages.slice(1)) this.emitFile({type:"asset",fileName:`case-study-pages/${page.slug}.html`,source:metadata(html,page)});
      this.emitFile({type:"asset",fileName:"sitemap.xml",source:`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(page=>`\n  <url><loc>${origin+page.path}</loc></url>`).join("")}\n</urlset>\n`});
      this.emitFile({type:"asset",fileName:"robots.txt",source:`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`});
    },
    async closeBundle(){
      if(!building)return;
      const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false,watch:null},appType:"custom",ssr:{noExternal:["gsap"]}});
      try{
        const {renderPage}=await server.ssrLoadModule("/scripts/prerender.tsx");
        const manifest=JSON.parse(await fs.readFile(path.join(outputDir,".vite/manifest.json"),"utf8"));
        const routeComponent:Record<string,string>={
          portfolio:"MainContainer", "ai-design-studio":"AIDesignStudioCaseStudy", "content-studio":"ContentStudioCaseStudy",
          "social-media-intelligence":"SocialIntelligenceCaseStudy", "content-tracker":"ContentTrackerCaseStudy",
          splitmate:"SplitMateCaseStudy", "clip-studio":"ClipStudioCaseStudy"
        };
        for(const page of pages){
          const htmlPath=path.join(outputDir,page.path==="/"?"index.html":`case-study-pages/${page.slug}.html`);
          let html=await fs.readFile(htmlPath,"utf8");
          const content=await renderPage(page.path);
          html=html.replace('<div id="root"></div>',()=>`<div id="root">${content}</div>`);
          const seen=new Set<string>(),css=new Set<string>();
          const visit=(key:string)=>{if(seen.has(key))return;seen.add(key);const chunk=manifest[key];if(!chunk)throw new Error("Missing manifest entry: "+key);(chunk.css||[]).forEach((file:string)=>css.add(file));(chunk.imports||[]).forEach(visit);};
          visit(`src/components/${routeComponent[page.slug]||"CommunicationCaseStudy"}.tsx`);
          const links=[...css].filter(file=>!html.includes(`href="/${file}"`)).map(file=>`<link rel="stylesheet" crossorigin href="/${file}" />`).join("\n");
          html=html.replace("</head>",links+"\n</head>");
          await fs.writeFile(htmlPath,html);
        }
        console.log("Prerendered visible content and route CSS for all 11 pages.");
      }finally{await server.close();}
    }
  };
}
