import Landing from "./Landing";
import "./styles/Navbar.css";

// Keep the same readable hero while the full interactive homepage downloads.
// Native anchors preserve a visitor's destination until Navbar takes over.
export default function OpeningShell() {
  return <div className="container-main">
    <nav className="header" aria-label="Portfolio navigation">
      <a href="/#" className="navbar-title" aria-label="VG — Viswanathan G home">VG</a>
      <ul>{["about", "work", "products", "contact"].map(section =>
        <li key={section}><a href={`#${section}`}>{section.toUpperCase()}</a></li>
      )}</ul>
    </nav>
    <Landing />
  </div>;
}
