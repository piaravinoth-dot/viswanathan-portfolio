import {chromium} from 'playwright';
import fs from 'node:fs';
const base=process.env.QA_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const cases=['ai-design-studio','content-studio','social-media-intelligence','content-tracker','splitmate','clip-studio'];
const tests=[
  {name:'mobile homepage 375px',width:375,path:'/'},
  {name:'desktop homepage 1440px',width:1440,path:'/'},
  ...cases.flatMap(slug=>[
    {name:slug+' mobile 375px',width:375,path:'/work/'+slug},
    {name:slug+' desktop 1440px',width:1440,path:'/work/'+slug}
  ])
];
const results=[];
for(const t of tests){
  const page=await browser.newPage({viewport:{width:t.width,height:900}});
  try{
    await page.goto(base+t.path,{waitUntil:'domcontentloaded',timeout:35000});
    // Case studies are lazy-loaded. Audit the actual document, not Suspense's
    // transient Loading case study placeholder (which has no heading).
    await page.waitForFunction(() => {
      const main=document.querySelector('main');
      return Boolean(main && main.getAttribute('role')!=='status' && document.querySelector('h1'));
    },null,{timeout:20000});
    await page.waitForTimeout(250);
    await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
    const a=await page.evaluate(async()=>await window.axe.run(document,{
      runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}
    }));
    const found=a.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,
      nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
    results.push({scenario:t.name,violations:found,passes:a.passes.length,incomplete:a.incomplete.length});
    console.log(t.name+' | '+a.passes.length+' checks passed, '+found.length+' violations');
    for(const v of found)console.log('  '+v.impact+' '+v.id+' '+JSON.stringify(v.nodes).slice(0,1000));
  }catch(e){results.push({scenario:t.name,error:String(e)});console.error(t.name+' ERROR '+String(e))}
  finally{await page.close()}
}
await browser.close();
fs.writeFileSync('qa-accessibility-results.json',JSON.stringify(results,null,2));
const serious=results.flatMap(x=>x.violations||[]).filter(v=>['critical','serious'].includes(v.impact));
const moderate=results.flatMap(x=>x.violations||[]).filter(v=>v.impact==='moderate');
const errors=results.filter(x=>x.error);
console.log('Accessibility QA complete: '+tests.length+' pages tested; '+serious.length+' serious/critical, '+moderate.length+' moderate violations; '+errors.length+' testing errors');
if(serious.length||moderate.length||errors.length)process.exitCode=1;
