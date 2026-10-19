import {useEffect,useRef} from "react";

/**
 * Only desktop visitors download the optional animation engine.
 * Mobile and reduced-motion visitors receive the original, instantly
 * readable case-study layout without loading ScrollTrigger.
 */
export function useAIDesignMotion(){
  const ref=useRef<HTMLElement>(null);
  useEffect(()=>{
    const root=ref.current;
    if(!root)return;
    const media=window.matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)");
    let version=0;
    let cleanup:(()=>void)|undefined;
    const update=()=>{
      const ticket=++version;
      cleanup?.();
      cleanup=undefined;
      if(!media.matches)return;
      void import("./aiMotionDriver").then(({enableAIDesignMotion})=>{
        if(version!==ticket||!media.matches)return;
        cleanup=enableAIDesignMotion(root);
      }).catch((err)=>{
        // Motion is progressive enhancement; failure never blocks content.
        if(import.meta.env.DEV)console.warn("Optional studio motion unavailable",err);
      });
    };
    update();
    media.addEventListener("change",update);
    return ()=>{
      version++;
      media.removeEventListener("change",update);
      cleanup?.();
    };
  },[]);
  return ref;
}
