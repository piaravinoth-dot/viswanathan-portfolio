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
 await verify("Project and artwork totals are not displayed as creative claims",async()=>{
  const labels=[
    await space.locator(".political-topline").innerText(),
    await space.locator(".political-chapters").innerText(),
    await space.locator(".ps-featured-heading").innerText(),
    await space.locator(".ps-gate-copy").innerText(),
    await space.locator(".ps-gate-folio").innerText(),
    await space.locator(".political-view-context").innerText()
  ].join(" ");
  assert.doesNotMatch(labels,/\b(?:26|04|03)\b|(?:projects|works|artworks)\s*[:/–-]?\s*\d+/i);
  assert.equal(await space.locator(".ps-index-number,.ps-preview-folio,.ps-featured-count").count(),0);
 });
 await verify("Only one artwork-collection selector is presented",async()=>{
  assert.equal(await space.locator(".ps-gate-artworks").count(),1);
  assert.equal(await space.locator(".ps-gate-art").count(),3);
  assert.equal(await space.locator(".political-collections").count(),0);
  assert.equal(await space.locator("#political-artwork-gallery").count(),1);
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
 await verify("Content and Creative collections show 10 and 9 designs",async()=>{
  await space.locator(".ps-gate-art").nth(1).click();
  assert.equal(await space.locator(".political-index-card").count(),10);
  await space.locator(".ps-gate-art").nth(2).click();
  assert.equal(await space.locator(".political-index-card").count(),9);
 });
 await verify("Grid opens original viewer and closes by Escape",async()=>{
  await space.locator(".political-index-card").first().click();
  assert.equal(await page.locator(".political-viewer[open]").count(),1);
  assert.match(await page.locator(".political-viewer-stage img").getAttribute("src"),/political-creative/);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".political-viewer[open]").count(),0);
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
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true);
 });
 await verify("Mobile grid stays within viewport and keeps work intact",async()=>{
  const panel=mobile.locator("#political-space");
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
