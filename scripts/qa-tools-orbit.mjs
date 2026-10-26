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
  await toolkit.scrollIntoViewIfNeeded();
  assert.equal(await toolkit.locator(".toolkit-category").count(),5);
  assert.equal(await toolkit.locator(".toolkit-tile").count(),4);
  assert.equal(await toolkit.locator(".toolkit-focus-copy strong").innerText(),"Adobe Photoshop");
  check(device+" default design orbit");
  if(device==="iphone"||device==="desktop"){
    // Autoplay should visibly advance while the section is onscreen.
    await page.waitForTimeout(200);
    const beforeAngle=await toolkit.locator(".toolkit-tile").first().evaluate(el=>el.style.left);
    await page.waitForTimeout(800);
    const afterAngle=await toolkit.locator(".toolkit-tile").first().evaluate(el=>el.style.left);
    assert.notEqual(beforeAngle,afterAngle,"toolkit orbit did not autoplay");
    check(device+" active autoplay advances tiles");
  }
  assert.equal(await toolkit.locator(".toolkit-tile-face svg").count(),1,"Design category should show Figma brand icon");
  check(device+" Figma renders original brand icon");
  await toolkit.getByRole("button",{name:"All",exact:false}).first().evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").count(),16);
  check(device+" displays all 16 tools");
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
