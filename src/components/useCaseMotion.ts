import {useEffect,useRef} from "react";
import "./styles/CaseMotion.css";
export function useCaseMotion<T extends HTMLElement=HTMLElement>(){
 const ref=useRef<T>(null);
 useEffect(()=>{
  const root=ref.current;if(!root||new URLSearchParams(location.search).get("motion")==="off")return;
  const media=matchMedia("(prefers-reduced-motion: reduce)");
  let disposed=false,loading=false,cleanup:(()=>void)|undefined;
  const load=()=>{if(disposed||media.matches||loading||cleanup)return;loading=true;
   void import("./caseMotionDriver").then(({enableCaseMotion})=>{loading=false;if(!disposed)cleanup=enableCaseMotion(root)}).catch(()=>{loading=false});
  };
  load();media.addEventListener("change",load);
  return()=>{disposed=true;media.removeEventListener("change",load);cleanup?.()};
 },[]);return ref;
}
