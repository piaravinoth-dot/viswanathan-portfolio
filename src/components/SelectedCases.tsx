import {useState} from 'react';
import projects from '../data/communicationProjects.json';
import './styles/CommunicationCases.css';

/**
 * Featured Political Space projects share one continuous page section.
 * Choosing a project updates the original-artwork preview in place; the
 * separate case-study link opens its existing dedicated route.
 */
export default function SelectedCases(){
  const [active,setActive]=useState(0);
  const featured=projects[active] ?? projects[0];
  const originalCover=(src:string,size?:'800')=>size?src.replace('.webp','-800.webp'):src;
  return <section className="selected-cases political-case-studies ps-featured ps-featured-oneview" id="political-case-studies" aria-labelledby="selected-cases-title">
    <div className="selected-cases-inner">
      <div className="ps-work-overline" aria-hidden="true"><span>SELECTED WORK</span><span className="ps-work-rule"/><span>IDEAS. IDENTITIES. IMPACT.</span></div>
      <div className="ps-editorial-layout ps-work-layout">
        <div className="ps-work-aside">
          <div className="ps-work-heading">
            <h3 id="selected-cases-title">Featured Projects</h3>
            <p>Campaigns, publications and visual systems, each shaped around a distinct communication challenge.</p>
          </div>
          <div className="ps-index-list" aria-label="Featured political project selector">
            {projects.map((p,i)=><button type="button" className={`selected-case ps-index-row${active===i?' is-active':''}`}
              key={p.slug} onClick={()=>setActive(i)} onMouseEnter={()=>setActive(i)}
              onFocus={()=>setActive(i)} aria-pressed={active===i}
              aria-label={`Preview ${p.title}`}>
              <span className="ps-index-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span>
              <span className="ps-index-copy"><strong>{p.title}</strong><small>{p.discipline}</small></span>
              <span className="ps-index-arrow" aria-hidden="true">→</span>
            </button>)}
          </div>
        </div>
        <div className="ps-featured-preview ps-work-preview" aria-label="Selected project artwork and case study">
          <a href={'/work/'+featured.slug} className="ps-featured-stage ps-work-artwork" aria-label={'Open '+featured.title+' case study'}>
            <img key={featured.slug}
              src={originalCover(featured.cover.src,'800')}
              srcSet={`${originalCover(featured.cover.src,'800')} 800w, ${featured.cover.src} ${featured.cover.width}w`}
              sizes="(min-width:900px) 50vw, 92vw"
              width={featured.cover.width} height={featured.cover.height}
              loading={active===0?'eager':'lazy'} decoding="async"
              alt={featured.title+' — original project artwork'} />
            <span className="ps-work-expand" aria-hidden="true">↗</span>
          </a>
          <div className="ps-preview-bottom ps-work-context">
            <div className="ps-work-context-copy">
              <span>THE DESIGN CONTEXT</span>
              <h4>{featured.headline}</h4>
              <p>{featured.description}</p>
            </div>
            <a href={'/work/'+featured.slug} className="ps-work-case-link" aria-label={'View '+featured.title+' case study'}>VIEW CASE STUDY <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
