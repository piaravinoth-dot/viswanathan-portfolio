import fs from "node:fs";
import {chromium} from "playwright";
const base=process.env.QA_URL||"http://127.0.0.1:4173";
const url=base+"/work/ai-design-studio";
const browser=await chromium.launch({headless:true});
const results=[];
const check=(label,ok,detail="")=>{
  results.push({label,status:ok?"PASS":"FAIL",detail});
  console.log(`${ok?"PASS":"FAIL"} | ${label} ${detail}`);
};
try{
  for(const width of [375,1440]){
    const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    try{
      const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:35000});
      await page.locator(".ai-case[data-motion-pilot='ai-studio-v1']").waitFor();
      await page.locator(".ai-case-hero-title h1").waitFor();
      await page.waitForTimeout(1600);
      check(`${width}px case study HTTP 200`,response?.status()===200,String(response?.status()));
      check(`${width}px pilot opt-in isolated to case study`,await page.locator("[data-motion-pilot]").count()===1);
      check(`${width}px optional motion engine loaded only on desktop`,
        await page.locator(".ai-case").getAttribute("data-motion-active") === (width>=761?"true":null));
      check(`${width}px all narrative sections preserved`,await page.locator(".ai-case-hero, .ai-case-intro, .ai-case-flow, .ai-case-feature, .ai-showcase, .ai-case-end").count()===9);
      check(`${width}px heading remains fully legible`,await page.locator(".ai-case-hero-title h1").evaluate(el=>getComputedStyle(el).opacity>0.95));
      check(`${width}px hero stage visible`,await page.locator(".ai-case-hero-stage").evaluate(el=>getComputedStyle(el).opacity>0.95));
      for(const selector of [".ai-case-flow-step",".ai-case-split-visual",".ai-showcase-card"]){
        const el=page.locator(selector).first();
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1050);
        check(`${width}px ${selector} enters at full opacity`,await el.evaluate(node=>parseFloat(getComputedStyle(node).opacity)>=0.98));
      }
      const metrics=await page.evaluate(()=>({
        clientWidth:document.documentElement.clientWidth,
        scrollWidth:document.documentElement.scrollWidth,
        links:[...document.querySelectorAll(".ai-case a")].filter(el=>el.getAttribute("href")).length
      }));
      check(`${width}px no horizontal document overflow`,metrics.scrollWidth<=metrics.clientWidth+2,JSON.stringify(metrics));
      check(`${width}px existing navigation links retained`,metrics.links>=5);
      check(`${width}px no JS exceptions`,errors.length===0,errors.join(" | "));
      await page.evaluate(()=>scrollTo(0,0));
      await page.waitForTimeout(700);
      await page.screenshot({path:`motion-pilot-${width}.png`,animations:"disabled"});
    }catch(e){check(`${width}px case study scenario`,false,String(e))}
    finally{await page.close()}
    // Reduced motion must work without GSAP ever setting opacity/transform values.
    const reduced=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
    try{
      await reduced.goto(url,{waitUntil:"domcontentloaded",timeout:35000});
      await reduced.locator(".ai-case[data-motion-pilot]").waitFor();
      const state=await reduced.locator(".ai-case-hero-title h1").evaluate(el=>({
        opacity:getComputedStyle(el).opacity,
        transform:getComputedStyle(el).transform
      }));
      check(`${width}px reduced motion leaves hero unanimated`,state.opacity==="1"&&state.transform==="none",JSON.stringify(state));
    }catch(e){check(`${width}px reduced-motion scenario`,false,String(e))}
    finally{await reduced.close()}
  }
  const other=await browser.newPage();
  try{
    await other.goto(base+"/work/content-studio",{waitUntil:"domcontentloaded",timeout:35000});
    await other.locator("h1").first().waitFor({timeout:18000});
    check("other case studies do not enable pilot",await other.locator("[data-motion-pilot]").count()===0);
  }catch(e){check("isolated route scenario",false,String(e))}
  finally{await other.close()}
}finally{await browser.close()}
fs.writeFileSync("motion-pilot-results.json",JSON.stringify(results,null,2));
console.log(`Motion pilot: ${results.length} checks; ${results.filter(x=>x.status==="FAIL").length} failures`);
if(results.some(x=>x.status==="FAIL"))process.exitCode=1;
