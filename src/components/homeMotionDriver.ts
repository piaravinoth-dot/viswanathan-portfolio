/** Homepage-only progressive enhancement. Text is never hidden before JavaScript. */
export function enableHomeMotion(root:HTMLElement){
  if(typeof Element.prototype.animate!=="function"||typeof IntersectionObserver==="undefined")return()=>{};
  const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact=window.matchMedia("(max-width: 760px)");
  const running=new Map<HTMLElement,Animation>();
  let observer:IntersectionObserver|undefined;
  let disposed=false,sequence=0;
  const finishAll=()=>{running.forEach(animation=>animation.cancel());running.clear();};
  const reveal=(element:HTMLElement,delay=0,hero=false)=>{
    if(disposed||document.hidden||preference.matches||element.contains(document.activeElement))return;
    const small=compact.matches;
    const distance=hero?(small?10:16):(small?12:24);
    const animation=element.animate([
      {transform:`translate3d(0,${distance}px,0)`},
      {transform:"translate3d(0,0,0)"}
    ],{duration:small?420:650,delay:small?Math.min(delay,70):delay,easing:"cubic-bezier(.16,1,.3,1)",fill:"backwards"});
    animation.id=`portfolio-home-${++sequence}`;
    element.dataset.homeRevealed="true";
    running.set(element,animation);
    animation.onfinish=()=>{running.delete(element);animation.cancel();};
  };
  const start=()=>{
    observer?.disconnect();finishAll();
    if(preference.matches){root.dataset.homeMotion="reduced";return;}
    root.dataset.homeMotion="active";
    const hero=root.querySelector<HTMLElement>(".landing-intro");
    if(hero&&hero.getBoundingClientRect().bottom>0&&hero.getBoundingClientRect().top<window.innerHeight){
      hero.querySelectorAll<HTMLElement>(".landing-greeting,h1,.landing-primary-role,.landing-summary,.landing-actions").forEach((element,index)=>reveal(element,index*55,true));
    }
    const targets=[...root.querySelectorAll<HTMLElement>([
      ".about-copy p",".selected-cases-intro>div",".selected-cases-intro>p",".selected-case",
      ".product-heading-grid",".product-count",".cap-intro",".cap-item",
      ".work-intro",".art-piece",".contact-heading",".contact-form",".contact-details"
    ].join(","))];
    observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      visible.forEach((entry,index)=>{observer?.unobserve(entry.target);reveal(entry.target as HTMLElement,Math.min(index,2)*75);});
    },{threshold:0.08,rootMargin:"0px 0px -4% 0px"});
    targets.forEach(element=>observer!.observe(element));
  };
  const focus=(event:FocusEvent)=>{
    if(!(event.target instanceof Element))return;
    running.forEach((animation,element)=>{if(element.contains(event.target as Element)){animation.cancel();running.delete(element);}});
  };
  const visibility=()=>{if(document.hidden)finishAll();};
  preference.addEventListener("change",start);
  document.addEventListener("visibilitychange",visibility);
  root.addEventListener("focusin",focus);
  start();
  return()=>{
    disposed=true;observer?.disconnect();finishAll();
    preference.removeEventListener("change",start);
    document.removeEventListener("visibilitychange",visibility);
    root.removeEventListener("focusin",focus);
    root.querySelectorAll<HTMLElement>("[data-home-revealed]").forEach(element=>delete element.dataset.homeRevealed);
    delete root.dataset.homeMotion;
  };
}
