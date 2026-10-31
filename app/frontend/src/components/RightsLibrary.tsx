import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpenCheck, LoaderCircle } from "lucide-react";
import { listSources } from "@/services/legalInfoService.ts";
import type { SourceRecord } from "@/types/legal";
import { useLanguage } from "@/components/LanguageProvider";

export function RightsLibrary() {
  const { t } = useLanguage();
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listSources()
      .then((records) => {
        if (active) {
          setSources(records.filter((source) =>
            source.source_type === "approved_public" &&
            source.approval_status === "approved",
          ));
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "The source list could not be loaded.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="rights-library-section" id="rights-library" aria-labelledby="rights-library-title">
      <div className="page-wrap">
        <div className="assistant-section-heading">
          <div>
            <p className="eyebrow">{t("libraryEyebrow")}</p>
            <h2 id="rights-library-title">{t("libraryTitle")}</h2>
            <p>{t("libraryIntro")}</p>
          </div>
          <a href="#sources" className="rights-library-link">{t("sourceCoverage")} <ArrowUpRight size={15} /></a>
        </div>
        {loading && <p className="rights-library-state" role="status"><LoaderCircle className="spin" size={16} /> {t("loadingSources")}</p>}
        {error && <p className="rights-library-state" role="alert">{error}</p>}
        {!loading && !error && sources.length === 0 && <p className="rights-library-state">{t("noSourceRecords")}</p>}
        {sources.length > 0 && (
          <div className="rights-library-grid">
            {sources.map((source) => (
              <article className="rights-library-card" key={source.source_id}>
                <span><BookOpenCheck size={16} /> {source.source_id}</span>
                <h3>{source.title}</h3>
                <p className="rights-authority">{source.issuing_authority} · {source.jurisdiction}</p>
                <p>{t("originalLanguage")} {source.text}</p>
                <a href={source.source_url} target="_blank" rel="noopener noreferrer">
                  {t("originalRecord")} <ArrowUpRight size={14} />
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
