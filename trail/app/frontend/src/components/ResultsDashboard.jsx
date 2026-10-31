import { useMemo, useState } from "react";
import {
  ArrowDownRight, ArrowUpRight, BadgeCheck, BookOpenCheck, Check,
  ChevronDown, CircleAlert, ClipboardList, FileText, MessageCircle,
  RotateCcw, Send, ShieldCheck, Sparkles, Pencil, Save,
} from "lucide-react";
import { LEGAL_SECTIONS } from "@/types/legal";

function CitationText({ text, hits }) {
  const sourceById = useMemo(() => new Map(hits.map((hit) => [hit.source_id, hit])), [hits]);
  return <p className="result-copy">{text.split(/(\[[A-Za-z0-9._-]+\])/g).map((part, index) => {
    const citation = /^\[([A-Za-z0-9._-]+)\]$/.exec(part);
    const hit = citation && sourceById.get(citation[1]);
    return hit
      ? <a className="citation" key={index} href={`#record-${hit.source_id}`}>{hit.source_id}</a>
      : <span key={index}>{part}</span>;
  })}</p>;
}

function SourceCard({ hit, idPrefix = "record" }) {
  const approved = hit.source_type === "approved_public" && hit.approval_status === "approved";
  return (
    <article className="record-card" id={`${idPrefix}-${hit.source_id}`}>
      <div className="record-top"><span className="record-icon"><BookOpenCheck size={17} /></span><span className="record-id">{hit.source_id}</span><span className="record-status">{approved ? "Approved corpus record" : "Status not confirmed"}</span></div>
      <h4>{hit.title}</h4>
      <p className="record-authority">{hit.issuing_authority} <span>·</span> {hit.jurisdiction}</p>
      <blockquote>{hit.passage}</blockquote>
      <div className="record-foot"><span>{hit.publication_date ? `Published ${hit.publication_date}` : "Publication date not supplied"}{hit.effective_date ? ` · Effective ${hit.effective_date}` : ""}</span><a href={hit.source_url} target="_blank" rel="noopener noreferrer">Open original <ArrowUpRight size={14} /></a></div>
      <p className="record-caveat"><CircleAlert size={13} /> Included in the project source collection; not independently verified as current.</p>
    </article>
  );
}

function Panel({ number, title, icon: Icon, children, open = false, className = "" }) {
  return <details className={`result-panel ${className}`} open={open}>
    <summary><span className="panel-number">{number}</span><span className="panel-icon"><Icon size={18} /></span><span className="panel-title">{title}</span><ChevronDown className="panel-chevron" size={17} /></summary>
    <div className="panel-content">{children}</div>
  </details>;
}

export default function ResultsDashboard({ result, caseDetails, onReset, onFollowUp, onCorrectProblem }) {
  const [checked, setChecked] = useState({});
  const [editingProblem, setEditingProblem] = useState(false);
  const [problemDraft, setProblemDraft] = useState(caseDetails.problem);
  const [chatText, setChatText] = useState("");
  const [chatItems, setChatItems] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatClarification, setChatClarification] = useState("");
  const sections = result.sections || {};
  const sourceHits = Array.isArray(result.hits) ? result.hits : [];
  const documentsText = sections.documents || "The available sources do not confirm which documents are relevant or legally required.";
  const documents = useMemo(
    () => documentsText.split(/\n+|(?<=[.!?])\s+/).map((text) => text.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, "").trim()).filter((text) => text.length > 12),
    [documentsText],
  );

  async function sendMessage(event, prompt = chatText) {
    event?.preventDefault();
    const question = prompt.trim();
    if (!question || chatLoading) return;
    setChatError("");
    setChatClarification("");
    setChatLoading(true);
    try {
      const response = await onFollowUp(question);
      if (response.mode === "clarification_required") {
        setChatClarification(response.clarification_questions?.join(" ") || "A little more information is needed before continuing.");
      } else {
        const answer = response.sections?.rights || response.sections?.next_step || "No verified response is available in the returned source collection.";
        setChatItems((items) => [...items, { question, answer, hits: response.hits || [], mode: response.mode }]);
      }
      setChatText("");
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "The follow-up could not be completed.");
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <main className="results-page">
      <div className="results-intro">
        <div><p className="eyebrow">YOUR INFORMATION WORKSPACE</p><h1>A clearer next step.</h1><p>Review what the available source collection can—and cannot—say about your question.</p></div>
        <button className="button button-outline" onClick={onReset} type="button"><RotateCcw size={15} /> Start new case</button>
      </div>
      <div className="result-honesty"><Sparkles size={17} /><div><strong>{result.mode === "ai_assisted" ? "AI-assisted, based on retrieved passages" : result.provider_configured ? "Source search only · no relevant approved passage found" : "Retrieval-only · no AI provider configured"}</strong><p>{result.mode === "ai_assisted" ? "Model-generated text is unverified. Check cited original records before relying on it." : "This is not a generated legal solution. Keyword matches are not legal analysis, and an empty search does not mean no law or remedy exists."}</p></div></div>
      <div className="result-meta"><span><span className="meta-key">Location</span>{caseDetails.state} <i>·</i> India central-law sources</span><span><span className="meta-key">Topic</span>{caseDetails.category}</span><span><span className="meta-key">References</span>{sourceHits.length} records</span></div>
      <div className="dashboard-layout">
        <div className="dashboard-main">
          <Panel number="01" title="Problem identified" icon={ClipboardList} open>
            <div className="problem-summary"><div className="summary-label">Your description <button type="button" className="edit-summary" onClick={() => setEditingProblem(!editingProblem)}><Pencil size={12} /> {editingProblem ? "Cancel edit" : "Edit"}</button></div>{editingProblem ? <><label className="sr-only" htmlFor="edit-case-summary">Edit your problem description</label><textarea className="summary-editor" id="edit-case-summary" maxLength={5000} value={problemDraft} onChange={(event) => setProblemDraft(event.target.value)} /><button className="save-summary" type="button" onClick={() => { if (problemDraft.trim().length > 7) { onCorrectProblem(problemDraft.trim()); setEditingProblem(false); } }} disabled={problemDraft.trim().length < 8}><Save size={13} /> Save updated description</button></> : <p>{caseDetails.problem}</p>}</div>
            <div className="summary-category"><span>Possible category</span><strong>{result.category || caseDetails.category}</strong></div>
            {result.clarification_questions?.length > 0 && <div className="open-questions"><strong>Details that may matter</strong><ul>{result.clarification_questions.map((question) => <li key={question}>{question}</li>)}</ul><p>State-specific rules are not in the current source coverage.</p></div>}
            <p className="uncertainty-note"><CircleAlert size={14} /> This is a rough classification, not a legal determination. Correct your description or ask a follow-up below.</p>
          </Panel>
          <Panel number="02" title="Applicable laws & source passages" icon={BookOpenCheck} open>
            {sourceHits.length ? <><p className="panel-lead">These are the passages returned by the local search. Check their scope and current status in the original records.</p><div className="record-list">{sourceHits.map((hit) => <SourceCard key={`${hit.source_id}-${hit.passage_id}`} hit={hit} idPrefix="record" />)}</div></> : <p className="empty-sources">No relevant passage was found in the selected records. This does not show that no law or official resource exists.</p>}
          </Panel>
          <Panel number="03" title="Know your rights" icon={ShieldCheck} open>
            <CitationText text={sections.rights || "I could not verify this from the available sources."} hits={sourceHits} />
            <p className="fact-interpretation"><BadgeCheck size={14} /> Source passages appear above. Any interpretation is not independently verified; consult the original text.</p>
          </Panel>
          <Panel number="04" title="Your solution & practical steps" icon={ArrowDownRight} open>
            <h4 className="subsection-title">Possible options</h4><CitationText text={sections.solutions || "No case-specific solutions are verified in the available sources."} hits={sourceHits} />
            <h4 className="subsection-title">Suggested sequence</h4><CitationText text={sections.action_plan || "No verified action plan is available for this situation."} hits={sourceHits} />
            <p className="result-caveat">No outcome, deadline, or requirement is guaranteed by this result.</p>
          </Panel>
          <Panel number="05" title="Where to report" icon={ArrowUpRight}>
            <CitationText text={sections.help || "No relevant reporting authority could be verified from the available sources."} hits={sourceHits} />
            <p className="result-caveat">This project currently has no verified directory of complaint portals, authorities, or local contacts. Do not treat an unlisted service as unavailable.</p>
          </Panel>
          <Panel number="06" title="Documents to consider" icon={FileText}>
            <p className="panel-lead">The retrieved sources do not establish which records are legally required. The notes below are informational, not a checklist of mandatory documents.</p>
            <div className="document-checklist">{documents.length ? documents.map((document, index) => <label key={`${index}-${document}`}><input type="checkbox" checked={Boolean(checked[index])} onChange={(event) => setChecked((items) => ({ ...items, [index]: event.target.checked }))} /><span>{document}</span>{checked[index] && <Check size={15} />}</label>) : <p>No document requirements were verified.</p>}</div>
          </Panel>
          <Panel number="07" title="Verified source records" icon={BadgeCheck}>
            <p className="panel-lead">The source list comes from this project’s corpus. A record’s inclusion or URL does not independently verify its current legal status.</p>
            {sourceHits.length ? <div className="record-list">{sourceHits.map((hit) => <SourceCard key={`verified-${hit.source_id}-${hit.passage_id}`} hit={hit} idPrefix="verified-record" />)}</div> : <p className="empty-sources">No source records were returned for this search.</p>}
          </Panel>
          <Panel number="08" title="Further assistance" icon={MessageCircle}>
            <CitationText text={sections.precautions || "For advice about a specific situation, seek qualified local help."} hits={sourceHits} />
            <CitationText text={sections.help || "No verified local legal-aid contacts are included in this project."} hits={sourceHits} />
            <div className="immediate-step"><span>One possible next step</span><CitationText text={sections.next_step || "Open an original source record and seek qualified help for advice about your situation."} hits={sourceHits} /></div>
            <p className="result-caveat">No verified legal-aid or emergency directory is included. If someone is in immediate danger, contact local emergency services using a number you can verify independently.</p>
          </Panel>
        </div>
        <aside className="dashboard-aside">
          <section className="chat-card">
            <div className="chat-heading"><span className="chat-heading-icon"><MessageCircle size={18} /></span><div><h2>Continue exploring</h2><p>{result.provider_configured ? "An external provider may be used only with your consent." : "Follow-ups search the local source collection only."}</p></div></div>
            {chatItems.length > 0 && <div className="chat-history" aria-live="polite">{chatItems.map((item, index) => <div className="chat-turn" key={`${index}-${item.question}`}><p className="chat-user">{item.question}</p><div className="chat-answer"><span className="chat-mode">{item.mode === "ai_assisted" ? "AI-assisted · unverified" : "Retrieved-source response"}</span><CitationText text={item.answer} hits={item.hits} />{item.hits.map((hit) => <a className="chat-cite" href={hit.source_url} target="_blank" rel="noopener noreferrer" key={hit.passage_id}>{hit.title} ↗</a>)}</div></div>)}</div>}
            {chatClarification && <p className="chat-clarification" role="status">{chatClarification}</p>}
            {chatError && <p className="form-alert" role="alert">{chatError}</p>}
            <div className="suggested-prompts"><span>Try asking</span>{["Explain a source simply", "How could I file a complaint?", "What should I check next?"].map((item) => <button key={item} type="button" onClick={(event) => sendMessage(event, item)} disabled={chatLoading}>{item} <ArrowUpRight size={13} /></button>)}</div>
            <form className="chat-form" onSubmit={(event) => sendMessage(event)}><label htmlFor="chat-input" className="sr-only">Ask a follow-up question</label><textarea id="chat-input" rows={3} maxLength={2000} value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Ask a follow-up. Avoid personal details." /><button className="button button-green chat-send" disabled={chatLoading || !chatText.trim()}>{chatLoading ? <span className="spinner-small" /> : <><Send size={15} /> Send</>}</button></form>
            <p className="chat-disclaimer">{chatLoading ? "Checking source collection…" : "A follow-up is not professional legal advice. Only submit details you’re comfortable sharing."}</p>
          </section>
          <div className="aside-limit"><CircleAlert size={17} /><p><strong>Coverage is limited</strong><br />Selected India-wide central-law records only. State laws and verified local contacts are not available in this prototype.</p></div>
          <button type="button" className="button button-outline aside-reset" onClick={onReset}><RotateCcw size={15} /> Start new case</button>
        </aside>
      </div>
      <div className="result-disclaimer"><ShieldCheck size={16} /><p>General legal information only—not legal advice. Check original sources and seek qualified assistance for advice about a specific situation.</p></div>
    </main>
  );
}
