import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpenCheck, CircleAlert, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getSources } from "@/services/api";

export default function Sources() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getSources().then((items) => { if (active) setSources(items); }).catch((failure) => { if (active) setError(failure.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const approved = sources.filter((source) => source.source_type === "approved_public" && source.approval_status === "approved");
  return <main className="sources-page">
    <p className="eyebrow">LEGAL RESOURCES</p><h1>Sources you can inspect.</h1><p className="sources-intro">This list is loaded from the project’s local source collection. Inclusion is not a claim that the record is current, comprehensive, or an endorsement.</p>
    <div className="coverage-banner"><CircleAlert size={18} /><p><strong>Limited coverage</strong><br />Selected India-wide central-law records only. No state-specific legal collection or verified legal-aid directory is available in this prototype.</p></div>
    {loading && <p className="loading-inline"><LoaderCircle className="spin" /> Loading source records…</p>}
    {error && <p className="form-alert" role="alert">{error}</p>}
    {!loading && !error && !approved.length && <div className="empty-state"><BookOpenCheck size={24} /><h2>No approved records are available.</h2><p>Start the local backend and try refreshing this page.</p></div>}
    <div className="sources-grid">{approved.map((source) => <article className="source-list-card" key={source.source_id}><div className="source-record-label"><BookOpenCheck size={16} /> {source.source_id}</div><h2>{source.title}</h2><p className="record-authority">{source.issuing_authority} · {source.jurisdiction}</p><p className="source-excerpt">{source.text}</p><div className="source-date">{source.publication_date ? `Published ${source.publication_date}` : "Publication date not supplied"}</div><a href={source.source_url} target="_blank" rel="noopener noreferrer">Open source record <ArrowUpRight size={14} /></a></article>)}</div>
    <div className="source-action"><p>Looking for a starting point?</p><Link className="button button-green" to="/assistant">Ask a question <ArrowUpRight size={15} /></Link></div>
  </main>;
}
