import {useEffect,useRef} from "react";

export function useHomeMotion(){
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const root=ref.current;
    if(!root||new URLSearchParams(window.location.search).get("motion")==="off")return;
    const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed=false,cleanup:(()=>void)|undefined,loading=false;
    const load=()=>{
      if(disposed||preference.matches||cleanup||loading)return;
      loading=true;
      void import("./homeMotionDriver").then(({enableHomeMotion})=>{
        loading=false;if(!disposed)cleanup=enableHomeMotion(root);
      }).catch(()=>{loading=false; /* Content stays readable if enhancement fails. */});
    };
    load();
    preference.addEventListener("change",load);
    return()=>{disposed=true;preference.removeEventListener("change",load);cleanup?.();};
  },[]);
  return ref;
}
