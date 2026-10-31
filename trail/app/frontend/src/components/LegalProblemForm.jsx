import { useEffect, useState } from "react";
import { ArrowRight, FileUp, Info, LoaderCircle, ShieldCheck } from "lucide-react";
import { CATEGORIES, STATES_AND_TERRITORIES } from "@/types/legal";
import { getAssistantStatus } from "@/services/api";

export default function LegalProblemForm({ onSubmit, initialCategory = "", jurisdiction, setJurisdiction, language, setLanguage }) {
  const [problem, setProblem] = useState("");
  const [state, setState] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [fileName, setFileName] = useState("");
  const [providerConfigured, setProviderConfigured] = useState(false);
  const [providerConsent, setProviderConsent] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    getAssistantStatus()
      .then((status) => {
        if (active) setProviderConfigured(Boolean(status.ai_provider_configured));
      })
      .catch(() => {
        if (active) setStatusError("The assistant API status is unavailable. Check that the backend provides GET /api/status; no demo legal answer will be shown.");
      });
    return () => { active = false; };
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (problem.trim().length < 8) {
      setError("Add a little more detail about what happened and what help you need.");
      return;
    }
    if (!state) {
      setError("Choose the state or union territory where this happened.");
      return;
    }
    if (jurisdiction !== "India (Central)") {
      setError("The connected source collection only supports India-wide central-law records. Change the jurisdiction selector to continue.");
      return;
    }
    if (!category) {
      setError("Choose a topic, or select “Other or not sure”.");
      return;
    }
    if (providerConfigured && !providerConsent) {
      setError("Please review and confirm the external AI provider notice before continuing.");
      return;
    }
    const contextualFollowUp = `Location context: ${state}. Selected topic: ${category}.`;
    setLoading(true);
    try {
      await onSubmit({
        problem: problem.trim(),
        followUp: contextualFollowUp,
        language,
        externalAiConsent: providerConsent,
        state,
        category,
        fileName,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The local assistant could not complete this request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="legal-form" onSubmit={submit}>
      <div className="form-topline"><span className="step-pill">01 <span>·</span> Tell us what happened</span><span className="form-secure"><ShieldCheck size={15} /> No account needed</span></div>
      <label className="form-label" htmlFor="legal-problem">Describe your situation in your own words</label>
      <p className="form-hint">You don’t need legal terms. A few sentences are enough to get started.</p>
      <textarea id="legal-problem" className="problem-input" maxLength={5000} rows={6} value={problem} onChange={(event) => setProblem(event.target.value)} placeholder="What happened? When did it happen? What would you like help understanding?" required />
      <div className="input-footer"><span>Simple English or Hindi</span><span>{problem.length}/5000</span></div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="case-jurisdiction">Source jurisdiction</label>
          <select id="case-jurisdiction" value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value)}>
            <option value="India (Central)">India — central law only</option><option value="not-covered">Other / not covered</option>
          </select>
          <small className="field-note">The state selection below is context only; state-specific sources are not included.</small>
        </div>
        <div className="field">
          <label htmlFor="case-state">State or union territory</label>
          <select id="case-state" value={state} onChange={(event) => setState(event.target.value)} required>
            <option value="">Select location</option>{STATES_AND_TERRITORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="case-category">What is this about?</label>
          <select id="case-category" value={category} onChange={(event) => setCategory(event.target.value)} required>
            <option value="">Select a topic</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="case-language">Response language</label>
          <select id="case-language" value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="auto">Detect automatically</option><option value="en">English</option><option value="hi">Hindi</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="case-file">Optional document (not sent)</label>
          <label className="upload-field" htmlFor="case-file"><FileUp size={17} /><span>{fileName || "Choose a file on this device"}</span><input id="case-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.txt" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} /></label>
          <small className="field-note">For your own reference only. This prototype does not upload it.</small>
        </div>
      </div>
      <div className="coverage-note"><Info size={17} /><p><strong>Important coverage note</strong><br />The connected source collection covers selected India-wide central-law passages only. Choosing a state helps describe context; state-specific laws and advice are not available here.</p></div>
      <div className="privacy-note"><ShieldCheck size={16} /><p>Please leave out names, addresses, account numbers, and sensitive documents. Submitted text is used for this request and isn’t stored by default.</p></div>
      {providerConfigured && <label className="provider-consent"><input type="checkbox" checked={providerConsent} onChange={(event) => setProviderConsent(event.target.checked)} /><span>An external AI provider is configured. I consent to sending my problem and retrieved source passages to that provider to prepare this response.</span></label>}
      {statusError && <p className="form-alert info-alert" role="status">{statusError}</p>}
      {error && <p className="form-alert" role="alert">{error}</p>}
      <button className="button button-green submit-button" type="submit" disabled={loading}>
        {loading ? <><LoaderCircle className="spin" size={17} /> Checking available sources…</> : <>Find My Legal Solution <ArrowRight size={17} /></>}
      </button>
      <p className="form-footnote">General legal information only. Not a substitute for advice from a qualified professional.</p>
    </form>
  );
}
