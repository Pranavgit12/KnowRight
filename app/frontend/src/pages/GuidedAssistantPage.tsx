import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import { CaseStudies } from "@/components/CaseStudies";
import { GuidedLegalChat } from "@/components/GuidedLegalChat";
import { GrievancePortals } from "@/components/GrievancePortals";
import { useJurisdiction } from "@/components/JurisdictionProvider";
import { JusticeScene } from "@/components/JusticeScene";
import { useLanguage } from "@/components/LanguageProvider";
import { RightsLibrary } from "@/components/RightsLibrary";
import { getAssistantStatus } from "@/services/legalInfoService.ts";
import type { Jurisdiction } from "@/types/legal";

export function GuidedAssistantPage() {
  const { jurisdiction, setJurisdiction } = useJurisdiction();
  const { language, t } = useLanguage();
  const [problem, setProblem] = useState("");
  const [providerConfigured, setProviderConfigured] = useState(false);
  const [providerConfigurationError, setProviderConfigurationError] = useState(false);
  const [providerConsent, setProviderConsent] = useState(false);

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

  return (
    <>
      <section className="assistant-hero page-wrap" id="home" aria-labelledby="assistant-title">
        <div className="assistant-hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> {t("disclaimer")}</p>
          <h1 id="assistant-title">Your Problem.<br /><span>Your Rights.</span><br />Your Next Step.</h1>
          <p className="assistant-hero-intro">
            {language === "hi"
              ? "अपनी स्थिति सरल भाषा में बताइए। मैं एक बार में एक सवाल पूछूँगा/पूछूँगी और उपलब्ध स्रोतों से अगले कदम समझने में मदद करूँगा/करूँगी।"
              : language === "te"
                ? "మీ పరిస్థితిని సరళమైన భాషలో చెప్పండి. ఒక్కసారి ఒక ప్రశ్న అడిగి, అందుబాటులో ఉన్న మూలాల ఆధారంగా తదుపరి అడుగు చూపుతాను."
                : "Tell me what happened in your own words. I’ll ask one question at a time and help you find a practical next step."}
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

          <GuidedLegalChat
            jurisdiction={jurisdiction}
            providerConfigured={providerConfigured}
            providerConsent={providerConsent}
            onProviderConsentChange={setProviderConsent}
            onSituationChange={setProblem}
          />
          {providerConfigurationError && <p className="provider-warning" role="status">{t("providerStatusError")}</p>}
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
        <a href="#problem">{t("inspectSources")} <ArrowUpRight size={16} aria-hidden="true" /></a>
      </section>
      <GrievancePortals problem={problem} />
      <CaseStudies />
      <RightsLibrary />
    </>
  );
}
