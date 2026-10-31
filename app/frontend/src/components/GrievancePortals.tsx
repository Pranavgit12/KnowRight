import { ArrowUpRight, CircleCheck, ExternalLink, Info, Landmark, MessageCircle } from "lucide-react";
import { useLanguage, type AppLanguage } from "@/components/LanguageProvider";

type LocalizedText = { en: string; hi: string; te: string };

type Portal = {
  id: string;
  name: string;
  authority: LocalizedText;
  url: string;
  applies: (description: string) => boolean;
  handles: LocalizedText;
  who: LocalizedText;
  note: LocalizedText;
};

const portals: Portal[] = [
  {
    id: "cpgrams",
    name: "CPGRAMS",
    authority: {
      en: "Government of India",
      hi: "भारत सरकार",
      te: "భారత ప్రభుత్వం",
    },
    url: "https://pgportal.gov.in/",
    applies: (text) => /\b(government|public service|public department|municipal|pension|ration|benefit|scheme|official service|सरकारी|सरकार|लोक सेवा|పౌర సేవ|ప్రభుత్వ|ప్రజా సేవ|పెన్షన్|రేషన్)\b/i.test(text),
    handles: {
      en: "Service-delivery grievances to participating Central Government ministries and State departments.",
      hi: "भाग लेने वाले केंद्र सरकार के मंत्रालयों और राज्य विभागों की सेवा-संबंधी शिकायतें।",
      te: "పాల్గొనే కేంద్ర ప్రభుత్వ మంత్రిత్వ శాఖలు, రాష్ట్ర శాఖల సేవలపై ఫిర్యాదులు.",
    },
    who: {
      en: "Citizens with a grievance about a covered public service.",
      hi: "कवर की गई सार्वजनिक सेवा के बारे में शिकायत रखने वाले नागरिक।",
      te: "సంబంధిత ప్రజా సేవపై ఫిర్యాదు ఉన్న పౌరులు.",
    },
    note: {
      en: "Some categories, including RTI and court-related matters, are excluded. Check the portal's current scope before filing.",
      hi: "RTI और न्यायालय-संबंधी मामलों सहित कुछ श्रेणियाँ इसमें शामिल नहीं हैं। शिकायत से पहले पोर्टल का वर्तमान दायरा देखें।",
      te: "RTI, కోర్టు సంబంధిత అంశాలతో సహా కొన్ని వర్గాలు ఇందులో ఉండవు. ఫిర్యాదు చేసే ముందు పోర్టల్ ప్రస్తుత పరిధిని చూడండి.",
    },
  },
  {
    id: "ncsc",
    name: "National Commission for Scheduled Castes",
    authority: {
      en: "e-Grievance portal",
      hi: "ई-शिकायत पोर्टल",
      te: "ఈ-ఫిర్యాదు పోర్టల్",
    },
    url: "https://ncsccmis.nic.in/",
    applies: (text) => /\b(sc|scheduled caste|caste|untouchab|dalit)\b|अनुसूचित जाति|जाति|దళిత|కులం|షెడ్యూల్డ్ కుల/i.test(text),
    handles: {
      en: "The Commission’s e-Grievance Management portal.",
      hi: "आयोग का ई-शिकायत प्रबंधन पोर्टल।",
      te: "కమిషన్ ఈ-ఫిర్యాదు నిర్వహణ పోర్టల్.",
    },
    who: {
      en: "People seeking to raise an issue within the NCSC’s constitutional and statutory remit.",
      hi: "NCSC के संवैधानिक और वैधानिक अधिकार-क्षेत्र में आने वाला मुद्दा उठाने वाले लोग।",
      te: "NCSC రాజ్యాంగ, చట్టబద్ధ పరిధిలోని సమస్యను తెలియజేయాలనుకునే వారు.",
    },
    note: {
      en: "The keyword match does not establish that the Commission can take up a particular complaint. Check its remit and filing instructions.",
      hi: "शब्दों का मेल यह तय नहीं करता कि आयोग किसी विशेष शिकायत पर कार्रवाई कर सकता है। उसका अधिकार-क्षेत्र और निर्देश देखें।",
      te: "పదాల సరిపోలికతో నిర్దిష్ట ఫిర్యాదును కమిషన్ స్వీకరిస్తుందని నిర్ధారణ కాదు. దాని పరిధి, ఫిర్యాదు సూచనలను చూడండి.",
    },
  },
  {
    id: "nhrc",
    name: "National Human Rights Commission of India",
    authority: {
      en: "National Human Rights Commission",
      hi: "राष्ट्रीय मानवाधिकार आयोग",
      te: "జాతీయ మానవ హక్కుల కమిషన్",
    },
    url: "https://nhrc.nic.in/",
    applies: (text) => /human rights|custod|police|state official|सरकारी अधिकारी|मानवाधिकार|పోలీసు|మానవ హక్కు/i.test(text),
    handles: {
      en: "Information and complaint channels for alleged human-rights violations.",
      hi: "कथित मानवाधिकार उल्लंघनों के लिए जानकारी और शिकायत मार्ग।",
      te: "మానవ హక్కుల ఉల్లంఘన ఆరోపణలపై సమాచారం, ఫిర్యాదు మార్గాలు.",
    },
    who: {
      en: "A person or representative seeking to submit a complaint that falls within NHRC’s remit.",
      hi: "NHRC के अधिकार-क्षेत्र में आने वाली शिकायत देने वाला व्यक्ति या प्रतिनिधि।",
      te: "NHRC పరిధిలోకి వచ్చే ఫిర్యాదు చేయాలనుకునే వ్యక్తి లేదా ప్రతినిధి.",
    },
    note: {
      en: "This opens the official NHRC site; follow its current complaint-registration instructions and admissibility limits.",
      hi: "यह NHRC की आधिकारिक वेबसाइट खोलता है; वहाँ शिकायत-पंजीकरण निर्देश और स्वीकार्यता की सीमाएँ देखें।",
      te: "ఇది అధికారిక NHRC వెబ్‌సైట్‌ను తెరుస్తుంది; ఫిర్యాదు నమోదు సూచనలు, స్వీకరణ పరిమితులను చూడండి.",
    },
  },
  {
    id: "samadhan",
    name: "SAMADHAN",
    authority: {
      en: "Ministry of Labour & Employment",
      hi: "श्रम एवं रोजगार मंत्रालय",
      te: "కార్మిక మరియు ఉపాధి మంత్రిత్వ శాఖ",
    },
    url: "https://samadhan.labour.gov.in/",
    applies: (text) => /employment|employer|workplace|salary|wage|termination|dismiss|labour|job|नौकरी|वेतन|ఉద్యోగం|జీతం/i.test(text),
    handles: {
      en: "Specified industrial disputes, including employment, non-employment, termination, and labour-condition matters handled through the Central Government system.",
      hi: "रोज़गार, बेरोज़गारी, सेवा-समाप्ति और श्रम-शर्तों से जुड़े निर्दिष्ट औद्योगिक विवाद, जो केंद्र सरकार की प्रणाली में आते हैं।",
      te: "కేంద్ర ప్రభుత్వ వ్యవస్థ పరిధిలోని ఉద్యోగం, ఉద్యోగం లేకపోవడం, తొలగింపు, కార్మిక పరిస్థితులకు సంబంధించిన నిర్దిష్ట పారిశ్రామిక వివాదాలు.",
    },
    who: {
      en: "Workers and employers with an eligible industrial dispute; jurisdiction and eligibility depend on the matter.",
      hi: "पात्र औद्योगिक विवाद वाले श्रमिक और नियोक्ता; अधिकार-क्षेत्र मामले पर निर्भर है।",
      te: "అర్హమైన పారిశ్రామిక వివాదం ఉన్న కార్మికులు, యజమానులు; పరిధి సమస్యపై ఆధారపడి ఉంటుంది.",
    },
    note: {
      en: "Not every private-sector hiring or discrimination complaint is an industrial dispute. Check eligibility; State labour departments may have separate channels.",
      hi: "निजी क्षेत्र की हर भर्ती या भेदभाव शिकायत औद्योगिक विवाद नहीं होती। पात्रता जाँचें; राज्य श्रम विभाग के अलग मार्ग हो सकते हैं।",
      te: "ప్రైవేట్ ఉద్యోగ నియామకం లేదా వివక్షపై ప్రతి ఫిర్యాదు పారిశ్రామిక వివాదం కాదు. అర్హతను తనిఖీ చేయండి; రాష్ట్ర కార్మిక శాఖలకు వేరే మార్గాలు ఉండవచ్చు.",
    },
  },
  {
    id: "consumer",
    name: "National Consumer Helpline",
    authority: {
      en: "Department of Consumer Affairs",
      hi: "उपभोक्ता मामले विभाग",
      te: "వినియోగదారుల వ్యవహారాల విభాగం",
    },
    url: "https://consumerhelpline.gov.in/",
    applies: (text) => /consumer|refund|product|service provider|billing|उपभोक्ता|वापसी|వినియోగదారు|రిఫండ్/i.test(text),
    handles: {
      en: "Consumer grievances about goods and services; NCH processes and forwards grievances to the concerned entity.",
      hi: "वस्तुओं और सेवाओं से जुड़ी उपभोक्ता शिकायतें; NCH शिकायत को संबंधित संस्था तक पहुँचाता है।",
      te: "వస్తువులు, సేవలపై వినియోగదారుల ఫిర్యాదులు; NCH వాటిని సంబంధిత సంస్థకు పంపిస్తుంది.",
    },
    who: {
      en: "Consumers seeking help with a goods or services grievance.",
      hi: "वस्तु या सेवा से जुड़ी शिकायत में सहायता चाहने वाले उपभोक्ता।",
      te: "వస్తువు లేదా సేవపై ఫిర్యాదుకు సహాయం కోరే వినియోగదారులు.",
    },
    note: {
      en: "The helpline is a grievance facilitation channel; it is not a court or a guarantee of resolution.",
      hi: "यह हेल्पलाइन शिकायत में सहायता का माध्यम है; यह अदालत नहीं है और समाधान की गारंटी नहीं देती।",
      te: "ఈ హెల్ప్‌లైన్ ఫిర్యాదుకు సహాయ మార్గం మాత్రమే; ఇది కోర్టు కాదు, పరిష్కారానికి హామీ కూడా కాదు.",
    },
  },
];

export function GrievancePortals({ problem }: { problem: string }) {
  const { language, t } = useLanguage();
  const matchedPortals = portals.filter((portal) => portal.applies(problem));

  const copyByLanguage: Record<AppLanguage, {
    title: string;
    intro: string;
    caution: string;
    routeFrom: string;
    routeTo: (count: number) => string;
    possibleMatch: string;
    noMatchTitle: string;
    noMatchBody: string;
  }> = {
    en: {
      title: "Find the right place to raise your issue",
      intro: "Explore official routes that may be relevant to what you described.",
      caution: "Suggested matches use words in your message only. They are not eligibility findings or legal conclusions. Portals are not interchangeable; check eligibility and jurisdiction before filing.",
      routeFrom: "Message keywords",
      routeTo: (count) => `${count} possible official ${count === 1 ? "route" : "routes"}`,
      possibleMatch: "Possible match",
      noMatchTitle: "No keyword-based suggestions yet",
      noMatchBody: "No portal matched the words in this message. That does not determine whether a portal can help. You can describe the public service, organisation, or issue in a little more detail.",
    },
    hi: {
      title: "अपनी समस्या उठाने के लिए सही जगह खोजें",
      intro: "आपकी बताई स्थिति से जुड़े संभावित आधिकारिक मार्ग देखें।",
      caution: "संभावित मेल केवल आपके संदेश के शब्दों पर आधारित हैं। ये पात्रता का निर्धारण या कानूनी निष्कर्ष नहीं हैं। पोर्टल एक-दूसरे के विकल्प नहीं हैं; शिकायत से पहले पात्रता और अधिकार-क्षेत्र जाँचें।",
      routeFrom: "संदेश के शब्द",
      routeTo: (count) => `${count} संभावित आधिकारिक मार्ग`,
      possibleMatch: "संभावित मेल",
      noMatchTitle: "अभी शब्दों के आधार पर कोई सुझाव नहीं",
      noMatchBody: "इस संदेश के शब्दों से कोई पोर्टल मेल नहीं खाया। इससे यह तय नहीं होता कि कोई पोर्टल मदद कर सकता है या नहीं। आप सार्वजनिक सेवा, संस्था या समस्या के बारे में थोड़ा और बता सकते हैं।",
    },
    te: {
      title: "మీ సమస్యను తెలియజేయడానికి సరైన స్థలం కనుగొనండి",
      intro: "మీరు వివరించిన పరిస్థితికి సంబంధించిన అధికారిక మార్గాలను చూడండి.",
      caution: "సూచించిన సరిపోలికలు మీ సందేశంలోని పదాల ఆధారంగా మాత్రమే ఉంటాయి. ఇవి అర్హత నిర్ధారణలు లేదా న్యాయ నిర్ణయాలు కావు. పోర్టల్స్ పరస్పరం ప్రత్యామ్నాయాలు కావు; ఫిర్యాదు చేసే ముందు అర్హత, పరిధిని తనిఖీ చేయండి.",
      routeFrom: "సందేశంలోని పదాలు",
      routeTo: (count) => `${count} సాధ్యమైన అధికారిక మార్గాలు`,
      possibleMatch: "సంభావ్య సరిపోలిక",
      noMatchTitle: "ఇంకా పదాల ఆధారిత సూచనలు లేవు",
      noMatchBody: "ఈ సందేశంలోని పదాలకు ఏ పోర్టల్ సరిపోలలేదు. దీనివల్ల ఏ పోర్టల్ సహాయపడగలదో లేదో నిర్ణయించబడదు. ప్రజా సేవ, సంస్థ లేదా సమస్య గురించి మరికొంత వివరించవచ్చు.",
    },
  };
  const copy = copyByLanguage[language];

  return (
    <section className="grievance-section page-wrap" id="grievance-portals" aria-labelledby="grievance-title">
      <div className="grievance-heading">
        <p className="eyebrow"><Landmark size={14} aria-hidden="true" /> {t("portalsHeading")}</p>
        <h2 id="grievance-title">{copy.title}</h2>
        <p>{copy.intro}</p>
      </div>

      <aside className="grievance-caution" aria-label={language === "hi" ? "महत्वपूर्ण जानकारी" : language === "te" ? "ముఖ్యమైన సమాచారం" : "Important information"}>
        <Info size={18} aria-hidden="true" />
        <p>{copy.caution}</p>
      </aside>

      {matchedPortals.length > 0 ? (
        <>
          <div className="grievance-route" aria-label={`${copy.routeFrom} → ${copy.routeTo(matchedPortals.length)}`}>
            <span className="grievance-route-label"><MessageCircle size={15} aria-hidden="true" />{copy.routeFrom}</span>
            <span className="grievance-route-line" aria-hidden="true"><span /></span>
            <span className="grievance-route-label"><Landmark size={15} aria-hidden="true" />{copy.routeTo(matchedPortals.length)}</span>
          </div>

          <div className="grievance-grid">
            {matchedPortals.map((portal, index) => (
              <article
                className="grievance-card"
                key={portal.id}
                style={{ animationDelay: `${Math.min(index * 90, 360)}ms` }}
              >
                <div className="grievance-card-top">
                  <span className="grievance-card-icon"><Landmark size={18} aria-hidden="true" /></span>
                  <span className="grievance-match"><CircleCheck size={14} aria-hidden="true" />{copy.possibleMatch}</span>
                </div>
                <h3>{portal.name}</h3>
                <p className="grievance-authority">{portal.authority[language]}</p>
                <div className="grievance-details">
                  <div>
                    <h4>{t("portalUse")}</h4>
                    <p>{portal.handles[language]}</p>
                  </div>
                  <div>
                    <h4>{t("portalWho")}</h4>
                    <p>{portal.who[language]}</p>
                  </div>
                </div>
                <p className="grievance-note">{portal.note[language]}</p>
                <a className="grievance-link" href={portal.url} target="_blank" rel="noopener noreferrer">
                  <span>{t("officialPortal")}</span>
                  <ExternalLink size={15} aria-hidden="true" />
                  <ArrowUpRight className="grievance-link-arrow" size={16} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="grievance-empty" role="status">
          <span className="grievance-empty-icon"><Info size={18} aria-hidden="true" /></span>
          <div><h3>{copy.noMatchTitle}</h3><p>{copy.noMatchBody}</p></div>
        </div>
      )}
    </section>
  );
}
