import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {chromium} from "playwright";
const origin=process.env.QA_URL||"http://127.0.0.1:4173";
const browser=await chromium.launch({headless:true,channel:"chrome",args:["--no-sandbox"]});
const results=[];const check=(name)=>{results.push(name);console.log("PASS",name)};
try{
 for(const [device,width,height] of [["iphone",390,844],["iphone-pro-max",428,926],["android",412,915],["tablet",820,1180],["desktop",1440,900]]){
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
  try{
    await page.waitForFunction(()=>{
      const r=document.querySelector(".toolkit-stage").getBoundingClientRect();
      return r.top<innerHeight*.85&&r.bottom>innerHeight*.1;
    },null,{timeout:8000});
  }catch{
    // On touch-enabled tablet, ScrollSmoother can still be settling after
    // native window.scrollTo. Recover with an element-aware scroll before
    // asserting the final position, rather than failing on transition timing.
    await toolkit.locator(".toolkit-stage").scrollIntoViewIfNeeded({timeout:10000});
    await page.waitForFunction(()=>{
      const r=document.querySelector(".toolkit-stage").getBoundingClientRect();
      return r.top<innerHeight*.85&&r.bottom>innerHeight*.1;
    },null,{timeout:10000});
  }
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
  if(width<=760){

    // Smooth CSS orbital motion must progress without changing the selected tool.
    const readStableLayout=()=>toolkit.evaluate(el=>{
      const focus=el.querySelector(".toolkit-focus-copy");
      const description=focus.querySelector("p");
      const stage=el.querySelector(".toolkit-stage");
      const panel=focus.getBoundingClientRect();
      return {
        focusHeight:panel.height,
        stageTop:stage.getBoundingClientRect().top,
        descriptionFits:description.getBoundingClientRect().bottom<=panel.bottom+1
      };
    });
    const beforeLayout=await readStableLayout();
    const autoBefore=await toolkit.locator(".toolkit-focus-copy strong").innerText();
    await page.waitForTimeout(600);
    const autoAfter=await toolkit.locator(".toolkit-focus-copy strong").innerText();
    assert.equal(autoBefore,autoAfter,"mobile orbit should not change selected tool every few seconds");
    check(device+" selected description remains stable during rotation");
    const afterLayout=await readStableLayout();
    assert.equal(afterLayout.focusHeight,beforeLayout.focusHeight,"focus panel resized during autoplay");
    assert(Math.abs(afterLayout.stageTop-beforeLayout.stageTop)<=2,
      "mobile page shifts when tool name changes: "+JSON.stringify({beforeLayout,afterLayout}));
    assert(beforeLayout.descriptionFits&&afterLayout.descriptionFits,"focus description extends into mobile artwork");
    check(device+" tool text updates without shifting the scroll layout");
    const mobile=await toolkit.locator(".toolkit-stage").evaluate(el=>({
      touchAction:getComputedStyle(el).touchAction,
      visible:[...el.querySelectorAll(".toolkit-tile")].filter(t=>getComputedStyle(t).display!=="none").length
    }));
    assert.equal(mobile.touchAction,"pan-y","vertical native scrolling must remain available");
    assert.equal(mobile.visible,16,"all sixteen tools must be in the mobile orbit");
    check(device+" all sixteen tools participate with vertical pan preserved");
    const titleBeforeSwipe=await toolkit.locator(".toolkit-focus-copy strong").innerText();
    const rect=await toolkit.locator(".toolkit-stage").boundingBox();
    assert(rect,"mobile stage bounding box missing");
    await page.evaluate(()=>{
      const stage=document.querySelector(".toolkit-stage");
      stage.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[new Touch({identifier:1,target:stage,clientX:280,clientY:320})]}));
      stage.dispatchEvent(new TouchEvent("touchend",{bubbles:true,changedTouches:[new Touch({identifier:1,target:stage,clientX:160,clientY:319})]}));
    });
    assert.notEqual(await toolkit.locator(".toolkit-focus-copy strong").innerText(),titleBeforeSwipe,"horizontal swipe did not change focus");
    check(device+" horizontal swipe changes tool");
  }
  if(width<=760){
    // Composited CSS motion avoids constant React state updates during native touch scroll.
    const sample=()=>toolkit.locator(".toolkit-tile[data-orbit-index='0']").evaluate(el=>({
      name:getComputedStyle(el).animationName,
      distance:getComputedStyle(el).offsetDistance,
      pos:(()=>{const r=el.getBoundingClientRect();return [r.left,r.top]})(),
      left:el.style.left
    }));
    await page.waitForTimeout(220);
    const before=await sample();
    await page.waitForTimeout(650);
    const after=await sample();
    assert(before.name.includes("toolkit-spaced-sixteen-orbit"),"all-sixteen mobile orbit animation not active");
    assert.notEqual(before.distance,after.distance,"mobile orbital progress did not advance");
    assert.notDeepEqual(before.pos,after.pos,"mobile orbit icons did not physically move");
    assert.equal(before.left,after.left,"mobile orbit still triggers per-frame React layout changes");
    check(device+" continuous orbital motion with no per-frame React layout updates");
    const phases=await toolkit.locator(".toolkit-stage .toolkit-tile").evaluateAll(els=>els.map(el=>({
      name:el.getAttribute("aria-label"),
      animation:getComputedStyle(el).animationName,
      delay:getComputedStyle(el).animationDelay
    })));
    assert.equal(phases.length,16,"all tools must be present");
    assert.equal(new Set(phases.map(x=>x.name)).size,16,"tool identities duplicated");
    assert.equal(new Set(phases.map(x=>x.delay)).size,16,"all sixteen require distinct orbital phases");
    assert(phases.every(x=>x.animation.includes("toolkit-spaced-sixteen-orbit")),"a tool is missing orbital motion");
    check(device+" all sixteen distinct tools are continuously phased around the orbit");
    if(device==="iphone")await toolkit.screenshot({path:"qa-tools-iphone-orbit-debug.png",animations:"allow"});
    // Verify the visible icons do not pile up over the hand or each other.
    // Sample multiple animation frames so one lucky screenshot cannot pass.
    for(let frame=0;frame<5;frame++){
      const g=await toolkit.locator(".toolkit-stage").evaluate(stage=>{
        const bound=stage.getBoundingClientRect();
        const hand=stage.querySelector(".toolkit-hand").getBoundingClientRect();
        const items=[...stage.querySelectorAll(".toolkit-tile")].filter(el=>{
          const css=getComputedStyle(el);
          return Number(css.opacity)>.6&&css.pointerEvents!=="none";
        }).map(el=>{const v=el.getBoundingClientRect();return {name:el.getAttribute("aria-label"),x:v.left+v.width/2,y:v.top+v.height/2,w:v.width,h:v.height,distance:getComputedStyle(el).offsetDistance};});
        return {cx:bound.left+bound.width/2,cy:bound.top+bound.height/2,stage:{left:bound.left,right:bound.right,top:bound.top,bottom:bound.bottom},items,handY:hand.top};
      });
      assert(g.items.length>=3&&g.items.length<=5,"expected four spaced orbit icons around the hand: "+g.items.length);
      for(let i=0;i<g.items.length;i++){
        const a=g.items[i];
        assert(a.x>g.stage.left+20&&a.x<g.stage.right-20&&a.y>g.stage.top+20&&a.y<g.stage.bottom-20,"visible icon clipped outside orbit stage: "+JSON.stringify(a));
        assert(Math.abs(a.x-g.cx)>40||Math.abs(a.y-g.cy)>65,"icon obscures hand centre: "+JSON.stringify({a,cx:g.cx,cy:g.cy}));
        for(let j=i+1;j<g.items.length;j++){
          const b=g.items[j];
          assert(Math.hypot(a.x-b.x,a.y-b.y)>48,"orbit icons overlap: "+JSON.stringify({a,b}));
        }
      }
      await page.waitForTimeout(350);
    }
    check(device+" rotating mobile icons do not cluster over the hand");


    const hand=await toolkit.locator(".toolkit-hand").evaluate(el=>{
      const a=el.getBoundingClientRect(),b=el.closest(".toolkit-stage").getBoundingClientRect();
      return {top:a.top,bottom:a.bottom,stageTop:b.top,stageBottom:b.bottom};
    });
    assert(hand.top>=hand.stageTop-2&&hand.bottom<=hand.stageBottom+2,"illustrated hand cropped: "+JSON.stringify(hand));
    check(device+" illustrated hand fits entirely inside mobile stage");
  } else if(device==="desktop"){
    // Desktop maintains the animated orbit with all sixteen icons.
    await page.waitForTimeout(200);
    const beforeAngle=await toolkit.locator(".toolkit-tile").first().evaluate(el=>el.style.left);
    await page.waitForTimeout(800);
    const afterAngle=await toolkit.locator(".toolkit-tile").first().evaluate(el=>el.style.left);
    assert.notEqual(beforeAngle,afterAngle,"desktop orbit did not autoplay while stage visible");
    check(device+" active autoplay advances tiles");
  }
  assert.equal(await toolkit.getByRole("button",{name:"Select Figma"}).locator(".toolkit-tile-face svg").count(),1,"Figma brand icon missing");
  check(device+" Figma renders original brand icon");
  await toolkit.locator(".toolkit-category").nth(1).evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").count(),4);
  if(width<=760)assert.equal(await toolkit.locator(".toolkit-tile").evaluateAll(els=>els.filter(el=>Number(getComputedStyle(el).opacity)>.9).length),4,"filtered Design tools should stay visible");
  check(device+" Design filter still shows four tools");
  await toolkit.locator(".toolkit-category").first().evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").count(),16);
  assert.equal(await toolkit.locator(".toolkit-category").first().getAttribute("aria-pressed"),"true");
  check(device+" All restores the complete sixteen-tool orbit");
  await toolkit.locator(".toolkit-category").nth(2).evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").count(),2);
  if(width<=760)assert.equal(await toolkit.locator(".toolkit-tile").evaluateAll(els=>els.filter(el=>Number(getComputedStyle(el).opacity)>.9).length),2,"filtered Motion tools should stay visible");
  assert.equal(await toolkit.locator(".toolkit-focus-copy strong").innerText(),"Adobe After Effects");
  check(device+" filters motion tools");
  await toolkit.locator(".toolkit-category").nth(3).evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").count(),8);
  if(width<=760)assert.equal(await toolkit.locator(".toolkit-tile").evaluateAll(els=>els.filter(el=>Number(getComputedStyle(el).opacity)>.9).length),8,"filtered Development tools should stay visible");
  check(device+" filters development tools");
  await toolkit.locator(".toolkit-category").nth(4).evaluate(el=>el.click());
  assert.equal(await toolkit.locator(".toolkit-tile").count(),2);
  if(width<=760)assert.equal(await toolkit.locator(".toolkit-tile").evaluateAll(els=>els.filter(el=>Number(getComputedStyle(el).opacity)>.9).length),2,"filtered AI tools should stay visible");
  check(device+" filters AI tools");
  if(width<=760){
    // A shorthand animation override must retain the per-icon phase delays:
    // otherwise filtered icons all pile up at the same spot.
    const filtered=await toolkit.locator(".toolkit-stage .toolkit-tile").evaluateAll(els=>els.map(el=>{
      const r=el.getBoundingClientRect(),s=getComputedStyle(el);
      return {x:r.left+r.width/2,y:r.top+r.height/2,delay:s.animationDelay,opacity:Number(s.opacity)};
    }));
    assert.equal(new Set(filtered.map(x=>x.delay)).size,2,"filtered icons lost distinct orbit delays");
    assert(Math.hypot(filtered[0].x-filtered[1].x,filtered[0].y-filtered[1].y)>90,
      "filtered icons are stacked: "+JSON.stringify(filtered));
    check(device+" filtered orbit keeps distinct icon positions");
  }

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
  if(device==="iphone"||device==="iphone-pro-max"||device==="desktop"){
    await toolkit.locator(".toolkit-category").nth(1).evaluate(el=>el.click());
    await page.waitForTimeout(450);
    await toolkit.screenshot({path:"qa-tools-"+device+".png",animations:"allow"});
  }
  assert.deepEqual(errs,[]);
  check(device+" no browser errors");
  await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});
 const page=await ctx.newPage();await page.goto(origin+"/",{waitUntil:"domcontentloaded"});
 await page.locator("#toolkit .toolkit-category").nth(3).evaluate(el=>el.click());
 await page.waitForFunction(()=>document.querySelectorAll("#toolkit .toolkit-tile").length===8,null,{timeout:5000});
 assert.equal(await page.locator("#toolkit .toolkit-tile").count(),8);
 check("reduced motion mode remains interactive");
 await ctx.close();
}finally{await browser.close();await fs.writeFile("qa-tools-results.json",JSON.stringify(results,null,2))}
console.log("TOOLS ORBIT QA:",results.length,"checks passed");
