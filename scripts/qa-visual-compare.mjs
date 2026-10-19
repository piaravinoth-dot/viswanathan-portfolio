import fs from "node:fs";
import {chromium, firefox, webkit} from "playwright";

const configurations=[
  {name:"pilot",url:"http://127.0.0.1:4173/work/ai-design-studio"},
  {name:"baseline",url:"http://127.0.0.1:4174/work/ai-design-studio"}
];
const engines=[["chromium",chromium],["firefox",firefox],["webkit",webkit]];
const widths=[375,1440];
const results=[];
const fail=(name,width,check,detail)=>results.push({name,width,check,status:"FAIL",detail:String(detail)});
const pass=(name,width,check,detail)=>results.push({name,width,check,status:"PASS",detail:String(detail)});
for(const [engineName,engine] of engines){
  const browser=await engine.launch({headless:true});
  try{
    for(const width of widths){
      const readings={};
      for(const conf of configurations){
        const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:"reduce"});
        try{
          const response=await page.goto(conf.url,{waitUntil:"domcontentloaded",timeout:45000});
          await page.locator(".ai-case-hero-title h1").waitFor();
          await page.evaluate(()=>document.fonts.ready);
          await page.waitForTimeout(350);
          // Force deterministic top-of-page capture in browsers with smooth scroll.
          await page.evaluate(()=>{
            document.documentElement.style.scrollBehavior="auto";
            document.body.style.scrollBehavior="auto";
            scrollTo(0,0);
          });
          await page.waitForFunction(()=>window.scrollY<2,{timeout:5000}).catch(()=>null);
          if(response?.status()!==200)throw Error("HTTP "+response?.status());
          const state=await page.evaluate(()=>{
            const box=selector=>{
              const r=document.querySelector(selector)?.getBoundingClientRect();
              return r?{x:r.x,y:r.y,width:r.width,height:r.height}:null
            };
            return {scrollY,documentHeight:document.documentElement.scrollHeight,
              heading:box(".ai-case-hero-title h1"),
              heroStage:box(".ai-case-hero-stage"),
              intro:box(".ai-case-intro"),
              galleryCount:document.querySelectorAll(".ai-showcase-card").length,
              flowCount:document.querySelectorAll(".ai-case-flow-step").length,
              route:location.pathname
            };
          });
          readings[conf.name]=state;
          const root=`visual-${engineName}-${width}-${conf.name}`;
          await page.screenshot({path:root+"-hero.png",animations:"disabled"});
          // Collect two full-page references in Chromium for visual review.
          // First activate viewport lazy images, then jump to top without smooth scrolling.
          if(engineName==="chromium"){
            for(let y=0;y<state.documentHeight;y+=750){
              await page.evaluate(next=>scrollTo(0,next),y);
              await page.waitForTimeout(40);
            }
            await page.evaluate(()=>scrollTo(0,0));
            await page.waitForFunction(()=>window.scrollY<2);
            await page.screenshot({path:root+"-full.png",fullPage:true,animations:"disabled",timeout:55000});
          }
        }catch(error){fail(engineName,width,conf.name+" screenshot",error)}
        finally{await page.close();}
      }
      if(readings.pilot&&readings.baseline){
        const a=readings.pilot,b=readings.baseline;
        const geometry=(
          Math.abs(a.documentHeight-b.documentHeight)<=4 &&
          Math.abs(a.heading.y-b.heading.y)<=4 &&
          Math.abs(a.heroStage.y-b.heroStage.y)<=4 &&
          Math.abs(a.intro.y-b.intro.y)<=4
        );
        const content=a.galleryCount===4&&a.flowCount===5&&a.route===b.route;
        const top=a.scrollY<2&&b.scrollY<2;
        (geometry?pass:fail)(engineName,width,"layout matches production baseline",
          JSON.stringify({pilot:a,baseline:b}));
        (content?pass:fail)(engineName,width,"case-study content preserved",
          JSON.stringify({gallery:a.galleryCount,flow:a.flowCount,route:a.route}));
        (top?pass:fail)(engineName,width,"both screenshots start at page top",
          JSON.stringify({pilot:a.scrollY,baseline:b.scrollY}));
      }
    }
  }finally{await browser.close();}
}
fs.writeFileSync("motion-visual-compare.json",JSON.stringify(results,null,2));
for(const row of results)console.log(`${row.status} ${row.name} ${row.width}px ${row.check} ${row.status==="FAIL"?row.detail:""}`);
console.log(`Visual comparison: ${results.length} assertions, ${results.filter(x=>x.status==="FAIL").length} failures`);
if(results.some(x=>x.status==="FAIL"))process.exitCode=1;
