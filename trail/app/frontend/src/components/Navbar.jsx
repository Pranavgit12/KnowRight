import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, BookOpenText, Menu, X } from "lucide-react";

const navItems = [
  ["/", "Home"],
  ["/assistant", "AI Legal Assistant"],
  ["/#topics", "Know Your Rights"],
  ["/sources", "Legal Resources"],
  ["/help", "About"],
];

export default function Navbar({ jurisdiction, setJurisdiction, language, setLanguage }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav-shell">
      <Link to="/" className="wordmark" aria-label="KnowRight home" onClick={() => setOpen(false)}>
        <span className="wordmark-icon"><BookOpenText size={22} strokeWidth={1.7} /></span>
        <span>KnowRight<span className="wordmark-dot">.</span></span>
      </Link>
      <button className="mobile-menu" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      <nav className={`main-nav ${open ? "nav-open" : ""}`} aria-label="Main navigation">
        {navItems.map(([href, label]) => {
          const item = href.includes("#") ? <a href={href} onClick={() => setOpen(false)}>{label}</a> : <NavLink to={href} onClick={() => setOpen(false)}>{label}</NavLink>;
          return <span className="nav-item" key={href}>{item}</span>;
        })}
        <div className="nav-selectors">
          <label className="sr-only" htmlFor="nav-jurisdiction">Source jurisdiction</label>
          <select id="nav-jurisdiction" value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value)}><option value="India (Central)">India · central</option><option value="not-covered">Other / not covered</option></select>
          <label className="sr-only" htmlFor="nav-language">Question language</label>
          <select id="nav-language" value={language} onChange={(event) => setLanguage(event.target.value)}><option value="auto">Auto</option><option value="en">EN</option><option value="hi">HI</option></select>
        </div>
        <Link className="nav-cta" to="/assistant" onClick={() => setOpen(false)}>Get started <ArrowUpRight size={15} /></Link>
      </nav>
    </header>
  );
}
