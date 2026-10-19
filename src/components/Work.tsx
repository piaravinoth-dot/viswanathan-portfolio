import {useEffect,useRef,useState} from "react";
import {MdArrowOutward,MdClose,MdArrowBack,MdArrowForward} from "react-icons/md";
import "./styles/Work.css";
import {createPortal} from "react-dom";
import gsap from "gsap";
import {smoother} from "./Navbar";

const artworks=[
{title:"Concert Campaign",type:"Event / Visual storytelling",image:"https://raw.githubusercontent.com/piaravinoth-dot/viswanathan-portfolio/main/assets/freelance/15-concert-poster.webp",shape:"large"},
{title:"Natural Stone",type:"Brand / Commercial",image:"https://raw.githubusercontent.com/piaravinoth-dot/viswanathan-portfolio/main/assets/freelance/03-quartzites.webp",shape:"small"},
{title:"Onam Brunch",type:"Hospitality / Campaign",image:"https://raw.githubusercontent.com/piaravinoth-dot/viswanathan-portfolio/main/assets/freelance/04-onam-brunch.webp",shape:"small"},
{title:"Telangana Manifesto",type:"Editorial / Publication",image:"https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/44b5a9252833713.6a58f729ec818.jpg",shape:"large"},
{title:"Ganesh Chaturthi",type:"Festive / Art direction",image:"https://raw.githubusercontent.com/piaravinoth-dot/viswanathan-portfolio/main/assets/freelance/06-ganesh-chaturthi.webp",shape:"large"},
{title:"Live Music",type:"Entertainment / Poster",image:"https://raw.githubusercontent.com/piaravinoth-dot/viswanathan-portfolio/main/assets/freelance/14-concert-layout.webp",shape:"small"},
{title:"Happy Hours",type:"Hospitality / Social creative",image:"https://raw.githubusercontent.com/piaravinoth-dot/viswanathan-portfolio/main/assets/freelance/10-happy-hours.webp",shape:"small"}
];
type Product={slug:string;id:string;title:string;subtitle:string;description:string;skills:string[];accent:string;visual:string;note:string};
const products:Product[]=[
{slug:"ai-design-studio",id:"01",title:"AI Design Studio",subtitle:"A workspace for visual creators.",description:"An editable AI-assisted creative environment for image generation, refinement, layer controls, review and export — designed around real production workflows.",skills:["Product design","AI workflows","Creative tooling"],accent:"lilac",visual:"studio",note:"Creative production platform"},
{slug:"content-studio",id:"02",title:"Content Studio",subtitle:"Make sense of the news.",description:"A shared content operations workspace bringing together newspaper and video-source discovery, filtering, translation, AI-assisted writing and team review.",skills:["Editorial UX","Workflow automation","Information architecture"],accent:"sage",visual:"news",note:"News intelligence platform"},
{slug:"social-media-intelligence",id:"03",title:"Social Media Intelligence",subtitle:"A clearer picture of performance.",description:"A reporting experience for comparing social accounts, organizing platform activity and turning fragmented metrics into readable insights.",skills:["Analytics UX","Dashboards","Data storytelling"],accent:"blue",visual:"analytics",note:"Social intelligence dashboard"},
{slug:"content-tracker",id:"04",title:"Content Tracker",subtitle:"From post to published link.",description:"A streamlined way for teams to record, find and follow up on published Facebook, Instagram and X content across accounts and channels.",skills:["Operations UX","Tracking","Team workflows"],accent:"peach",visual:"tracker",note:"Cross-platform content tracking"},
{slug:"splitmate",id:"05",title:"SplitMate",subtitle:"Shared expenses, minus the friction.",description:"A private two-person expense experience with encrypted records, flexible splits, balances and settlements.",skills:["Mobile UX","PWA","Financial interactions"],accent:"mint",visual:"split",note:"Expense splitting application"},
{slug:"clip-studio",id:"06",title:"Clip Studio",subtitle:"One link. A simpler video workflow.",description:"A responsive video utility concept for working with supported social video links, with a focused input flow and straightforward save options.",skills:["Web product","Responsive UI","Creator workflows"],accent:"sand",visual:"clip",note:"Video workflow prototype"}
];
const Chip=({children}:{children:React.ReactNode})=><span className="product-chip">{children}</span>;
const ProductVisual=({type}:{type:string})=>{
if(type==="studio")return <div className="pv-studio"><div className="pv-bar"><span className="pv-dots">● ● ●</span><span>AI DESIGN STUDIO</span><span>EXPORT ↗</span></div><div className="pv-studio-main"><div className="pv-tools"><span>✦</span><span>▧</span><span>◫</span><span>◈</span></div><div className="pv-canvas"><img src="https://raw.githubusercontent.com/piaravinoth-dot/viswanathan-portfolio/main/assets/portfolio-visuals/ai-studio-workspace.svg" alt="AI Design Studio visual workspace illustration"/><div className="pv-float">✦ &nbsp; Create with intention</div></div><div className="pv-properties"><b>Layers</b><span>01 &nbsp; Artwork</span><span>02 &nbsp; Typography</span><span>03 &nbsp; Background</span></div></div></div>;
if(type==="news")return <div className="pv-dashboard pv-news"><div className="pv-side"><b>C<span>●</span></b><span>⌂</span><span>▤</span><span>◷</span></div><div className="pv-screen"><div className="pv-screen-top">CONTENT STUDIO <span>LIVE FEED <i>●</i></span></div><h3>Today's stories<span>.</span></h3><div className="pv-filter"><b>All sources</b><span>Telangana</span><span>National</span><span>Video</span></div>{["Morning briefing / Top stories","Editorial watch / Developing","Video monitor / New coverage"].map((t,i)=><div className="pv-news-row" key={t}><span className="pv-news-thumb" style={{background:["#b9cbb7","#d6c1a9","#a7bfc0"][i]}}></span><div><small>0{i+1} / SOURCE MONITOR</small><strong>{t}</strong><em>Review &nbsp; · &nbsp; Translate &nbsp; · &nbsp; Save</em></div><span>↗</span></div>)}</div></div>;
if(type==="analytics")return <div className="pv-dashboard pv-analytics"><div className="pv-screen"><div className="pv-screen-top">SOCIAL INTELLIGENCE <span>OVERVIEW ↗</span></div><h3>Signals, not noise.</h3><div className="pv-metrics"><div><small>ACCOUNTS</small><b>24</b><span>↑ Monitored</span></div><div><small>POSTS TRACKED</small><b>1,284</b><span>↑ Activity</span></div><div><small>PLATFORMS</small><b>03</b><span>● Connected</span></div></div><div className="pv-chart"><div className="pv-chart-head">Content activity <span>LAST 7 DAYS</span></div><div className="pv-bars">{[36,55,44,74,58,91,70,100,80,67,86,62].map((n,i)=><i key={i} style={{height:n+"%"}}/>)}</div></div></div></div>;
if(type==="tracker")return <div className="pv-dashboard pv-tracker"><div className="pv-screen"><div className="pv-screen-top">CONTENT TRACKER <span>+ ADD LINK</span></div><h3>Every post, accounted for.</h3><div className="pv-track-head"><span>CONTENT / CHANNEL</span><span>PLATFORM</span><span>STATUS</span></div>{[["Campaign creative / 01","Instagram","Captured"],["Editorial update / 02","Facebook","Captured"],["Short video / 03","X","Review"],["Campaign visual / 04","Instagram","Captured"]].map((row,i)=><div className="pv-track-row" key={i}><div><i>▧</i>{row[0]}</div><span>{row[1]}</span><b className={row[2]==="Review"?"pending":""}>{row[2]}</b></div>)}</div></div>;
if(type==="split")return <div className="pv-split"><div className="pv-phone"><div className="pv-notch"/><div className="pv-phone-top">splitmate <span>•••</span></div><small>TWO-PERSON BALANCE</small><h3>₹ 450<span>.00</span></h3><p>Sam owes you. All accounted for.</p><div className="pv-people"><span>You</span><span>Sam</span></div><div className="pv-expenses"><b>Recent expenses</b>{[["Dinner","₹ 1,200"],["Cab to the station","₹ 800"],["Groceries","₹ 500"]].map(x=><div key={x[0]}><span>◉ &nbsp; {x[0]}</span><strong>{x[1]}</strong></div>)}</div><div className="pv-add">+ &nbsp; Add expense</div></div><div className="pv-split-orbit">EQUAL<br/>SPLITS<br/><span>↗</span></div></div>;
return <div className="pv-clip"><div className="pv-clip-window"><div className="pv-clip-top">CLIP STUDIO <span>● &nbsp; WORKSPACE</span></div><div className="pv-clip-inner"><span className="pv-clip-eyebrow">VIDEO WORKFLOW, SIMPLIFIED</span><h3>Save what<br/><i>inspires.</i></h3><div className="pv-url">https://video-link.example <span>↗</span></div><div className="pv-clip-formats"><span>MP4</span><span>HD</span><span>ORIGINAL</span></div><div className="pv-clip-action">Continue &nbsp; ↗</div></div></div><div className="pv-clip-circle">▶</div></div>
};
const Work=()=>{
const [orbitIndex,setOrbitIndex]=useState(0);
const [orbitPlaying,setOrbitPlaying]=useState(true);
const [orbitMobile,setOrbitMobile]=useState(()=>window.matchMedia("(max-width: 760px)").matches);
const orbitHost=useRef<HTMLDivElement>(null);
const [orbitInView,setOrbitInView]=useState(false);
const [orbitPageVisible,setOrbitPageVisible]=useState(()=>!document.hidden);
const [orbitHovered,setOrbitHovered]=useState(false);
const [orbitFocused,setOrbitFocused]=useState(false);
const orbitManuallyPaused=useRef(false);
const orbitRefs=useRef<(HTMLDivElement|null)[]>([]);
const touchStart=useRef<{x:number;y:number}|null>(null);
const orbitSwipeAt=useRef(0);
const orbitUserPause=useRef<number|null>(null);
// Pointer-down handles mouse/touch reliably even if scroll animation changes
// the hovered card before click. Keyboard/assistive activation uses click.
const toggleOrbitPlayback=()=>{
  if(orbitUserPause.current!==null){
    window.clearTimeout(orbitUserPause.current);
    orbitUserPause.current=null;
  }
  const nextPlaying=!orbitPlaying;
  orbitManuallyPaused.current=!nextPlaying;
  setOrbitPlaying(nextPlaying);
};
const orbitNext=(delta:number)=>{
  setOrbitIndex(current=>(current+delta+products.length)%products.length);
  if(orbitUserPause.current!==null)window.clearTimeout(orbitUserPause.current);
  if(!orbitManuallyPaused.current){
    setOrbitPlaying(false);
    orbitUserPause.current=window.setTimeout(()=>setOrbitPlaying(true),9000);
  }
};
useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{
    setOrbitInView(entries.some(e=>e.isIntersecting));
  },{threshold:0.05});
  const element=orbitHost.current;
  if(element)observer.observe(element);
  return()=>observer.disconnect();
},[]);
useEffect(()=>{
  const onVisibility=()=>setOrbitPageVisible(!document.hidden);
  document.addEventListener("visibilitychange",onVisibility);
  return()=>document.removeEventListener("visibilitychange",onVisibility);
},[]);
useEffect(()=>{
  const query=window.matchMedia("(max-width: 760px)");
  const update=()=>setOrbitMobile(query.matches);
  query.addEventListener("change",update);
  return()=>query.removeEventListener("change",update);
},[]);
useEffect(()=>{
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Preserve GSAP transforms between changes; reverting the context each
  // rotation reset transforms to zero and caused visible iOS shaking.
  orbitRefs.current.forEach((element,index)=>{
    if(!element)return;
    let offset=(index-orbitIndex+products.length)%products.length;
    if(offset>products.length/2)offset-=products.length;
    const abs=Math.abs(offset),side=Math.sign(offset);
    gsap.to(element,{
      xPercent:offset*32,
      y:abs*12,
      rotationY:reduced?0:-side*Math.min(abs*18,48),
      rotationZ:reduced?0:-offset*1.2,
      scale:1-abs*.085,
      opacity:1,
      zIndex:10-abs,
      duration:reduced?0:.95,
      ease:"power2.inOut",
      force3D:true,
      overwrite:"auto"
    });
  });
},[orbitIndex,orbitMobile]);
useEffect(()=>()=>{
  orbitRefs.current.forEach(element=>{if(element)gsap.killTweensOf(element)});
},[]);
useEffect(()=>{
  // Rotate on desktop as well as mobile only while visible and not interacted with.
  // Desktop dwell time is slightly longer to make case studies easy to read.
  if(!orbitPlaying||!orbitInView||!orbitPageVisible||orbitHovered||orbitFocused||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const interval=orbitMobile?4500:5500;
  const timer=window.setInterval(()=>setOrbitIndex(index=>(index+1)%products.length),interval);
  return()=>window.clearInterval(timer);
},[orbitMobile,orbitPlaying,orbitInView,orbitPageVisible,orbitHovered,orbitFocused]);
useEffect(()=>()=>{if(orbitUserPause.current!==null)window.clearTimeout(orbitUserPause.current)},[]);
const [openImage,setOpenImage]=useState<number|null>(null);
const dialogRef=useRef<HTMLDivElement>(null);
useEffect(()=>{
  if(openImage===null)return;
  const previousFocus=document.activeElement as HTMLElement|null;
  const previousOverflow=document.body.style.overflowY;
  const wasPaused=smoother?.paused();
  document.body.style.overflowY="hidden";
  smoother?.paused(true);
  dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  const fn=(e:KeyboardEvent)=>{
    if(e.key==="Escape"){e.preventDefault();setOpenImage(null)}
    if(e.key==="ArrowRight"){e.preventDefault();setOpenImage(v=>v===null?null:(v+1)%artworks.length)}
    if(e.key==="ArrowLeft"){e.preventDefault();setOpenImage(v=>v===null?null:(v+artworks.length-1)%artworks.length)}
    if(e.key==="Tab"){
      const controls=dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
      if(!controls?.length)return;
      const first=controls[0],last=controls[controls.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  };
  window.addEventListener("keydown",fn);
  return()=>{window.removeEventListener("keydown",fn);document.body.style.overflowY=previousOverflow;smoother?.paused(Boolean(wasPaused));previousFocus?.focus({preventScroll:true})};
},[openImage!==null]);
return <section className="work-section" id="work">
<div className="work-container section-container">
<div className="work-intro"><div><span className="work-eyebrow"><i/> 01 / SELECTED VISUAL WORK</span><h2>Work that<br/><em>speaks.</em></h2></div><div className="work-intro-right"><p>From the first idea to the final frame. A selection of commercial, campaign, editorial and visual storytelling projects.</p><span>SCROLL TO EXPLORE &nbsp; ↓</span></div></div>
<div className="art-grid">{artworks.map((a,i)=><button type="button" className={`art-piece art-${a.shape}`} key={a.title} onClick={()=>setOpenImage(i)} aria-label={`View ${a.title} image`} data-cursor="disable"><div className="art-image"><img src={a.image} alt={a.title+" — original portfolio artwork"} loading="lazy"/><span className="art-open"><MdArrowOutward/></span></div><div className="art-caption"><span><b>{a.title}</b><small>{a.type}</small></span><span className="art-index">{String(i+1).padStart(2,"0")} / {String(artworks.length).padStart(2,"0")}</span></div></button>)}</div>
<div className="work-gallery-end"><span>VISUAL DESIGN / ART DIRECTION / CREATIVE SYSTEMS</span></div>
</div>
<div className="product-section" id="products"><div className="product-inner section-container">
<div className="product-heading"><div className="product-topline"><span><i/> 02 / DIGITAL PRODUCTS</span><span>SELECTED PRODUCT DESIGN / 2026</span></div><div className="product-heading-grid"><h2>Ideas, made<br/><em>interactive.</em></h2><p>Six products spanning creative AI, content operations, analytics and everyday utilities. Designed with an emphasis on usability, workflow and visual craft.</p></div><div className="product-count">06 <span>SELECTED PRODUCTS</span></div></div>
<div className="product-showcase-hint"><span>EXPLORE THE COLLECTION</span><span>Select a product to open <MdArrowForward/></span></div>
<div ref={orbitHost} className="mobile-product-orbit" role="region" aria-roledescription="carousel" aria-label="Selected digital products — use the left and right arrow keys to browse" tabIndex={0} onPointerEnter={event=>{if(event.pointerType==="mouse")setOrbitHovered(true)}} onPointerLeave={()=>setOrbitHovered(false)} onFocusCapture={()=>setOrbitFocused(true)} onBlurCapture={event=>{if(!event.relatedTarget||!event.currentTarget.contains(event.relatedTarget as Node))setOrbitFocused(false)}} onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();orbitNext(event.key==="ArrowRight"?1:-1)}}}>
  <div className="orbit-topline"><span>THE PRODUCT COLLECTION</span><span>{String(orbitIndex+1).padStart(2,"0")} / 06</span></div>
  <div className="orbit-stage" onTouchStart={event=>{touchStart.current={x:event.touches[0].clientX,y:event.touches[0].clientY};}} onTouchEnd={event=>{if(!touchStart.current)return;const dx=event.changedTouches[0].clientX-touchStart.current.x;const dy=event.changedTouches[0].clientY-touchStart.current.y;touchStart.current=null;if(Math.abs(dx)>38&&Math.abs(dx)>Math.abs(dy)*1.2){orbitSwipeAt.current=Date.now();orbitNext(dx<0?1:-1);}}}>
    {products.map((p,i)=><div key={p.id} ref={element=>{orbitRefs.current[i]=element;}} className={`orbit-card orbit-${p.accent}${orbitIndex===i?" orbit-active":""}`} aria-hidden={orbitIndex!==i} style={{pointerEvents:orbitIndex===i?"auto":"none"}} onClick={event=>{if(orbitIndex!==i||Date.now()-orbitSwipeAt.current<650||event.target instanceof Element&&event.target.closest("a"))return;window.location.assign(`/work/${p.slug}`);}}>
      <div className="orbit-card-meta"><span>{p.id} / 06</span><span>{p.note}</span></div>
      <div className="orbit-card-image"><ProductVisual type={p.visual}/></div>
      <div className="orbit-card-copy"><h3>{p.title}</h3><p>{p.subtitle}</p></div>
      <a className="orbit-card-action" href={`/work/${p.slug}`} aria-label={`View ${p.title} case study`} tabIndex={orbitIndex===i?0:-1}>View case study <MdArrowOutward/></a>
    </div>)}
  </div>
  <div className="orbit-controls"><button type="button" onClick={()=>orbitNext(-1)} aria-label="Previous product"><MdArrowBack/></button><span aria-live={orbitPlaying?"off":"polite"} aria-atomic="true">{products[orbitIndex].title}</span><button type="button" onClick={()=>orbitNext(1)} aria-label="Next product"><MdArrowForward/></button></div>
  <button type="button" className="orbit-autoplay" onPointerDown={event=>{if(event.button===0){event.stopPropagation();toggleOrbitPlayback();}}} onClick={event=>{if(event.detail===0)toggleOrbitPlayback();}} aria-pressed={orbitPlaying}>{orbitPlaying?"Pause rotation":"Play rotation"}</button>
  <div className="orbit-index" aria-label="Choose a product">{products.map((p,i)=><button type="button" key={p.id} aria-current={orbitIndex===i?"true":undefined} className={orbitIndex===i?"orbit-index-active":""} onClick={()=>orbitNext((i-orbitIndex+products.length)%products.length)}>{p.id} <span>{p.title}</span></button>)}</div>
  <p className="orbit-note">{orbitMobile?"SWIPE CARDS OR USE ARROWS TO EXPLORE":"AUTOMATIC ROTATION · HOVER TO PAUSE · USE ARROWS"} · SIX PRODUCTS</p>
</div>
<div className="product-outro"><span>DESIGN THAT WORKS AS WELL AS IT LOOKS.</span><a href="#contact">Have a project in mind? <MdArrowOutward/></a></div>
</div></div>
{openImage!==null&&createPortal(<div ref={dialogRef} className="art-lightbox" role="dialog" aria-modal="true" aria-label="Portfolio image viewer" onClick={()=>setOpenImage(null)}><button type="button" className="art-lightbox-close" aria-label="Close image" onClick={()=>setOpenImage(null)}><MdClose/></button><button type="button" className="art-lightbox-prev" aria-label="Previous image" onClick={e=>{e.stopPropagation();setOpenImage((openImage+artworks.length-1)%artworks.length)}}><MdArrowBack/></button><figure onClick={e=>e.stopPropagation()}><img src={artworks[openImage].image} alt={artworks[openImage].title}/><figcaption>{artworks[openImage].title} <span>{artworks[openImage].type}</span></figcaption></figure><button type="button" className="art-lightbox-next" aria-label="Next image" onClick={e=>{e.stopPropagation();setOpenImage((openImage+1)%artworks.length)}}><MdArrowForward/></button></div>,document.body)}
</section>};
export default Work;
