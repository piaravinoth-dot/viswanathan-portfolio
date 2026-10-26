import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {chromium} from "playwright";

const base=process.env.QA_URL||"http://127.0.0.1:4173";
const results=[];
const pass=(s)=>{results.push(s);console.log("PASS",s)};
const oldCareer=await fs.readFile("src/components/Career.tsx","utf8");
const oldCSS=await fs.readFile("src/components/styles/Career.css","utf8");
const main=await fs.readFile("src/components/MainContainer.tsx","utf8");
assert(oldCareer.includes("My career")&&oldCSS.includes(".career-section"),"legacy implementation not preserved");
assert(main.includes("<CareerJourney/>")&&!main.includes("<Career/>"),"new component not substituted");
pass("Original career files preserved; homepage uses Journey");
const browser=await chromium.launch({headless:true,channel:process.env.QA_CHROME_CHANNEL||undefined,args:["--no-sandbox"]});
try{
 for(const [name,width,height] of [["iphone",390,844],["small-phone",375,667],["android",412,915],["tablet",820,1180],["desktop",1440,900]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<850,hasTouch:width<850});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const response=await page.goto(base+"/",{waitUntil:"domcontentloaded",timeout:60000});
  assert.equal(response?.status(),200);
  const stage=page.locator(".exp-journey-scene");
  await stage.waitFor({state:"attached",timeout:40000});
  await page.locator('.exp-journey[data-interactive="true"]').waitFor({state:"attached",timeout:45000});
  await stage.scrollIntoViewIfNeeded();
  assert.equal(await page.locator(".exp-journey-stopbar button").count(),4);
  assert.equal(await page.locator(".exp-journey-pin").count(),4);
  assert.equal(await page.locator(".exp-journey-card-head strong").innerText(),"Peacock India");
  pass(name+" starts with four employers");
  const aboutText=await page.locator(".about-copy").innerText();
  assert(aboutText.includes("I translate complex ideas into clear visual systems and useful digital products."),"Previous About introduction was not restored");
  assert(aboutText.includes("With 10+ years across visual communication"),"Previous professional overview not restored");
  assert(aboutText.includes("As a Vibe Coder"),"Previous Vibe Coder paragraph not restored");
  assert.equal(await page.locator(".about-copy p").count(),3,"Previous About paragraph count changed");
  assert.equal(await page.locator(".about-journey-link").count(),0,"Removed Journey CTA remains visible");
  assert.equal(await page.locator(".about-actions a").count(),2,"Resume or contact link changed");
  const aboutGeometry=await page.locator(".about-me").evaluate(el=>{
    const r=el.getBoundingClientRect();const parent=el.closest(".about-section")?.getBoundingClientRect();
    return {left:r.left,right:r.right,parentLeft:parent?.left,parentRight:parent?.right}
  });
  assert(aboutGeometry.left>=-3 && aboutGeometry.right<=width+3,"About text overflows viewport: "+JSON.stringify(aboutGeometry));
  pass(name+" previous About restored, CTA removed, resume/contact preserved");
  // Check that every employer now has a detailed, distinct description.
  const names=["Peacock India","Ad2pro Media Solutions","I-PAC","Nation with NaMo"];
  for(let index=0;index<names.length;index++){
    await page.locator(".exp-journey-stopbar button").nth(index).evaluate(el=>el.click());
    assert.equal(await page.locator(".exp-journey-card-head strong").innerText(),names[index]);
    const copy=await page.locator(".exp-journey-card-body p").innerText();
    assert(copy.trim().split(" ").length>=47,names[index]+" description is too short: "+copy);
  }
  await page.locator(".exp-journey-stopbar button").first().evaluate(el=>el.click());
  pass(name+" all four employer descriptions expanded");
  const initial=await page.locator(".exp-journey-world").evaluate(e=>e.style.transform);
  const nextButton=page.locator(".exp-journey-controls button").last();
  assert(await nextButton.isVisible());
  await nextButton.click();
  try{
    await page.waitForFunction(()=>document.querySelector(".exp-journey-card-head strong")?.textContent==="Ad2pro Media Solutions",null,{timeout:6500});
  }catch(error){
    await page.screenshot({path:"qa-career-journey-"+name+"-failure.png"});
    const state=await page.evaluate(()=>({
      headline:document.querySelector(".exp-journey-card-head strong")?.textContent,
      step:document.querySelector(".exp-journey")?.getAttribute("data-active-step"),
      clicked:document.querySelector(".exp-journey-controls button:last-child")?.outerHTML
    }));
    console.error("NAVIGATION DIAGNOSTICS",name,JSON.stringify(state));
    throw error;
  }
  await page.waitForTimeout(500);
  assert.notEqual(initial,await page.locator(".exp-journey-world").evaluate(e=>e.style.transform));
  pass(name+" camera moves between career stops");
  // ScrollSmoother may hold the tab bar above the viewport after map focusing.
  // Native pointer activation is checked with Next; test direct-tab semantics separately.
  await page.locator(".exp-journey-stopbar button").nth(3).evaluate(el=>el.click());
  assert.equal(await page.locator(".exp-journey-card-head strong").innerText(),"Nation with NaMo");
  assert(await page.getByRole("button",{name:/Next stop/}).isDisabled());
  assert.equal(await page.locator(".exp-journey-controls output").innerText(),"4 / 4");
  pass(name+" last employer and four-stop bounds");
  const layout=await page.evaluate(()=>{
   const stage=document.querySelector(".exp-journey-scene").getBoundingClientRect();
   const card=document.querySelector(".exp-journey-card").getBoundingClientRect();
   const nav=document.querySelector(".exp-journey-stopbar").getBoundingClientRect();
   return {width:innerWidth,scroll:document.documentElement.scrollWidth,stage:{left:stage.left,right:stage.right,top:stage.top,bottom:stage.bottom},card:{left:card.left,right:card.right,top:card.top,bottom:card.bottom},nav:{left:nav.left,right:nav.right}};
  });
  assert(layout.scroll<=width+4,JSON.stringify(layout));
  assert(layout.card.left>=layout.stage.left-2&&layout.card.right<=layout.stage.right+2,JSON.stringify(layout));
  assert(layout.card.top>=layout.stage.top-2&&layout.card.bottom<=layout.stage.bottom+2,JSON.stringify(layout));
  pass(name+" mobile/desktop card fits map frame");
  const coverage=await page.evaluate(()=>{
    const host=document.querySelector(".exp-journey-scene").getBoundingClientRect();
    const art=document.querySelector(".exp-journey-city-map").getBoundingClientRect();
    const card=document.querySelector(".exp-journey-card").getBoundingClientRect();
    return {host:{left:host.left,top:host.top,right:host.right,bottom:host.bottom,height:host.height},
      art:{left:art.left,top:art.top,right:art.right,bottom:art.bottom},
      card:{top:card.top,bottom:card.bottom}};
  });
  assert(coverage.art.left<=coverage.host.left+3&&coverage.art.right>=coverage.host.right-3,"Map background missing at horizontal edge: "+JSON.stringify(coverage));
  assert(coverage.art.top<=coverage.host.top+3&&coverage.art.bottom>=coverage.host.bottom-3,"Map background missing at vertical edge: "+JSON.stringify(coverage));
  if(width>900){assert(coverage.card.top<=coverage.host.top+135,"Desktop story card is too low: "+JSON.stringify(coverage))}
  pass(name+" background fills scene and experience card remains readable");
  assert(await page.locator("#products").count()>0,"products section missing");
  assert(await page.locator("#career").count()===1,"career anchor missing or duplicate");
  pass(name+" products retained and career anchor unique");
  await page.waitForTimeout(1400);
  if(name==="iphone"||name==="desktop"){await page.screenshot({path:"qa-career-journey-"+name+".png",animations:"disabled"});}
  assert.deepEqual(errors,[],errors.join("; "));
  pass(name+" no uncaught errors");
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});
 const page=await context.newPage();
 await page.goto(base+"/",{waitUntil:"domcontentloaded"});
 await page.locator(".exp-journey-scene").waitFor({state:"attached"});
 await page.locator(".exp-journey-stopbar button").nth(2).click();
 assert.equal(await page.locator(".exp-journey-card-head strong").innerText(),"I-PAC");
 pass("reduced motion still navigates the journey");
 await context.close();
}finally{await browser.close();await fs.writeFile("qa-career-journey-results.json",JSON.stringify(results,null,2))}
console.log("CAREER JOURNEY QA:",results.length,"checks passed");
