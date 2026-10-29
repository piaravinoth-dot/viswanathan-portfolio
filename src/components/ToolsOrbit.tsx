import {useEffect,useMemo,useRef,useState} from "react";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {SiFigma,SiReact,SiTypescript,SiGithub,SiVercel,SiCloudflare} from "react-icons/si";
import {VscVscode} from "react-icons/vsc";
import "./styles/ToolsOrbit.css";

type Group="Design"|"Motion"|"Development"|"AI";
type Tool={name:string;mark:string;group:Group;color:string;description:string};
const TOOLS:Tool[]=[
 {name:"Adobe Photoshop",mark:"Ps",group:"Design",color:"#31a8ff",description:"Photo editing, compositing and detailed campaign artwork."},
 {name:"Adobe Illustrator",mark:"Ai",group:"Design",color:"#ff9a3b",description:"Vector graphics, identities, illustrations and scalable assets."},
 {name:"Adobe InDesign",mark:"Id",group:"Design",color:"#fa5595",description:"Multi-page publications, editorial layouts and print systems."},
 {name:"Figma",mark:"Fg",group:"Design",color:"#ff8b72",description:"UI/UX exploration, interfaces, components and prototypes."},
 {name:"Adobe After Effects",mark:"Ae",group:"Motion",color:"#ac97fa",description:"Motion graphics, animated storytelling and visual transitions."},
 {name:"Adobe Premiere Pro",mark:"Pr",group:"Motion",color:"#c099fb",description:"Video editing, sequence building and campaign-ready content."},
 {name:"Visual Studio Code",mark:"VSC",group:"Development",color:"#45a8e8",description:"Code editing and day-to-day development workflows."},
 {name:"React",mark:"R",group:"Development",color:"#6dcada",description:"Responsive, component-based digital product interfaces."},
 {name:"TypeScript",mark:"TS",group:"Development",color:"#69a4f6",description:"Structured, reliable frontend implementation."},
 {name:"GSAP",mark:"G",group:"Development",color:"#9cd771",description:"Scroll-driven animation and purposeful interface motion."},
 {name:"Three.js",mark:"3D",group:"Development",color:"#e9e7df",description:"Interactive 3D visuals and creative web experiences."},
 {name:"GitHub",mark:"GH",group:"Development",color:"#e2e8ef",description:"Version control and collaborative source management."},
 {name:"Vercel",mark:"V",group:"Development",color:"#f0efe9",description:"Preview and production website deployment."},
 {name:"Cloudflare",mark:"CF",group:"Development",color:"#f4b060",description:"Pages and lightweight cloud workflows."},
 {name:"ChatGPT",mark:"GPT",group:"AI",color:"#91d6bb",description:"Ideation, content support, prototyping and AI-assisted development."},
 {name:"AI Design Studio",mark:"AI",group:"AI",color:"#d7abec",description:"My own creative product for generation, editing and iteration."}
];
const GROUPS:("All"|Group)[]=["All","Design","Motion","Development","AI"];
const groupCopy:Record<string,string>={
 All:"Creative thinking meets the software that brings it to life.",
 Design:"Shape the story, every pixel and every page.",
 Motion:"Make the message move, without losing the meaning.",
 Development:"Turn the visual idea into a working experience.",
 AI:"Experiment faster, while keeping creative judgment human."
};
// Locally bundled brand marks, no hotlinked icon APIs.
// Adobe's app-monogram marks remain recognizable from the reference.
const TOOL_LOGOS:Record<string,React.ReactNode>={
 "Figma":<SiFigma/>,
 "Visual Studio Code":<VscVscode/>,
 "React":<SiReact/>,
 "TypeScript":<SiTypescript/>,
 "GitHub":<SiGithub/>,
 "Vercel":<SiVercel/>,
 "Cloudflare":<SiCloudflare/>,
};

function GestureHand(){
 return <svg className="toolkit-hand-illustration" viewBox="0 0 350 590" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Original illustrated hand reaching into an orbit of creative tools">
  <defs>
   <linearGradient id="toolkit-skin" x1="0" y1=".1" x2=".95" y2=".8"><stop offset="0" stopColor="#e4b49b"/><stop offset=".4" stopColor="#c7907d"/><stop offset=".8" stopColor="#975c51"/><stop offset="1" stopColor="#734844"/></linearGradient>
   <linearGradient id="toolkit-finger" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0" stopColor="#dbab98"/><stop offset=".54" stopColor="#b97d70"/><stop offset="1" stopColor="#92574c"/></linearGradient>
   <linearGradient id="toolkit-sleeve" x1=".3" y1="0" x2=".8" y2="1"><stop stopColor="#3c4552"/><stop offset=".55" stopColor="#202b37"/><stop offset="1" stopColor="#111922"/></linearGradient>
   <radialGradient id="toolkit-palm" cx=".3" cy=".38" r=".78"><stop stopColor="#dda893" stopOpacity=".85"/><stop offset="1" stopColor="#8f5148" stopOpacity="0"/></radialGradient>
  </defs>
  <path d="M132 590 L114 534 Q100 510 100 470 L236 425 Q260 487 287 534 L311 590 Z" fill="url(#toolkit-sleeve)" stroke="#505462" strokeWidth="2"/>
  <path d="M129 545 Q173 561 270 528 M126 561 Q174 578 280 543" fill="none" stroke="#626875" strokeWidth="2" opacity=".35"/>
  {/* Upright index finger */}
  <path d="M195 294 C181 258 170 222 154 173 C140 131 133 91 137 62 C140 39 156 30 169 40 C180 48 185 70 189 100 L211 195 L234 261 Z" fill="url(#toolkit-finger)" stroke="#855249" strokeWidth="2"/>
  <path d="M149 84 Q164 77 179 85 M151 99 Q165 95 180 102" fill="none" stroke="#7e4d46" strokeWidth="2" opacity=".38"/>
  {/* Finger lifted to the left */}
  <path d="M191 292 Q165 266 121 235 L73 201 Q43 181 46 164 C48 149 66 144 82 151 Q101 161 142 188 L202 222 L234 270 Z" fill="url(#toolkit-finger)" stroke="#865049" strokeWidth="2"/>
  <path d="M63 167 Q75 159 91 174" fill="none" stroke="#f3d0b6" strokeWidth="3" opacity=".5"/>
  {/* Middle and ring fingers folded gently in space */}
  <path d="M230 296 Q205 269 176 265 L130 260 Q106 261 101 246 C98 230 114 221 135 222 L196 224 Q238 229 261 266 Z" fill="url(#toolkit-finger)" stroke="#82524a" strokeWidth="2"/>
  <path d="M256 327 Q234 301 207 295 L173 294 Q151 294 147 279 C144 262 161 253 180 255 L240 267 Q268 276 282 302 Z" fill="url(#toolkit-finger)" stroke="#834f49" strokeWidth="2"/>
  {/* Thumb extends toward the viewer */}
  <path d="M178 399 Q140 361 119 343 L92 318 C72 299 53 310 55 329 Q58 347 83 378 L129 431 L169 466 Z" fill="url(#toolkit-finger)" stroke="#82524b" strokeWidth="2"/>
  {/* Main palm / wrist */}
  <path d="M170 284 C190 270 229 272 254 294 Q278 315 279 345 C280 390 263 429 245 457 Q228 486 238 526 C200 545 149 544 124 521 Q113 481 120 443 Q125 410 149 373 Q162 356 165 326 Q167 307 170 284 Z" fill="url(#toolkit-skin)" stroke="#754941" strokeWidth="2.4"/>
  <path d="M170 284 C190 270 229 272 254 294 Q278 315 279 345 C280 390 263 429 245 457 Q228 486 238 526 C200 545 149 544 124 521 Q113 481 120 443 Q125 410 149 373 Q162 356 165 326 Q167 307 170 284 Z" fill="url(#toolkit-palm)"/>
  {/* Hand details, subtle rather than plastic shine */}
  <g fill="none" stroke="#764a46" strokeWidth="2" strokeLinecap="round" opacity=".35">
   <path d="M175 351 Q191 364 191 398 Q189 423 201 448"/>
   <path d="M224 334 Q228 364 223 391"/>
   <path d="M151 440 Q180 434 208 455"/>
   <path d="M174 464 Q199 472 217 481"/>
   <path d="M162 490 Q190 498 205 501"/>
   <path d="M203 311 Q224 303 249 317"/>
   <path d="M165 301 Q178 288 199 295"/>
  </g>
  <path d="M138 532 Q177 549 240 520" fill="none" stroke="#edc0a2" strokeOpacity=".38" strokeWidth="4"/>
 </svg>;
}
export default function ToolsOrbit(){
 const host=useRef<HTMLElement>(null);
 const [group,setGroup]=useState<"All"|Group>("All");
 const [selected,setSelected]=useState("Adobe Photoshop");
 const [turn,setTurn]=useState(0);
 const [scrollTurn,setScrollTurn]=useState(0);
 const [autoTurn,setAutoTurn]=useState(0);
 const [inView,setInView]=useState(false);
 const [reduced,setReduced]=useState(false);
 const [mobile,setMobile]=useState(false);
 const interactionPause=useRef(0);
 const touchStart=useRef<{x:number;y:number}|null>(null);
 const activeTools=useMemo(()=>group==="All"?TOOLS:TOOLS.filter(t=>t.group===group),[group]);
 const active=TOOLS.find(t=>t.name===selected)??TOOLS[0];
 useEffect(()=>{
  if(activeTools.some(t=>t.name===selected))return;
  setSelected(activeTools[0].name);
 },[activeTools,selected]);
 useEffect(()=>{
  const media=window.matchMedia("(max-width: 760px)");
  const onChange=()=>setMobile(media.matches);
  onChange();media.addEventListener("change",onChange);
  return()=>media.removeEventListener("change",onChange);
 },[]);
 useEffect(()=>{
  const media=window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange=()=>setReduced(media.matches);
  onChange();media.addEventListener("change",onChange);
  return()=>media.removeEventListener("change",onChange);
 },[]);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const observer=new IntersectionObserver(([entry])=>{
    document.body.classList.toggle("toolkit-section-active",entry.isIntersecting&&entry.intersectionRatio>.25);
    setInView(entry.isIntersecting);
  },{threshold:[0,.25,.6]});
  observer.observe(el);
  return()=>{observer.disconnect();document.body.classList.remove("toolkit-section-active")};
 },[]);
 useEffect(()=>{
  if(!host.current||reduced||mobile)return;
  const handle=ScrollTrigger.create({
    trigger:host.current,
    start:"top bottom",
    end:"bottom top",
    onUpdate:self=>setScrollTurn(self.progress*130)
  });
  return()=>handle.kill();
 },[reduced,mobile]);
 // Faster 14s revolution, throttled to ~30 updates/sec, paused offscreen.
 useEffect(()=>{
  // Native mobile scrolling stays smooth when animation runs on the compositor,
  // rather than forcing a React render every 32ms for sixteen orbit elements.
  if(reduced||!inView||mobile)return;
  let frame=0,last=0;
  const tick=(now:number)=>{
   if(!document.hidden&&now-last>=32){
    const elapsed=last?Math.min(now-last,80):32;
    setAutoTurn(value=>(value+elapsed*360/14000)%360);
    last=now;
   }
   frame=window.requestAnimationFrame(tick);
  };
  frame=window.requestAnimationFrame(tick);
  return()=>window.cancelAnimationFrame(frame);
 },[reduced,inView,mobile]);
 // The mobile orbit is continuously animated by CSS motion paths. No timer
 // changes selection during scrolling: this avoids tool-text jumps and costly
 // React layout rerenders on iOS Safari.
 const rotate=(direction:number)=>{
   interactionPause.current=Date.now()+6500;
   const visible=activeTools;
   const index=visible.findIndex(t=>t.name===selected);
   const next=(Math.max(index,0)+direction+visible.length)%visible.length;
   setSelected(visible[next].name);
   setTurn(value=>value+direction*360/visible.length);
 };
 const selectGroup=(value:"All"|Group)=>{
  interactionPause.current=Date.now()+6500;
  setGroup(value);setTurn(0);
  if(value!=="All"){
   const next=TOOLS.find(t=>t.group===value);
   if(next)setSelected(next.name);
  }
 };
 const orbitOffset=turn+scrollTurn+autoTurn;
 return <section className="toolkit-section section-container" id="toolkit" ref={host} aria-labelledby="toolkit-title">
  <div className="toolkit-header">
   <span className="toolkit-eyebrow">THE CREATIVE TOOLKIT <span aria-hidden="true">/</span> DESIGN × MOTION × CODE × AI</span>
   <span className="toolkit-counter">16 TOOLS · 04 DISCIPLINES</span>
  </div>
  <div className="toolkit-layout">
   <div className="toolkit-intro">
    <span className="toolkit-chapter">03 / THE WAY I WORK</span>
    <h2 id="toolkit-title">Ideas in <em>motion.</em></h2>
    <p>The tools behind my visual design, campaign communication, digital products and creative technology work.</p>
    <div className="toolkit-category-list" aria-label="Explore tool categories">
     {GROUPS.map(value=><button key={value} type="button" className={"toolkit-category"+(group===value?" is-active":"")}
       aria-pressed={group===value} onClick={()=>selectGroup(value)}>
       <span>{value}</span><small>{value==="All"?TOOLS.length:TOOLS.filter(tool=>tool.group===value).length}</small>
     </button>)}
    </div>
    <div className="toolkit-focus-copy"><span>IN FOCUS / {active.group.toUpperCase()}</span>
      <strong>{active.name}</strong><p>{active.description}</p></div>
   </div>
   <div className="toolkit-stage-col">
    <div className={"toolkit-stage"+(mobile?" toolkit-stage-mobile":"")+(group!=="All"?" toolkit-stage-filtered":"")} role="group" aria-label="Interactive orbit of creative software tools"
     onTouchStart={event=>{const t=event.touches[0];touchStart.current={x:t.clientX,y:t.clientY}}}
     onTouchEnd={event=>{const start=touchStart.current;touchStart.current=null;if(!start)return;const t=event.changedTouches[0];const dx=t.clientX-start.x;const dy=t.clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)rotate(dx<0?1:-1)}}>
     <div className="toolkit-ring toolkit-ring-outer" aria-hidden="true"/>
     <div className="toolkit-ring toolkit-ring-inner" aria-hidden="true"/>
     <div className="toolkit-axis" aria-hidden="true"/>
     <div className="toolkit-hand" aria-hidden="true" style={{transform:reduced||mobile?"translate(-50%, -50%)":`translate(-50%, -50%) rotate(${Math.sin(orbitOffset*Math.PI/180)*3.5}deg)`}}>
       <GestureHand/>
     </div>
     {activeTools.map((tool,i)=>{
       const angle=(i/activeTools.length)*Math.PI*2-1.4+(reduced?0:orbitOffset*Math.PI/180);
       const depth=(Math.sin(angle)+1)/2;
       const x=50+Math.cos(angle)*37.5;
       const y=49+Math.sin(angle)*30;
       const scale=.72+depth*.34;
       const isActive=selected===tool.name;
       return <button type="button" key={tool.name}
         className={"toolkit-tile"+(isActive?" is-active":"")}
         data-orbit-index={i}
         aria-label={"Select "+tool.name} aria-pressed={isActive}
         onClick={()=>{interactionPause.current=Date.now()+6500;setSelected(tool.name)}}
         style={{left:x+"%",top:y+"%",transform:`translate(-50%,-50%) scale(${scale})`,zIndex:Math.round(10+depth*20),opacity:reduced?1:(.52+depth*.48),["--tool-color" as string]:tool.color,["--mobile-orbit-delay" as string]:`${(-24*i/activeTools.length).toFixed(3)}s`}}>
         <span className="toolkit-tile-face" aria-hidden="true">{TOOL_LOGOS[tool.name]??<span className="toolkit-tile-monogram">{tool.mark}</span>}</span>
         <span className="toolkit-tile-name">{tool.name}</span>
       </button>;
     })}
     <div className="toolkit-stage-number" aria-hidden="true">{String(TOOLS.indexOf(active)+1).padStart(2,"0")} / {String(TOOLS.length).padStart(2,"0")}</div>
    </div>
    <div className="toolkit-controls">
     <span>{reduced?"SELECT A TOOL TO EXPLORE":mobile?"AUTO ROTATION · SWIPE OR USE ARROWS":"AUTO ROTATION · USE ARROWS TO EXPLORE"}</span>
     <div><button type="button" onClick={()=>rotate(-1)} aria-label="Previous tool">←</button>
          <button type="button" onClick={()=>rotate(1)} aria-label="Next tool">→</button></div>
    </div>
   </div>
  </div>
  <div className="toolkit-footer"><span>DESIGN TO DELIVERY</span>
   <p>{groupCopy[group]}</p><a href="#products">See the products built with these tools <span aria-hidden="true">↗</span></a>
  </div>
 </section>;
}
