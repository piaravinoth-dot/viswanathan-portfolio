import fs from "node:fs";
import {chromium} from "playwright";
const urls={
  original:"http://127.0.0.1:4174/work/ai-design-studio",
  pilot:"http://127.0.0.1:4173/work/ai-design-studio"
};
const states=[];
const browser=await chromium.launch({headless:true});
const cases=[
 {width:375,height:900},
 {width:768,height:900},
 {width:1440,height:900}
];
const selectors={
 hero:".ai-case-hero-title h1",
 stage:".ai-case-hero-stage",
 flow:".ai-case-flow-step",
 feature:".ai-case-split-visual",
 showcase:".ai-showcase-card"
};
function metricsResult(metrics){
  const delta=metrics.pilot.map((x,i)=>{
    const o=metrics.original[i];
    return {name:x.name,positionDelta:Math.round((x.top-o.top)*10)/10,
      widthDelta:Math.round((x.width-o.width)*10)/10,
      heightDelta:Math.round((x.height-o.height)*10)/10};
  });
  return delta;
}
async function capture(page,variant,width){
  await page.goto(urls[variant],{waitUntil:"networkidle",timeout:60000});
  await page.locator(".ai-case-hero-title h1").waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(1800);
  const geom=await page.evaluate((selectors)=>{
    return Object.entries(selectors).map(([name,selector])=>{
      const el=document.querySelector(selector);
      const r=el?.getBoundingClientRect();
      const s=el?getComputedStyle(el):null;
      return {name,top:r?.top??0,left:r?.left??0,width:r?.width??0,height:r?.height??0,
        opacity:s?.opacity,transform:s?.transform};
    });
  },selectors);
  for(const [name,selector] of Object.entries(selectors)){
    if(["hero","stage"].includes(name) && name==="stage")continue;
    if(name!=="hero")await page.locator(selector).first().scrollIntoViewIfNeeded();
    else await page.evaluate(()=>scrollTo(0,0));
    await page.waitForTimeout(950);
    await page.screenshot({path:`motion-compare-${variant}-${width}-${name}.png`,animations:"disabled"});
  }
  return geom;
}
try{
  for(const {width,height} of cases){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,reducedMotion:"no-preference"});
    try{
      const original=await capture(page,"original",width);
      const pilot=await capture(page,"pilot",width);
      const delta=metricsResult({original,pilot});
      states.push({type:"layout",width,delta});
      console.log("LAYOUT "+width+" "+JSON.stringify(delta));
      // Compare stable first-viewport layout only. Offscreen elements may be translated\n      // 28px by ScrollTrigger before entering view and lazy images can resize later.\n      // Cross-browser QA separately asserts full layout, scroll completion and overflow.\n      const stable=delta.filter(x=>x.name==="hero"||x.name==="stage");\n      const largest=Math.max(...stable.map(x=>Math.max(Math.abs(x.widthDelta),Math.abs(x.heightDelta))));
      if(largest>3)process.exitCode=1;
    }finally{await page.close()}
  }
  const timing=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:"no-preference"});
  try{
    await timing.goto(urls.pilot,{waitUntil:"domcontentloaded",timeout:60000});
    await timing.locator(".ai-case-hero-title h1").waitFor();
    const samples=[];
    const sample=async(label)=>{
      samples.push(await timing.evaluate((label)=>{
        const root=document.querySelector(".ai-case");
        const els=[...document.querySelectorAll(".ai-case-hero-title h1,.ai-case-hero-side,.ai-case-hero-stage")];
        return {label,t:performance.now(),active:root?.dataset.motionActive||null,
          transforms:els.map(el=>({tag:el.className||el.tagName,transform:getComputedStyle(el).transform,
            opacity:getComputedStyle(el).opacity,rectTop:el.getBoundingClientRect().top}))};
      },label));
    };
    for(const [name,ms] of [["entry",0],["early",130],["mid",320],["settled",1050]]){
      if(ms)await timing.waitForTimeout(ms);
      await sample(name);
      if(["entry","early","mid"].includes(name)){
        await timing.screenshot({path:`motion-timing-${name}.png`,animations:"allow"});
      }
    }
    states.push({type:"motionTiming",samples});
    console.log("TIMING "+JSON.stringify(samples));
    if(samples.some(s=>s.transforms.some(t=>t.opacity!=="1")))process.exitCode=1;
    const settled=samples[samples.length-1];
    if(settled.active!=="true")process.exitCode=1;
    if(settled.transforms.some(t=>t.transform!=="none" && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(t.transform)))process.exitCode=1;
  }finally{await timing.close()}
}finally{await browser.close()}
fs.writeFileSync("motion-visual-comparison.json",JSON.stringify(states,null,2));
