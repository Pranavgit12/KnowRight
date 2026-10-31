import { Link } from "react-router-dom";
import ResultsDashboard from "@/components/ResultsDashboard";

export default function Results({ caseData, onReset, onFollowUp, onCorrectProblem }) {
  if (!caseData) return <main className="missing-results"><p className="eyebrow">NO ACTIVE CASE</p><h1>Your case details are not available.</h1><p>For privacy, this prototype does not store case responses across page reloads. Start a new question to search the local source collection.</p><Link to="/assistant" className="button button-green">Start a question</Link></main>;
  return <ResultsDashboard result={caseData.result} caseDetails={caseData.values} onReset={onReset} onFollowUp={onFollowUp} onCorrectProblem={onCorrectProblem} />;
}
