import {SplitText} from "gsap/SplitText";
import gsap from "gsap";
import {smoother} from "../Navbar";

export function initialFX() {
  document.body.style.overflowY = "auto";
  smoother?.paused(false);
  const main = document.querySelector(".main-body");
  main?.classList.add("main-active");
  let text: SplitText | undefined;
  const context = gsap.context(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    text = new SplitText([".landing-info h3", ".landing-intro h2", ".landing-intro h1"], {type:"chars,lines", linesClass:"split-line"});
    gsap.fromTo(text.chars, {opacity:0,y:45}, {opacity:1,y:0,duration:.8,ease:"power3.out",stagger:.018});
    gsap.fromTo([".header", ".icons-section", ".nav-fade"], {opacity:0}, {opacity:1,duration:.7,ease:"power1.out"});
  });
  return () => {
    context.revert();
    text?.revert();
    main?.classList.remove("main-active");
  };
}
