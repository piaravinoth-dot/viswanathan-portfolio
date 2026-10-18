import type { Plugin } from "vite";
import pages from "../src/data/sitePages.json";
const origin = "https://viswanathan-portfolio-iota.vercel.app";
const escapeHtml = (value: string) => value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function metadata(html: string, page: typeof pages[number]) {
  const url = origin + page.path;
  const image = `${origin}/social/${page.slug}.png`;
  const schema = page.path === "/" ? {
    "@context":"https://schema.org", "@type":"ProfilePage", "url":url,
    "mainEntity":{"@type":"Person","name":"Viswanathan G","url":origin,"jobTitle":"Senior Product & Visual Designer","sameAs":["https://www.linkedin.com/in/viswanathan-g-55a0176a/","https://github.com/piaravinoth-dot"]}
  } : {"@context":"https://schema.org","@type":"CreativeWork","name":page.title.split(" — ")[0],"description":page.description,"url":url,"image":image,"author":{"@type":"Person","name":"Viswanathan G","url":origin}};
  const block = `<!--seo:start-->
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
    .replace("</head>",block+"\n</head>");
}
export function portfolioSeo(): Plugin {
  return {
    name:"portfolio-page-metadata", enforce:"post",
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
      this.emitFile({type:"asset",fileName:"robots.txt",source:`User-agent: *\nAllow: /\nDisallow: /case-study-pages/\nSitemap: ${origin}/sitemap.xml\n`});
    }
  };
}
