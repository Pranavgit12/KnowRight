import { useEffect, useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { PageIntro } from "@/components/PageIntro";
import { SourceCard } from "@/components/SourceCard";
import { listSources } from "@/services/legalInfoService.ts";
import type { SourceRecord } from "@/types/legal";

export function SourcesPage() {
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listSources()
      .then((records) => {
        if (active) setSources(records);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "The source list could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="page-wrap page-content">
      <PageIntro
        eyebrow="SOURCE NOTES"
        title={<>See where the<br />information comes from.</>}
        description="The demo uses a small collection of selected section summaries, each linked to its source record. A link is a reference to check, not an endorsement or a guarantee that a rule applies."
      />
      <div className="source-coverage-banner">
        <div><span className="eyebrow">CURRENT COLLECTION</span><strong>Selected India-wide central-law summaries</strong></div>
        <p>Not state-specific, comprehensive, or live-updated. Dates shown are the dates available in the source records; they do not establish current legal status.</p>
        <a href="https://www.indiacode.gov.in/" target="_blank" rel="noopener noreferrer">Visit India Code <ArrowUpRight size={15} aria-hidden="true" /></a>
      </div>
      {loading && <p className="notice"><LoaderCircle className="spin" size={17} /> Loading source records…</p>}
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {!loading && !error && (
        <div className="source-list">
          {sources.map((source) => <SourceCard key={source.source_id} source={source} />)}
        </div>
      )}
      {!loading && !error && !sources.length && <p className="notice">No source records are available right now.</p>}
    </div>
  );
}
