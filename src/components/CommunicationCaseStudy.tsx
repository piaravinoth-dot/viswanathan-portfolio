import {useCaseMotion} from "./useCaseMotion";
import {useEffect} from 'react';
import projects from '../data/communicationProjects.json';
import './styles/CommunicationCases.css';

export default function CommunicationCaseStudy({projectSlug}: {projectSlug?:string}){
  const motionRef=useCaseMotion<HTMLDivElement>();
  const slug=projectSlug ?? (typeof window==='undefined' ? '' : window.location.pathname.replace(/\/$/,'').split('/').pop());
  const project=projects.find(p=>p.slug===slug)!;
  const next=projects[(projects.indexOf(project)+1)%projects.length];
  useEffect(()=>{const prior=document.body.style.overflowY;document.body.style.overflowY='auto';return()=>{document.body.style.overflowY=prior}},[]);
  return <div ref={motionRef} className={'communication-case comm-'+project.slug}>
    <a className="comm-skip" href="#case-content">Skip to case study</a>
    <header className="comm-nav"><a href="/" aria-label="VG — Viswanathan G home">VG<span aria-hidden="true">®</span></a><nav aria-label="Case study navigation"><a href="/#political-case-studies">Political Space <span aria-hidden="true">↗</span></a><a href="/#contact">Let’s talk <span aria-hidden="true">↗</span></a></nav></header>
    <main id="case-content">
      <section className="comm-hero"><span className="comm-kicker">SELECTED COMMUNICATION DESIGN / {project.discipline}</span><h1>{project.title}<span>.</span></h1><p>{project.headline}</p><figure><img src={project.hero.src} srcSet={`${project.hero.src.replace('.webp','-800.webp')} 800w, ${project.hero.src} ${project.hero.width}w`} sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1333px) 90vw, 1200px" width={project.hero.width} height={project.hero.height} alt={project.slug==='nation-building'?'Nation Building identity applied to an orange mug':project.title+' — project opening'} fetchPriority="high" decoding="async"/></figure></section>
      <section className="comm-brief" aria-labelledby="comm-brief-title"><div><span className="comm-kicker">THE PROJECT</span><h2 id="comm-brief-title">{project.headline}</h2></div><div><p>{project.description}</p><dl><div><dt>Design</dt><dd>Viswanathan G</dd></div><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Scope</dt><dd>{project.scope}</dd></div></dl></div></section>
      {project.caseBrief&&<section className="comm-evidence" aria-labelledby="comm-evidence-title"><span className="comm-kicker">BRIEF / CONTRIBUTION / DELIVERABLE</span><h2 id="comm-evidence-title">The work behind the pages.</h2><dl>{[["The challenge",project.caseBrief.challenge],["My contribution",project.caseBrief.contribution],["Design constraints",project.caseBrief.constraints],["What was delivered",project.caseBrief.deliverable]].map(([label,text])=><div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl><p>{project.caseBrief.evidence}</p></section>}
      <section className="comm-decisions" aria-labelledby="comm-decisions-title"><span className="comm-kicker">THE APPROACH</span><h2 id="comm-decisions-title">Design decisions.</h2><div>{project.decisions.map((decision,i)=><article key={decision.title}><span className="comm-kicker">0{i+1}</span><h3>{decision.title}</h3><p>{decision.text}</p></article>)}</div></section>
      <section className="comm-story" aria-label="Selected artwork and applications">{project.story.map((image,i)=><figure className={'comm-figure comm-figure-'+i} key={image.src}><img src={image.src} srcSet={`${image.src.replace('.webp','-800.webp')} 800w, ${image.src} ${image.width}w`} sizes="(max-width: 700px) 100vw, (max-width: 1300px) 92vw, 1200px" width={image.width} height={image.height} alt={image.caption} loading="lazy" decoding="async"/><figcaption><span>0{i+1}</span><div>{image.caption}<a className="comm-artwork-link" href={image.src} target="_blank" rel="noopener noreferrer">Open full-resolution artwork <span aria-hidden="true">↗</span><span className="comm-sr"> (opens in a new tab)</span></a></div></figcaption></figure>)}</section>
      <section className="comm-links"><span className="comm-kicker">MORE OF THE PROJECT</span><h2>The complete collection.</h2><p>Explore the full project and original artwork on Behance.</p><a href={project.behance} target="_blank" rel="noopener noreferrer">View on Behance <span aria-hidden="true">↗</span><span className="comm-sr"> (opens in a new tab)</span></a></section>
      <a className="comm-next" href={'/work/'+next.slug}><span className="comm-kicker">NEXT CASE STUDY</span><strong>{next.title}</strong><span aria-hidden="true">↗</span></a>
    </main><footer className="comm-footer"><a href="/#political-case-studies">Back to Political Space</a><span>© 2026 Viswanathan G</span></footer>
  </div>;
}
