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
 await verify("Project selection updates the original artwork in place without navigation",async()=>{
  assert.equal(await space.locator(".ps-index-row").count(),4);
  assert.equal(await space.locator(".ps-work-artwork img").count(),1);
  const rows=space.locator(".ps-index-row");
  await rows.nth(1).hover();
  assert.match(await space.locator(".ps-work-artwork img").getAttribute("src"),/telangana-manifesto/);
  await rows.nth(2).focus();
  assert.match(await space.locator(".ps-work-artwork img").getAttribute("src"),/led-rath-yatra/);
  await rows.nth(3).click();
  assert.match(await space.locator(".ps-work-artwork img").getAttribute("src"),/samvidhan/);
  assert.equal(await space.locator(".ps-work-artwork").getAttribute("href"),"/work/samvidhan");
  assert.equal(await space.locator(".ps-work-case-link").getAttribute("href"),"/work/samvidhan");
  for(let i=0;i<4;i++)assert.equal(await rows.nth(i).getAttribute("type"),"button");
  assert.equal(await rows.nth(3).getAttribute("aria-pressed"),"true");
 });
 await verify("Featured Projects fits one continuous desktop section with aligned columns",async()=>{
  try{
    for(const width of [1440,1280,1024]){
      await page.setViewportSize({width,height:900});
      const selectors=[".ps-featured-oneview",".ps-work-aside",".ps-work-preview",".ps-index-row:first-child",".ps-index-row:last-child",".ps-work-artwork",".ps-work-context"];
      const boxes=await Promise.all(selectors.map(sel=>space.locator(sel).boundingBox()));
      assert(boxes.every(Boolean),`Missing featured project layout at ${width}px`);
      const [section,left,right,first,last,art,context]=boxes;
      const bottom=r=>r.y+r.height;
      assert(Math.abs(left.y-right.y)<5,`Featured columns start at different heights at ${width}px`);
      assert(last.y>first.y,`Featured rows not sequential at ${width}px`);
      assert(bottom(context)<=bottom(section)+3,`Right case context goes outside the section at ${width}px`);
      assert(bottom(last)<=bottom(section)+3,`Left projects go outside the section at ${width}px`);
      assert(section.height<870,`Featured work requires more than one normal desktop scroll at ${width}px, height ${section.height}`);
      const scrollState=await page.evaluate(()=>{
        const root=document.querySelector(".ps-featured-oneview");
        const preview=document.querySelector(".ps-work-preview");
        const left=document.querySelector(".ps-work-aside");
        return [root,preview,left].map(el=>({height:el.scrollHeight,client:el.clientHeight,overflowY:getComputedStyle(el).overflowY,position:getComputedStyle(el).position}));
      });
      assert(scrollState.every(x=>x.height<=x.client+4),`Nested scrolling found at ${width}px`);
      assert.notEqual(scrollState[1].position,"sticky",`Sticky separate right pane at ${width}px`);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,`Horizontal overflow at ${width}px`);
    }
  }finally{await page.setViewportSize({width:1440,height:900})}
 });
 await verify("Mobile keeps a visible selected artwork and all four project controls",async()=>{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const visit=await openSite(ctx);
  try{
    const selector=visit.locator(".ps-work-aside .ps-index-row");
    assert.equal(await selector.count(),4);
    assert.equal(await visit.locator(".ps-work-preview").isVisible(),true);
    await selector.nth(1).click();
    assert.match(await visit.locator(".ps-work-artwork img").getAttribute("src"),/telangana-manifesto/);
    assert.equal(await visit.locator(".ps-work-case-link").getAttribute("href"),"/work/telangana-manifesto");
    assert.equal(await visit.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true);
  }finally{await visit.close();await ctx.close()}
 });
 await verify("Capture the featured project and selected artwork together",async()=>{
  const visit=await openSite(desktopContext);
  try{
    await visit.locator(".ps-work-artwork img").evaluate(img=>img.decode());
    const section=visit.locator("#political-case-studies");
    await section.screenshot({path:"political-featured-oneview.png",animations:"disabled"});
  }finally{await visit.close()}
 });
 await verify("Archive shows heading ABOVE three equally-sized artwork cards",async()=>{
  try{
    for(const width of [1440,1200,1024,920,820]){
      await page.setViewportSize({width,height:900});
      const [copy,grid,budget,content,creative]=await Promise.all(
        [".ps-gate-copy",".ps-gate-artworks",".ps-gate-art-budget",".ps-gate-art-content",".ps-gate-art-creative"]
          .map(selector=>space.locator(selector).boundingBox()));
      assert([copy,grid,budget,content,creative].every(Boolean));
      const bottom=r=>r.y+r.height;
      assert(copy.y<grid.y && bottom(copy)<=grid.y+2,`Text must be ABOVE all three cards at ${width}px`);
      assert(Math.abs(budget.width-content.width)<3 && Math.abs(content.width-creative.width)<3,`Unequal card widths at ${width}px`);
      assert(Math.abs(budget.height-content.height)<3 && Math.abs(content.height-creative.height)<3,`Unequal card heights at ${width}px`);
      assert(Math.abs(budget.y-content.y)<3 && Math.abs(content.y-creative.y)<3,`Cards must share top edge at ${width}px`);
      assert(Math.abs(bottom(budget)-bottom(content))<3 && Math.abs(bottom(content)-bottom(creative))<3,`Cards must share bottom edge at ${width}px`);
      const gap1=content.x-(budget.x+budget.width),gap2=creative.x-(content.x+content.width);
      assert(Math.abs(gap1-gap2)<3,`Three card gaps inconsistent at ${width}px`);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true,`Horizontal overflow at ${width}px`);
    }
    await page.setViewportSize({width:390,height:844});
    const mobileCards=await Promise.all(["budget","content","creative"].map(id=>space.locator(".ps-gate-art-"+id).boundingBox()));
    assert(mobileCards[0].y<mobileCards[1].y && mobileCards[1].y<mobileCards[2].y,"Mobile cards must stack vertically");
    assert(Math.abs(mobileCards[0].width-mobileCards[1].width)<3 && Math.abs(mobileCards[1].width-mobileCards[2].width)<3,"Mobile cards must be equal width");
  }finally{await page.setViewportSize({width:1440,height:900})}
 });
 await verify("No two-row or spanning layouts remain in the archive",async()=>{
  const layout=await page.evaluate(()=>{
    const grid=document.querySelector(".ps-gate-artworks");
    const styles=getComputedStyle(grid);
    return {display:styles.display,columns:styles.gridTemplateColumns.split(/\s+/).filter(Boolean).length,rows:styles.gridTemplateRows.split(/\s+/).filter(Boolean).length};
  });
  assert.equal(layout.display,"grid");
  assert.equal(layout.columns,3);
  assert.equal(layout.rows,1);
 });
 await verify("Full original artwork visible in all equal-size cards",async()=>{
  try{
    for(const width of [1440,1024,820,390]){
      await page.setViewportSize({width,height:900});
      for(const id of ["budget","content","creative"]){
        const x=await space.locator(".ps-gate-art-"+id+" img").evaluate(async img=>{
          await img.decode();
          const css=getComputedStyle(img),box=img.getBoundingClientRect();
          return {fit:css.objectFit,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,width:box.width,height:box.height};
        });
        assert.equal(x.fit,"contain",`Uncropped original required for ${id} ${width}px`);
        assert(x.naturalWidth>0&&x.naturalHeight>0&&x.width>0&&x.height>0);
      }
    }
    await page.setViewportSize({width:1440,height:900});
    const screenshotPage=await openSite(desktopContext);
    try{
      await screenshotPage.locator("#political-artwork").scrollIntoViewIfNeeded();
      await screenshotPage.waitForFunction(()=>[...document.querySelectorAll(".ps-gate-art img")].length===3
        &&[...document.querySelectorAll(".ps-gate-art img")].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:20000});
      await screenshotPage.locator(".ps-gate-art img").evaluateAll(async images=>{await Promise.all(images.map(img=>img.decode()))});
      await screenshotPage.screenshot({path:"political-space-archive-verified.png",animations:"disabled"});
    }finally{await screenshotPage.close()}
  }finally{await page.setViewportSize({width:1440,height:900})}
 });
 await verify("Artwork card labels remain inside equal card boundaries",async()=>{
  for(const width of [1440,1024,820,390]){
    await page.setViewportSize({width,height:900});
    for(const id of ["budget","content","creative"]){
      const card=await space.locator(".ps-gate-art-"+id).boundingBox();
      const label=await space.locator(".ps-gate-art-"+id+" .ps-gate-art-label").boundingBox();
      assert(label.y>=card.y && label.y+label.height<=card.y+card.height+2,`Label overflows ${id} ${width}px`);
    }
  }
  await page.setViewportSize({width:1440,height:900});
 });
 await verify("Archive headings stay entirely above the first artwork row",async()=>{
  try{
    for(const width of [1440,1024,920,820,390]){
      await page.setViewportSize({width,height:900});
      const [copy,kicker,statement,description,firstCard]=await Promise.all(
        [".ps-gate-copy",".ps-gate-kicker",".ps-gate-statement",".ps-gate-copy>p",".ps-gate-art-budget"].map(x=>space.locator(x).boundingBox()));
      assert(kicker.y>=copy.y-3 && statement.y>=kicker.y,`Archive text order incorrect at ${width}px`);
      assert(description.y>=statement.y,`Description precedes heading at ${width}px`);
      assert(description.y+description.height<=firstCard.y,`Description overlaps first artwork at ${width}px`);
    }
  }finally{await page.setViewportSize({width:1440,height:900})}
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
  const visit=await openSite(desktopContext);
  try{
    await visit.waitForLoadState("networkidle",{timeout:15000});
    assert.equal(await visit.locator(".ps-gate-art").count(),3);
    assert.equal(await visit.locator(".ps-gate-art img").count(),3);
    assert.match((await visit.locator(".ps-gate-figure").innerText()).replace(/\s+/g,""),/WORKWITHPURPOSE/);
    const previews=await visit.locator(".ps-gate-art img").evaluateAll(elements=>elements.map(img=>({src:img.getAttribute("src"),loaded:img.complete&&img.naturalWidth>0})));
    assert(previews.every(img=>img.src.includes("political-")));
    const creative=visit.locator(".ps-gate-art-creative");
    await creative.click();
    await visit.locator("#political-artwork-gallery").waitFor({state:"visible",timeout:10000});
    assert.equal(await creative.getAttribute("aria-pressed"),"true");
  }finally{await visit.close()}
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
 await verify("Clicking each collection on a fresh visit selects that collection",async()=>{
  for(const item of [{name:"budget"},{name:"content"},{name:"creative"}]){
    const visit=await openSite(desktopContext);
    try{
      const tile=visit.locator(".ps-gate-art-"+item.name);
      await tile.click();
      await visit.waitForFunction(id=>document.querySelector(".ps-gate-art-"+id)?.getAttribute("aria-pressed")==="true",item.name,{timeout:12000});
      await visit.locator("#political-artwork-gallery").waitFor({state:"visible",timeout:10000});
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
