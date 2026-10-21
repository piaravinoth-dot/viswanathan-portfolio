import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: SplitText;
}

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
const ownedElements = new Set<ParaElement>();

export default function setSplitText(cleanupOnly = false) {
  ScrollTrigger.config({ ignoreMobileResize: true });
  const paras = [...document.querySelectorAll<ParaElement>(".para")].filter(element=>!element.closest(".about-copy"));
  const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");

  new Set([...ownedElements, ...paras, ...titles]).forEach(element => {
    element.anim?.scrollTrigger?.kill();
    element.anim?.kill();
    element.split?.revert();
    delete element.anim;
    delete element.split;
  });
  ownedElements.clear();
  if (cleanupOnly || window.innerWidth < 900 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const TriggerStart = window.innerWidth <= 1024 ? "top 60%" : "20% 60%";
  const ToggleAction = "play pause resume reverse";

  // Animate paragraphs as semantic elements rather than splitting every word.
  // SplitText adds aria-label to <p>, which is prohibited on a generic paragraph.
  // Keeping the text nodes intact also reduces DOM work for assistive technology.
  paras.forEach((para: ParaElement) => {
    ownedElements.add(para);
    para.classList.add("visible");
    para.removeAttribute("aria-label");
    para.anim = gsap.fromTo(para,
      { y: 18 },
      {
        y: 0, duration: 0.7, ease: "power2.out",
        scrollTrigger: {
          trigger: para.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart
        }
      }
    );
  });
  titles.forEach((title: ParaElement) => {
    ownedElements.add(title);
    if (title.anim) {
      title.anim.progress(1).kill();
      title.split?.revert();
    }
    title.split = new SplitText(title, {
      type: "chars,lines",
      linesClass: "split-line",
    });
    title.anim = gsap.fromTo(
      title.split.chars,
      { autoAlpha: 0, y: 80, rotate: 10 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: title.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 0.8,
        ease: "power2.inOut",
        y: 0,
        rotate: 0,
        stagger: 0.03,
      }
    );
  });

  // Resplit on the existing resize lifecycle, not every ScrollTrigger refresh.
  // Refreshing layout must not add another listener and duplicate text animations.
}
