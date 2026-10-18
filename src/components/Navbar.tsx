import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";
import { useLoading } from "../context/LoadingProvider";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

const Navbar = () => {
  const { isLoading } = useLoading();
  useEffect(() => {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    smoother.paused(false);

    const onResize = () => ScrollSmoother.refresh(true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      smoother.kill();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const followHash = (animate = false) => {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); }
      catch { return; }
      const target = document.getElementById(id);
      if (target) {
        ScrollTrigger.refresh();
        const headerHeight = document.querySelector<HTMLElement>(".header")?.offsetHeight || 0;
        const position = Math.max(0, smoother.offset(target, "top top") - headerHeight - 12);
        gsap.killTweensOf(smoother, "scrollTop");
        // scrollTo clamps against native page height, which is shorter with speed > 1.
        if (animate) gsap.to(smoother, {scrollTop: position, duration: 0.7, ease: "power2.out", overwrite: "auto"});
        else smoother.scrollTop(position);
      }
    };
    const onHashChange = () => followHash(false);
    const onAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute("href");
      if (!hash || hash === "#") return;
      let target: HTMLElement | null;
      try { target = document.getElementById(decodeURIComponent(hash.slice(1))); }
      catch { return; }
      if (!target) return;
      event.preventDefault();
      if (window.location.hash !== hash) window.history.pushState(null, "", hash);
      followHash(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    const frame = window.requestAnimationFrame(() => followHash(false));
    document.addEventListener("click", onAnchorClick);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("click", onAnchorClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [isLoading]);
  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          VG
        </a>
        <a
          href="https://www.linkedin.com/in/viswanathan-g-55a0176a/"
          className="navbar-connect"
          data-cursor="disable"
          target="_blank"
          rel="noreferrer"
        >
          linkedin.com/in/viswanathan-g-55a0176a
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#products" href="#products">
              <HoverLinks text="PRODUCTS" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
