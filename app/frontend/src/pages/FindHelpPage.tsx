import { ArrowUpRight, CircleHelp, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { PageIntro } from "@/components/PageIntro";

export function FindHelpPage() {
  return (
    <div className="page-wrap page-content">
      <PageIntro
        eyebrow="FINDING THE RIGHT SUPPORT"
        title={<>Some questions need<br />a person, not a search.</>}
        description="A source lookup can be a starting point. For guidance about a specific situation, seek a qualified professional or an official support service in your jurisdiction."
      />
      <div className="help-grid">
        <article className="help-card">
          <span className="topic-icon topic-icon-0"><CircleHelp size={22} aria-hidden="true" /></span>
          <h2>Looking for legal aid?</h2>
          <p>This project does not yet include a verified directory of legal-aid providers or local contacts. We will not guess at phone numbers or links.</p>
          <p>Check with an official government or court source for your location, and confirm contact details there.</p>
        </article>
        <article className="help-card help-card-caution">
          <span className="topic-icon topic-icon-3"><ShieldAlert size={22} aria-hidden="true" /></span>
          <h2>Need advice for your situation?</h2>
          <p>This demo cannot review documents, weigh evidence, or tell you what legal step to take. Consider speaking with a qualified lawyer or appropriate official service.</p>
          <p>Avoid sharing personal or sensitive details in this demo.</p>
        </article>
      </div>
      <div className="help-next">
        <p className="eyebrow">CHECK THE MATERIAL WE DO HAVE</p>
        <p>Browse the source list and open original records to check their context and issuing authority.</p>
        <Link className="button button-secondary" to="/sources">Browse source records <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
