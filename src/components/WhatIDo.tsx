import {useEffect, useRef, useState, type KeyboardEvent} from "react";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {MdArrowOutward} from "react-icons/md";
import {smoother} from "./Navbar";
import "./styles/WhatIDo.css";

const capabilities = [
  {
    title: "Art Direction & Visual Design",
    focus: "An idea, with a point of view.",
    description: "I shape visual identities and campaign narratives that stay clear across formats. From the first concept to the final composition, the focus is on distinctive storytelling, considered typography and consistent creative direction.",
    skills: ["Creative direction", "Brand identity", "Campaigns", "Editorial design", "Typography", "Visual storytelling"],
    links: [{label: "Selected visual work", href: "#work"}, {label: "AI Design Studio", href: "/work/ai-design-studio"}],
    note: "Concept development · Visual systems · Art direction",
  },
  {
    title: "Product Design & UX",
    focus: "Useful at every interaction.",
    description: "I turn complex tasks into focused product experiences. I connect user flows, interface design and interaction details, building responsive systems and prototypes around the way people actually work.",
    skills: ["User experience", "Interface design", "Interaction design", "Design systems", "Prototyping", "Responsive UI"],
    links: [{label: "SplitMate", href: "/work/splitmate"}, {label: "Social Media Intelligence", href: "/work/social-media-intelligence"}],
    note: "Product thinking · User flows · Interface craft",
  },
  {
    title: "Creative Development",
    focus: "Design that moves into code.",
    description: "I bring interfaces to life through frontend development and creative coding. This portfolio uses React, TypeScript, GSAP and Three.js to connect responsive layouts, motion and an interactive 3D experience.",
    skills: ["React", "TypeScript", "CSS", "GSAP", "Three.js", "Creative coding"],
    links: [{label: "Content Tracker", href: "/work/content-tracker"}, {label: "Clip Studio prototype", href: "/work/clip-studio"}],
    note: "Interactive experiences · Frontend implementation · Motion",
  },
  {
    title: "AI & Intelligent Workflows",
    focus: "More room for creative judgment.",
    description: "I design practical ways to use AI in creative and content work: from image generation and refinement to editorial discovery, writing assistance and review. The goal is a useful workflow with people in control of the final decision.",
    skills: ["AI-assisted design", "Creative tooling", "Content workflows", "Workflow automation", "Human review"],
    links: [{label: "AI Design Studio", href: "/work/ai-design-studio"}, {label: "Content Studio", href: "/work/content-studio"}],
    note: "Creative technology · Intelligent tools · Practical workflows",
  },
];

const WhatIDo = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const interacted = useRef(false);
  const lastSelected = useRef(0);

  useEffect(() => {
    if (!interacted.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
      const button = buttons.current[lastSelected.current];
      if (!button || !smoother || window.innerWidth > 760) return;
      const headerHeight = document.querySelector<HTMLElement>(".header")?.offsetHeight || 0;
      const box = button.getBoundingClientRect();
      if (box.top < headerHeight + 12 || box.bottom > window.innerHeight - 24) {
        smoother.scrollTop(Math.max(0, smoother.offset(button, "top top") - headerHeight - 12));
      }
    }, reduced ? 0 : 440);
    return () => window.clearTimeout(timer);
  }, [expanded]);

  const handleKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === "ArrowDown") next = (index + 1) % capabilities.length;
    else if (event.key === "ArrowUp") next = (index + capabilities.length - 1) % capabilities.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = capabilities.length - 1;
    else return;
    event.preventDefault();
    const button = buttons.current[next];
    button?.focus({preventScroll: true});
    if (button && smoother) {
      const headerHeight = document.querySelector<HTMLElement>(".header")?.offsetHeight || 0;
      const box = button.getBoundingClientRect();
      if (box.top < headerHeight + 12 || box.bottom > window.innerHeight - 24) {
        smoother.scrollTop(Math.max(0, smoother.offset(button, "top top") - headerHeight - 12));
      }
    }
  };

  return <section className="whatIDO" id="capabilities" aria-labelledby="capabilities-heading">
    <div className="cap-topline"><span><i/> WHAT I DO</span><span>CREATIVE DIRECTION MEETS PRODUCT THINKING</span></div>
    <div className="cap-layout">
      <div className="cap-intro"><h2 id="capabilities-heading">A considered<br/> idea.<br/><em>A useful<br/> experience.</em></h2><p>From visual storytelling to the systems behind it. Four connected disciplines, one thoughtful approach.</p><span className="cap-index">01 — 04 / CAPABILITIES</span></div>
      <div className="cap-list">{capabilities.map((capability, index) => {
        const open = expanded === index;
        const number = String(index + 1).padStart(2, "0");
        return <article className={`cap-item${open ? " is-expanded" : ""}`} key={capability.title}>
          <h3><button ref={element => {buttons.current[index] = element;}} type="button" id={`cap-trigger-${number}`} aria-expanded={open} aria-controls={`cap-panel-${number}`} onKeyDown={event => handleKey(event, index)} onClick={() => {interacted.current = true; lastSelected.current = index; setExpanded(open ? null : index);}} data-cursor="disable"><span className="cap-number">{number}</span><span className="cap-name">{capability.title}</span><span className="cap-toggle" aria-hidden="true"><MdArrowOutward/></span></button></h3>
          <div className="cap-panel" id={`cap-panel-${number}`} role="region" aria-labelledby={`cap-trigger-${number}`} aria-hidden={!open} {...(open ? {} : {inert: ""})}>
            <div className="cap-panel-clip"><div className="cap-detail"><h4>{capability.focus}</h4><p>{capability.description}</p><ul className="cap-skills" aria-label="Focus areas">{capability.skills.map(skill => <li key={skill}>{skill}</li>)}</ul><div className="cap-evidence"><span>EXPLORE THE WORK</span><div>{capability.links.map(link => <a href={link.href} key={link.label}>{link.label}<MdArrowOutward aria-hidden="true"/></a>)}</div></div><span className="cap-note">{capability.note}</span></div></div>
          </div>
        </article>;
      })}</div>
    </div>
    <div className="cap-footer"><span>THINK CLEARLY. DESIGN INTENTIONALLY. BUILD WITH PURPOSE.</span><a href="#contact">Let’s make something useful <MdArrowOutward aria-hidden="true"/></a></div>
  </section>;
};
export default WhatIDo;
