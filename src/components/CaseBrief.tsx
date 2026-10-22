import briefs from "../data/productBriefs.json";
import "./styles/CaseBrief.css";
export type ProductSlug = keyof typeof briefs;
export function CaseBrief({slug}:{slug:ProductSlug}) {
  const brief=briefs[slug];
  return <section className="case-brief" aria-labelledby="case-brief-title">
    <div className="case-brief-heading"><div><span>THE PROJECT AT A GLANCE</span><h2 id="case-brief-title">The thinking behind the work.</h2></div><p>{brief.status}</p></div>
    <dl>{[["The challenge",brief.challenge],["My contribution",brief.role],["A key design decision",brief.decision],["What I built",brief.delivery]].map(([label,value],i)=><div key={label}><dt><span aria-hidden="true">0{i+1}</span>{label}</dt><dd>{value}</dd></div>)}</dl>
    <p className="case-brief-evidence">{brief.evidence}</p>
    {slug==="content-studio"&&<a className="case-brief-source-jump" href="#cs-evidence-title">Inspect the actual News and Videos product captures <span aria-hidden="true">↗</span></a>}
  </section>;
}
export function CaseContact() {
  return <section className="case-contact" aria-labelledby="case-contact-title"><div><span>LET’S WORK TOGETHER</span><h2 id="case-contact-title">A role to discuss.<br/>An idea to build.</h2><p>Open to product design, visual design and creative leadership opportunities.</p></div><div className="case-contact-actions"><a href="/#contact">Discuss a role or project <span aria-hidden="true">↗</span></a><a href="/resume/Viswanathan_G_Resume.pdf" download>Download résumé <span aria-hidden="true">↓</span></a></div></section>;
}
