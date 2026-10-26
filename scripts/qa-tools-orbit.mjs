import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {chromium} from "playwright";
const origin=process.env.QA_URL||"http://127.0.0.1:4173";
const browser=await chromium.launch({headless:true,channel:"chrome",args:["--no-sandbox"]});
const results=[];const check=(name)=>{results.push(name);console.log("PASS",name)};
try{
 for(const [device,width,height] of [["iphone",390,844],["android",412,915],["tablet",820,1180],["desktop",1440,900]]){
  const ctx=await browser.newContext({viewport:{width,height},isMobile:width<850,hasTouch:width<850});
  const page=await ctx.newPage();const errs=[];page.on("pageerror",e=>errs.push(e.message));
  const response=await page.goto(origin+"/",{waitUntil:"domcontentloaded",timeout:60000});
  assert.equal(response?.status(),200);
  const toolkit=page.locator("#toolkit");
  await toolkit.waitFor({state:"attached",timeout:40000});
  // Wait for the hardware-WebGL fallback and its portfolio:layout-ready event:
  // it resets ScrollSmoother to top and can undo an earlier browser test scroll.
  await page.waitForTimeout(1100);
  await page.evaluate(()=>{
    const stage=document.querySelector(".toolkit-stage");
    const target=Math.max(0,window.scrollY+stage.getBoundingClientRect().top-window.innerHeight*.35);
    window.scrollTo({top:target,behavior:"instant"});
  });
  // Desktop ScrollSmoother intentionally eases toward the scroll target over ~1.7s.
  // Wait for actual stage visibility instead of asserting mid-transition.
  await page.waitForFunction(()=>{
    const r=document.querySelector(".toolkit-stage").getBoundingClientRect();
    return r.top<innerHeight*.85&&r.bottom>innerHeight*.1;
  },null,{timeout:8000});
  const stageVisibility=await page.evaluate(()=>{
    const rect=document.querySelector(".toolkit-stage").getBoundingClientRect();
    return {top:rect.top,bottom:rect.bottom,scrollY:scrollY,scrollHeight:document.documentElement.scrollHeight,viewport:innerHeight};
  });
  assert(stageVisibility.top<height*.85&&stageVisibility.bottom>height*.1,"orbit stage not in view after native scroll "+JSON.stringify(stageVisibility));
  // The artwork must blend with the site's navy instead of showing a square panel.
  const backdrop=await toolkit.locator(".toolkit-stage").evaluate(stage=>{
    const style=getComputedStyle(stage);
    const grid=getComputedStyle(stage,"::before");
    const shell=getComputedStyle(document.querySelector(".toolkit-section"));
    return {color:style.backgroundColor,image:style.backgroundImage,grid:grid.display,shell:shell.backgroundColor};
  });
  assert.equal(backdrop.color,"rgba(0, 0, 0, 0)","orbit has a separate filled rectangle");
  assert.equal(backdrop.image,"none","orbit has a separate gradient rectangle");
  assert.equal(backdrop.grid,"none","orbit still has the rectangular grid");
  assert.equal(backdrop.shell,"rgb(11, 16, 23)","site shell color has changed");
  check(device+" seamlessly integrated orbit background");
  assert.equal(await toolkit.locator(".toolkit-category").count(),5);
  const illustration=toolkit.locator(".toolkit-hand-illustration");
  assert.equal(await illustration.count(),1,"original illustrated SVG hand missing");
  assert.equal(await illustration.getAttribute("viewBox"),"0 0 350 590","original hand illustration proportions changed");
  assert((await illustration.locator("path").count())>=10,"illustrated hand SVG artwork incomplete");
  assert.equal(await toolkit.locator(".toolkit-hand-photo").count(),0,"photographic hand should not be shown");
  check(device+" original illustrated hand restored");
  // On every fresh visit, All is the selected filter and every tool is visible.
  assert.equal(await toolkit.locator(".toolkit-category").first().getAttribute("aria-pressed"),"true");
  assert.equal(await toolkit.locator(".toolkit-tile").count(),16);
  assert.equal(await toolkit.locator(".toolkit-focus-copy strong").innerText(),"Adobe Photoshop");
  check(device+" defaults to All 16 tools");
  if(device==="iphone"||device==="desktop"){
    // Autoplay should visibly advance while the section is onscreen.
    await page.waitForTimeout(200);
    const beforeAngle=await toolkit.locator(".toolkit-tile").first().evaluate(el=>el.style.left);
    await page.waitForTimeout(800);
    const afterAngle=await toolkit.locator(".toolkit-tile").first().evaluate(el=>el.style.left);
    assert.notEqual(beforeAngle,afterAngle,"toolkit orbit did not autoplay while stage visible; "+JSON.stringify(await page.evaluate(()=>({hidden:document.hidden,reduced:matchMedia("(prefers-reduced-motion: reduce)").matches,stage:(()=>{const r=document.querySelector(".toolkit-stage").getBoundingClientRect();return {top:r.top,bottom:r.bottom}})()}))));
    check(device+" active autoplay advances tiles");
  }
  assert.equal(await toolkit.getByRole("button",{name:"Select Figma"}).locator(".toolkit-tile-face svg").count(),1,"Figma brand icon missing");
  check(device+" Figma renders original brand icon");
  await toolkit.locator(".toolkit-category").nth(1).evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").count(),4);
  check(device+" Design filter still shows four tools");
  await toolkit.locator(".toolkit-category").first().evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").count(),16);
  assert.equal(await toolkit.locator(".toolkit-category").first().getAttribute("aria-pressed"),"true");
  check(device+" All restores the complete sixteen-tool orbit");
  await toolkit.locator(".toolkit-category").nth(2).evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").count(),2);
  assert.equal(await toolkit.locator(".toolkit-focus-copy strong").innerText(),"Adobe After Effects");
  check(device+" filters motion tools");
  await toolkit.locator(".toolkit-category").nth(3).evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").count(),8);
  check(device+" filters development tools");
  await toolkit.locator(".toolkit-category").nth(4).evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").count(),2);
  check(device+" filters AI tools");
  await toolkit.locator(".toolkit-category").first().evaluate(el=>el.click());
  const before=await toolkit.locator(".toolkit-focus-copy strong").innerText();
  await toolkit.locator(".toolkit-controls button").last().click();
  const after=await toolkit.locator(".toolkit-focus-copy strong").innerText();
  assert.notEqual(before,after);
  check(device+" arrow controls update active tool");
  await toolkit.locator(".toolkit-tile").first().evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").first().getAttribute("aria-pressed"),"true");
  check(device+" direct tool selection works");
  const geometry=await page.evaluate(()=>{
   const host=document.querySelector("#toolkit").getBoundingClientRect();
   const stage=document.querySelector(".toolkit-stage").getBoundingClientRect();
   return {scrollWidth:document.documentElement.scrollWidth,width:innerWidth,sectionLeft:host.left,sectionRight:host.right,stageLeft:stage.left,stageRight:stage.right};
  });
  assert(geometry.scrollWidth<=width+4,JSON.stringify(geometry));
  assert(geometry.sectionLeft>=-3&&geometry.sectionRight<=width+3,JSON.stringify(geometry));
  assert(geometry.stageLeft>=-3&&geometry.stageRight<=width+3,JSON.stringify(geometry));
  check(device+" no horizontal overflow");
  assert.equal(await page.locator("#career").count(),1);
  assert.equal(await page.locator("#products").count(),1);
  assert.equal(await page.locator(".about-journey-link").count(),0);
  check(device+" existing sections preserved");
  const footerLayout=await page.evaluate(()=>{
    const p=document.querySelector(".toolkit-footer p").getBoundingClientRect();
    const link=document.querySelector(".toolkit-footer a").getBoundingClientRect();
    return {overlap:!(p.right<link.left||link.right<p.left||p.bottom<link.top||link.bottom<p.top)};
  });
  if(width<761)assert.equal(footerLayout.overlap,false,"toolkit footer elements overlap");
  check(device+" readable footer");
  if(device==="iphone"||device==="desktop"){
    await toolkit.locator(".toolkit-category").nth(1).evaluate(el=>el.click());
    await page.waitForTimeout(450);
    await toolkit.screenshot({path:"qa-tools-"+device+".png",animations:"disabled"});
  }
  assert.deepEqual(errs,[]);
  check(device+" no browser errors");
  await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});
 const page=await ctx.newPage();await page.goto(origin+"/",{waitUntil:"domcontentloaded"});
 await page.locator("#toolkit .toolkit-category").nth(3).evaluate(el=>el.click());
 assert.equal(await page.locator("#toolkit .toolkit-tile").count(),8);
 check("reduced motion mode remains interactive");
 await ctx.close();
}finally{await browser.close();await fs.writeFile("qa-tools-results.json",JSON.stringify(results,null,2))}
console.log("TOOLS ORBIT QA:",results.length,"checks passed");
