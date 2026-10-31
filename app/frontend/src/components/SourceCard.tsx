import { ArrowUpRight, FileText } from "lucide-react";
import type { SourceRecord } from "@/types/legal";

export function SourceCard({ source }: { source: SourceRecord }) {
  return (
    <article className="source-card">
      <div className="source-card-icon" aria-hidden="true">
        <FileText size={19} strokeWidth={1.7} />
      </div>
      <div className="source-card-content">
        <p className="source-kicker">{source.source_id}</p>
        <h3>{source.title}</h3>
        <p className="source-authority">{source.issuing_authority}</p>
        <p className="source-summary">{source.text}</p>
        <div className="source-meta">
          <span>{source.jurisdiction}</span>
          {source.publication_date && (
            <span>Published {source.publication_date}</span>
          )}
          {source.effective_date && (
            <span>Effective {source.effective_date}</span>
          )}
        </div>
        <a href={source.source_url} target="_blank" rel="noopener noreferrer">
          Check original record <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
