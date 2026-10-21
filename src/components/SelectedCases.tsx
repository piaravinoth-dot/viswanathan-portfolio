import projects from '../data/communicationProjects.json';
import './styles/CommunicationCases.css';

export default function SelectedCases(){
  return <section className="selected-cases political-case-studies" id="political-case-studies" aria-labelledby="selected-cases-title">
    <div className="selected-cases-inner">
      <div className="selected-cases-intro"><div><span className="comm-kicker">01 / FEATURED POLITICAL PROJECTS</span><h3 id="selected-cases-title">Ideas in context.<br/><em>Design in use.</em></h3></div><p>From campaign identities to publications and public spaces. Four projects showing the thinking, the visual system and its applications.</p></div>
      <div className="selected-case-grid">
        {projects.map((p,i)=><a className={'selected-case selected-'+p.slug} href={'/work/'+p.slug} key={p.slug}>
          <div className="selected-case-image"><img src={p.cover.src} srcSet={`${p.cover.src.replace('.webp','-800.webp')} 800w, ${p.cover.src} ${p.cover.width}w`} sizes="(max-width: 700px) 90vw, 45vw" width={p.cover.width} height={p.cover.height} alt={`${p.title} — ${p.discipline}`} loading="lazy" decoding="async"/></div>
          <div className="selected-case-caption"><div><span className="comm-kicker">0{i+1} / {p.discipline}</span><h4>{p.title}</h4></div><span aria-hidden="true">↗</span></div>
          <p className="political-case-description">{p.description}</p><span className="political-case-action">Explore case study <span aria-hidden="true">↗</span></span>
        </a>)}
      </div>
    </div>
  </section>;
}
