import fs from "node:fs";
import {chromium,firefox,webkit} from "playwright";

const base=process.env.QA_URL || "http://127.0.0.1:4173";
const engines=[["Chromium",chromium],["Firefox",firefox],["WebKit (Safari engine)",webkit]];
const widths=[320,375,425,768,1024,1440,1920];
const results=[];
const screenshots=[];
const report=(engine,width,description,ok,detail="")=>{
  const row={engine,width,description,passed:Boolean(ok),detail:String(detail).slice(0,500)};
  results.push(row);
  console.log(`${row.passed?"PASS":"FAIL"} | ${engine} | ${width}px | ${description} ${detail}`);
};
const visible=async(loc)=>loc.evaluate(el=>{
  const r=el.getBoundingClientRect();
  const style=getComputedStyle(el);
  return r.width>1 && r.height>1 && style.visibility!=="hidden" && parseFloat(style.opacity)>.98;
});
const scrollPosition=async(page)=>page.evaluate(()=>({x:scrollX,y:scrollY}));
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));

for(const [name,engine] of engines){
  let browser;
  try{browser=await engine.launch({headless:true});}
  catch(error){report(name,0,"browser launch",false,error);continue;}
  try{
    for(const width of widths){
      const page=await browser.newPage({
        viewport:{width,height:900},
        reducedMotion:"no-preference",
        hasTouch:width<=768,
        deviceScaleFactor:1
      });
      page.setDefaultTimeout(12000);
      const pageErrors=[];
      page.on("pageerror",e=>pageErrors.push(e.message));
      try{
        const response=await page.goto(base+"/work/ai-design-studio",{waitUntil:"domcontentloaded",timeout:45000});
        await page.locator(".ai-case[data-motion-pilot='ai-studio-v1']").waitFor();
        const root=page.locator(".ai-case");
        const expectedMotion=width>=761;
        await page.waitForTimeout(expectedMotion?1500:300);
        report(name,width,"HTTP 200",response?.status()===200,String(response?.status()));
        report(name,width,"heading visible and legible",await visible(page.locator(".ai-case-hero-title h1")));
        report(name,width,"hero product UI visible",await visible(page.locator(".ai-case-hero-stage")));
        const marker=await root.getAttribute("data-motion-active");
        report(name,width,"correct desktop-only animation activation",expectedMotion?marker==="true":marker===null,`marker=${marker}`);
        const widthState=await page.evaluate(()=>({
          viewport:innerWidth,
          client:document.documentElement.clientWidth,
          scroll:document.documentElement.scrollWidth,
          bodyScroll:document.body.scrollWidth
        }));
        report(name,width,"no document horizontal overflow",
          widthState.scroll<=widthState.client+2 && widthState.bodyScroll<=widthState.client+2,
          JSON.stringify(widthState));
        const content=await page.evaluate(()=>({
          heading:document.querySelector(".ai-case-hero-title h1")?.textContent?.trim(),
          gallery:document.querySelectorAll(".ai-showcase-card").length,
          steps:document.querySelectorAll(".ai-case-flow-step").length,
          sections:document.querySelectorAll(".ai-case-hero,.ai-case-intro,.ai-case-flow,.ai-case-feature,.ai-showcase,.ai-case-end").length,
          navigation:document.querySelectorAll(".ai-case a[href]").length
        }));
        report(name,width,"all case study information intact",
          content.heading?.includes("AI Design") && content.gallery===4 && content.steps===5 &&
          content.sections===9 && content.navigation>=5,JSON.stringify(content));
        // Real scroll motion should end, not leave text offscreen or transformed.
        const flow=page.locator(".ai-case-flow-step").first();
        await flow.scrollIntoViewIfNeeded();
        await page.waitForTimeout(expectedMotion?1000:120);
        const flowMetrics=await flow.evaluate(el=>{
          const s=getComputedStyle(el),r=el.getBoundingClientRect();
          const m=s.transform==="none"?0:new DOMMatrixReadOnly(s.transform).m42;
          return {dy:m,opacity:s.opacity,top:r.top,bottom:r.bottom};
        });
        report(name,width,"scroll reveal completes without hiding text",
          Math.abs(flowMetrics.dy)<=1.5 && Number(flowMetrics.opacity)>=.99 &&
          flowMetrics.bottom>0 && flowMetrics.top<900,JSON.stringify(flowMetrics));
        report(name,width,"no uncaught JavaScript errors",pageErrors.length===0,pageErrors.join("; "));
        if([375,768,1440].includes(width)){
          await page.evaluate(()=>scrollTo(0,0));
          await page.waitForTimeout(200);
          const file=`motion-crossbrowser-${name.split(" ")[0].toLowerCase()}-${width}.png`;
          await page.screenshot({path:file,animations:"disabled"});
          screenshots.push(file);
        }
        await page.close();
        // Honor reduced motion across all engines including desktop.
        if(width===375||width===1440){
          const rm=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
          try{
            await rm.goto(base+"/work/ai-design-studio",{waitUntil:"domcontentloaded",timeout:45000});
            await rm.locator(".ai-case").waitFor();
            await rm.waitForTimeout(550);
            const state=await rm.locator(".ai-case").evaluate(el=>({
              active:el.dataset.motionActive||null,
              title:getComputedStyle(el.querySelector(".ai-case-hero-title h1")).transform,
              textOpacity:getComputedStyle(el.querySelector(".ai-case-hero-title h1")).opacity
            }));
            report(name,width,"reduced motion disables GSAP and preserves contrast",
              state.active===null && state.title==="none" && state.textOpacity==="1",
              JSON.stringify(state));
          }catch(e){report(name,width,"reduced motion",false,e);}
          finally{await rm.close();}
        }
      }catch(error){report(name,width,"viewport scenario",false,error);await page.close();}
    }
    const other=await browser.newPage({viewport:{width:1440,height:900}});
    try{
      await other.goto(base+"/work/content-studio",{waitUntil:"domcontentloaded",timeout:45000});
      await other.locator("h1").first().waitFor();
      report(name,1440,"other products unaffected",await other.locator("[data-motion-pilot]").count()===0);
    }catch(error){report(name,1440,"other products unaffected",false,error);}
    finally{await other.close();}
  }finally{await browser.close();}
}
fs.writeFileSync("motion-crossbrowser-results.json",JSON.stringify({results,screenshots},null,2));
console.log(`Final matrix: ${results.length} checks; ${results.filter(x=>!x.passed).length} failures`);
if(results.some(x=>!x.passed))process.exitCode=1;
