import { LockKeyhole, MapPinned, Scale } from "lucide-react";
import { PageIntro } from "@/components/PageIntro";

const principles = [
  {
    Icon: Scale,
    title: "Information, not advice",
    text: "Know U Right shares source passages to explore. It is not a law firm, legal representative, or substitute for qualified advice.",
  },
  {
    Icon: MapPinned,
    title: "Place changes the answer",
    text: "The current demo searches only selected India-wide central-law material. It has no state-specific or other-country coverage.",
  },
  {
    Icon: LockKeyhole,
    title: "Questions stay local",
    text: "The demo sends a question only to its local Python service for keyword retrieval. It does not call an AI model or send the question to an external service.",
  },
];

export function AboutPage() {
  return (
    <div className="page-wrap page-content">
      <PageIntro
        eyebrow="ABOUT KNOWRIGHT"
        title={<>Legal information<br />should feel approachable.</>}
        description="Know U Right is a public-information demo built to make it easier to begin exploring everyday legal questions and find the sources behind a search."
      />
      <div className="principle-list">
        {principles.map(({ Icon, title, text }, index) => (
          <article className="principle-card" key={title} data-reveal style={{ "--reveal-delay": `${index * 70}ms` } as React.CSSProperties}>
            <span className="principle-icon"><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span>
            <div><h2>{title}</h2><p>{text}</p></div>
          </article>
        ))}
      </div>
      <section className="limitations-panel">
        <p className="eyebrow">LIMITATIONS TO KEEP IN MIND</p>
        <h2>A small library has real limits.</h2>
        <p>The collection contains selected summaries from three central Acts. Search uses keyword matching; it is not semantic research, and a match may not answer your question. Sources are not guaranteed to be current or complete. Check the original material and seek qualified help about a specific situation.</p>
      </section>
    </div>
  );
}
