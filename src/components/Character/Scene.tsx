import {useEffect,useRef} from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import {useLoading} from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {handleMouseMove,handleTouchEnd,handleHeadRotation,handleTouchMove} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import {setCharTimeline} from "../utils/GsapScroll";
import {setProgress} from "../Loading";

function disposeModel(model:THREE.Object3D){
  model.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    object.geometry?.dispose();
    const materials=Array.isArray(object.material)?object.material:[object.material];
    materials.forEach(material=>{
      Object.values(material).forEach(value=>{if(value instanceof THREE.Texture)value.dispose();});
      material.dispose();
    });
  });
}

const Scene=()=>{
  const canvasDiv=useRef<HTMLDivElement>(null);
  const hoverDivRef=useRef<HTMLDivElement>(null);
  const {setLoading}=useLoading();
  useEffect(()=>{
    const host=canvasDiv.current;
    if(!host)return;
    const scene=new THREE.Scene();
    const box=host.getBoundingClientRect();
    let renderer:THREE.WebGLRenderer;
    try {renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}
    catch(error){console.warn("3D rendering unavailable; continuing with portfolio content.",error);host.style.pointerEvents="none";host.classList.add("character-unavailable");setLoading(100);return;}
    renderer.setSize(box.width,box.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,window.matchMedia("(max-width: 1024px)").matches?1.2:1.5));
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1;
    host.appendChild(renderer.domElement);
    const camera=new THREE.PerspectiveCamera(14.5,box.width/box.height,.1,1000);
    camera.position.set(0,13.1,24.7);camera.zoom=1.1;
    // Phone/tablet framing: bring the face above the lower edge and fit the figure.
    // Desktop perspective and animation remain unchanged.
    if(window.matchMedia("(max-width: 1024px)").matches){camera.position.y=10.8;camera.zoom=.78;}
    camera.updateProjectionMatrix();
    const light=setLighting(scene),progress=setProgress(setLoading),clock=new THREE.Clock();
    // Pause expensive WebGL drawing off-screen or in background tabs.
    let onScreen=true;
    const visibilityObserver=new IntersectionObserver(entries=>{onScreen=entries.some(entry=>entry.isIntersecting);},{threshold:0.01});
    visibilityObserver.observe(host);
    const frameInterval=window.matchMedia("(max-width: 1024px)").matches?1000/30:1000/45;
    let lastDraw=0;
    let disposed=false,frame=0,visibleReported=false;
    let model:THREE.Object3D|undefined,head:THREE.Object3D|undefined,screen:THREE.Object3D|undefined;
    let animations:ReturnType<typeof setAnimations>|undefined;
    let stopTimeline:(()=>void)|undefined,stopHover:(()=>void)|undefined,stopTouchReset:(()=>void)|undefined;
    let mouse={x:0,y:0},interpolation={x:.1,y:.2};
    const onMouseMove=(event:MouseEvent)=>handleMouseMove(event,(x,y)=>{mouse={x,y};});
    const onTouchMove=(event:TouchEvent)=>handleTouchMove(event,(x,y)=>{mouse={x,y};});
    const onTouchEnd=()=>{stopTouchReset?.();stopTouchReset=handleTouchEnd((x,y,ix,iy)=>{mouse={x,y};interpolation={x:ix,y:iy};});};
    let previousWidth=window.innerWidth;
    const onResize=()=>{
      const width=window.innerWidth;
      // Phone browser UI height shifts do not resize this width-based canvas;
      // rescaling WebGL on every scroll-induced resize causes visible jitter.
      if(width<=1024 && width===previousWidth)return;
      previousWidth=width;
      if(!disposed)handleResize(renderer,camera,canvasDiv);
    };
    const landing=document.getElementById("landingDiv");
    document.addEventListener("mousemove",onMouseMove,{passive:true});
    landing?.addEventListener("touchmove",onTouchMove,{passive:true});
    landing?.addEventListener("touchend",onTouchEnd,{passive:true});
    window.addEventListener("resize",onResize);
    setCharacter(renderer,scene,camera,()=>disposed).loadCharacter().then(gltf=>{
      if(!gltf)return;
      if(disposed){disposeModel(gltf.scene);return;}
      model=gltf.scene;
      // The laptop screen in this borrowed rig is a GROUP, not necessarily a mesh.
      // Hide the entire monitor object on mobile only, before it enters the scene.
      if(window.matchMedia("(max-width: 1024px)").matches){
        const monitor=model.getObjectByName("Plane004") || model.getObjectByName("Plane.004");
        if(monitor){monitor.visible=false;monitor.scale.set(0,0,0);}
      }
      scene.add(model);
      animations=setAnimations(gltf);
      if(hoverDivRef.current)stopHover=animations.hover(gltf,hoverDivRef.current);
      head=model.getObjectByName("spine006");screen=model.getObjectByName("screenlight");
      stopTimeline=setCharTimeline(model,camera);
      // Begin the reveal as soon as the model exists. The old 2.5s timer
      // delayed the most memorable element even after downloading had finished.
      progress.clear();
      light.turnOnLights();
      animations?.startIntro();
    }).catch(error=>{if(!disposed){console.warn("3D model unavailable",error);host.style.pointerEvents="none";host.classList.add("character-unavailable");progress.clear();}});
    const animate=(now:number)=>{
      if(disposed)return;
      frame=requestAnimationFrame(animate);
      if(document.hidden||!onScreen)return;
      if(now-lastDraw<frameInterval)return;
      lastDraw=now;
      if(head)handleHeadRotation(head,mouse.x,mouse.y,interpolation.x,interpolation.y,THREE.MathUtils.lerp);
      light.setPointLight(screen);
      animations?.mixer.update(Math.min(clock.getDelta(),0.05));
      renderer.render(scene,camera);
      if(model&&!visibleReported){
        visibleReported=true;
        document.documentElement.dataset.character3d="visible";
        performance.mark("portfolio-3d-visible");
        try {performance.measure("portfolio-3d-first-frame","portfolio-3d-start","portfolio-3d-visible");} catch { /* mark may not exist in direct previews */ }
      }
    };
    frame=requestAnimationFrame(animate);
    return()=>{
      disposed=true;cancelAnimationFrame(frame);progress.cancel();visibilityObserver.disconnect();
      window.removeEventListener("resize",onResize);document.removeEventListener("mousemove",onMouseMove);
      landing?.removeEventListener("touchmove",onTouchMove);landing?.removeEventListener("touchend",onTouchEnd);
      stopTouchReset?.();stopHover?.();stopTimeline?.();animations?.dispose();light.dispose();
      if(model)disposeModel(model);scene.clear();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    };
  },[]);
  return <div className="character-container"><div className="character-model" ref={canvasDiv}><div className="character-rim"/><div className="character-hover" ref={hoverDivRef}/></div></div>;
};
export default Scene;
