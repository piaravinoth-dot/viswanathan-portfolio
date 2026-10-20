import {useEffect,useState} from 'react';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import projects from '../data/communicationProjects.json';
import './styles/CommunicationCases.css';

const digital=[['ai-design-studio','AI Design Studio'],['content-studio','Content Studio'],['social-media-intelligence','Social Media Intelligence'],['content-tracker','Content Tracker'],['splitmate','SplitMate'],['clip-studio','Clip Studio']];
export default function SelectedCases(){
  const [filter,setFilter]=useState('all');
  useEffect(()=>{const frame=requestAnimationFrame(()=>ScrollTrigger.refresh());return()=>cancelAnimationFrame(frame)},[filter]);
  return <section className="selected-cases" id="work" aria-labelledby="selected-cases-title">
    <div className="selected-cases-inner">
      <div className="selected-cases-intro"><div><span className="comm-kicker">SELECTED WORK / VISWANATHAN G</span><h2 id="selected-cases-title">Ideas in context.<br/><em>Design in use.</em></h2></div><p>Communication, publications and digital products. Explore the work, the thinking and the details that connect them.</p></div>
      <div className="case-filters" role="group" aria-label="Filter selected projects">{[['all','All work'],['communication','Communication design'],['digital','Digital products']].map(([value,label])=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}</button>)}</div>
      <div className="selected-case-grid" aria-live="polite">
        {filter!=='digital'&&projects.map((p,i)=><a className={'selected-case selected-'+p.slug} href={'/work/'+p.slug} key={p.slug}>
          <div className="selected-case-image"><img src={p.cover.src} srcSet={`${p.cover.src.replace('.webp','-800.webp')} 800w, ${p.cover.src} ${p.cover.width}w`} sizes="(max-width: 700px) 92vw, 45vw" width={p.cover.width} height={p.cover.height} alt={`${p.title} — ${p.discipline}`} loading="lazy" decoding="async"/></div>
          <div className="selected-case-caption"><div><span className="comm-kicker">0{i+1} / {p.discipline}</span><h3>{p.title}</h3></div><span aria-hidden="true">↗</span></div>
        </a>)}
        {filter!=='communication'&&digital.map(([slug,title],i)=><a className="selected-case selected-digital" href={'/work/'+slug} key={slug}><div className="selected-case-image"><img src={'/social/'+slug+'.png'} alt={`${title} — product case study`} width={1200} height={630} loading="lazy" decoding="async"/></div><div className="selected-case-caption"><div><span className="comm-kicker">0{i+1} / DIGITAL PRODUCT</span><h3>{title}</h3></div><span aria-hidden="true">↗</span></div></a>)}
      </div>
      <div className="selected-case-end"><span>ART DIRECTION · VISUAL SYSTEMS · DIGITAL PRODUCTS</span><a href="#visual-archive">Explore the visual archive <span aria-hidden="true">↓</span></a></div>
    </div>
  </section>;
}
