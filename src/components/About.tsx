import "./styles/About.css";

const About = () => <div className="about-section" id="about">
  <div className="about-me">
    <h2 className="title">About Me</h2>
    <div className="about-position">Senior Product &amp; Visual Designer <span>/</span> Creative Lead <span>/</span> Vibe Coder</div>
    <div className="about-copy">
      <p className="para about-lead">I translate complex ideas into clear visual systems and useful digital products.</p>
      <p className="para">With 10+ years across visual communication, campaigns and publications, I bring creative direction, visual craft and hands-on execution—from shaping the first concept to delivering work across digital, print and on-ground formats.</p>
      <p className="para">As a <strong>Vibe Coder</strong>, I combine product design with AI-assisted development to build working prototypes and applications for content, analytics and creative teams. I focus on clear workflows, thoughtful interactions and how a product behaves, refining the experience through testing and iteration.</p>
    </div>
    <div className="about-actions"><a href="/resume/Viswanathan_G_Resume.pdf" download>Download resume <span>PDF ↓</span></a><a href="#contact">Discuss a role or project ↗</a></div>
  </div>
</div>;
export default About;
