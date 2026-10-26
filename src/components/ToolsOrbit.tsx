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
 return <img className="toolkit-hand-photo" src="/toolkit-hand.avif" width={400} height={315} alt="" draggable={false} decoding="async"/>;
}
export default function ToolsOrbit(){
 const host=useRef<HTMLElement>(null);
 const [group,setGroup]=useState<"All"|Group>("Design");
 const [selected,setSelected]=useState("Adobe Photoshop");
 const [turn,setTurn]=useState(0);
 const [scrollTurn,setScrollTurn]=useState(0);
 const [autoTurn,setAutoTurn]=useState(0);
 const [inView,setInView]=useState(false);
 const [reduced,setReduced]=useState(false);
 const activeTools=useMemo(()=>group==="All"?TOOLS:TOOLS.filter(t=>t.group===group),[group]);
 const active=TOOLS.find(t=>t.name===selected)??TOOLS[0];
 useEffect(()=>{
  if(activeTools.some(t=>t.name===selected))return;
  setSelected(activeTools[0].name);
 },[activeTools,selected]);
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
  if(!host.current||reduced)return;
  const handle=ScrollTrigger.create({
    trigger:host.current,
    start:"top bottom",
    end:"bottom top",
    onUpdate:self=>setScrollTurn(self.progress*130)
  });
  return()=>handle.kill();
 },[reduced]);
 // Faster 14s revolution, throttled to ~30 updates/sec, paused offscreen.
 useEffect(()=>{
  if(reduced||!inView)return;
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
 },[reduced,inView]);
 const rotate=(direction:number)=>{
   const visible=activeTools;
   const index=visible.findIndex(t=>t.name===selected);
   const next=(Math.max(index,0)+direction+visible.length)%visible.length;
   setSelected(visible[next].name);
   setTurn(value=>value+direction*360/visible.length);
 };
 const selectGroup=(value:"All"|Group)=>{
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
    <div className="toolkit-stage" role="group" aria-label="Interactive orbit of creative software tools">
     <div className="toolkit-ring toolkit-ring-outer" aria-hidden="true"/>
     <div className="toolkit-ring toolkit-ring-inner" aria-hidden="true"/>
     <div className="toolkit-axis" aria-hidden="true"/>
     <div className="toolkit-hand" aria-hidden="true" style={{transform:reduced?"translate(-50%, -50%)":`translate(-50%, -50%) rotate(${Math.sin(orbitOffset*Math.PI/180)*3.5}deg)`}}>
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
         aria-label={"Select "+tool.name} aria-pressed={isActive}
         onClick={()=>setSelected(tool.name)}
         style={{left:x+"%",top:y+"%",transform:`translate(-50%,-50%) scale(${scale})`,zIndex:Math.round(10+depth*20),opacity:reduced?1:(.52+depth*.48),["--tool-color" as string]:tool.color}}>
         <span className="toolkit-tile-face" aria-hidden="true">{TOOL_LOGOS[tool.name]??<span className="toolkit-tile-monogram">{tool.mark}</span>}</span>
         <span className="toolkit-tile-name">{tool.name}</span>
       </button>;
     })}
     <div className="toolkit-stage-number" aria-hidden="true">{String(TOOLS.indexOf(active)+1).padStart(2,"0")} / {String(TOOLS.length).padStart(2,"0")}</div>
    </div>
    <div className="toolkit-controls">
     <span>{reduced?"SELECT A TOOL TO EXPLORE":"AUTO ROTATION · USE ARROWS TO EXPLORE"}</span>
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
