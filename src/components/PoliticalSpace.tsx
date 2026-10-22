import {useEffect,useRef,useState} from "react";
import {MdArrowOutward,MdClose,MdArrowBack,MdArrowForward,MdZoomIn,MdZoomOut} from "react-icons/md";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {smoother} from "./Navbar";
import SelectedCases from "./SelectedCases";
import pieces from "../data/politicalProjects.json";
import "./styles/PoliticalSpace.css";
const collections=[
 {id:"budget",label:"Gujarat Budget Basics",discipline:"01 / EDITORIAL & INFORMATION DESIGN",title:"Making policy\nmake sense.",description:"A budget is more than a set of numbers. Explore a publication that turns complex public information into a clear visual story."},
 {id:"content",label:"Content Posters",discipline:"02 / CONTENT & CAMPAIGN COMMUNICATION",title:"A message.\nMade visible.",description:"Content-led political communication, where hierarchy, language and imagery work together to bring the message into focus."},
 {id:"creative",label:"Creative Posters",discipline:"03 / CONCEPT & ART DIRECTION",title:"Ideas that\nhold attention.",description:"Concept-driven posters exploring how a strong visual idea can give political communication an unmistakable presence."}
];
export default function PoliticalSpace(){
 const [category,setCategory]=useState("budget"),[index,setIndex]=useState(0),[open,setOpen]=useState(false),[zoom,setZoom]=useState(false);
 const [displayMode,setDisplayMode]=useState<"exhibition"|"index">("exhibition");
 const [copyNotice,setCopyNotice]=useState("");
 const swipeStart=useRef<{x:number;y:number}|null>(null);
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLElement|null>(null),strip=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null);
 const collection=collections.find(c=>c.id===category)!,artworks=pieces.filter(p=>p.category===category),artwork=artworks[index];
 const move=(step:number)=>{setIndex(i=>(i+step+artworks.length)%artworks.length);setZoom(false);setCopyNotice("")};
 const openArtwork=(event:React.MouseEvent<HTMLElement>,itemIndex:number)=>{opener.current=event.currentTarget;setIndex(itemIndex);setZoom(false);setCopyNotice("");setOpen(true)};
 const copyArtworkLink=async()=>{
  const url=new URL("/",window.location.origin);
  url.searchParams.set("artwork",artwork.id);
  url.hash="political-artwork";
  try{await navigator.clipboard.writeText(url.toString());setCopyNotice("Artwork link copied")}
  catch{setCopyNotice("Copy unavailable in this browser")}
 };
 useEffect(()=>{
  const id=new URLSearchParams(window.location.search).get("artwork");
  const match=pieces.find(piece=>piece.id===id);
  if(!match)return;
  const itemIndex=pieces.filter(piece=>piece.category===match.category).findIndex(piece=>piece.id===id);
  if(itemIndex<0)return;
  setCategory(match.category);setIndex(itemIndex);setDisplayMode("exhibition");setOpen(true);
 },[]);
 useEffect(()=>{const row=strip.current,thumb=row?.querySelector<HTMLElement>('[aria-pressed="true"]');if(row&&thumb)row.scrollLeft=thumb.offsetLeft-row.offsetLeft-row.clientWidth/2+thumb.clientWidth/2;},[index,category]);
 useEffect(()=>{stage.current?.scrollTo(0,0);if(zoom)stage.current?.focus({preventScroll:true})},[index,zoom]);
 useEffect(()=>{const frame=requestAnimationFrame(()=>ScrollTrigger.refresh());return()=>cancelAnimationFrame(frame)},[category]);
 useEffect(()=>{
  if(!open)return;
  const node=dialog.current,overflow=document.body.style.overflowY,paused=smoother?.paused();
  document.body.style.overflowY="hidden";smoother?.paused(true);node?.showModal();
  return()=>{node?.close();document.body.style.overflowY=overflow;smoother?.paused(Boolean(paused));opener.current?.focus({preventScroll:true})};
 },[open]);
 const keys=(e:React.KeyboardEvent)=>{if(zoom&&e.target===stage.current)return;if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();move(e.key==="ArrowRight"?1:-1)}};
 return <section id="political-space" className="political-space" aria-labelledby="political-title"><div className="section-container political-inner">
 <span id="work" className="political-work-anchor" aria-hidden="true"/><div className="political-topline"><span>POLITICAL SPACE</span><span>04 CASE STUDIES / 26 ARTWORKS</span></div>
 <div className="political-intro"><h2 id="political-title">Politics.<br/><em>Through design.</em></h2><p>Public ideas, shaped into visual stories.<br/>Campaign identities, publications and political communication.<br/><span>Explore the thinking. Discover the artwork.</span></p></div>
 <nav className="political-chapters" aria-label="Political Space chapters"><a href="#political-case-studies"><span>01</span><strong>Featured projects</strong><small>04 case studies</small><MdArrowOutward aria-hidden="true"/></a><a href="#political-artwork"><span>02</span><strong>Artwork archive</strong><small>03 collections · 26 works</small><MdArrowOutward aria-hidden="true"/></a></nav>
 <SelectedCases/>
 <section id="political-artwork" className="ps-archive-gate" aria-labelledby="ps-archive-title">
  <div className="ps-gate-copy"><span className="ps-gate-kicker">CHAPTER 02 / ORIGINAL ARTWORK</span>
    <span className="ps-gate-figure">26<span>ORIGINAL<br/>ARTWORKS</span></span>
    <h3 id="ps-archive-title">Explore the<br/><em>original work.</em></h3>
    <p>Choose a collection to view its artworks below.</p>
  </div>
  <div className="ps-gate-artworks" role="group" aria-label="Choose political collection">
   {collections.map((c,i)=>{const sample=pieces.find(p=>p.category===c.id);return sample?<button type="button" key={c.id} className={`ps-gate-art ps-gate-art-${c.id}`} aria-pressed={category===c.id} onClick={()=>{setCategory(c.id);setIndex(0);setZoom(false);requestAnimationFrame(()=>{const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;document.getElementById("political-artwork-gallery")?.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"})})}} aria-label={`View ${c.label} collection, ${pieces.filter(p=>p.category===c.id).length} artworks`}>
    <span className="ps-gate-art-image"><img src={sample.preview} width={sample.width} height={sample.height} loading="lazy" decoding="async" alt="" /></span>
    <span className="ps-gate-art-label"><span>0{i+1}</span><strong>{c.label}</strong><MdArrowOutward aria-hidden="true"/></span>
   </button>:null})}
  </div>
  <div className="ps-gate-folio"><span>VISWANATHAN G / ORIGINAL POLITICAL COMMUNICATION</span><span>03 COLLECTIONS</span></div>
 </section>
 <div id="political-artwork-gallery" className="political-view-switch" role="group" aria-label="Artwork browsing mode">
  <div className="political-view-context"><span>{collection.label}</span><strong>{String(artworks.length).padStart(2,"0")} original works</strong></div>
  <div className="political-view-options"><button type="button" aria-pressed={displayMode==="exhibition"} onClick={()=>setDisplayMode("exhibition")}>Exhibition view</button><button type="button" aria-pressed={displayMode==="index"} onClick={()=>setDisplayMode("index")}>All works grid</button></div>
 </div>
 {displayMode==="exhibition"&&<>
 <div className="political-exhibition" onKeyDown={keys}>
 <div className="political-curatorial"><span className="political-discipline">{collection.discipline}</span><h4>{collection.title}</h4><p>{collection.description}</p><div className="political-pagination"><button type="button" aria-label="Previous artwork" onClick={()=>move(-1)}><MdArrowBack aria-hidden="true"/></button><span role="status">{String(index+1).padStart(2,"0")} <span>/ {String(artworks.length).padStart(2,"0")}</span></span><button type="button" aria-label="Next artwork" onClick={()=>move(1)}><MdArrowForward aria-hidden="true"/></button></div><div className="political-progress" aria-hidden="true"><span style={{width:`${(index+1)/artworks.length*100}%`}}/></div><p className="political-help">Browse the strip or use the arrows.<br/>Open an artwork to explore every detail.</p></div>
 <div className="political-display"><button type="button" className="political-feature" aria-label={`View ${artwork.title} full screen`} onClick={e=>openArtwork(e,index)} data-cursor="disable"><img key={artwork.id} src={artwork.image} width={artwork.width} height={artwork.height} loading="lazy" decoding="async" alt={artwork.alt}/></button><div className="political-feature-caption"><strong>{artwork.caption}</strong><span>{artwork.width} × {artwork.height}</span></div><button type="button" className="political-view-label" aria-label={`Open ${artwork.title} in artwork viewer`} onClick={e=>openArtwork(e,index)}><MdZoomIn aria-hidden="true"/> View artwork</button></div>
 </div>
 <div className="political-filmstrip" ref={strip} role="group" aria-label={`${collection.label} artworks`}>{artworks.map((p,i)=><button type="button" key={p.id} aria-pressed={index===i} aria-label={`Select ${p.title}`} onClick={()=>setIndex(i)}><img src={p.preview} width={p.width} height={p.height} loading="lazy" decoding="async" alt=""/><span>{String(i+1).padStart(2,"0")}</span></button>)}</div>
 </>}
 {displayMode==="index"&&<div className="political-index-grid" role="region" aria-label={collection.label+" all artworks"}>
 {artworks.map((p,i)=><button type="button" key={p.id} className="political-index-card" onClick={e=>openArtwork(e,i)} aria-label={"Open "+p.title+" in high-resolution viewer"}>
  <span className="political-index-image"><img src={p.preview} width={p.width} height={p.height} loading="lazy" decoding="async" alt=""/></span>
  <span className="political-index-meta"><span>{String(i+1).padStart(2,"0")} / {String(artworks.length).padStart(2,"0")}</span><span aria-hidden="true">↗</span></span>
  <strong>{p.caption}</strong><small>View original artwork</small>
 </button>)}
 </div>}
 <div className="political-foot"><span>ORIGINAL WORK / FULL-RESOLUTION VIEWER</span><p>Original project artwork. Dates, figures and messages belong to the campaigns and publications shown.</p></div>
 </div><dialog className="political-viewer" ref={dialog} aria-labelledby="political-viewer-title" onCancel={()=>setOpen(false)} onKeyDown={keys}>{open&&<><header><div><strong id="political-viewer-title">{collection.label}</strong><span aria-live="polite">{artwork.caption} · {index+1} / {artworks.length}</span></div><button type="button" aria-label="Close political artwork" onClick={()=>setOpen(false)}><MdClose aria-hidden="true"/></button></header><div className={`political-viewer-stage${zoom?" is-zoomed":""}`} ref={stage} tabIndex={0} role="region" aria-label="Artwork detail — scroll to explore when zoomed" onTouchStart={e=>{if(zoom)return;const t=e.touches[0];swipeStart.current={x:t.clientX,y:t.clientY}}} onTouchEnd={e=>{const start=swipeStart.current;swipeStart.current=null;if(!start||zoom)return;const t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.3)move(dx<0?1:-1)}}><img src={artwork.image} width={artwork.width} height={artwork.height} alt={artwork.alt}/></div><footer><button type="button" aria-label="Previous political artwork" onClick={()=>move(-1)}><MdArrowBack aria-hidden="true"/></button><button type="button" className="political-zoom" aria-pressed={zoom} onClick={()=>setZoom(v=>!v)}>{zoom?<MdZoomOut aria-hidden="true"/>:<MdZoomIn aria-hidden="true"/>}{zoom?"Fit artwork":"Zoom to detail"}</button><button type="button" className="political-copy-link" onClick={copyArtworkLink} aria-label={"Copy link to "+artwork.title}>Copy link <MdArrowOutward aria-hidden="true"/></button><button type="button" aria-label="Next political artwork" onClick={()=>move(1)}><MdArrowForward aria-hidden="true"/></button><span className="political-copy-notice" role="status">{copyNotice}</span></footer></>}</dialog></section>;
}
