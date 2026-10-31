import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileText,
  MapPin,
  Printer,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useJurisdiction } from "@/components/JurisdictionProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { ConversationChat, type ConversationMessage } from "@/components/ConversationChat";
import { GrievancePortals } from "@/components/GrievancePortals";
import { ResultTabs, type ResultTab } from "@/components/ResultTabs";
import { CaseStudies } from "@/components/CaseStudies";
import { RightsLibrary } from "@/components/RightsLibrary";
import { JusticeScene } from "@/components/JusticeScene";
import { findAssistantResult, getAssistantStatus } from "@/services/legalInfoService.ts";
import type {
  AssistantResult,
  Jurisdiction,
  SolutionSection,
  SourceHit,
} from "@/types/legal";

const SOLUTION_SECTIONS: {
  key: keyof SolutionSection;
  title: string;
}[] = [
  { key: "understanding", title: "Understanding Your Problem" },
  { key: "issue", title: "Legal Issue Identified" },
  { key: "rights", title: "Your Rights" },
  { key: "solutions", title: "Recommended Solutions" },
  { key: "action_plan", title: "Legal Action · How to Proceed" },
  { key: "documents", title: "Potentially Useful Documents" },
  { key: "help", title: "Where to Get Help" },
  { key: "precautions", title: "AI Advice and Precautions" },
  { key: "next_step", title: "Your Next Step" },
];

function getSolutionText(result: AssistantResult, problem: string) {
  return [
    "KnowRight — general legal information, not legal advice",
    `Problem: ${problem}`,
    `Mode: ${result.mode === "ai_assisted" ? "AI-assisted, grounded in retrieved sources" : result.provider_configured ? "Retrieval only; no relevant approved source passages" : "Retrieval only; no AI provider configured"}`,
    ...SOLUTION_SECTIONS.map(({ key, title }) => {
      const section = result.sections[key];
      return `${title}\n${section || "No verified information is available for this section."}`;
    }),
    "Sources",
    ...result.hits.map((hit) => `${hit.title} — ${hit.issuing_authority} (${hit.jurisdiction})${hit.publication_date ? `, published ${hit.publication_date}` : ""}\n${hit.source_url}\n${hit.passage}`),
    "Check the original sources. This is general information, not legal advice.",
  ].join("\n\n");
}

function CitedText({
  text,
  sources,
  onCitation,
}: {
  text: string;
  sources: Map<string, SourceHit>;
  onCitation?: (sourceId: string) => void;
}) {
  const parts = text.split(/(\[[A-Za-z0-9._-]+\])/g);
  return (
    <p className="solution-copy">
      {parts.map((part, index) => {
        const match = /^\[([A-Za-z0-9._-]+)\]$/.exec(part);
        const source = match ? sources.get(match[1]) : undefined;
        if (!match || !source) return <span key={index}>{part}</span>;
        return (
          <a
            className="inline-citation"
            href={`#source-${source.source_id}`}
            key={index}
            onClick={(event) => {
              if (!onCitation) return;
              event.preventDefault();
              onCitation(source.source_id);
            }}
          >
            {source.source_id}
          </a>
        );
      })}
    </p>
  );
}

function SourcePassage({ hit }: { hit: SourceHit }) {
  return (
    <article className="assistant-source-card" id={`source-${hit.source_id}`} key={hit.source_id}>
      <div className="assistant-source-top">
        <FileText size={17} aria-hidden="true" />
        <span>{hit.source_id}</span>
        <span className="source-jurisdiction">{hit.jurisdiction}</span>
      </div>
      <h4>{hit.title}</h4>
      <p className="assistant-source-authority">{hit.issuing_authority}</p>
      <blockquote>{hit.passage}</blockquote>
      <div className="assistant-source-bottom">
        <span>
          {hit.publication_date ? `Published ${hit.publication_date}` : "Publication date not available"}
          {hit.effective_date ? ` · Effective ${hit.effective_date}` : ""}
        </span>
        <a href={hit.source_url} target="_blank" rel="noopener noreferrer">
          Open source record <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export function AssistantPage() {
  const { jurisdiction, setJurisdiction } = useJurisdiction();
  const { language, t } = useLanguage();
  const [problem, setProblem] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copyState, setCopyState] = useState("");
  const [providerConfigured, setProviderConfigured] = useState(false);
  const [providerConfigurationError, setProviderConfigurationError] = useState(false);
  const [providerConsent, setProviderConsent] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>("solution");

  const sourceById = useMemo(
    () => new Map((result?.hits ?? []).map((hit) => [hit.source_id, hit])),
    [result],
  );
  const sectionTitles: Record<keyof SolutionSection, string> = {
    understanding: t("summary"),
    issue: t("topic"),
    rights: t("rightsHeading"),
    solutions: t("solutionsHeading"),
    action_plan: t("stepsHeading"),
    documents: t("documents"),
    help: t("authorityHeading"),
    precautions: t("disclaimer"),
    next_step: t("next"),
  };

  function showSource(sourceId: string) {
    setActiveResultTab("sources");
    window.setTimeout(() => {
      document.getElementById(`source-${sourceId}`)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
    }, 40);
  }

  useEffect(() => {
    let active = true;
    getAssistantStatus()
      .then((status) => {
        if (!active) return;
        setProviderConfigured(status.ai_provider_configured);
        setProviderConfigurationError(status.ai_provider_configuration_error);
      })
      .catch(() => {
        if (active) setProviderConfigurationError(true);
      });
    return () => { active = false; };
  }, []);

  async function sendConversationMessage(message: string, history: ConversationMessage[]) {
    if (providerConfigurationError) {
      throw new Error(t("providerStatusError"));
    }
    if (jurisdiction === "not-covered") {
      throw new Error(language === "hi" ? "यह डेमो केवल भारत के केंद्रीय कानूनों को कवर करता है। राज्य-विशिष्ट और अन्य देशों के स्रोत शामिल नहीं हैं।" : language === "te" ? "ఈ డెమో భారతదేశ కేంద్ర చట్టాలకే పరిమితం. రాష్ట్ర-నిర్దిష్ట, ఇతర దేశాల మూలాలు లేవు." : "This demo only supports India — central law. State-specific and other-country sources are not included.");
    }
    if (jurisdiction !== "India (Central)") {
      throw new Error(t("coverageChoose"));
    }
    setLoading(true);
    try {
      const firstMessage = history.find((item) => item.role === "user")?.text ?? message;
      const transcript = [...history, { role: "user" as const, text: message, createdAt: new Date().toISOString() }]
        .filter((item) => item.role === "user")
        .map((item) => `User: ${item.text}`)
        .join("\n");
      const recentTranscript = transcript.slice(-12_000);
      const response = await findAssistantResult({
        problem: firstMessage,
        followUp: recentTranscript,
        jurisdiction: "India (Central)",
        language,
        externalAiConsent: providerConsent,
      });
      setResult(response);
      setProblem(firstMessage);
      setFollowUp(recentTranscript);
      setActiveResultTab("solution");
      const reply = response.clarification_questions[0]
        ? response.clarification_questions[0]
        : response.mode === "ai_assisted"
          ? response.sections.understanding || response.sections.next_step || "I’ve prepared a source-grounded overview below."
          : response.no_matching_sources
            ? t("noSources")
            : `${t("sourceOnly")} ${t("needHelp")}`;
      return { reply, result: response };
    } finally {
      setLoading(false);
    }
  }

  async function copySolution() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(getSolutionText(result, problem));
      setCopyState(t("copyDone"));
    } catch {
      setCopyState(t("copyFailed"));
    }
  }

  function downloadSolution() {
    if (!result) return;
    const blob = new Blob([getSolutionText(result, problem)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "knowright-solution.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    setCopyState(t("downloadDone"));
  }

  function updateConversationResult(nextResult: AssistantResult | null, messages: ConversationMessage[]) {
    setResult(nextResult);
    setProblem(messages.find((message) => message.role === "user")?.text ?? "");
    setFollowUp(messages.filter((message) => message.role === "user").map((message) => `User: ${message.text}`).join("\n").slice(-12_000));
    setActiveResultTab("solution");
  }

  return (
    <>
      <section className="assistant-hero page-wrap" id="home" aria-labelledby="assistant-title">
        <div className="assistant-hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> {t("disclaimer")}</p>
          <h1 id="assistant-title">Your Problem.<br /><span>Your Rights.</span><br />Your Next Step.</h1>
          <p className="assistant-hero-intro">
            {language === "hi"
              ? "अपनी बात सामान्य भाषा में बताएं। उपलब्ध जानकारी और स्रोतों को समझें—और जानें कि जानकारी क्या बता सकती है और क्या नहीं।"
              : language === "te"
                ? "మీ పరిస్థితిని సాధారణ భాషలో వివరించండి. అందుబాటులో ఉన్న సమాచారం, మూలాలు ఏమి చెబుతాయో—ఏమి చెప్పలేవో—తెలుసుకోండి."
                : "Explain your situation naturally. Explore the information and sources available, and understand what they can—and cannot—tell you."}
          </p>
          <div className="assistant-hero-actions">
            <a className="button button-primary" href="#problem">{t("askQuestion")} <ArrowRight size={16} aria-hidden="true" /></a>
            <span className="assistant-disclaimer"><ShieldCheck size={16} aria-hidden="true" /> {t("disclaimer")}</span>
          </div>
          <div className="assistant-coverage"><MapPin size={15} aria-hidden="true" /><span>{t("coverage")}</span><strong>{t("coverageValue")}</strong></div>
        </div>
        <JusticeScene className="assistant-hero-art" />
      </section>

      <section className="assistant-workspace" id="problem" aria-labelledby="problem-title">
        <div className="page-wrap workspace-inner">
          <div className="assistant-workspace-heading">
            <div>
              <p className="eyebrow">{t("currentChat")}</p>
              <h2 id="problem-title">{t("welcome")}</h2>
              <p>{t("welcomeBody")}</p>
            </div>
            <label className="workspace-jurisdiction" htmlFor="assistant-jurisdiction">
              <MapPin size={14} aria-hidden="true" /> {t("jurisdiction")}
              <select id="assistant-jurisdiction" value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value as Jurisdiction)}>
                <option value="">{t("coverageChoose")}</option>
                <option value="India (Central)">{t("indiaCentral")}</option>
                <option value="not-covered">{t("coverageOther")}</option>
              </select>
            </label>
          </div>

          <div id="privacy">
            <ConversationChat
              providerConfigured={providerConfigured}
              providerConsent={providerConsent}
              onProviderConsentChange={setProviderConsent}
              onSend={sendConversationMessage}
              onResultChange={updateConversationResult}
            />
            {providerConfigurationError && <p className="provider-warning" role="status">{t("providerStatusError")}</p>}
          </div>

          {result && (
            <section className="solution-panel" id="solution" aria-labelledby="solution-heading" aria-live="polite">
              <div className="solution-topline">
                <div className="solution-status">
                  <span className={`solution-mode-dot ${result.mode === "ai_assisted" ? "mode-ai" : ""}`} />
                  <span>{result.mode === "ai_assisted" ? t("aiGrounded") : result.provider_configured ? t("retrievalNoMatch") : t("retrievalNoProvider")}</span>
                </div>
                <span className="solution-jurisdiction"><MapPin size={14} /> {result.jurisdiction}</span>
              </div>
              <div className="solution-heading-row">
                <div><p className="eyebrow">{t("summaryLabel")}</p><h2 id="solution-heading">{t("nextClearer")}</h2></div>
              </div>
              <p className="solution-mode-explainer">
                {result.mode === "ai_assisted"
                  ? t("sourceGroundedExplanation")
                  : t("sourceMatchesNotAnalysis")}
              </p>

              <ResultTabs activeTab={activeResultTab} onChange={setActiveResultTab} />

              {activeResultTab === "solution" && (
                <div
                  aria-labelledby="result-tab-solution"
                  className="result-tab-panel"
                  id="result-panel-solution"
                  role="tabpanel"
                  tabIndex={0}
                >
              {result.mode === "retrieval_only" && (
                <div className="retrieval-honesty"><Sparkles size={16} aria-hidden="true" /><p><strong>{t("generatedUnavailable")}</strong> {result.provider_configured ? t("noAIRequested") : t("noProvider")} {language === "hi" ? "हम शब्दों के मिलान को कानूनी समाधान के रूप में प्रस्तुत नहीं करेंगे।" : language === "te" ? "పదాల సరిపోలికలను న్యాయ పరిష్కారంగా చూపించము." : "We will not present keyword matches as a legal solution."}</p></div>
              )}

              {result.mode !== "clarification_required" && (
                <div className="solution-sections">
                  {SOLUTION_SECTIONS.map(({ key }, index) => (
                    <details className="solution-detail" key={key} open={index < 3}>
                      <summary><span className="solution-index">{String(index + 1).padStart(2, "0")}</span><span>{sectionTitles[key]}</span><ChevronDown className="solution-chevron" size={17} aria-hidden="true" /></summary>
                      <div className="solution-detail-body">
                      <CitedText text={result.sections[key] || "I could not verify this from the available sources."} sources={sourceById} onCitation={showSource} />
                        {key === "issue" && <span className="category-chip">{t("possibleCategory")}: {result.category}</span>}
                      </div>
                    </details>
                  ))}
                </div>
              )}
                </div>
              )}

              {activeResultTab === "sources" && (
              <div className="assistant-results-sources result-tab-panel" id="result-panel-sources" role="tabpanel" aria-labelledby="result-tab-sources" tabIndex={0}>
              <div className="assistant-sources-heading"><div><p className="eyebrow">{t("sources")}</p><h3>{t("sourcePassages")}</h3></div><span>{result.hits.length} {result.hits.length === 1 ? t("sourceCount") : t("sourceCountPlural")}</span></div>
                {result.hits.length ? (
                  <div className="assistant-source-list">{result.hits.map((hit) => <SourcePassage hit={hit} key={hit.source_id} />)}</div>
                ) : (
                  <p className="no-source-notice">{t("noSourceNotice")}</p>
                )}
              </div>
              )}

              <div className="solution-tools" aria-label="Solution actions">
                <button type="button" onClick={copySolution}><Clipboard size={16} /> {t("copySolution")}</button>
                <button type="button" onClick={downloadSolution}><Download size={16} /> {t("downloadSolution")}</button>
                <button type="button" onClick={() => window.print()}><Printer size={16} /> {t("saveSolution")}</button>
              </div>
              {copyState && <p className="action-feedback" role="status"><Check size={14} /> {copyState}</p>}
              <p className="solution-final-disclaimer">{t("generalDisclaimer")}</p>
            </section>
          )}
        </div>
      </section>

      <section className="assistant-context page-wrap" id="how-it-works">
        <div className="assistant-context-intro"><p className="eyebrow">{t("howWorks")}</p><h2>{t("sourcesFirst")}</h2><p>{t("howWorksBody")}</p></div>
        <div className="assistant-context-steps">
          <article><span>01</span><h3>{t("stepChoose")}</h3><p>{t("stepChooseBody")}</p></article>
          <article><span>02</span><h3>{t("stepSearch")}</h3><p>{t("stepSearchBody")}</p></article>
          <article><span>03</span><h3>{t("stepVerify")}</h3><p>{t("stepVerifyBody")}</p></article>
        </div>
      </section>

      <section className="assistant-source-note page-wrap" id="sources">
        <div><p className="eyebrow">{t("sourceCoverage")}</p><h2>{t("selectedSources")}</h2><p>{t("coverageDetails")}</p></div>
        <a href="#problem">{t("inspectSources")} <ArrowUpRight size={16} /></a>
      </section>
      <GrievancePortals problem={`${problem} ${followUp}`} />
      <CaseStudies />
      <RightsLibrary />
      <div className="sr-only" aria-live="polite">{loading ? t("searching") : ""}</div>
    </>
  );
}
