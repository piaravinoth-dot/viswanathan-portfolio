import {useEffect,useRef} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

// GSAP and ScrollTrigger are already in the portfolio; no new runtime package.
gsap.registerPlugin(ScrollTrigger);

/**
 * Isolated motion pilot: AI Design Studio case study only.
 * Uses transform/opacity instead of reflow, and honors reduced motion.
 * All animations are scoped to this route and reverted on navigation.
 */
export function useAIDesignMotion(){
  const ref=useRef<HTMLElement>(null);
  useEffect(()=>{
    const root=ref.current;
    if(!root)return;
    const media=gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)",()=>{
      const scope=gsap.context(()=>{
        const compact=window.matchMedia("(max-width: 760px)").matches;
        // First viewport on phones stays instantly readable: animating LCP
        // headline/UI during a cold load hurts mobile perception and scoring.
        if(!compact){
          const intro=gsap.timeline({defaults:{ease:"power2.out"}});
          intro.fromTo(".ai-case-hero-title h1",
            {opacity:0.35,y:32},{opacity:1,y:0,duration:0.88},0
          ).fromTo(".ai-case-hero-side",
            {opacity:0.55,y:22},{opacity:1,y:0,duration:0.78},0.13
          ).fromTo(".ai-case-hero-stage",
            {opacity:0.8,y:26},{opacity:1,y:0,duration:1.0},0.22
          );
        }

        // Progressive reading rhythm; no full-screen pinning, video or heavy shader.
        const revealTargets=[
          ".ai-case-intro-grid h2",
          ".ai-case-intro-grid>div",
          ".ai-case-section-head",
          ".ai-case-flow-step",
          ".ai-case-feature-head",
          ".ai-case-split-copy",
          ".ai-case-split-visual",
          ".ai-showcase-heading",
          ".ai-showcase-card",
          ".ai-case-system-grid",
          ".ai-case-end h2"
        ].join(", ");
        gsap.utils.toArray<HTMLElement>(revealTargets).forEach((element)=>{
          gsap.fromTo(element,
            {opacity:compact?0.9:0.8,y:compact?14:28},
            {opacity:1,y:0,duration:compact?0.45:0.75,ease:"power2.out",
              scrollTrigger:{trigger:element,start:"top 92%",once:true}}
          );
        });
        // Short desktop-only editorial drift, kept away from scaled UI mockups.
        if(!compact){
          gsap.fromTo(".ai-case-statement h2",
            {y:12},{y:-12,ease:"none",scrollTrigger:{
              trigger:".ai-case-statement",start:"top bottom",end:"bottom top",scrub:0.65
            }}
          );
        }
      },root);
      return ()=>scope.revert();
    });
    return ()=>media.revert();
  },[]);
  return ref;
}
