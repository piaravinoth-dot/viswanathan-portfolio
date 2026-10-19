import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";
const AIDesignStudioCaseStudy = lazy(() => import("./components/AIDesignStudioCaseStudy"));
const ContentStudioCaseStudy = lazy(() => import("./components/ContentStudioCaseStudy"));
const SocialIntelligenceCaseStudy = lazy(() => import("./components/SocialIntelligenceCaseStudy"));
const ContentTrackerCaseStudy = lazy(() => import("./components/ContentTrackerCaseStudy"));
const SplitMateCaseStudy = lazy(() => import("./components/SplitMateCaseStudy"));
const ClipStudioCaseStudy = lazy(() => import("./components/ClipStudioCaseStudy"));

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const canUseHardwareWebGL=()=>{
  // Never auto-start an expensive animated scene through a software renderer.
  // SwiftShader/llvmpipe can freeze navigation and cause massive blocking time.
  try{
    const canvas=document.createElement("canvas");
    const options:WebGLContextAttributes={failIfMajorPerformanceCaveat:true,powerPreference:"low-power"};
    const gl=canvas.getContext("webgl2",options)||canvas.getContext("webgl",options);
    if(!gl)return false;
    const info=gl.getExtension("WEBGL_debug_renderer_info");
    const name=String(info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|software|softpipe|basic render/i.test(name);
  }catch{return false}
};

const App = () => {
  // Let the first hero frame paint, then begin the 3D scene right away.
  // The previous load-event + 2.7s timer + idle callback caused visitors
  // to leave before the character appeared. Keep the hardware WebGL check.
  const [threeDReady,setThreeDReady]=useState(false);
  const route = window.location.pathname.replace(/\/$/, "");
  useEffect(()=>{
    if(route!=="" || window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    let cancelled=false;
    let paintFrame=0,loadFrame=0,timer=0;
    paintFrame=window.requestAnimationFrame(()=>{
      loadFrame=window.requestAnimationFrame(()=>{
        // Give the visible hero a short head start, not multiple seconds.
        timer=window.setTimeout(()=>{
          if(cancelled)return;
          if(!canUseHardwareWebGL()){
            document.documentElement.dataset.character3d="unsupported";
            return;
          }
          document.documentElement.dataset.character3d="starting";
          performance.mark("portfolio-3d-start");
          setThreeDReady(true);
        },window.matchMedia("(max-width: 1024px)").matches?420:160);
      });
    });
    return()=>{
      cancelled=true;
      window.cancelAnimationFrame(paintFrame);
      window.cancelAnimationFrame(loadFrame);
      window.clearTimeout(timer);
    };
  },[route]);
  const caseStudies = {
    "/work/ai-design-studio": AIDesignStudioCaseStudy,
    "/work/content-studio": ContentStudioCaseStudy,
    "/work/social-media-intelligence": SocialIntelligenceCaseStudy,
    "/work/content-tracker": ContentTrackerCaseStudy,
    "/work/splitmate": SplitMateCaseStudy,
    "/work/clip-studio": ClipStudioCaseStudy,
  };
  useEffect(() => {
    const canonicalBase = "https://viswanathan-portfolio-iota.vercel.app";
    const seo: Record<string, [string,string]> = {
      "/": ["Viswanathan G — Senior Product & Visual Designer", "Explore Viswanathan G's product design, visual direction, creative technology projects and six detailed digital product case studies."],
      "/work/ai-design-studio": ["AI Design Studio — Case Study | Viswanathan G", "AI-assisted creative workspace design case study covering image creation, layers, production flows and export experience."],
      "/work/content-studio": ["Content Studio — Case Study | Viswanathan G", "Content operations and news intelligence platform: source monitoring, translation, editorial review and collaborative workflows."],
      "/work/social-media-intelligence": ["Social Media Intelligence — Case Study | Viswanathan G", "Social media reporting and analytics design case study featuring dashboards, account comparisons and clear data storytelling."],
      "/work/content-tracker": ["Content Tracker — Case Study | Viswanathan G", "Cross-platform content tracking workflow for published links across Facebook, Instagram and X."],
      "/work/splitmate": ["SplitMate — Case Study | Viswanathan G", "Mobile expense splitting product design case study featuring shared balances, settlements and private financial records."],
      "/work/clip-studio": ["Clip Studio — Case Study | Viswanathan G", "Responsive creator utility concept for supported social video links and streamlined video workflows."]
    };
    const [title,description]=seo[route]||seo["/"];
    document.title=title;
    const setMeta=(selector:string,name:string,content:string,attribute="name")=>{
      let el=document.head.querySelector<HTMLMetaElement>(selector);
      if(!el){el=document.createElement("meta");el.setAttribute(attribute,name);document.head.appendChild(el)}
      el.setAttribute("content",content);
    };
    setMeta('meta[name="description"]',"description",description);
    setMeta('meta[property="og:title"]',"og:title",title,"property");
    setMeta('meta[property="og:description"]',"og:description",description,"property");
    setMeta('meta[property="og:type"]',"og:type",route==="/"?"website":"article","property");
    setMeta('meta[property="og:url"]',"og:url",canonicalBase+route,"property");
    setMeta('meta[name="twitter:card"]',"twitter:card","summary_large_image");
    let link=document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if(!link){link=document.createElement("link");link.rel="canonical";document.head.appendChild(link)}
    link.href=canonicalBase+route;
  },[route]);
  const CaseStudy = caseStudies[route];
  if (CaseStudy) return <Suspense fallback={<main className="case-loading" role="status">Loading case study…</main>}><CaseStudy /></Suspense>;
  return (
    <>
      <LoadingProvider>
        <Suspense>
          <MainContainer>
            {threeDReady&&<Suspense fallback={null}>
              <CharacterModel />
            </Suspense>}
          </MainContainer>
        </Suspense>
      </LoadingProvider>
    </>
  );
};

export default App;
