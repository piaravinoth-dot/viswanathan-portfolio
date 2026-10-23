import assert from "node:assert/strict";
import { chromium } from "playwright";

const base=process.env.QA_URL||"http://127.0.0.1:4173";
const browser=await chromium.launch({headless:true});
const checks=[];
async function verify(label,run){
 try{await run();checks.push({label,passed:true});console.log("PASS",label)}
 catch(error){checks.push({label,passed:false,error:String(error)});console.error("FAIL",label,error);throw error}
}
async function openSite(context,url=base+"/"){
 const page=await context.newPage();
 await page.goto(url,{waitUntil:"domcontentloaded",timeout:45000});
 await page.locator("#political-space .ps-gate-artworks").waitFor({timeout:30000});
 return page;
}
try{
 const desktopContext=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const page=await openSite(desktopContext);
 const space=page.locator("#political-space");
 await verify("Four original featured case studies are preserved",async()=>{
  assert.equal(await space.locator(".selected-case").count(),4);
 });
 await verify("Editorial index preview responds to hover and keyboard focus",async()=>{
  assert.equal(await space.locator(".ps-index-row").count(),4);
  assert.equal(await space.locator(".ps-featured-stage img").count(),1);
  const rows=space.locator(".ps-index-row");
  await rows.nth(1).hover();
  assert.match(await space.locator(".ps-featured-stage img").getAttribute("src"),/telangana-manifesto/);
  await rows.nth(2).focus();
  assert.match(await space.locator(".ps-featured-stage img").getAttribute("src"),/led-rath-yatra/);
  assert.equal(await space.locator(".ps-featured-stage").getAttribute("href"),"/work/led-rath-yatra");
  for(let i=0;i<4;i++)assert.match(await rows.nth(i).getAttribute("href"),/^\/work\//);
 });
 await verify("Archive uses three equal desktop columns and even spacing",async()=>{
  const targets=[".ps-gate-copy",".ps-gate-art-budget",".ps-gate-art-content",".ps-gate-art-creative"];
  try {
    for(const width of [1440,1024,920]){
      await page.setViewportSize({width,height:900});
      const boxes=await Promise.all(targets.map(selector=>space.locator(selector).boundingBox()));
      const [copy,budget,content,creative]=boxes;
      assert(boxes.every(Boolean),"All archive sections must have measurable layout");
      assert(Math.abs(copy.width-budget.width)<3,`Text and Gujarat columns unequal at ${width}px`);
      assert(Math.abs(budget.width-content.width)<3,`Gujarat and content columns unequal at ${width}px`);
      assert(Math.abs(content.width-creative.width)<3,`Content and creative columns unequal at ${width}px`);
      const gap1=budget.x-(copy.x+copy.width),gap2=content.x-(budget.x+budget.width);
      assert(Math.abs(gap1-gap2)<3,`Archive gutters differ at ${width}px`);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true,`Horizontal overflow at ${width}px`);
    }
    await page.setViewportSize({width:820,height:900});
    const budget=await space.locator(".ps-gate-art-budget").boundingBox();
    const content=await space.locator(".ps-gate-art-content").boundingBox();
    assert(Math.abs(budget.width-content.width)<3,"Tablet artwork columns must share width");
  } finally {
    await page.setViewportSize({width:1440,height:900});
  }
 });
 await verify("Archive introduction starts at the top, never halfway down",async()=>{
  try{
    for(const width of [1440,1200,1024,920]){
      await page.setViewportSize({width,height:900});
      const selectors=[".ps-gate-copy",".ps-gate-kicker",".ps-gate-statement",".ps-gate-copy>p",".ps-gate-art-budget"];
      const [panel,kicker,statement,description,budget]=await Promise.all(selectors.map(sel=>space.locator(sel).boundingBox()));
      assert([panel,kicker,statement,description,budget].every(Boolean));
      assert(kicker.y-panel.y < 25,`Archive kicker is not at the top at ${width}px`);
      assert(statement.y-panel.y < 125,`Archive headline starts too far down at ${width}px`);
      assert(statement.y >= kicker.y+kicker.height,`Headline overlaps kicker at ${width}px`);
      assert(description.y >= statement.y+statement.height,`Description overlaps headline at ${width}px`);
      assert(description.y+description.height < panel.y+panel.height*.73,
        `Description has been pushed into the bottom half at ${width}px`);
      assert(Math.abs(panel.y-budget.y) < 5,`Intro and poster columns start at different heights at ${width}px`);
    }
  }finally{
    await page.setViewportSize({width:1440,height:900});
  }
 });
 await verify("Project and artwork totals are not displayed as creative claims",async()=>{
  const labels=[
    await space.locator(".political-topline").innerText(),
    await space.locator(".political-chapters").innerText(),
    await space.locator(".ps-featured-heading").innerText(),
    await space.locator(".ps-gate-copy").innerText(),
    await space.locator(".ps-gate-folio").innerText(),
    (await space.locator(".political-view-context").count())?await space.locator(".political-view-context").innerText():""
  ].join(" ");
  assert.doesNotMatch(labels,/\b(?:26|04|03)\b|(?:projects|works|artworks)\s*[:/–-]?\s*\d+/i);
  assert.equal(await space.locator(".ps-index-number,.ps-preview-folio,.ps-featured-count").count(),0);
 });
 await verify("No political artwork gallery is open before visitor chooses a collection",async()=>{
  assert.equal(await space.locator(".ps-gate-art[aria-pressed=true]").count(),0);
  assert.equal(await space.locator(".political-view-switch,.political-exhibition,.political-index-grid").count(),0);
 });
 await verify("Only one artwork-collection selector is presented",async()=>{
  assert.equal(await space.locator(".ps-gate-artworks").count(),1);
  assert.equal(await space.locator(".ps-gate-art").count(),3);
  assert.equal(await space.locator(".political-collections").count(),0);
  assert.equal(await space.locator("#political-artwork-gallery").count(),0);
  assert.equal(await space.locator(".political-exhibition,.political-index-grid,.political-filmstrip").count(),0);
  assert.equal(await space.locator(".ps-gate-art[aria-pressed=true]").count(),0);
  assert.equal(await space.locator(".political-archive-heading").count(),0);
 });
 await verify("Artwork archive has three original, linked cover previews",async()=>{
  assert.equal(await space.locator(".ps-gate-art").count(),3);
  assert.equal(await space.locator(".ps-gate-art img").count(),3);
  assert.match((await space.locator(".ps-gate-figure").innerText()).replace(/\s+/g,""),/WORKWITHPURPOSE/);
  const previews=await space.locator(".ps-gate-art img").evaluateAll(elements=>elements.map(img=>({src:img.getAttribute("src"),loaded:img.complete&&img.naturalWidth>0})));
  if(previews.some(img=>!img.loaded))await space.locator(".ps-gate-art img").first().waitFor({state:"visible"});
  assert(previews.every(img=>img.src.includes("political-")));
  await space.locator(".ps-gate-art-creative").click();
  assert.equal(await space.locator("#political-artwork-gallery").count(),1);
  assert.equal(await space.locator(".ps-gate-art[aria-pressed=true]").innerText().then(x=>x.includes("Creative Posters")),true);
 });
 await verify("26 original works in source manifest",async()=>{
  const data=JSON.parse((await (await import("node:fs/promises")).readFile("src/data/politicalProjects.json","utf8")));
  assert.equal(data.length,26);assert.equal(new Set(data.map(p=>p.id)).size,26);
  assert.deepEqual(["budget","content","creative"].map(c=>data.filter(p=>p.category===c).length),[7,10,9]);
 });
 await verify("Grid reveals all seven budget designs",async()=>{
  await space.locator(".ps-gate-art").first().click();
  await space.getByRole("button",{name:"All works grid"}).click();
  assert.equal(await space.locator(".political-index-card").count(),7);
  assert.equal(await space.locator(".political-filmstrip").count(),0);
 });
 await verify("Content and Creative collections work with keyboard navigation",async()=>{
  const contentTile=space.locator(".ps-gate-art-content");
  await contentTile.focus();
  await contentTile.press("Enter");
  assert.equal(await space.locator(".political-index-card").count(),10);
  const creativeTile=space.locator(".ps-gate-art-creative");
  await creativeTile.focus();
  await creativeTile.press("Enter");
  assert.equal(await space.locator(".political-index-card").count(),9);
 });
 await verify("Clicking each collection opens its correct artwork on a fresh visit",async()=>{
  for(const item of [{name:"budget",count:7},{name:"content",count:10},{name:"creative",count:9}]){
    const visit=await openSite(desktopContext);
    try{
      await visit.waitForLoadState("networkidle",{timeout:15000});
      const collection=visit.locator(".ps-gate-art-"+item.name);
      await collection.click();
      assert.equal(await collection.getAttribute("aria-pressed"),"true");
      const gridButton=visit.getByRole("button",{name:"All works grid"});
      await gridButton.click();
      try{
        await visit.waitForFunction(expected=>document.querySelectorAll(".political-index-card").length===expected,item.count,{timeout:12000});
      }catch(error){
        const state=await visit.evaluate(()=>({
          collection:document.querySelector(".ps-gate-art[aria-pressed=true]")?.getAttribute("aria-label"),
          view:[...document.querySelectorAll(".political-view-options button")].map(el=>({text:el.textContent,pressed:el.getAttribute("aria-pressed")})),
          gallery:!!document.querySelector("#political-artwork-gallery"),
          cards:document.querySelectorAll(".political-index-card").length,
          exhibition:!!document.querySelector(".political-exhibition")
        }));
        console.error("Fresh-visit gallery state for "+item.name,JSON.stringify(state));
        throw error;
      }
      assert.equal(await visit.locator(".political-index-card").count(),item.count);
    }finally{await visit.close()}
  }
 });
 await verify("Grid opens original viewer and closes by Escape",async()=>{
  await space.locator(".political-index-card").first().click();
  await page.locator(".political-viewer[open]").waitFor({state:"visible",timeout:10000});
  assert.match(await page.locator(".political-viewer-stage img").getAttribute("src"),/political-creative/);
  await page.keyboard.press("Escape");
  await page.locator(".political-viewer[open]").waitFor({state:"hidden",timeout:10000});
 });
 await verify("Exhibition mode and thumbnails remain available",async()=>{
  await space.getByRole("button",{name:"Exhibition view"}).click();
  assert.equal(await space.locator(".political-exhibition").count(),1);
  assert.equal(await space.locator(".political-filmstrip button").count(),9);
 });
 await verify("Direct URL loads correct original artwork",async()=>{
  const deep=await openSite(desktopContext,base+"/?artwork=budget-3#political-artwork");
  await deep.locator(".political-viewer[open]").waitFor({timeout:15000});
  assert.match(await deep.locator(".political-viewer-stage img").getAttribute("src"),/political-budget-03/);
  assert.equal(await deep.locator(".political-viewer .political-copy-link").count(),1);
  await deep.close();
 });
 const mobileContext=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const mobile=await openSite(mobileContext);
 await verify("Mobile featured chapter and archive entry remain usable",async()=>{
  const section=mobile.locator("#political-space");
  assert.equal(await section.locator(".ps-index-row").count(),4);
  assert.equal(await section.locator(".ps-gate-art").count(),3);
  assert.equal(await section.locator(".ps-featured-preview").isVisible(),false);
  assert.equal(await section.locator(".political-exhibition,.political-index-grid,.political-filmstrip").count(),0);
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true);
 });
 await verify("Mobile grid stays within viewport and keeps work intact",async()=>{
  const panel=mobile.locator("#political-space");
  await panel.locator(".ps-gate-art-budget").click();
  await panel.getByRole("button",{name:"All works grid"}).click();
  assert.equal(await panel.locator(".political-index-card").count(),7);
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true);
 });
 await verify("Mobile swipe advances a non-zoomed artwork",async()=>{
  await mobile.locator(".political-index-card").first().click();
  const screen=mobile.locator(".political-viewer-stage");
  const before=await mobile.locator(".political-viewer header span").textContent();
  await screen.evaluate(el=>{
   const event=(type,x,y)=>{
    const touch=new Touch({identifier:11,target:el,clientX:x,clientY:y});
    el.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:type==="touchstart"?[touch]:[],changedTouches:[touch],targetTouches:type==="touchstart"?[touch]:[]}));
   };
   event("touchstart",330,400);event("touchend",80,405);
  });
  const after=await mobile.locator(".political-viewer header span").textContent();
  assert.notEqual(after,before);
  await mobile.locator(".political-viewer button[aria-label='Close political artwork']").click();
 });
 await desktopContext.close();await mobileContext.close();
}finally{
 await browser.close();
 console.log(JSON.stringify({checks,passed:checks.filter(c=>c.passed).length,total:checks.length}));
}
