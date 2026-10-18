import {useEffect,useRef} from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor=()=>{
  const cursorRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const cursor=cursorRef.current;
    if(!cursor)return;
    let hover=false,frame=0;
    const mouse={x:0,y:0},position={x:0,y:0};
    const move=(event:MouseEvent)=>{mouse.x=event.clientX;mouse.y=event.clientY;};
    document.addEventListener("mousemove",move,{passive:true});
    const loop=()=>{
      if(!hover){position.x+=(mouse.x-position.x)/6;position.y+=(mouse.y-position.y)/6;gsap.to(cursor,{x:position.x,y:position.y,duration:.1,overwrite:true});}
      frame=requestAnimationFrame(loop);
    };
    frame=requestAnimationFrame(loop);
    const removeHoverListeners:(()=>void)[]=[];
    document.querySelectorAll<HTMLElement>("[data-cursor]").forEach(element=>{
      const enter=()=>{
        if(element.dataset.cursor==="icons"){
          const box=element.getBoundingClientRect();cursor.classList.add("cursor-icons");
          gsap.to(cursor,{x:box.left,y:box.top,duration:.1,overwrite:true});cursor.style.setProperty("--cursorH",`${box.height}px`);hover=true;
        }
        if(element.dataset.cursor==="disable")cursor.classList.add("cursor-disable");
      };
      const leave=()=>{cursor.classList.remove("cursor-disable","cursor-icons");hover=false;};
      element.addEventListener("mouseenter",enter);element.addEventListener("mouseleave",leave);
      removeHoverListeners.push(()=>{element.removeEventListener("mouseenter",enter);element.removeEventListener("mouseleave",leave);});
    });
    return()=>{cancelAnimationFrame(frame);document.removeEventListener("mousemove",move);removeHoverListeners.forEach(remove=>remove());gsap.killTweensOf(cursor);};
  },[]);
  return <div className="cursor-main" ref={cursorRef}/>;
};
export default Cursor;
