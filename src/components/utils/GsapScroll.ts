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
      intro.fromTo(character.rotation,{y:0},{y:.7,duration:1},0)
        .to(camera.position,{z:22,duration:1},0)
        .to(".character-model",{xPercent:-75,duration:1},0)
        .to(".landing-container",{opacity:0,yPercent:25,duration:.8},0);
      // About stays in its own section instead of starting half a section above it.
      intro.fromTo(".about-me",{y:45,opacity:0},{y:0,opacity:1,duration:1},0);
      const about = gsap.timeline({scrollTrigger:{trigger:".about-section",start:"center 55%",end:"bottom top",scrub:true,invalidateOnRefresh:true}});
      about.to(camera.position,{z:75,y:8.4,duration:6,delay:2,ease:"power3.inOut"},0)
        .to(".about-me",{opacity:0,delay:3,duration:2},0)
        .to(".character-model",{xPercent:-62,delay:2,duration:5},0)
        .to(".character-hover",{pointerEvents:"none",delay:2,duration:0},0)
        .to(character.rotation,{y:.92,x:.12,delay:3,duration:3},0)
        .to(".character-rim",{opacity:0,scale:0,yPercent:-70,delay:2,duration:5},0);
      if (neck) about.to(neck.rotation,{x:.6,delay:2,duration:3},0);
      if (monitor && monitorScale) {
        about.to(monitor.scale,{x:monitorScale.x,y:monitorScale.y,z:monitorScale.z,duration:1,delay:3.2},0);
      }
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
  const context = gsap.context(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeline = gsap.timeline({scrollTrigger:{trigger:".career-section",start:"top 80%",end:"bottom 65%",scrub:true,invalidateOnRefresh:true}});
    timeline.fromTo(".career-timeline",{maxHeight:"10%",opacity:0},{maxHeight:"100%",opacity:1,duration:1},0)
      .fromTo(".career-info-box",{opacity:.3},{opacity:1,stagger:.1,duration:.5},0);
  });
  return () => context.revert();
}
