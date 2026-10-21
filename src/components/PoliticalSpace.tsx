import {useEffect,useRef,useState} from "react";
import {MdArrowOutward,MdClose,MdArrowBack,MdArrowForward} from "react-icons/md";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {smoother} from "./Navbar";
import pieces from "../data/politicalProjects.json";
import "./styles/PoliticalSpace.css";
const categories=[{id:"all",label:"Selected",count:26},{id:"budget",label:"Gujarat Budget Basics",count:7},{id:"content",label:"Content Posters",count:10},{id:"creative",label:"Creative Posters",count:9}];
const featured=["budget-1","creative-6","content-9","budget-2","content-7","creative-1"];
const ordered=[...featured.map(id=>pieces.find(p=>p.id===id)!),...pieces.filter(p=>!featured.includes(p.id))];
export default function PoliticalSpace(){
 const [category,setCategory]=useState("all"),[expanded,setExpanded]=useState(false),[active,setActive]=useState<string|null>(null);
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLElement|null>(null);
 const collection=category==="all"?ordered:pieces.filter(p=>p.category===category);
 const visible=expanded?collection:collection.slice(0,6),artwork=pieces.find(p=>p.id===active),isOpen=active!==null;
 const move=(step:number)=>setActive(id=>collection[(collection.findIndex(p=>p.id===id)+step+collection.length)%collection.length].id);
 useEffect(()=>{const frame=requestAnimationFrame(()=>ScrollTrigger.refresh());return()=>cancelAnimationFrame(frame)},[category,expanded]);
 useEffect(()=>{
  if(!isOpen)return;
  const node=dialog.current,overflow=document.body.style.overflowY,paused=smoother?.paused();
  document.body.style.overflowY="hidden";smoother?.paused(true);node?.showModal();
  return()=>{node?.close();document.body.style.overflowY=overflow;smoother?.paused(Boolean(paused));opener.current?.focus({preventScroll:true})};
 },[isOpen]);
 return <section id="political-space" className="political-space" aria-labelledby="political-title"><div className="section-container political-inner">
 <div className="political-topline"><span>POLITICAL SPACE</span><span>03 COLLECTIONS / 26 ARTWORKS</span></div>
 <div className="political-intro"><h2 id="political-title">Public ideas.<br/><em>Visual impact.</em></h2><div><p>Political communication, through a designer’s lens. Budget storytelling, content-led posters and concept-driven creative work, brought together in one visual archive.</p><span>EDITORIAL DESIGN · CAMPAIGN CREATIVE · VISUAL STORYTELLING</span></div></div>
 <div className="political-filters" role="group" aria-label="Filter political artwork">{categories.map(c=><button type="button" key={c.id} aria-pressed={category===c.id} onClick={()=>{setCategory(c.id);setExpanded(false)}}>{c.label}<span>{String(c.count).padStart(2,"0")}</span></button>)}</div>
 <p className="political-status" role="status">{category==="all"?"A curated opening selection":categories.find(c=>c.id===category)?.label} — showing {visible.length} of {collection.length}. Select an artwork to view it larger.</p>
 <div className="political-grid">{visible.map((p,i)=><button type="button" className="political-piece" key={p.id} aria-label={`View ${p.title}`} onClick={e=>{opener.current=e.currentTarget;setActive(p.id)}} data-cursor="disable"><div className="political-image"><img src={p.image} srcSet={`${p.preview} 640w, ${p.image} ${p.width}w`} sizes="(max-width:600px) calc(100vw - 40px), (max-width:1024px) 44vw, 28vw" width={p.width} height={p.height} loading="lazy" decoding="async" alt={p.alt}/><span><MdArrowOutward aria-hidden="true"/></span></div><div className="political-caption"><span><strong>{p.collection}</strong><small>{p.caption}</small></span><span>{String(i+1).padStart(2,"0")}</span></div></button>)}</div>
 {collection.length>6&&<button className="political-more" type="button" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?"Show selected works":`Explore all ${collection.length} artworks`}<MdArrowOutward aria-hidden="true"/></button>}
 <div className="political-foot"><span>DESIGN ARCHIVE</span><p>Original project artwork. Dates, figures and messages belong to the campaigns and publications shown.</p></div>
 </div><dialog className="political-viewer" ref={dialog} aria-labelledby="political-viewer-title" onCancel={()=>setActive(null)} onKeyDown={e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();move(e.key==="ArrowRight"?1:-1)}}}>{artwork&&<><header><div><strong id="political-viewer-title">{artwork.collection}</strong><span aria-live="polite">{artwork.caption} · {collection.findIndex(p=>p.id===active)+1} / {collection.length}</span></div><button type="button" aria-label="Close political artwork" onClick={()=>setActive(null)}><MdClose aria-hidden="true"/></button></header><div className="political-viewer-stage"><button type="button" aria-label="Previous political artwork" onClick={()=>move(-1)}><MdArrowBack aria-hidden="true"/></button><figure><img src={artwork.image} width={artwork.width} height={artwork.height} alt={artwork.alt}/></figure><button type="button" aria-label="Next political artwork" onClick={()=>move(1)}><MdArrowForward aria-hidden="true"/></button></div><footer><span>{artwork.width} × {artwork.height} px</span><a href={artwork.image} target="_blank" rel="noopener noreferrer">Open full resolution <MdArrowOutward aria-hidden="true"/></a></footer></>}</dialog></section>;
}
