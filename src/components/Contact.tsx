import {useState,type FormEvent} from "react";
import {MdArrowOutward,MdCopyright} from "react-icons/md";
import "./styles/Contact.css";

const contactEmail="piaravinoth@gmail.com";

const Contact=()=>{
  const [notice,setNotice]=useState("");
  const [copyState,setCopyState]=useState("");
  const copyEmail=async()=>{try{await navigator.clipboard.writeText(contactEmail);setCopyState("Email address copied.")}catch{setCopyState("Please select and copy piaravinoth@gmail.com.")}};
  const [error,setError]=useState("");

  const handleSubmit=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    const name=String(data.get("name")||"").trim();
    const email=String(data.get("email")||"").trim();
    const message=String(data.get("message")||"").trim();
    if(name.length<2||message.length<10){
      setNotice("");
      setError("Please add your name and a message of at least 10 characters.");
      return;
    }
    setError("");
    const subject=encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body=encodeURIComponent(`Hello Viswanathan,\n\n${message}\n\nFrom: ${name}\nReply to: ${email}`);
    // No mail service is configured. Open a filled draft in the visitor's
    // email application rather than falsely claiming a message was sent.
    setNotice("Your email draft is ready. Please press Send in your email app to complete.");
    window.location.href=`mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return <section className="contact-section section-container" id="contact" aria-labelledby="contact-title">
    <div className="contact-container">
      <div className="contact-heading">
        <span className="contact-eyebrow">05 / GET IN TOUCH</span>
        <h2 className="contact-title" id="contact-title">Have something <em>in mind?</em></h2>
        <p>Open to thoughtful opportunities, product design roles and creative collaborations. Tell me what you're working on.</p>
      </div>
      <a className="contact-direct-action" href={`mailto:${contactEmail}`}>Email me directly <MdArrowOutward aria-hidden="true"/><span>{contactEmail}</span></a>
      <div className="contact-layout">
        <div className="contact-form-column">
          <h3 className="contact-form-title">Or prepare an email draft.</h3>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-fields-inline">
              <div className="contact-field">
                <label htmlFor="portfolio-contact-name">YOUR NAME</label>
                <input id="portfolio-contact-name" name="name" type="text" autoComplete="name" placeholder="How should I address you?" minLength={2} maxLength={80} required onChange={()=>{setNotice("");setError("")}}/>
              </div>
              <div className="contact-field">
                <label htmlFor="portfolio-contact-email">EMAIL ADDRESS</label>
                <input id="portfolio-contact-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" maxLength={120} required onChange={()=>{setNotice("");setError("")}}/>
              </div>
            </div>
            <div className="contact-field">
              <label htmlFor="portfolio-contact-message">YOUR MESSAGE</label>
              <textarea id="portfolio-contact-message" name="message" rows={4} minLength={10} maxLength={1200} placeholder="A little about your opportunity or project…" required onChange={()=>{setNotice("");setError("")}}/>
            </div>
            {error&&<p className="contact-feedback contact-error" role="alert">{error}</p>}
            {notice&&<p className="contact-feedback" role="status">{notice}</p>}
            <div className="contact-submit-row">
              <button className="contact-submit" type="submit">Prepare email <MdArrowOutward aria-hidden="true"/></button>
              <p>Opens your email app. Review and press Send there.</p>
            </div>
          </form>
        </div>
        <section className="contact-details" aria-label="Other ways to connect">
          <span className="contact-details-kicker">DIRECT CONTACT</span>
          <h3>A role or project to discuss?</h3>
          <a className="contact-email-link" href={`mailto:${contactEmail}`}>{contactEmail} <MdArrowOutward aria-hidden="true"/></a>
          <button className="contact-copy-email" type="button" onClick={copyEmail}>Copy email address</button><p className="contact-copy-status" role="status">{copyState}</p>
          <p>Based in India. Available for remote and international opportunities.</p>
          <div className="contact-resource-links">
            <a href="/resume/Viswanathan_G_Resume.pdf" download>Download résumé <span>PDF ↓</span></a>
            <a href="https://github.com/piaravinoth-dot" target="_blank" rel="noopener noreferrer">GitHub <MdArrowOutward aria-hidden="true"/></a>
          </div>
        </section>
      </div>
      <footer className="contact-footer">
        <p>Art direction &amp; design by <span>Viswanathan G.</span></p>
        <p className="contact-copyright"><MdCopyright aria-hidden="true"/> 2026 Viswanathan G</p>
      </footer>
    </div>
  </section>;
};

export default Contact;
