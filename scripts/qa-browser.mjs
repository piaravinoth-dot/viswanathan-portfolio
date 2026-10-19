import fs from 'node:fs';
import { chromium, firefox, webkit } from 'playwright';

const base = process.env.QA_URL || 'https://viswanathan-portfolio-iota.vercel.app';
const widths = [320, 375, 425, 768, 1024, 1440, 1920];
const slugs = ['ai-design-studio','content-studio','social-media-intelligence','content-tracker','splitmate','clip-studio'];
const browsers = [['chromium',chromium],['firefox',firefox],['webkit',webkit]];
const results = [];

function log(browser, viewport, check, ok, detail='') {
  const row = {browser, viewport, check, status:ok?'PASS':'FAIL', detail:String(detail).slice(0,500)};
  results.push(row);
  console.log(`${row.status} | ${browser} | ${viewport} | ${check} ${detail}`);
}
async function testViewport(browser, name, width) {
  const page = await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1,hasTouch:width<=768});
  page.setDefaultTimeout(15000);
  try {
    const response = await page.goto(base, {waitUntil:'domcontentloaded',timeout:60000});
    log(name,width,'homepage HTTP',response?.status()===200,response?.status()||'no response');
    const welcome = page.locator('.loading-screen');
    if(width===375 || width===1440){
      // The original welcome screen must appear on homepage entry, then exit
      // without blocking keyboard, carousel or case-study navigation.
      await welcome.waitFor({state:'visible',timeout:15000});
      log(name,width,'Welcome intro appears',await page.locator('.loading-content2').getByText('Welcome').count()===1);
    }
    await welcome.waitFor({state:'hidden',timeout:10000});
    if(width===375 || width===1440){
      log(name,width,'Welcome intro dismisses automatically',await welcome.count()===0);
    }
    await page.locator('.orbit-index').waitFor({state:'attached',timeout:30000});
    await page.waitForTimeout(250);
    const metrics = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('.orbit-index button')];
      const element = document.querySelector('.mobile-product-orbit');
      return {
        vw:window.innerWidth,
        scrollWidth:document.documentElement.scrollWidth,
        indexCount:buttons.length,
        indexRects:buttons.map(b=>{const r=b.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width}}),
        sectionWidth:element?.getBoundingClientRect().width || 0
      };
    });
    log(name,width,'six index buttons',metrics.indexCount===6,`count=${metrics.indexCount}`);
    const tolerance=3;
    const within=metrics.indexRects.every(r=>r.width>0&&r.left>=-tolerance&&r.right<=metrics.vw+tolerance);
    log(name,width,'index buttons within viewport',within,JSON.stringify(metrics.indexRects.map(r=>[Math.round(r.left),Math.round(r.right)])));
    log(name,width,'no document horizontal overflow',metrics.scrollWidth<=metrics.vw+tolerance,`scrollWidth=${metrics.scrollWidth} viewport=${metrics.vw}`);
    const linkedIn=page.locator('a[href*="linkedin.com/in/viswanathan-g-55a0176a"]');
    log(name,width,'exactly one LinkedIn link',await linkedIn.count()===1,`count=${await linkedIn.count()}`);
    log(name,width,'LinkedIn retained in right-hand rail',await page.locator('.icons-section .resume-button[href*="linkedin.com"]').count()===1);
    if(name==='chromium' && (width===375||width===1440)){
      log(name,width,'portfolio footer credits Viswanathan G',
        await page.locator('.contact-footer .contact-copyright').getByText('2026 Viswanathan G').count()===1);
      log(name,width,'no inherited template brand in homepage text',
        await page.locator('body').evaluate(el=>!/Malhotra Dev|Akash Malhotra/i.test(el.innerText)));
    }
    if(width>=1025){
      const desktop = await page.evaluate(() => {
        const github = document.querySelector('.social-icons a[aria-label="GitHub"]');
        const linkedIn = document.querySelector('.resume-button');
        const about = document.querySelector('.about-section');
        const aside = document.querySelector('.about-aside');
        const cap = document.querySelector('.whatIDO');
        const gh = github?.getBoundingClientRect();
        const li = linkedIn?.getBoundingClientRect();
        return {
          ghLeft:gh?.left ?? -1,
          liLeft:li?.left ?? -1,
          viewport:window.innerWidth,
          aboutHeight:about?.getBoundingClientRect().height ?? 99999,
          viewportHeight:window.innerHeight,
          asideVisible:Boolean(aside && getComputedStyle(aside).display!=='none'),
          capPadding:cap ? parseFloat(getComputedStyle(cap).paddingTop) : 99999
        };
      });
      log(name,width,'GitHub and LinkedIn both anchored on right',desktop.ghLeft>desktop.viewport*.83&&desktop.liLeft>desktop.viewport*.83,JSON.stringify([desktop.ghLeft,desktop.liLeft,desktop.viewport]));
      log(name,width,'No copy overlaps the 3D character',!desktop.asideVisible);
      log(name,width,'desktop About avoids forced full-screen spacer',desktop.aboutHeight<desktop.viewportHeight*.96,`about height=${desktop.aboutHeight}, viewport=${desktop.viewportHeight}`);
      log(name,width,'About to capabilities top padding compact',desktop.capPadding<=76,`padding=${desktop.capPadding}`);
    }
    if(name==='chromium' && width===375) {
      const about = page.locator('.about-me');
      await about.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const before = await about.evaluate(el => {
        const r = el.getBoundingClientRect();
        return {x:r.x,width:r.width,transform:getComputedStyle(el).transform,text:el.textContent?.trim()};
      });
      // Simulates mobile address-bar expansion without changing layout width.
      await page.setViewportSize({width:375,height:830});
      await page.waitForTimeout(450);
      const after = await about.evaluate(el => {
        const r = el.getBoundingClientRect();
        return {x:r.x,width:r.width,transform:getComputedStyle(el).transform,text:el.textContent?.trim()};
      });
      log(name,width,'mobile About text remains stable on height-only resize',
        before.text===after.text && Math.abs(before.x-after.x)<2 &&
        Math.abs(before.width-after.width)<2 &&
        before.transform===after.transform,
        `x=${before.x.toFixed(1)}→${after.x.toFixed(1)}, width=${before.width.toFixed(1)}→${after.width.toFixed(1)}`);
      await page.setViewportSize({width:375,height:900});
    }
    if(name==='chromium' && width===1440) {
      const orbit = page.locator('.mobile-product-orbit');
      await orbit.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const el = document.querySelector('.mobile-product-orbit');
        if (!el) return false;
        const box = el.getBoundingClientRect();
        return box.top < innerHeight && box.bottom > 0;
      },null,{timeout:5000});
      const initialIndex = await page.locator('.orbit-card.orbit-active').getAttribute('class');
      const changed = await page.waitForFunction(initial => {
        const active = document.querySelector('.orbit-card.orbit-active');
        return active && active.className !== initial;
      },initialIndex,{timeout:8500}).then(()=>true).catch(()=>false);
      log(name,width,'desktop products auto-rotate when visible',changed);
      const control = page.locator('.orbit-autoplay');
      log(name,width,'desktop pause rotation control visible',await control.isVisible());
      await control.click();
      await page.waitForFunction(() => document.querySelector('.orbit-autoplay')?.getAttribute('aria-pressed')==='false',null,{timeout:2000}).catch(()=>null);
      const pauseState=await control.evaluate(el=>({text:el.textContent?.trim(),pressed:el.getAttribute('aria-pressed')}));
      log(name,width,'desktop pause control switches to Play',pauseState.pressed==='false'&&pauseState.text==='Play rotation',JSON.stringify(pauseState));
      const pausedIndex = await page.locator('.orbit-card.orbit-active').getAttribute('class');
      await page.waitForTimeout(5900);
      const stillPaused = await page.locator('.orbit-card.orbit-active').getAttribute('class');
      log(name,width,'desktop rotation stays paused on request',pausedIndex===stillPaused);
      if(pauseState.pressed==='false'){
        await control.click();
        const resumed=await control.evaluate(el=>({text:el.textContent?.trim(),pressed:el.getAttribute('aria-pressed')}));
        log(name,width,'desktop Play control resumes rotation',resumed.pressed==='true'&&resumed.text==='Pause rotation',JSON.stringify(resumed));
        // Real-world case: visitor scrolls into Products with a cursor on top
        // of the carousel, then clicks a numbered card. Neither state should
        // permanently suppress automatic rotation.
        await page.mouse.move(orbit ? 700 : 700, 430);
        const hoverBefore=await page.locator('.orbit-card.orbit-active').getAttribute('class');
        const hoverAdvances=await page.waitForFunction(initial => 
          document.querySelector('.orbit-card.orbit-active')?.className!==initial,
          hoverBefore,{timeout:8000}).then(()=>true).catch(()=>false);
        log(name,width,'autoplay continues with stationary pointer over products',hoverAdvances);
        await page.locator('.orbit-index button').nth(2).click();
        const selectedAfterClick=await page.locator('.orbit-card.orbit-active').getAttribute('class');
        const resumesAfterClick=await page.waitForFunction(initial =>
          document.querySelector('.orbit-card.orbit-active')?.className!==initial,
          selectedAfterClick,{timeout:18000}).then(()=>true).catch(()=>false);
        log(name,width,'autoplay resumes after pointer selection',resumesAfterClick);
      }
    }
    if(width===375||width===1440){
      log(name,width,'no manual 3D switch',await page.locator('.hero-3d-trigger').count()===0);
      if(name==='chromium'){
        const status=await page.waitForFunction(()=>
          document.documentElement.dataset.character3d==='starting' ||
          document.documentElement.dataset.character3d==='unsupported',
          null,{timeout:14000}
        ).then(handle=>handle.jsonValue()).catch(()=>null);
        const mode=await page.evaluate(()=>document.documentElement.dataset.character3d||'not-started');
        const mounted=await page.locator('.character-model').count()===1;
        log(name,width,'automatic 3D starts with hardware or safely skips software renderer',
          Boolean(status)&&(mode==='unsupported'||mounted),mode+(mounted?' mounted':''));
        if(mode==='starting')log(name,width,'3D has mounted automatically',mounted);
      }
      await page.locator('.orbit-index button').nth(5).click({timeout:12000});
      // WebKit can be busy compiling the desktop hero's 3D scene.
      // Wait for the actual state transition rather than a fixed 1.1 s.
      await page.waitForFunction(() =>
        document.querySelector('.orbit-card.orbit-active')?.textContent?.includes('Clip Studio'),
        null,{timeout:20000}
      ).catch(()=>null);
      const selected=await page.locator('.orbit-card.orbit-active').textContent();
      log(name,width,'index 06 selects Clip Studio',Boolean(selected?.includes('Clip Studio')));
      // Skill-led UX: carousel must work without pointer input, with a focus
      // indicator and the selected slide announced to assistive technology.
      const orbit=page.locator('.mobile-product-orbit');
      await orbit.focus();
      log(name,width,'carousel has visible keyboard focus',await orbit.evaluate(el=>el===document.activeElement&&getComputedStyle(el).outlineStyle!=='none'&&parseFloat(getComputedStyle(el).outlineWidth)>=2));
      await page.keyboard.press('ArrowRight');
      await page.waitForFunction(()=>document.querySelector('.orbit-card.orbit-active')?.textContent?.includes('AI Design Studio'),null,{timeout:4000});
      log(name,width,'ArrowRight advances carousel',await page.locator('.orbit-card.orbit-active').textContent().then(t=>Boolean(t?.includes('AI Design Studio'))));
      await page.keyboard.press('ArrowLeft');
      await page.waitForFunction(()=>document.querySelector('.orbit-card.orbit-active')?.textContent?.includes('Clip Studio'),null,{timeout:4000});
      log(name,width,'ArrowLeft reverses carousel',await page.locator('.orbit-card.orbit-active').textContent().then(t=>Boolean(t?.includes('Clip Studio'))));
      if(name==='chromium'&&width===375){
        await page.waitForTimeout(4750);
        log(name,width,'mobile auto-rotation pauses on keyboard focus',await page.locator('.orbit-card.orbit-active').textContent().then(t=>Boolean(t?.includes('Clip Studio'))));
      }
      log(name,width,'selected title exposes live status',await page.locator('.orbit-controls span[aria-live]').count()===1);
      const href=await page.locator('.orbit-card.orbit-active a.orbit-card-action').getAttribute('href');
      log(name,width,'case study link target',href==='/work/clip-studio',href||'none');
      if(href==='/work/clip-studio'){
        await page.locator('.orbit-card.orbit-active .orbit-card-action').click({timeout:12000});
        await page.waitForURL('**/work/clip-studio',{timeout:15000});
        log(name,width,'case study opens on click',page.url().endsWith('/work/clip-studio'),page.url());
      }
    }
  } catch(e) {
    log(name,width,'browser scenario completes',false,e.message);
  } finally {
    await page.close();
  }
}
async function testContact(browser,width) {
  const page=await browser.newPage({viewport:{width,height:900}});
  try {
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
    await page.locator('.loading-screen').waitFor({state:'hidden',timeout:10000});
    const name='chromium';
    const contact=page.locator('#contact');
    const form=contact.locator('form.contact-form');
    log(name,width,'minimal contact form has labelled fields',
    await form.locator('label').count()===3 &&
    await form.locator('input').count()===2 &&
    await form.locator('textarea').count()===1);
    log(name,width,'empty contact form cannot submit',
    await form.evaluate(el=>!el.checkValidity()));
    await form.locator('[name="name"]').fill('Test Visitor');
    await form.locator('[name="email"]').fill('not-an-email');
    await form.locator('[name="message"]').fill('I would like to discuss a portfolio collaboration.');
    log(name,width,'contact form rejects invalid email',
    await form.evaluate(el=>!el.checkValidity()));
    await form.locator('[name="email"]').fill('visitor@example.com');
    log(name,width,'valid contact form accepts required inputs',
    await form.evaluate(el=>el.checkValidity()));
    const rect=await form.evaluate(el=>({x:el.getBoundingClientRect().x,width:el.getBoundingClientRect().width,viewport:innerWidth}));
    log(name,width,'contact form contained within viewport',
    rect.x>=-2 && rect.x+rect.width<=rect.viewport+2,JSON.stringify(rect));
    log(name,width,'contact has transparent email-app handoff notice',
    await form.getByText('Opens your email app. Review and press Send there.').count()===1);
    await form.locator('[name="name"]').fill('');
    await form.locator('[name="email"]').fill('');
    await form.locator('[name="message"]').fill('');
  } catch(e) {
    log('chromium',width,'contact form scenario completes',false,String(e));
  } finally {
    await page.close();
  }
}

for (const [name,engine] of browsers) {
  let browser;
  try {browser=await engine.launch({headless:true});}
  catch (e) {log(name,'all','browser launches',false,e.message);continue;}
  try {
    for(const width of name==='chromium'?widths:[375,1440])await testViewport(browser,name,width);
    if(name==='chromium'){
      const page=await browser.newPage({viewport:{width:1280,height:800}});
      for(const slug of slugs){
        try {
          const res=await page.goto(`${base}/work/${slug}`,{waitUntil:'domcontentloaded',timeout:45000});
          const heading=await page.locator('h1,h2').first().textContent({timeout:15000});
          log(name,1280,`case study ${slug}`,res?.status()===200&&Boolean(heading),`status=${res?.status()} title=${heading?.trim().slice(0,75)}`);
        }catch(e){log(name,1280,`case study ${slug}`,false,e.message);}
      }
      await page.close();
      for (const width of [375,1440]) await testContact(browser,width);
    }
  }finally{await browser.close();}
}
fs.writeFileSync('qa-browser-results.json',JSON.stringify({url:base,createdAt:new Date().toISOString(),results},null,2));
const failed=results.filter(x=>x.status==='FAIL');
console.log(`QA totals: ${results.length} checks; ${failed.length} failures`);
if(failed.length)process.exitCode=1;
