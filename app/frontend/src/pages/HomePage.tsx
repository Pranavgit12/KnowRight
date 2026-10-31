import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useJurisdiction } from "@/components/JurisdictionProvider";
import { JusticeScene } from "@/components/JusticeScene";
import { topics } from "@/data/topics";
import type { Jurisdiction } from "@/types/legal";

export function HomePage() {
  const { jurisdiction, setJurisdiction } = useJurisdiction();

  return (
    <>
      <section className="hero page-wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A calmer way to find a starting point</p>
          <h1 id="hero-title">Understand your rights.<br /><span>Know your next step.</span></h1>
          <p className="hero-intro">
            Everyday legal information, in plain language. Explore a question,
            see the source behind it, and decide where to go next.
          </p>
          <div className="hero-location">
            <label htmlFor="home-jurisdiction"><MapPin size={15} aria-hidden="true" /> START WITH YOUR LOCATION</label>
            <select
              id="home-jurisdiction"
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value as Jurisdiction)}
            >
              <option value="">Choose your location</option>
              <option value="India (Central)">India — central law</option>
              <option value="not-covered">Another location / not sure</option>
            </select>
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" to="/ask">Ask a question <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <Link className="text-link" to="/topics">Browse topics <ArrowDown size={15} aria-hidden="true" /></Link>
          </div>
          <p className="hero-note"><ShieldCheck size={16} aria-hidden="true" /> General information only — not legal advice.</p>
        </div>
        <JusticeScene className="hero-art" />
      </section>

      <section className="coverage-strip" aria-label="Demo coverage">
        <div className="coverage-inner page-wrap">
          <span className="coverage-icon" aria-hidden="true">i</span>
          <p><strong>A small, careful starting library.</strong> Selected India-wide central-law sources only. No state-specific or other-country coverage.</p>
          <Link to="/sources">See source notes <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="home-section page-wrap" aria-labelledby="topics-preview-title">
        <div className="section-heading-row" data-reveal>
          <div>
            <p className="eyebrow">EVERYDAY STARTING POINTS</p>
            <h2 id="topics-preview-title">A question can start anywhere.</h2>
          </div>
          <Link className="text-link" to="/topics">Explore all topics <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className="topic-grid">
          {topics.slice(0, 4).map(({ slug, title, shortDescription, Icon }, index) => (
            <Link className="topic-card" to={`/topics/${slug}`} key={slug} data-reveal style={{ "--reveal-delay": `${index * 70}ms` } as React.CSSProperties}>
              <span className={`topic-icon topic-icon-${index}`}><Icon size={22} strokeWidth={1.6} aria-hidden="true" /></span>
              <span className="topic-title">{title}</span>
              <span className="topic-description">{shortDescription}</span>
              <ArrowUpRight className="topic-arrow" size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className="topic-footnote">These are starting points, not a promise of coverage.</p>
      </section>

      <section className="home-how-section" data-reveal>
        <div className="home-how-inner page-wrap">
          <div>
            <p className="eyebrow">SIMPLE BY DESIGN</p>
            <h2>A useful first step,<br />not the final word.</h2>
            <p>Legal questions can be complicated. This tool helps you find your bearings; it does not decide what you should do.</p>
            <Link className="text-link" to="/how-it-works">How it works <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="home-how-points">
            <p><span>01</span><strong>Choose where you are</strong><small>Rules vary by location.</small></p>
            <p><span>02</span><strong>Ask in your own words</strong><small>Search the local source collection.</small></p>
            <p><span>03</span><strong>Check the original</strong><small>Follow references back to their source.</small></p>
            <BookOpenCheck className="home-how-mark" size={38} strokeWidth={1.2} aria-hidden="true" />
          </div>
        </div>
      </section>
    </>
  );
}
