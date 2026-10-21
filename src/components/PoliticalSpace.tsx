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
 const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLElement|null>(null),strip=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null);
 const collection=collections.find(c=>c.id===category)!,artworks=pieces.filter(p=>p.category===category),artwork=artworks[index];
 const move=(step:number)=>{setIndex(i=>(i+step+artworks.length)%artworks.length);setZoom(false)};
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
 <div id="political-artwork" className="political-archive-heading"><span>02 / POSTER & PUBLICATION ARCHIVE</span><h3>Explore the artwork.</h3><p>Choose a collection, browse its works, then open any artwork to see the original details.</p></div>
 <div className="political-collections" role="group" aria-label="Choose political collection">{collections.map((c,i)=><button type="button" key={c.id} aria-pressed={category===c.id} onClick={()=>{setCategory(c.id);setIndex(0)}}><span>0{i+1}</span><strong>{c.label}</strong><small>{pieces.filter(p=>p.category===c.id).length} works</small><MdArrowOutward aria-hidden="true"/></button>)}</div>
 <div className="political-exhibition" onKeyDown={keys}>
 <div className="political-curatorial"><span className="political-discipline">{collection.discipline}</span><h4>{collection.title}</h4><p>{collection.description}</p><div className="political-pagination"><button type="button" aria-label="Previous artwork" onClick={()=>move(-1)}><MdArrowBack aria-hidden="true"/></button><span role="status">{String(index+1).padStart(2,"0")} <span>/ {String(artworks.length).padStart(2,"0")}</span></span><button type="button" aria-label="Next artwork" onClick={()=>move(1)}><MdArrowForward aria-hidden="true"/></button></div><div className="political-progress" aria-hidden="true"><span style={{width:`${(index+1)/artworks.length*100}%`}}/></div><p className="political-help">Browse the strip or use the arrows.<br/>Open an artwork to explore every detail.</p></div>
 <div className="political-display"><button type="button" className="political-feature" aria-label={`View ${artwork.title} full screen`} onClick={e=>{opener.current=e.currentTarget;setZoom(false);setOpen(true)}} data-cursor="disable"><img key={artwork.id} src={artwork.image} width={artwork.width} height={artwork.height} loading="lazy" decoding="async" alt={artwork.alt}/></button><div className="political-feature-caption"><strong>{artwork.caption}</strong><span>{artwork.width} × {artwork.height}</span></div><button type="button" className="political-view-label" aria-label={`Open ${artwork.title} in artwork viewer`} onClick={e=>{opener.current=e.currentTarget;setZoom(false);setOpen(true)}}><MdZoomIn aria-hidden="true"/> View artwork</button></div>
 </div>
 <div className="political-filmstrip" ref={strip} role="group" aria-label={`${collection.label} artworks`}>{artworks.map((p,i)=><button type="button" key={p.id} aria-pressed={index===i} aria-label={`Select ${p.title}`} onClick={()=>setIndex(i)}><img src={p.preview} width={p.width} height={p.height} loading="lazy" decoding="async" alt=""/><span>{String(i+1).padStart(2,"0")}</span></button>)}</div>
 <div className="political-foot"><span>03 COLLECTIONS / 26 ORIGINAL WORKS</span><p>Original project artwork. Dates, figures and messages belong to the campaigns and publications shown.</p></div>
 </div><dialog className="political-viewer" ref={dialog} aria-labelledby="political-viewer-title" onCancel={()=>setOpen(false)} onKeyDown={keys}>{open&&<><header><div><strong id="political-viewer-title">{collection.label}</strong><span aria-live="polite">{artwork.caption} · {index+1} / {artworks.length}</span></div><button type="button" aria-label="Close political artwork" onClick={()=>setOpen(false)}><MdClose aria-hidden="true"/></button></header><div className={`political-viewer-stage${zoom?" is-zoomed":""}`} ref={stage} tabIndex={0} role="region" aria-label="Artwork detail — scroll to explore when zoomed"><img src={artwork.image} width={artwork.width} height={artwork.height} alt={artwork.alt}/></div><footer><button type="button" aria-label="Previous political artwork" onClick={()=>move(-1)}><MdArrowBack aria-hidden="true"/></button><button type="button" className="political-zoom" aria-pressed={zoom} onClick={()=>setZoom(v=>!v)}>{zoom?<MdZoomOut aria-hidden="true"/>:<MdZoomIn aria-hidden="true"/>}{zoom?"Fit artwork":"Zoom to detail"}</button><button type="button" aria-label="Next political artwork" onClick={()=>move(1)}><MdArrowForward aria-hidden="true"/></button></footer></>}</dialog></section>;
}
