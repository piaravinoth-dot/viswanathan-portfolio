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
    await page.locator('.orbit-index').waitFor({state:'attached',timeout:30000});
    await page.waitForTimeout(700);
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
    if(width===375||width===1440){
      log(name,width,'no manual 3D switch',await page.locator('.hero-3d-trigger').count()===0);
      if(name==='chromium'){
        const auto3D=await page.locator('.character-model').waitFor({state:'attached',timeout:14000}).then(()=>true).catch(()=>false);
        log(name,width,'3D starts automatically',auto3D);
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
    }
  }finally{await browser.close();}
}
fs.writeFileSync('qa-browser-results.json',JSON.stringify({url:base,createdAt:new Date().toISOString(),results},null,2));
const failed=results.filter(x=>x.status==='FAIL');
console.log(`QA totals: ${results.length} checks; ${failed.length} failures`);
if(failed.length)process.exitCode=1;
