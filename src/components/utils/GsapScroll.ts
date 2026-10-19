import type * as THREE from "three";
import gsap from "gsap";

export function setCharTimeline(character: THREE.Object3D, camera: THREE.PerspectiveCamera) {
  const media = gsap.matchMedia();
  media.add("(min-width: 1025px)", () => {
    const context = gsap.context(() => {
      // Keep percent centering separate from pixel offsets and scroll movement.
      gsap.set(".character-model", {xPercent:-50,x:0,yPercent:0,y:0,opacity:1});
      gsap.set(".character-hover", {pointerEvents:"auto"});
      // GLTFLoader sanitizes Plane.004 to Plane004. Hide the entire
      // multi-material monitor, including its black glass, during close-ups.
      const monitor = character.getObjectByName("Plane004") || character.getObjectByName("Plane.004");
      const monitorScale = monitor?.scale.clone();
      if (monitor) gsap.set(monitor.scale, {x:0,y:0,z:0});
      const neck = character.getObjectByName("spine005");
      const intro = gsap.timeline({scrollTrigger:{trigger:".landing-section",start:"top top",end:"bottom top",scrub:true,invalidateOnRefresh:true}});
      intro.fromTo(character.rotation,{y:0,x:0},{y:.7,x:.08,duration:1},0)
        .to(camera.position,{z:75,y:8.4,duration:1,ease:"power2.inOut"},0)
        .to(".character-model",{xPercent:-75,duration:1},0)
        .to(".landing-container",{opacity:0,yPercent:25,duration:.8},0);
      // About stays in its own section instead of starting half a section above it.
      intro.fromTo(".about-me",{y:45,opacity:0},{y:0,opacity:1,duration:1},0);
      // Complete the working pose as About arrives, then hold it while the
      // biography is read. The previous late reveal happened below About.
      if (neck) intro.to(neck.rotation,{x:.35,duration:1},0);
      if (monitor && monitorScale) {
        intro.to(monitor.scale,{x:monitorScale.x,y:monitorScale.y,z:monitorScale.z,duration:.55},.45);
      }
      intro.to(".character-hover",{pointerEvents:"none",duration:0},.3);
      intro.to(".character-rim",{opacity:0,scale:.6,duration:.6},.4);
      // The 3D scene belongs to the hero/About, never the capabilities content.
      gsap.to(".character-model", {opacity:0, ease:"none", scrollTrigger:{
        trigger:"#capabilities", start:"top 95%", end:"top 75%", scrub:true,
        invalidateOnRefresh:true,
      }});
    });
    return () => context.revert();
  });
  return () => media.revert();
}

export function setAllTimeline() {
  const media = gsap.matchMedia();
  // Match the mobile scroll-led reveal with a slower, ordered desktop sequence.
  // All four experiences remain in the DOM and the layout never changes.
  media.add("(min-width: 901px)", () => {
    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const entries = gsap.utils.toArray<HTMLElement>(".career-info-box");
      if (!entries.length) return;
      const timeline = gsap.timeline({
        scrollTrigger:{
          trigger:".career-info",
          start:"top 78%",
          end:"bottom 55%",
          scrub:1.15,
          invalidateOnRefresh:true
        }
      });
      // The timeline draws while jobs enter gently, one after another.
      timeline.fromTo(".career-timeline",
        {maxHeight:"0%",opacity:.7},
        {maxHeight:"100%",opacity:1,duration:entries.length*1.25,ease:"none"},0);
      entries.forEach((entry,index) => {
        timeline.fromTo(entry,
          {y:48,opacity:0},
          {y:0,opacity:1,duration:1.25,ease:"power2.out",immediateRender:true},
          index*1.25
        );
      });
    });
    return () => context.revert();
  });
  media.add("(max-width: 900px)", () => {
    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const entries = gsap.utils.toArray<HTMLElement>(".career-info-box");
      // Each job reveals independently when it enters the phone viewport.
      // Scroll back up to reverse naturally, without autoplaying offscreen items.
      entries.forEach((entry) => {
        gsap.fromTo(entry,{y:32},{
          y:0,ease:"none",immediateRender:false,
          scrollTrigger:{trigger:entry,start:"top 88%",end:"top 50%",scrub:true,invalidateOnRefresh:true},
        });
      });
      gsap.fromTo(".career-timeline",{maxHeight:"0%",opacity:.7},{
        maxHeight:"100%",opacity:1,ease:"none",
        scrollTrigger:{trigger:".career-info",start:"top 86%",end:"bottom 65%",scrub:true,invalidateOnRefresh:true},
      });
    });
    return () => context.revert();
  });
  return () => media.revert();
}
