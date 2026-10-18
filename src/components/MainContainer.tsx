import {PropsWithChildren,useEffect,useState} from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar,{smoother} from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import setSplitText from "./utils/splitText";
import {setAllTimeline} from "./utils/GsapScroll";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {useLoading} from "../context/LoadingProvider";

const MainContainer=({children}:PropsWithChildren)=>{
  const [isDesktopView,setIsDesktopView]=useState(window.innerWidth>1024);
  const {isLoading}=useLoading();
  useEffect(()=>{
    const media=window.matchMedia("(min-width:1025px)");
    const change=()=>setIsDesktopView(media.matches);
    media.addEventListener("change",change);
    return()=>media.removeEventListener("change",change);
  },[]);
  useEffect(()=>{
    if(isLoading)return;
    document.body.style.overflowY="auto";
    smoother?.paused(false);
    let disposed=false;
    let stopIntro:(()=>void)|undefined;
    let stopCareer:(()=>void)|undefined;
    let timer:number;
    const resize=()=>{
      window.clearTimeout(timer);
      timer=window.setTimeout(()=>{setSplitText();ScrollTrigger.refresh();},150);
    };
    Promise.all([document.fonts.ready,import("./utils/initialFX")]).then(([,module])=>{
      if(disposed)return;
      stopIntro=module.initialFX();
      setSplitText();
      stopCareer=setAllTimeline();
      ScrollTrigger.refresh();
    });
    window.addEventListener("resize",resize);
    return()=>{disposed=true;window.clearTimeout(timer);window.removeEventListener("resize",resize);stopIntro?.();stopCareer?.();setSplitText(true);};
  },[isLoading]);
  return <div className="container-main"><Cursor/><Navbar/><SocialIcons/>{isDesktopView&&children}<div id="smooth-wrapper"><div id="smooth-content"><div className="container-main"><Landing>{!isDesktopView&&children}</Landing><About/><WhatIDo/><Career/><Work/><Contact/></div></div></div></div>;
};
export default MainContainer;
