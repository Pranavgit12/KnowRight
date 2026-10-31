import {
  ArrowRight, BriefcaseBusiness, Building2, CircleHelp, FileSearch,
  Landmark, ShieldAlert, ShoppingBag, WalletCards, HeartHandshake,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CategoryCard from "@/components/CategoryCard";
import HeroIllustration from "@/components/HeroIllustration";

const categories = [
  [BriefcaseBusiness, "Employment and workplace", "Pay, conditions, and workplace concerns"],
  [Building2, "Housing and tenancy", "Rent, repairs, and housing questions"],
  [ShoppingBag, "Consumer rights", "Products, services, and complaints"],
  [Landmark, "Property disputes", "A place to begin exploring property issues"],
  [FileSearch, "Government services", "Public information and services"],
  [WalletCards, "Banking and financial complaints", "Payments and financial complaints"],
  [ShieldAlert, "Cybercrime and online fraud", "Digital safety and reporting questions"],
  [HeartHandshake, "Family and personal matters", "Sensitive questions, handled with care"],
  [CircleHelp, "Other or not sure", "Start wherever you are"],
];

export default function Home() {
  const navigate = useNavigate();
  function chooseTopic(title) {
    navigate("/assistant", { state: { category: title } });
  }
  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-mark" /> EVERYDAY LEGAL INFORMATION, MADE CLEARER</p>
          <h1>Know your rights.<br /><span>Find your solution.</span></h1>
          <p className="hero-description">Understand your legal rights, explore relevant laws, and discover practical steps to address everyday legal problems.</p>
          <div className="hero-actions"><Link className="button button-green" to="/assistant">Find My Legal Solution <ArrowRight size={17} /></Link><a className="text-link" href="#topics">Explore your rights <span>↓</span></a></div>
          <div className="hero-trust"><span className="trust-mark">i</span><span>Clear sources. Honest limits. Your choices stay yours.</span></div>
        </div>
        <HeroIllustration />
        <div className="hero-bottom-note"><span>01</span><span>Start with your question</span><span className="note-line" /></div>
      </section>

      <section className="categories-section" id="topics">
        <div className="section-heading">
          <div><p className="eyebrow">A PLACE TO BEGIN</p><h2>What’s on your mind?</h2><p>Pick a starting point. You can describe your situation in your own words.</p></div>
          <Link to="/assistant" className="text-link">View all topics <ArrowRight size={15} /></Link>
        </div>
        <div className="categories-grid">{categories.map(([icon, title, description]) => <CategoryCard key={title} icon={icon} title={title} description={description} onSelect={() => chooseTopic(title)} />)}</div>
      </section>

      <section className="how-section" id="how">
        <div className="how-intro"><p className="eyebrow">A THOUGHTFUL FIRST STEP</p><h2>Clarity begins<br />with good sources.</h2><p>KnowRight helps you look through available legal references and understand where the information comes from—without pretending to replace expert advice.</p><Link to="/help" className="text-link">How this works <ArrowRight size={15} /></Link></div>
        <div className="how-steps"><article><span>01</span><div><h3>Tell us what happened</h3><p>Plain language is welcome. Share only details you’re comfortable submitting.</p></div></article><article><span>02</span><div><h3>Look at available sources</h3><p>Explore passages from a limited collection of India-wide central-law records.</p></div></article><article><span>03</span><div><h3>Choose your next step</h3><p>Check original texts and find qualified help when your situation needs it.</p></div></article></div>
      </section>

      <section className="resources-band">
        <div className="resources-icon"><FileSearch size={24} /></div>
        <div><p className="eyebrow">SOURCE TRANSPARENCY</p><h2>See what the answer is based on.</h2><p>Source records include titles, authorities, excerpts, and links when provided. Their inclusion does not guarantee they are current or complete.</p></div>
        <Link className="button button-ivory" to="/sources">Explore legal resources <ArrowRight size={16} /></Link>
      </section>
      <section className="help-band"><div><p className="eyebrow">WHEN YOU NEED MORE</p><h2>Some questions need a person.</h2><p>This prototype does not include verified local legal-aid or emergency contacts. Find qualified assistance through official channels you can independently confirm.</p></div><Link to="/help" className="text-link">About coverage &amp; limits <ArrowRight size={15} /></Link></section>
    </main>
  );
}
