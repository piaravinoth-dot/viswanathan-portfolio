import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Desktop-only progressive enhancement; only transforms, never text opacity.
export function enableAIDesignMotion(root:HTMLElement){
  root.dataset.motionActive="true";
  const scope=gsap.context(()=>{
    const intro=gsap.timeline({defaults:{ease:"power2.out"}});
    intro.fromTo(".ai-case-hero-title h1",
      {y:32},{y:0,duration:0.88},0
    ).fromTo(".ai-case-hero-side",
      {y:22},{y:0,duration:0.78},0.13
    ).fromTo(".ai-case-hero-stage",
      {y:26},{y:0,duration:1.0},0.22
    );

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
      gsap.fromTo(element,{y:28},{
        y:0,duration:0.75,ease:"power2.out",
        scrollTrigger:{trigger:element,start:"top 92%",once:true}
      });
    });
    gsap.fromTo(".ai-case-statement h2",
      {y:12},{y:-12,ease:"none",scrollTrigger:{
        trigger:".ai-case-statement",start:"top bottom",end:"bottom top",scrub:0.65
      }}
    );
  },root);
  return ()=>{
    scope.revert();
    delete root.dataset.motionActive;
  };
}
