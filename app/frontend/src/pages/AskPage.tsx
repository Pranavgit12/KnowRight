import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle, MapPin } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageIntro } from "@/components/PageIntro";
import { useJurisdiction } from "@/components/JurisdictionProvider";
import { findSourcePassages } from "@/services/legalInfoService.ts";
import type { Jurisdiction, SearchResponse } from "@/types/legal";

export function AskPage() {
  const { jurisdiction, setJurisdiction } = useJurisdiction();
  const [searchParams] = useSearchParams();
  const [question, setQuestion] = useState(searchParams.get("q") ?? "");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setQuestion(query);
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (jurisdiction === "not-covered") {
      setError("This demo only includes selected India-wide central-law sources. It cannot search state-specific or other-country sources.");
      return;
    }
    if (jurisdiction !== "India (Central)") {
      setError("Choose India — central law to search this demo’s sources.");
      return;
    }
    if (!question.trim()) {
      setError("Write a question to search the available source passages.");
      return;
    }

    setLoading(true);
    try {
      setResult(await findSourcePassages(question.trim(), jurisdiction));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The local source search could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrap page-content">
      <PageIntro
        eyebrow="ASK IN YOUR OWN WORDS"
        title={<>What would you like<br />to understand?</>}
        description="We’ll look for related passages in the available sources. The results are references to explore, not answers or legal advice."
      />
      <form className="ask-form" onSubmit={handleSubmit}>
        <label htmlFor="ask-question">Your question</label>
        <textarea
          id="ask-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="For example: What do these sources say about making a consumer complaint?"
          required
        />
        <div className="ask-form-bottom">
          <div className="form-jurisdiction">
            <label htmlFor="ask-jurisdiction"><MapPin size={15} aria-hidden="true" /> Your location</label>
            <select
              id="ask-jurisdiction"
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value as Jurisdiction)}
            >
              <option value="">Choose your location</option>
              <option value="India (Central)">India — central law</option>
              <option value="not-covered">Another location / not sure</option>
            </select>
          </div>
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? <><LoaderCircle className="spin" size={17} /> Searching sources…</> : <>Find source passages <ArrowUpRight size={16} aria-hidden="true" /></>}
          </button>
        </div>
        <p className="form-privacy">Your question is sent only to this local demo. Please leave out names and personal details.</p>
      </form>

      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {result && (
        <section className="search-results" aria-live="polite" aria-labelledby="results-title">
          <h2 id="results-title">Source passages to explore</h2>
          <p className="results-caveat">
            Keyword matches are not verified answers. Check the original source
            and its current status; the excerpts may not apply to your situation.
          </p>
          {result.hits.length === 0 ? (
            <p className="notice">No matching passages were found in this small demo collection. That does not mean no legal information exists.</p>
          ) : (
            <div className="result-list">
              {result.hits.map((hit) => (
                <article className="result-card" key={hit.passage_id}>
                  <p className="source-kicker">{hit.source_id}</p>
                  <h3>{hit.title}</h3>
                  <p className="source-authority">{hit.issuing_authority} · {hit.jurisdiction}</p>
                  <p className="result-passage">{hit.passage}</p>
                  <a href={hit.source_url} target="_blank" rel="noopener noreferrer">Open original source <ArrowUpRight size={15} aria-hidden="true" /></a>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      {!result && !error && (
        <p className="notice notice-muted">
          This demo currently searches selected India-wide central-law summaries.
          It has no state-specific sources and does not generate legal answers.
        </p>
      )}
    </div>
  );
}
