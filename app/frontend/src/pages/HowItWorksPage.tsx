import { ArrowRight, BookOpenCheck, MapPin, SearchCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { PageIntro } from "@/components/PageIntro";

const steps = [
  {
    number: "01",
    Icon: MapPin,
    title: "Choose the jurisdiction",
    description:
      "Legal information depends on where you are. The current demo only searches selected India-wide central-law records.",
  },
  {
    number: "02",
    Icon: SearchCheck,
    title: "Ask in your own words",
    description:
      "The local service looks for matching words in a small set of source summaries. It does not generate an answer or understand every situation.",
  },
  {
    number: "03",
    Icon: BookOpenCheck,
    title: "Follow the reference",
    description:
      "Open the linked original record, check its full context and status, and seek qualified help for advice about your particular situation.",
  },
];

export function HowItWorksPage() {
  return (
    <div className="page-wrap page-content">
      <PageIntro
        eyebrow="HOW KNOWRIGHT WORKS"
        title={<>A useful first step,<br />not the final word.</>}
        description="Know U Right is a public legal-information tool. It helps you explore references in plain language; it is not a law firm, lawyer, or legal-advice service."
      />
      <div className="process-list">
        {steps.map(({ number, Icon, title, description }) => (
          <article className="process-step" key={number} data-reveal>
            <span className="process-number">{number}</span>
            <span className="process-icon"><Icon size={22} strokeWidth={1.6} aria-hidden="true" /></span>
            <div><h2>{title}</h2><p>{description}</p></div>
          </article>
        ))}
      </div>
      <div className="notice notice-warm">
        <strong>What a search result means:</strong> a word match in the demo
        collection. It does not show that a source is current, complete, binding,
        or applicable to your circumstances.
      </div>
      <Link className="button button-primary" to="/ask">Try a source search <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  );
}
