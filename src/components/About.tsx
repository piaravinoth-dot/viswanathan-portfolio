import "./styles/About.css";

const About = () => <div className="about-section" id="about">
  <div className="about-me">
    <h2 className="title">About Me</h2>
    <div className="about-position">Senior Product &amp; Visual Designer <span>/</span> Creative Lead <span>/</span> Vibe Coder</div>
    <div className="about-copy">
      <p className="para about-lead">I translate complex ideas into clear visual systems and useful digital products.</p>
      <p className="para">With 10+ years across visual communication, campaigns, publications and creative production, I bring experience in shaping concepts, directing design and delivering work across digital, print and on-ground formats.</p>
      <p className="para">Today, I extend that foundation into product design and hands-on application building, creating tools for content operations, analytics and creative workflows.</p>
      <p className="para">As a <strong>Vibe Coder</strong>, I use AI-assisted development to build working prototypes and applications, explore interactions and refine the experience through iteration. I connect visual design decisions with how a product actually behaves.</p>
      <p className="para">I bring creative direction, attention to detail and the ability to move a project from an open brief to a tangible experience.</p>
    </div>
    <div className="about-actions"><a href="/resume/Viswanathan_G_Resume.pdf" download>Download resume <span>PDF ↓</span></a><a href="#contact">Discuss a role or project ↗</a></div>
  </div>
</div>;
export default About;
