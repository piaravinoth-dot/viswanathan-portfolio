import {useState} from 'react';
import projects from '../data/communicationProjects.json';
import './styles/CommunicationCases.css';

/** A project-first editorial index. All previews are original case-study covers. */
export default function SelectedCases(){
  const [active,setActive]=useState(0);
  const featured=projects[active] ?? projects[0];
  return <section className="selected-cases political-case-studies ps-featured" id="political-case-studies" aria-labelledby="selected-cases-title">
    <div className="selected-cases-inner">
      <div className="ps-featured-heading">
        <div className="ps-featured-heading-main">
          <span className="comm-kicker">FEATURED CAMPAIGN WORK</span>
          <h3 id="selected-cases-title">Work that<br/><em>speaks in context.</em></h3>
        </div>
        <div className="ps-featured-heading-side">
          
          <p>Explore the thinking, visual direction and original work behind each project.</p>
          <span className="ps-interaction-hint">HOVER TO PREVIEW <span aria-hidden="true">↗</span> CLICK TO EXPLORE</span>
        </div>
      </div>
      <div className="ps-editorial-layout">
        <div className="ps-index-list" aria-label="Political project index">
          {projects.map(p=><a className={`selected-case ps-index-row${active===i?' is-active':''}`} href={'/work/'+p.slug} key={p.slug}
            onMouseEnter={()=>setActive(i)}
            onFocus={()=>setActive(i)}
            aria-label={`Explore case study: ${p.title}`}>
            
            <span className="ps-index-copy"><strong>{p.title}</strong><small>{p.discipline}</small><span className="ps-index-mobile-cover"><img src={p.cover.src.replace('.webp','-800.webp')} width={p.cover.width} height={p.cover.height} loading="lazy" decoding="async" alt=""/></span></span>
            <span className="ps-index-arrow" aria-hidden="true">↗</span>
          </a>)}
          <div className="ps-index-foot"><span>VISWANATHAN G / VISUAL COMMUNICATION</span><span>PROJECT STORIES</span></div>
        </div>
        <div className="ps-featured-preview" aria-label="Selected project preview">
          <div className="ps-featured-top"><span>IN FOCUS</span><span aria-hidden="true">EXPLORE THE DESIGN</span></div>
          <a href={'/work/'+featured.slug} className="ps-featured-stage" aria-label={'Explore '+featured.title+' case study'}>
            <img key={featured.slug} src={featured.cover.src.replace('.webp','-800.webp')} srcSet={`${featured.cover.src.replace('.webp','-800.webp')} 800w, ${featured.cover.src} ${featured.cover.width}w`} sizes="(min-width:900px) 46vw, 90vw" width={featured.cover.width} height={featured.cover.height} loading={active===0?"eager":"lazy"} decoding="async" alt={featured.title+' — original case-study artwork'} />
            <span className="ps-preview-corner" aria-hidden="true">VIEW CASE STUDY ↗</span>
          </a>
          <div className="ps-preview-bottom">
            <div><span>THE DESIGN CONTEXT</span><h4>{featured.headline}</h4><p>{featured.description}</p></div>
            
          </div>
        </div>
      </div>
    </div>
  </section>;
}
