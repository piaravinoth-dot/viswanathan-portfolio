import {PropsWithChildren,useEffect,useState} from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar,{smoother} from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work,{VisualArchive} from "./Work";
import SelectedCases from "./SelectedCases";
import PoliticalSpace from "./PoliticalSpace";
import setSplitText from "./utils/splitText";
import {setAllTimeline} from "./utils/GsapScroll";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {useLoading} from "../context/LoadingProvider";
import {useHomeMotion} from "./useHomeMotion";
import "./styles/HomeMotion.css";

const MainContainer=({children}:PropsWithChildren)=>{
  const motionRef=useHomeMotion();
  const [isDesktopView,setIsDesktopView]=useState(false);
  const {isLoading}=useLoading();
  useEffect(()=>{
    const media=window.matchMedia("(min-width:1025px)");
    const change=()=>setIsDesktopView(media.matches);
    change();
    media.addEventListener("change",change);
    return()=>media.removeEventListener("change",change);
  },[]);
  useEffect(()=>{
    if(isLoading)return;
    document.body.style.overflowY="auto";
    smoother?.paused(false);
    let disposed=false;
    let stopCareer:(()=>void)|undefined;
    let timer:number;
    let previousWidth=window.innerWidth;
    const resize=()=>{
      const width=window.innerWidth;
      // Address-bar hide/show changes the phone's viewport height, not its
      // layout width. Avoid re-splitting headings and refreshing scroll triggers.
      if(width<=1024 && width===previousWidth)return;
      previousWidth=width;
      window.clearTimeout(timer);
      timer=window.setTimeout(()=>{setSplitText();ScrollTrigger.refresh();},150);
    };
    document.fonts.ready.then(()=>{
      if(disposed)return;
      setSplitText();
      stopCareer=setAllTimeline();
      ScrollTrigger.refresh();
    });
    window.addEventListener("resize",resize);
    return()=>{disposed=true;window.clearTimeout(timer);window.removeEventListener("resize",resize);stopCareer?.();setSplitText(true);};
  },[isLoading]);
  return <div className="container-main" ref={motionRef}><Cursor/><Navbar/><SocialIcons/>{isDesktopView&&children}<div id="smooth-wrapper"><div id="smooth-content"><div className="container-main"><Landing>{!isDesktopView&&children}</Landing><About/><SelectedCases/><Work/><VisualArchive/><PoliticalSpace/><WhatIDo/><Career/><Contact/></div></div></div></div>;
};
export default MainContainer;
