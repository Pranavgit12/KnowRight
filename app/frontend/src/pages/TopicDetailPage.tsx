import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageIntro } from "@/components/PageIntro";
import { SourceCard } from "@/components/SourceCard";
import { topics } from "@/data/topics";
import { listSources } from "@/services/legalInfoService.ts";
import type { SourceRecord } from "@/types/legal";

export function TopicDetailPage() {
  const { slug } = useParams();
  const topic = topics.find((item) => item.slug === slug);
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!topic?.sourceIds.length) return;
    listSources()
      .then((records) => setSources(records.filter((record) => topic.sourceIds.includes(record.source_id))))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Source records could not be loaded."));
  }, [topic]);

  if (!topic) {
    return (
      <div className="page-wrap page-content">
        <PageIntro eyebrow="TOPIC NOT FOUND" title="Let’s find another starting point." description="That topic isn’t in this demo. Browse the available topics to continue." />
        <Link className="button button-secondary" to="/topics"><ArrowLeft size={16} /> Explore topics</Link>
      </div>
    );
  }

  const Icon = topic.Icon;
  return (
    <div className="page-wrap page-content">
      <Link className="back-link" to="/topics"><ArrowLeft size={15} aria-hidden="true" /> All topics</Link>
      <div className="topic-detail-heading">
        <span className="topic-icon topic-icon-large"><Icon size={26} aria-hidden="true" /></span>
        <PageIntro eyebrow="TOPIC STARTING POINT" title={topic.title} description={topic.description} />
      </div>
      <div className="topic-detail-actions">
        <Link className="button button-primary" to={`/ask?q=${encodeURIComponent(topic.prompt)}`}>Ask about {topic.title.toLowerCase()} <ArrowUpRight size={16} /></Link>
        <p>Choose your location on the question page before searching.</p>
      </div>
      <section className="topic-sources" aria-labelledby="topic-sources-title">
        <div className="section-heading-row">
          <div><p className="eyebrow">AVAILABLE REFERENCES</p><h2 id="topic-sources-title">Source records in this demo</h2></div>
          <Link className="text-link" to="/sources">All sources <ArrowUpRight size={15} /></Link>
        </div>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        {topic.sourceIds.length === 0 ? (
          <p className="notice">There are no matching source records for this topic in the current demo collection. We won’t fill the gap with a guess.</p>
        ) : sources.length ? (
          <div className="source-list">{sources.map((source) => <SourceCard key={source.source_id} source={source} />)}</div>
        ) : !error ? (
          <p className="notice">Loading source records…</p>
        ) : null}
      </section>
    </div>
  );
}
