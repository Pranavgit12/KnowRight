import { ArrowLeft, MapPin, Scale } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LegalProblemForm from "@/components/LegalProblemForm";
import { submitProblem } from "@/services/api";

export default function Assistant({ onResult, jurisdiction, setJurisdiction, language, setLanguage }) {
  const navigate = useNavigate();
  const location = useLocation();
  async function handleSubmit(values) {
    const response = await submitProblem(values);
    onResult(response, values);
    navigate("/results");
  }
  return (
    <main className="assistant-page">
      <div className="assistant-breadcrumb"><Link to="/"><ArrowLeft size={14} /> Home</Link><span>/</span><span>Legal assistant</span></div>
      <div className="assistant-heading"><div><p className="eyebrow">A CLEARER STARTING POINT</p><h1>Let’s understand what’s going on.</h1><p>Tell us about the situation, and we’ll look for relevant passages in the available source collection.</p></div><div className="assistant-heading-badge"><Scale size={23} /><span><b>India</b><small>Central-law corpus</small></span></div></div>
      <div className="assistant-layout"><LegalProblemForm onSubmit={handleSubmit} initialCategory={location.state?.category || ""} jurisdiction={jurisdiction} setJurisdiction={setJurisdiction} language={language} setLanguage={setLanguage} /><aside className="assistant-side"><div className="side-quote"><span className="quote-mark">“</span><p>You don’t need to know the legal words. Start with what happened.</p><span className="side-rule" /></div><div className="side-coverage"><MapPin size={16} /><div><strong>Where we can search</strong><p>Selected India-wide central-law records. State selection is context only; state-specific laws are not covered.</p></div></div><div className="side-coverage"><Scale size={16} /><div><strong>What this is</strong><p>A public information prototype. Not legal advice, a lawyer, or an emergency service.</p></div></div><Link className="side-link" to="/sources">View current source list <ArrowLeft size={14} /></Link></aside></div>
    </main>
  );
}
