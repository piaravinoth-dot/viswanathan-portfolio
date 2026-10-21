type StoryPlan={root:string;intro:string;chapters:string;distance:number;duration:number};
const plans:StoryPlan[]=[
 {root:'.cs-case',intro:'.cs-hero-title h1,.cs-hero-title>p,.cs-hero-stage',chapters:'.cs-case>section h2,.cs-evidence figure,.cs-feature-stage,.cs-flow-grid>div,.cs-principles-list>div,.cs-editorial-stage',distance:22,duration:720},
 {root:'.si-case',intro:'.si-hero h1,.si-hero-head>div,.si-hero-stage',chapters:'.si-case>section h2,.si-feature-frame,.si-fact-grid>div,.si-process-grid>div,.si-architecture-board,.si-decisions-grid>div',distance:16,duration:620},
 {root:'.ct-case',intro:'.ct-hero-title h1,.ct-hero-title>div,.ct-hero-art',chapters:'.ct-case>section h2,.ct-fullmock,.ct-grid-stage,.ct-flow-step,.ct-detail-scene,.ct-queue-screen,.ct-mobile-stage',distance:14,duration:580},
 {root:'.sm-case',intro:'.sm-hero-title h1,.sm-hero-sub,.sm-hero-stage',chapters:'.sm-case>section h2,.sm-journey-grid>div,.sm-balance-stage,.sm-expense-stage,.sm-pair-stage,.sm-settlement-stage,.sm-design-decisions article',distance:20,duration:760},
 {root:'.cl-case',intro:'.cl-hero-title h1,.cl-hero-title>div,.cl-hero-board',chapters:'.cl-case>section h2,.cl-input-visual,.cl-job-study,.cl-cut-console,.cl-format-selector,.cl-principles>div,.cl-evidence-grid>article,.cl-close h2',distance:12,duration:520},
 {root:'.communication-case',intro:'.comm-hero h1,.comm-hero>p,.comm-hero>figure',chapters:'.comm-brief>div,.comm-evidence h2,.comm-evidence dl>div,.comm-decisions h2,.comm-decisions article,.comm-story>figure,.comm-links h2,.comm-next',distance:18,duration:780}
];
/** One-time entrances using individual translate to preserve existing artwork rotations. */
export function enableCaseMotion(root:HTMLElement){
 const plan=plans.find(item=>root.matches(item.root));
 if(!plan||typeof Element.prototype.animate!=='function'||typeof IntersectionObserver==='undefined')return()=>{};
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),compact=matchMedia('(max-width: 760px)');
 const running=new Map<HTMLElement,Animation>(),revealed=new Set<HTMLElement>();
 let observer:IntersectionObserver|undefined,disposed=false,sequence=0;
 const cancelAll=()=>{running.forEach(animation=>animation.cancel());running.clear()};
 const reveal=(element:HTMLElement,delay=0)=>{
  if(disposed||preference.matches||document.hidden||revealed.has(element))return;
  revealed.add(element);element.dataset.caseRevealed='true';if(element.contains(document.activeElement))return;
  const small=compact.matches;
  const animation=element.animate([{translate:`0 ${small?Math.min(plan.distance,8):plan.distance}px`},{translate:'0 0'}],{duration:small?380:plan.duration,delay:small?Math.min(delay,40):delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
  animation.id=`portfolio-case-${++sequence}`;running.set(element,animation);
  animation.onfinish=()=>{running.delete(element);animation.cancel()};
 };
 const start=()=>{
  observer?.disconnect();cancelAll();if(preference.matches){root.dataset.caseMotion='reduced';return}root.dataset.caseMotion='active';
  const intro=[...root.querySelectorAll<HTMLElement>(plan.intro)];
  intro.forEach((element,index)=>{const box=element.getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight)reveal(element,index*65)});
  const targets=[...root.querySelectorAll<HTMLElement>(plan.chapters)].filter(element=>!intro.includes(element));
  const outer=targets.filter(element=>!targets.some(parent=>parent!==element&&parent.contains(element)));
  observer=new IntersectionObserver(entries=>{
   entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top).forEach((entry,index)=>{if(document.hidden)return;observer?.unobserve(entry.target);reveal(entry.target as HTMLElement,Math.min(index,2)*65)});
  },{threshold:0,rootMargin:'0px 0px -5% 0px'});
  outer.filter(element=>!revealed.has(element)).forEach(element=>observer!.observe(element));
 };
 const focus=(event:FocusEvent)=>{if(!(event.target instanceof Element))return;running.forEach((animation,element)=>{if(element.contains(event.target as Element)){animation.cancel();running.delete(element)}})};
 const visibility=()=>{if(document.hidden)cancelAll();else start()};
 preference.addEventListener('change',start);document.addEventListener('visibilitychange',visibility);root.addEventListener('focusin',focus);start();
 return()=>{disposed=true;observer?.disconnect();cancelAll();preference.removeEventListener('change',start);document.removeEventListener('visibilitychange',visibility);root.removeEventListener('focusin',focus);revealed.forEach(element=>delete element.dataset.caseRevealed);delete root.dataset.caseMotion};
}
