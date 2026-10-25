import {useCallback,useEffect,useRef,useState} from "react";
import "./styles/CareerJourney.css";

// Original Career.tsx and Career.css deliberately remain unchanged for easy rollback.
const steps=[
 {company:"Peacock India",short:"Peacock India",logo:"P",years:"2015–2016",role:"Design Intern",color:"#ae806b",x:170,y:445,title:"Where it all began.",description:"I learned how creative ideas move into professional visual work: layout development, image editing, concepts and production-ready assets."},
 {company:"Ad2pro Media Solutions",short:"Ad2pro",logo:"A",years:"2016–2018",role:"Graphic Designer",color:"#7194a8",x:420,y:220,title:"Craft became a discipline.",description:"Digital and print advertising for clients in Australia and New Zealand taught me layout accuracy, branding, revision workflows and quality production."},
 {company:"I-PAC",short:"I-PAC",logo:"I",years:"2018–2019",role:"Senior Graphic Designer",color:"#67967d",x:730,y:375,title:"Communication at scale.",description:"I worked with political campaign and content teams to translate complex briefs into visual narratives across digital, editorial, presentation, print and field formats."},
 {company:"Nation with NaMo",short:"NaMo",logo:"N",years:"From 2019",role:"Creative / Design Leadership",color:"#ad8866",x:1030,y:165,title:"From making to leading.",description:"My work expanded into campaign creative direction, reusable design systems, team reviews and communication across digital, print and on-ground formats."}
] as const;
const route="M170 445 C240 445 290 215 420 220 C535 230 595 415 730 375 C840 345 900 125 1030 165";
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
export default function CareerJourney(){
 const [active,setActive]=useState(0);
 const scene=useRef<HTMLDivElement>(null),world=useRef<HTMLDivElement>(null),path=useRef<SVGPathElement>(null),drawn=useRef<SVGPathElement>(null),pointer=useRef<HTMLDivElement>(null);
 const distances=useRef<number[]>([]),total=useRef(0),current=useRef(0),target=useRef(0),velocity=useRef(0),frame=useRef(0),last=useRef(0);
 const selected=useRef(0),reduce=useRef(false);
 const place=useCallback(()=>{
  const host=scene.current,layer=world.current,road=path.current;
  if(!host||!layer||!road||!total.current)return;
  const w=host.clientWidth,h=host.clientHeight,narrow=w<710;
  const p=road.getPointAtLength(clamp(current.current,0,total.current));
  const prev=road.getPointAtLength(clamp(current.current-16,0,total.current));
  const next=road.getPointAtLength(clamp(current.current+16,0,total.current));
  const scale=narrow?Math.max(.67,Math.min(.86,w/485)):w<970?.84:1;
  const ax=w*(narrow?.50:.58),ay=h*(narrow?.30:.38);
  layer.style.transform="translate3d("+ax+"px,"+ay+"px,0) scale("+scale+") translate3d("+(-p.x).toFixed(2)+"px,"+(-p.y).toFixed(2)+"px,0)";
  if(pointer.current)pointer.current.style.transform="translate(-50%,-50%) rotate("+(Math.atan2(next.y-prev.y,next.x-prev.x)*180/Math.PI+90).toFixed(2)+"deg)";
  drawn.current?.setAttribute("stroke-dasharray",current.current+" "+total.current);
 },[]);
 const tick=useCallback((now:number)=>{
  frame.current=0;
  const dt=last.current?clamp((now-last.current)/1000,.001,.035):.016;
  last.current=now;
  velocity.current+=((target.current-current.current)*38-velocity.current*12.5)*dt;
  current.current+=velocity.current*dt;
  if(Math.abs(target.current-current.current)<.8&&Math.abs(velocity.current)<3){
   current.current=target.current;velocity.current=0;last.current=0;place();return;
  }
  place();frame.current=requestAnimationFrame(tick);
 },[place]);
 const visit=useCallback((index:number)=>{
  const n=clamp(index,0,steps.length-1);
  if(n===selected.current)return;
  selected.current=n;setActive(n);target.current=distances.current[n]??0;
  if(reduce.current){cancelAnimationFrame(frame.current);frame.current=0;current.current=target.current;velocity.current=0;place();}
  else if(!frame.current){last.current=0;frame.current=requestAnimationFrame(tick);}
 },[place,tick]);
 // Smooth-scroll may move a target between pointerdown and click. Activate once
 // on pointerdown for a mouse, and suppress its trailing synthetic click.
 const pointerHandledAt=useRef(0);
 const activatePointer=(i:number,event:{pointerType:string})=>{
   if(event.pointerType!=="mouse")return;
   pointerHandledAt.current=performance.now();
   visit(i);
 };
 const activateClick=(i:number)=>{
   if(performance.now()-pointerHandledAt.current<650){pointerHandledAt.current=0;return;}
   visit(i);
 };
 useEffect(()=>{
  const road=path.current;if(!road)return;
  total.current=road.getTotalLength();
  const distancesArr=[0];let from=0;
  for(let i=1;i<steps.length-1;i++){
   let at=from,best=Infinity;
   for(let d=from;d<=total.current;d+=5){
    const p=road.getPointAtLength(d),v=(p.x-steps[i].x)**2+(p.y-steps[i].y)**2;
    if(v<best){best=v;at=d;}
   }
   distancesArr.push(at);from=at;
  }
  distancesArr.push(total.current);distances.current=distancesArr;
  const media=window.matchMedia("(prefers-reduced-motion: reduce)");
  const onPreference=()=>{reduce.current=media.matches;if(media.matches){cancelAnimationFrame(frame.current);frame.current=0;current.current=target.current;velocity.current=0;place();}};
  onPreference();
  // Keep the floating LinkedIn tab from blocking the map's story card.
  const section=document.getElementById("career");
  const visibilityObserver=new IntersectionObserver(([entry])=>{
    document.body.classList.toggle("exp-journey-visible",entry.isIntersecting&&entry.intersectionRatio>.22);
  },{threshold:[0,.22,.55]});
  if(section)visibilityObserver.observe(section);
  const resize=new ResizeObserver(place);if(scene.current)resize.observe(scene.current);
  media.addEventListener("change",onPreference);place();
  scene.current?.closest<HTMLElement>(".exp-journey")?.setAttribute("data-interactive","true");
  return()=>{scene.current?.closest<HTMLElement>(".exp-journey")?.removeAttribute("data-interactive");resize.disconnect();visibilityObserver.disconnect();document.body.classList.remove("exp-journey-visible");media.removeEventListener("change",onPreference);cancelAnimationFrame(frame.current);};
 },[place]);
 const stop=steps[active];
 return <section className="exp-journey section-container" data-active-step={active} id="career" aria-labelledby="exp-journey-title">
  <div className="exp-journey-heading"><div><span className="exp-journey-eyebrow">FOUR PLACES · ONE CREATIVE JOURNEY</span>
   <h2 id="exp-journey-title">My professional <em>journey.</em></h2>
   <p>Explore the teams that shaped my creative practice, from the first design brief to campaign leadership.</p></div>
   <span className="exp-journey-instruction">SELECT A STOP OR FOLLOW THE ROUTE ↗</span>
  </div>
  <div className="exp-journey-stopbar" role="group" aria-label="Choose an employer">
   {steps.map((s,i)=><button key={s.company} type="button" aria-pressed={active===i} className={active===i?"is-selected":""} onPointerDown={e=>activatePointer(i,e)} onClick={()=>activateClick(i)}>
     <small>0{i+1}</small><span>{s.short}</span>
   </button>)}
  </div>
  <div className="exp-journey-scene" ref={scene}>
   <div className="exp-journey-world" ref={world}>
    <svg width="1280" height="710" viewBox="0 0 1280 710" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
     <rect width="1280" height="710" fill="#222629"/>
     <g fill="#273c33" opacity=".88"><rect x="30" y="44" width="300" height="135" rx="65"/><rect x="850" y="520" width="355" height="140" rx="70"/><rect x="620" y="14" width="260" height="100" rx="52"/></g>
     <g stroke="#383d40" strokeWidth="8">
      {Array.from({length:12},(_,i)=><path key={"x"+i} d={"M"+(i*120)+" 0 V710"}/>)}
      {Array.from({length:8},(_,i)=><path key={"y"+i} d={"M0 "+(i*107)+" H1280"}/>)}
     </g>
     <g fill="#303538" stroke="#44494b" strokeWidth="1.4">
      {Array.from({length:11},(_,x)=>Array.from({length:7},(_,y)=><g key={x+"-"+y}>
       <rect x={x*120+12} y={y*107+10} width="98" height="87" rx="3"/>
       <path d={"M"+(x*120+24)+" "+(y*107+32)+" h30 m15 0 h29 M"+(x*120+24)+" "+(y*107+64)+" h70"} stroke="#414648" strokeWidth="9" opacity=".5"/>
      </g>))}
     </g>
     <path d="M-80 145 L1060 770" stroke="#171b1f" strokeWidth="26"/><path d="M-80 145 L1060 770" stroke="#45494a" strokeWidth="7"/>
     <g fill="#7a8386" fontSize="30" letterSpacing="8" fontFamily="Arial,sans-serif" opacity=".33" fontWeight="bold">
      <text x="100" y="105">THE BEGINNING</text><text x="590" y="93">CAMPAIGNS</text><text x="870" y="650">LEADERSHIP</text>
     </g>
     <path d={route} fill="none" stroke="#101c2b" strokeWidth="24" strokeLinecap="round"/>
     <path d={route} fill="none" stroke="#286fe4" strokeWidth="15" strokeLinecap="round"/>
     <path d={route} fill="none" stroke="#8eb8ff" strokeWidth="3.5" strokeLinecap="round"/>
     <path d={route} ref={drawn} fill="none" stroke="#eef6ff" strokeWidth="3.5" strokeLinecap="round"/>
     <path d={route} ref={path} fill="none" stroke="none"/>
    </svg>
    {steps.map((s,i)=><button key={s.company} type="button" className={"exp-journey-pin"+(active===i?" is-current":"")}
      style={{left:s.x,top:s.y,["--pin-tone" as string]:s.color}} aria-label={"Navigate to "+s.company} aria-pressed={active===i} onPointerDown={e=>activatePointer(i,e)} onClick={()=>activateClick(i)}>
      <span className="exp-journey-pin-dot">{s.logo}</span><span className="exp-journey-pin-name">{s.short}</span>
    </button>)}
   </div>
   <div className="exp-journey-shade" aria-hidden="true"/>
   <div className="exp-journey-pointer" aria-hidden="true" ref={pointer}><span>➤</span></div>
   <div className="exp-journey-card" style={{["--exp-accent" as string]:stop.color}}>
    <header className="exp-journey-card-head">
      <span className="exp-journey-card-logo">{stop.logo}</span><div><strong>{stop.company}</strong><small>{stop.years} · {stop.role}</small></div><span className="exp-journey-card-counter">0{active+1} / 04</span>
    </header>
    <div className="exp-journey-card-body" key={stop.company}>
      <h3>{stop.title}</h3><p>{stop.description}</p>
    </div>
    <nav className="exp-journey-controls" aria-label="Journey navigation">
      <button type="button" onPointerDown={e=>activatePointer(active-1,e)} onClick={()=>activateClick(active-1)} disabled={active===0} aria-label="Previous stop">← <span>Previous</span></button>
      <output aria-live="polite">{active+1} / {steps.length}</output>
      <button type="button" onPointerDown={e=>activatePointer(active+1,e)} onClick={()=>activateClick(active+1)} disabled={active===steps.length-1}>Next stop <span aria-hidden="true">→</span></button>
    </nav>
   </div>
  </div>
  <p className="exp-journey-caption">Employment experience only · Explore my independently created work under <a href="#products">Products</a>.</p>
 </section>;
}
