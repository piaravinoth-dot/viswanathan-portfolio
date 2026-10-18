import "./styles/Career.css";
const entries=[
{role:"Creative / Design Leadership",org:"Nation with NaMo",when:"2019–NOW",desc:"Lead creative direction and production across digital campaigns, presentations, print and on-ground communication. Develop reusable brand assets, guide design reviews and build tools for creative and content workflows."},
{role:"Senior Graphic Designer",org:"I-PAC",when:"2018–2019",desc:"Created campaign communication across digital, editorial, presentation, print and field formats. Worked with content and campaign teams to translate complex briefs into clear visual narratives."},
{role:"Graphic Designer",org:"Ad2pro Media Solutions",when:"2016–2018",desc:"Produced digital and print advertising for clients in Australia and New Zealand, with a focus on layout accuracy, brand requirements, revisions and delivery specifications."},
{role:"Design Intern",org:"Peacock India",when:"2015–2016",desc:"Supported commercial design through concept exploration, layout development, image editing and preparation of production-ready assets."}
];
const Career=()=> <div className="career-section section-container"><div className="career-container"><h2>My career <span>&amp;</span><br/>experience</h2><div className="career-info"><div className="career-timeline"><div className="career-dot"/></div>{entries.map((e,i)=><div className="career-info-box" key={i}><div className="career-info-in"><div className="career-role"><h4>{e.role}</h4><h5>{e.org}</h5></div><h3>{e.when}</h3></div><p>{e.desc}</p></div>)}</div></div></div>;
export default Career;