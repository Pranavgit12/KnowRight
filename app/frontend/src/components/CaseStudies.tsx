import { ArrowUpRight, BookOpenText, Scale } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const cases = [
  {
    topic: "CASTE DISCRIMINATION · PRISONS",
    title: "Sukanya Shantha v. Union of India",
    court: "Supreme Court of India · 3 October 2024 · 2024 INSC 753",
    summary:
      "Journalist Sukanya Shantha challenged prison-manual rules that enabled caste-based segregation and the assignment of prison work by caste. The Supreme Court held caste-based discrimination in prison administration unconstitutional and directed governments to remove such practices from prison rules.",
    limit:
      "A constitutional challenge to prison rules—not a criminal prosecution or a ruling under the SC/ST (Prevention of Atrocities) Act.",
    source: "https://indiankanoon.org/doc/137753759/",
  },
  {
    topic: "GENDER IDENTITY · EQUAL RECOGNITION",
    title: "National Legal Services Authority v. Union of India",
    court: "Supreme Court of India · 15 April 2014 · (2014) 5 SCC 438",
    summary:
      "Petitioners including the National Legal Services Authority and transgender activist Laxmi Narayan Tripathi asked the Court to address the legal recognition and unequal treatment of transgender people. The Court recognized transgender people as a third gender and affirmed the right to self-identified gender, with directions to governments on recognition and support.",
    limit:
      "This judgment explains constitutional recognition; it does not resolve every later policy question or an individual person's circumstances.",
    source: "https://indiankanoon.org/doc/193543132/",
  },
  {
    topic: "PUBLIC ACCOUNTABILITY · INVESTIGATIONS",
    title: "Vineet Narain v. Union of India",
    court: "Supreme Court of India · 18 December 1997 · (1998) 1 SCC 226",
    summary:
      "The case followed public-interest petitions alleging that investigative agencies had not properly pursued leads from the Jain diaries, which were said to record hawala payments. The Court monitored the investigation and issued directions aimed at making investigations more accountable and protecting agencies from improper influence.",
    limit:
      "The Court expressly did not decide whether the people named in the allegations were guilty. This is a case about investigative duties and institutional independence—not proof that a particular officer was corrupt.",
    source: "https://indiankanoon.org/doc/1203995/",
  },
];

export function CaseStudies() {
  const { language, t } = useLanguage();
  return (
    <section className="case-studies-section page-wrap" id="case-studies" aria-labelledby="case-studies-title">
      <div className="case-studies-heading">
        <p className="eyebrow">{t("casesEyebrow")}</p>
        <h2 id="case-studies-title">{t("casesTitle")}</h2>
        <p>{t("casesIntro")}</p>
        <a
          className="case-studies-reading"
          href="https://vajiramandravi.com/current-affairs/fundamental-rights-of-indian-constitution/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BookOpenText size={15} aria-hidden="true" />
          {t("furtherReading")}
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <span className="case-studies-editorial-note">{t("secondaryReading")}</span>
      </div>
      <figure className="case-studies-artwork">
        <img
          src="/images/dZifFiT-MBBFbY_o4ppMh9yYwX27GgkdDrdhBGZppMERNB1Zegh5CZKcRBJxlLPbp21RMaqtIRdyxgkyVn_8jJqcG-2o8ickUSx6KJNzzk91hAJzmNmrA-NGHGeVm4e02PlTTqahqUMwizKAe_HtS6_NB6EOy_TX5rnKIqLkehY.jpg"
          alt={language === "hi" ? "तराजू और तलवार पकड़े न्याय की प्रतिमा" : language === "te" ? "తూకపు త్రాసు, ఖడ్గం పట్టుకున్న న్యాయదేవత విగ్రహం" : "Lady Justice statue holding scales and a sword"}
          loading="lazy"
          decoding="async"
          width="1000"
          height="1000"
        />
      </figure>
      <div className="case-study-grid">
        {cases.map((caseStudy) => (
          <article className="case-study-card" key={caseStudy.title}>
            <p className="case-study-topic"><Scale size={14} aria-hidden="true" />{language === "hi"
              ? caseStudy.topic.replace("CASTE DISCRIMINATION · PRISONS", "जातिगत भेदभाव · जेल").replace("GENDER IDENTITY · EQUAL RECOGNITION", "लिंग पहचान · समान मान्यता").replace("PUBLIC ACCOUNTABILITY · INVESTIGATIONS", "सार्वजनिक जवाबदेही · जाँच")
              : language === "te"
                ? caseStudy.topic.replace("CASTE DISCRIMINATION · PRISONS", "కుల వివక్ష · జైళ్లు").replace("GENDER IDENTITY · EQUAL RECOGNITION", "లింగ గుర్తింపు · సమాన గుర్తింపు").replace("PUBLIC ACCOUNTABILITY · INVESTIGATIONS", "ప్రజా జవాబుదారీతనం · దర్యాప్తు")
                : caseStudy.topic}</p>
            <h3>{caseStudy.title}</h3>
            <p className="case-study-court">{caseStudy.court}</p>
            <p className="case-study-summary">{caseStudy.summary}</p>
            <p className="case-study-limit"><strong>{t("importantLimit")}</strong> {caseStudy.limit}</p>
            <a href={caseStudy.source} target="_blank" rel="noopener noreferrer">
              {t("readJudgment")} <span>{t("searchableCopy")}</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
