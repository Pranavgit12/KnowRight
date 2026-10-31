import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppLanguage = "en" | "hi" | "te";

const translations = {
  en: {
    home: "Home", ask: "Ask", rights: "Rights", sources: "Sources", grievance: "Grievance Portal", caseStudiesTab: "Case studies",
    askQuestion: "Ask a question", welcome: "Tell me what happened",
    welcomeBody: "Describe your situation in your own words. I’ll ask one question at a time and show the sources behind any information I can provide.",
    placeholder: "Type your message… Please leave out names and sensitive details.",
    send: "Send", sending: "Thinking…", newChat: "New conversation",
    history: "Recent conversations", currentChat: "Current conversation",
    privacy: "Your message is sent only after you press Send. Conversations are kept in this page only and are not saved to the server by default.",
    disclaimer: "Legal awareness and general information only—not legal advice.",
    sourceOnly: "Source search only · AI responses are unavailable until a server provider is configured.",
    consent: "I agree to send this conversation and retrieved source passages to the configured AI provider for this request. I have omitted sensitive details.",
    analysis: "Legal information and source matches", rightsHeading: "Your Rights",
    lawsHeading: "Applicable Laws", solutionsHeading: "Recommended Solutions",
    authorityHeading: "Where to File a Complaint", stepsHeading: "Legal Action · How to Proceed",
    portalsHeading: "Grievance Portal", noSources: "No relevant approved source was found. This does not mean no law or remedy exists.",
    needHelp: "For advice about your circumstances, speak with a qualified lawyer or legal-aid service.",
    errorGeneric: "The assistant could not complete this request. Please try again.",
    jurisdiction: "Jurisdiction", indiaCentral: "India · central law",
    selectLanguage: "Website language", english: "English", hindi: "हिंदी", telugu: "తెలుగు",
    assistantRole: "Know U Right", you: "You", question: "Question", voiceUnavailable: "Voice input is not supported in this browser.",
    startMessage: "Start by describing what happened and where it happened. You can share details gradually.",
    sourceSearch: "Source search", aiAssisted: "AI-assisted · check the sources",
    topic: "Topic", documents: "Potentially useful documents", next: "Possible next steps",
    officialPortal: "Visit Official Portal", portalUse: "What it handles", portalWho: "Who can use it",
    portalCaution: "Portals are not interchangeable. Check eligibility and jurisdiction before filing.",
    solution: "Analysis", voiceInput: "Voice input",
    coverage: "Current source coverage", coverageValue: "India · central law only",
    summary: "Your information summary", nextClearer: "Your next step, made clearer.",
    aiGrounded: "AI-assisted · grounded in retrieved sources",
    retrievalNoMatch: "Source search · no relevant approved passages",
    retrievalNoProvider: "Source search · no AI provider configured",
    generatedUnavailable: "Generated analysis is unavailable.",
    noAIRequested: "No relevant approved source passages were found, so no AI analysis was requested.",
    noProvider: "No AI provider is configured.",
    sourceMatchesNotAnalysis: "This demo uses keyword search only. It has not generated or verified a legal analysis, and source matches may not answer your question.",
    sourceGroundedExplanation: "An AI provider drafted this general-information response using only the source passages shown below. Check every source; the result is not legal advice.",
    summaryLabel: "Your information summary", sourcePassages: "Source passages used",
    sourceCount: "source", sourceCountPlural: "sources", openSource: "Open source record",
    publicationUnavailable: "Publication date not available", published: "Published",
    effective: "Effective", possibleCategory: "Possible category",
    noSourceNotice: "I could not verify a relevant passage in the available approved sources. This does not mean no law or help exists.",
    generalDisclaimer: "General legal information only—not legal advice. Check original sources and seek qualified help for advice about your situation.",
    copySolution: "Copy Solution", downloadSolution: "Download Solution", saveSolution: "Save My Solution",
    copyDone: "Solution copied.", copyFailed: "Copy is unavailable in this browser. Use Download or Save instead.",
    downloadDone: "Downloaded to your device.", searching: "Searching the local source collection.",
    sourceCoverage: "Source coverage", selectedSources: "Selected India-wide central-law summaries.",
    coverageDetails: "The current collection includes selected passages from three central Acts. It is not state-specific, comprehensive, or guaranteed current.",
    inspectSources: "Inspect source passages after a search",
    howWorks: "How this tool works", sourcesFirst: "Sources first. Uncertainty in the open.",
    howWorksBody: "Know U Right searches a small local collection before showing references. It does not pretend a missing source is an answer.",
    stepChoose: "Choose a place", stepChooseBody: "The current collection is limited to selected India-wide central-law records.",
    stepSearch: "Search the sources", stepSearchBody: "Keyword retrieval finds possible passages; it is not legal research or AI analysis.",
    stepVerify: "Check the original", stepVerifyBody: "Follow citations, verify current status, and ask a qualified professional when needed.",
    providerStatusError: "AI provider settings could not be verified. No generated answer will be provided.",
    coverageOther: "Other location / not sure", coverageChoose: "Choose coverage",
    externalConsentError: "Please confirm the AI provider privacy notice before sending.",
    mainNavigation: "Main navigation", footerNavigation: "Footer navigation",
    footerEyebrow: "A public legal information tool", footerHeadline: "A clearer next step starts with a question.",
    footerIntro: "Explore everyday topics, check the source behind a passage, and take your time deciding where to go next.",
    footerAsk: "Ask a question", footerDisclaimer: "General legal information, not legal advice. This demo searches a limited collection of selected India-wide central-law sources. Check the original source and seek qualified help for advice about your situation.",
    explorePortals: "Explore grievance portals", backHome: "Back to home",
    casesEyebrow: "Real cases · carefully framed", casesTitle: "How rights questions reached the courts.",
    casesIntro: "Short summaries of published Supreme Court decisions. They describe what the cases addressed, not a promise that another situation will have the same outcome.",
    furtherReading: "Further reading: Fundamental Rights overview", secondaryReading: "Vajiram & Ravi editorial explainer · secondary reading, not a legal authority",
    importantLimit: "Important limit:", readJudgment: "Read judgment text", searchableCopy: "(searchable reproduction)",
    libraryEyebrow: "A small, source-led library", libraryTitle: "Explore the records we have.",
    libraryIntro: "Selected central-law summaries from the local project corpus, not a complete or current statement of the law.",
    loadingSources: "Loading approved source records…", noSourceRecords: "No approved records are available in the connected source collection.",
    originalRecord: "Open original record", originalLanguage: "Source text is shown in its original language.",
  },
  hi: {
    caseStudiesTab: "न्यायिक मामले",
    home: "होम", ask: "पूछें", rights: "अधिकार", sources: "स्रोत", grievance: "शिकायत पोर्टल",
    askQuestion: "सवाल पूछें", welcome: "बताइए क्या हुआ",
    welcomeBody: "अपनी स्थिति अपने शब्दों में बताएं। मैं एक बार में एक सवाल पूछूँगा और उपलब्ध जानकारी के स्रोत दिखाऊँगा।",
    placeholder: "अपना संदेश लिखें… कृपया नाम और संवेदनशील जानकारी न दें।",
    send: "भेजें", sending: "सोच रहा है…", newChat: "नई बातचीत",
    history: "हाल की बातचीत", currentChat: "वर्तमान बातचीत",
    privacy: "आपका संदेश केवल भेजें दबाने पर भेजा जाता है। बातचीत इसी पृष्ठ में रहती है और डिफ़ॉल्ट रूप से सर्वर पर सहेजी नहीं जाती।",
    disclaimer: "केवल कानूनी जागरूकता और सामान्य जानकारी—कानूनी सलाह नहीं।",
    sourceOnly: "केवल स्रोत खोज · सर्वर AI प्रदाता सेट होने तक AI उत्तर उपलब्ध नहीं हैं।",
    consent: "मैं इस अनुरोध के लिए बातचीत और मिले स्रोत-अंशों को कॉन्फ़िगर किए गए AI प्रदाता को भेजने की सहमति देता/देती हूँ। मैंने संवेदनशील जानकारी हटा दी है।",
    analysis: "कानूनी जानकारी और स्रोत मिलान", rightsHeading: "आपके अधिकार",
    lawsHeading: "लागू कानून", solutionsHeading: "सुझाए गए कदम",
    authorityHeading: "शिकायत कहाँ करें", stepsHeading: "कानूनी प्रक्रिया · आगे कैसे बढ़ें",
    portalsHeading: "शिकायत पोर्टल", noSources: "कोई संबंधित अनुमोदित स्रोत नहीं मिला। इसका अर्थ यह नहीं कि कोई कानून या उपाय मौजूद नहीं है।",
    needHelp: "अपनी स्थिति पर सलाह के लिए योग्य वकील या कानूनी सहायता सेवा से बात करें।",
    errorGeneric: "सहायक अनुरोध पूरा नहीं कर सका। कृपया फिर प्रयास करें।",
    jurisdiction: "क्षेत्राधिकार", indiaCentral: "भारत · केंद्रीय कानून",
    selectLanguage: "वेबसाइट की भाषा", english: "English", hindi: "हिंदी", telugu: "తెలుగు",
    assistantRole: "Know U Right", you: "आप", question: "सवाल", voiceUnavailable: "इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।",
    startMessage: "शुरुआत में बताएं कि क्या हुआ और कहाँ हुआ। आप धीरे-धीरे जानकारी दे सकते हैं।",
    sourceSearch: "स्रोत खोज", aiAssisted: "AI सहायता · स्रोत जाँचें",
    topic: "विषय", documents: "संभावित उपयोगी दस्तावेज़", next: "संभावित अगले कदम",
    officialPortal: "आधिकारिक पोर्टल पर जाएँ", portalUse: "यह किस प्रकार की शिकायत देखता है", portalWho: "कौन उपयोग कर सकता है",
    portalCaution: "सभी पोर्टल एक जैसे नहीं हैं। शिकायत करने से पहले पात्रता और क्षेत्राधिकार जाँचें।",
    solution: "जानकारी", voiceInput: "वॉइस इनपुट",
    coverage: "स्रोतों का दायरा", coverageValue: "भारत · केवल केंद्रीय कानून",
    summary: "आपकी जानकारी का सार", nextClearer: "आपका अगला कदम अब और स्पष्ट।",
    aiGrounded: "AI सहायता · मिले स्रोतों पर आधारित",
    retrievalNoMatch: "स्रोत खोज · संबंधित अनुमोदित अंश नहीं मिले",
    retrievalNoProvider: "स्रोत खोज · AI प्रदाता सेट नहीं है",
    generatedUnavailable: "AI-आधारित विश्लेषण उपलब्ध नहीं है।",
    noAIRequested: "संबंधित अनुमोदित स्रोत नहीं मिले, इसलिए AI विश्लेषण नहीं माँगा गया।",
    noProvider: "कोई AI प्रदाता सेट नहीं है।",
    sourceMatchesNotAnalysis: "यह डेमो केवल शब्दों के आधार पर खोज करता है। इसने कानूनी विश्लेषण नहीं बनाया या सत्यापित किया है; मिले स्रोत आपके सवाल का उत्तर न भी दें।",
    sourceGroundedExplanation: "AI प्रदाता ने नीचे दिखाए गए स्रोत-अंशों के आधार पर सामान्य जानकारी तैयार की है। हर स्रोत जाँचें; यह कानूनी सलाह नहीं है।",
    summaryLabel: "आपकी जानकारी का सार", sourcePassages: "उपयोग किए गए स्रोत अंश",
    sourceCount: "स्रोत", sourceCountPlural: "स्रोत", openSource: "मूल स्रोत रिकॉर्ड खोलें",
    publicationUnavailable: "प्रकाशन तिथि उपलब्ध नहीं", published: "प्रकाशित",
    effective: "प्रभावी", possibleCategory: "संभावित विषय",
    noSourceNotice: "उपलब्ध अनुमोदित स्रोतों में संबंधित अंश सत्यापित नहीं हुआ। इसका अर्थ यह नहीं कि कोई कानून या सहायता नहीं है।",
    generalDisclaimer: "केवल सामान्य कानूनी जानकारी—कानूनी सलाह नहीं। मूल स्रोत जाँचें और अपनी स्थिति पर योग्य सहायता लें।",
    copySolution: "जानकारी कॉपी करें", downloadSolution: "जानकारी डाउनलोड करें", saveSolution: "जानकारी प्रिंट करें",
    copyDone: "जानकारी कॉपी की गई।", copyFailed: "इस ब्राउज़र में कॉपी उपलब्ध नहीं है। डाउनलोड या प्रिंट करें।",
    downloadDone: "आपके डिवाइस पर डाउनलोड किया गया।", searching: "स्थानीय स्रोत खोजे जा रहे हैं।",
    sourceCoverage: "स्रोतों का दायरा", selectedSources: "चयनित भारत-व्यापी केंद्रीय कानून सारांश।",
    coverageDetails: "वर्तमान संग्रह में तीन केंद्रीय अधिनियमों के चुनिंदा अंश हैं। यह राज्य-विशिष्ट या व्यापक नहीं है और इसकी वर्तमानता की गारंटी नहीं है।",
    inspectSources: "खोज के बाद स्रोत अंश देखें",
    howWorks: "यह टूल कैसे काम करता है", sourcesFirst: "पहले स्रोत। अनिश्चितता स्पष्ट।",
    howWorksBody: "संदर्भ दिखाने से पहले Know U Right छोटे स्थानीय संग्रह में खोजता है। स्रोत न मिलने पर उसे उत्तर नहीं बताता।",
    stepChoose: "स्थान चुनें", stepChooseBody: "वर्तमान संग्रह में भारत-व्यापी केंद्रीय कानून के चुनिंदा रिकॉर्ड हैं।",
    stepSearch: "स्रोत खोजें", stepSearchBody: "शब्द मिलान संभावित अंश ढूँढ़ता है; यह कानूनी शोध या AI विश्लेषण नहीं है।",
    stepVerify: "मूल स्रोत जाँचें", stepVerifyBody: "संदर्भ देखें, वर्तमान स्थिति जाँचें और ज़रूरत पड़ने पर योग्य विशेषज्ञ से पूछें।",
    providerStatusError: "AI प्रदाता सेटिंग सत्यापित नहीं हो सकीं। कोई AI उत्तर नहीं दिया जाएगा।",
    coverageOther: "अन्य स्थान / निश्चित नहीं", coverageChoose: "क्षेत्र चुनें",
    externalConsentError: "भेजने से पहले AI प्रदाता गोपनीयता सूचना की पुष्टि करें।",
    mainNavigation: "मुख्य नेविगेशन", footerNavigation: "फ़ुटर नेविगेशन",
    footerEyebrow: "सार्वजनिक कानूनी जानकारी का टूल", footerHeadline: "स्पष्ट अगला कदम एक सवाल से शुरू होता है।",
    footerIntro: "रोज़मर्रा के विषय देखें, स्रोत जाँचें और आगे का रास्ता सोचने के लिए समय लें।",
    footerAsk: "सवाल पूछें", footerDisclaimer: "सामान्य कानूनी जानकारी, कानूनी सलाह नहीं। यह डेमो भारत-व्यापी केंद्रीय कानूनों के चुनिंदा स्रोतों में खोजता है। मूल स्रोत जाँचें और अपनी स्थिति पर योग्य सहायता लें।",
    explorePortals: "शिकायत पोर्टल देखें", backHome: "होम पर लौटें",
    casesEyebrow: "वास्तविक मामले · सावधानी से प्रस्तुत", casesTitle: "अधिकारों के सवाल अदालतों तक कैसे पहुँचे।",
    casesIntro: "प्रकाशित सुप्रीम कोर्ट निर्णयों के संक्षिप्त सार। ये मामलों का विषय बताते हैं, किसी अन्य स्थिति के समान परिणाम का वादा नहीं।",
    furtherReading: "आगे पढ़ें: मौलिक अधिकारों का परिचय", secondaryReading: "वजीराम एंड रवि का संपादकीय विवरण · अतिरिक्त पठन, कानूनी प्राधिकरण नहीं",
    importantLimit: "महत्वपूर्ण सीमा:", readJudgment: "निर्णय का पाठ पढ़ें", searchableCopy: "(खोजने योग्य पुनर्प्रकाशन)",
    libraryEyebrow: "छोटी, स्रोत-आधारित लाइब्रेरी", libraryTitle: "उपलब्ध रिकॉर्ड देखें।",
    libraryIntro: "स्थानीय परियोजना संग्रह के चुनिंदा केंद्रीय कानून सारांश; कानून का पूर्ण या वर्तमान विवरण नहीं।",
    loadingSources: "अनुमोदित स्रोत रिकॉर्ड लोड हो रहे हैं…", noSourceRecords: "जुड़े स्रोत संग्रह में कोई अनुमोदित रिकॉर्ड उपलब्ध नहीं है।",
    originalRecord: "मूल रिकॉर्ड खोलें", originalLanguage: "स्रोत का पाठ उसकी मूल भाषा में दिखाया गया है।",
  },
  te: {
    caseStudiesTab: "న్యాయ కేసులు",
    home: "హోమ్", ask: "అడగండి", rights: "హక్కులు", sources: "మూలాలు", grievance: "ఫిర్యాదు పోర్టల్",
    askQuestion: "ప్రశ్న అడగండి", welcome: "ఏం జరిగిందో చెప్పండి",
    welcomeBody: "మీ పరిస్థితిని మీ మాటల్లో వివరించండి. నేను ఒక్కోసారి ఒక ప్రశ్న అడిగి, అందుబాటులో ఉన్న సమాచారానికి మూలాలను చూపిస్తాను.",
    placeholder: "మీ సందేశాన్ని టైప్ చేయండి… పేర్లు, సున్నితమైన వివరాలు ఇవ్వకండి.",
    send: "పంపండి", sending: "ఆలోచిస్తోంది…", newChat: "కొత్త సంభాషణ",
    history: "ఇటీవలి సంభాషణలు", currentChat: "ప్రస్తుత సంభాషణ",
    privacy: "పంపు నొక్కిన తర్వాతే మీ సందేశం పంపబడుతుంది. సంభాషణ ఈ పేజీలో మాత్రమే ఉంటుంది; సాధారణంగా సర్వర్‌లో భద్రపరచబడదు.",
    disclaimer: "న్యాయ అవగాహన, సాధారణ సమాచారం మాత్రమే—న్యాయ సలహా కాదు.",
    sourceOnly: "మూలాల శోధన మాత్రమే · సర్వర్ AI ప్రొవైడర్ అమర్చే వరకు AI సమాధానాలు అందుబాటులో ఉండవు.",
    consent: "ఈ అభ్యర్థన కోసం ఈ సంభాషణను, పొందిన మూల భాగాలను కాన్ఫిగర్ చేసిన AI ప్రొవైడర్‌కు పంపడానికి అంగీకరిస్తున్నాను. సున్నితమైన వివరాలను తొలగించాను.",
    analysis: "న్యాయ సమాచారం మరియు మూలాల సరిపోలికలు", rightsHeading: "మీ హక్కులు",
    lawsHeading: "వర్తించే చట్టాలు", solutionsHeading: "సిఫార్సు చేయబడిన పరిష్కారాలు",
    authorityHeading: "ఫిర్యాదు ఎక్కడ చేయాలి", stepsHeading: "న్యాయ చర్య · ఎలా ముందుకు వెళ్లాలి",
    portalsHeading: "ఫిర్యాదు పోర్టల్", noSources: "సంబంధిత ఆమోదిత మూలం కనబడలేదు. దీనర్థం చట్టం లేదా పరిష్కారం లేదని కాదు.",
    needHelp: "మీ పరిస్థితిపై సలహా కోసం అర్హత కలిగిన న్యాయవాది లేదా న్యాయ సహాయ సేవను సంప్రదించండి.",
    errorGeneric: "సహాయకుడు అభ్యర్థనను పూర్తి చేయలేకపోయాడు. మళ్లీ ప్రయత్నించండి.",
    jurisdiction: "న్యాయ పరిధి", indiaCentral: "భారతదేశం · కేంద్ర చట్టం",
    selectLanguage: "వెబ్‌సైట్ భాష", english: "English", hindi: "हिंदी", telugu: "తెలుగు",
    assistantRole: "Know U Right", you: "మీరు", question: "ప్రశ్న", voiceUnavailable: "ఈ బ్రౌజర్‌లో వాయిస్ ఇన్‌పుట్‌కు మద్దతు లేదు.",
    startMessage: "ఏం జరిగింది, ఎక్కడ జరిగింది చెప్పి ప్రారంభించండి. వివరాలను క్రమంగా పంచుకోవచ్చు.",
    sourceSearch: "మూలాల శోధన", aiAssisted: "AI సహాయం · మూలాలను తనిఖీ చేయండి",
    topic: "విషయం", documents: "ఉపయోగపడే అవకాశం ఉన్న పత్రాలు", next: "తదుపరి సాధ్యమైన చర్యలు",
    officialPortal: "అధికారిక పోర్టల్‌ను సందర్శించండి", portalUse: "ఇది ఏ ఫిర్యాదులను చూస్తుంది", portalWho: "ఎవరు ఉపయోగించవచ్చు",
    portalCaution: "పోర్టల్స్ అన్నీ ఒకేలా ఉండవు. ఫిర్యాదు చేయడానికి ముందు అర్హత, పరిధిని తనిఖీ చేయండి.",
    solution: "విశ్లేషణ", voiceInput: "వాయిస్ ఇన్‌పుట్",
    coverage: "ప్రస్తుత మూలాల పరిధి", coverageValue: "భారతదేశం · కేంద్ర చట్టాలు మాత్రమే",
    summary: "మీ సమాచారం సారాంశం", nextClearer: "మీ తదుపరి అడుగు మరింత స్పష్టంగా.",
    aiGrounded: "AI సహాయం · పొందిన మూలాల ఆధారంగా",
    retrievalNoMatch: "మూలాల శోధన · సంబంధిత ఆమోదిత భాగాలు లేవు",
    retrievalNoProvider: "మూలాల శోధన · AI ప్రొవైడర్ అమర్చలేదు",
    generatedUnavailable: "AI రూపొందించిన విశ్లేషణ అందుబాటులో లేదు.",
    noAIRequested: "సంబంధిత ఆమోదిత మూల భాగాలు లేవు, కాబట్టి AI విశ్లేషణ కోరలేదు.",
    noProvider: "AI ప్రొవైడర్ అమర్చలేదు.",
    sourceMatchesNotAnalysis: "ఈ డెమో పదాల ఆధారంగా మాత్రమే శోధిస్తుంది. ఇది న్యాయ విశ్లేషణను రూపొందించలేదు లేదా ధృవీకరించలేదు; మూలాల సరిపోలికలు మీ ప్రశ్నకు సమాధానం కాకపోవచ్చు.",
    sourceGroundedExplanation: "క్రింద చూపిన మూల భాగాల ఆధారంగా AI ప్రొవైడర్ ఈ సాధారణ సమాచారాన్ని రూపొందించింది. ప్రతి మూలాన్ని తనిఖీ చేయండి; ఇది న్యాయ సలహా కాదు.",
    summaryLabel: "మీ సమాచారం సారాంశం", sourcePassages: "ఉపయోగించిన మూల భాగాలు",
    sourceCount: "మూలం", sourceCountPlural: "మూలాలు", openSource: "మూల రికార్డును తెరవండి",
    publicationUnavailable: "ప్రచురణ తేదీ అందుబాటులో లేదు", published: "ప్రచురణ",
    effective: "అమలులోకి", possibleCategory: "సంభావ్య అంశం",
    noSourceNotice: "అందుబాటులో ఉన్న ఆమోదిత మూలాల్లో సంబంధిత భాగాన్ని ధృవీకరించలేకపోయాం. చట్టం లేదా సహాయం లేదని దీని అర్థం కాదు.",
    generalDisclaimer: "సాధారణ న్యాయ సమాచారం మాత్రమే—న్యాయ సలహా కాదు. అసలు మూలాలను తనిఖీ చేసి, మీ పరిస్థితికి అర్హత కలిగిన సహాయం పొందండి.",
    copySolution: "సమాచారాన్ని కాపీ చేయండి", downloadSolution: "సమాచారాన్ని డౌన్‌లోడ్ చేయండి", saveSolution: "సమాచారాన్ని ముద్రించండి",
    copyDone: "సమాచారం కాపీ చేయబడింది.", copyFailed: "ఈ బ్రౌజర్‌లో కాపీ అందుబాటులో లేదు. డౌన్‌లోడ్ లేదా ముద్రించండి.",
    downloadDone: "మీ పరికరానికి డౌన్‌లోడ్ చేయబడింది.", searching: "స్థానిక మూలాల సేకరణను శోధిస్తోంది.",
    sourceCoverage: "మూలాల పరిధి", selectedSources: "ఎంచుకున్న భారతదేశవ్యాప్త కేంద్ర చట్టాల సారాంశాలు.",
    coverageDetails: "ప్రస్తుత సేకరణలో మూడు కేంద్ర చట్టాల నుంచి ఎంపిక చేసిన భాగాలు ఉన్నాయి. ఇది రాష్ట్ర-నిర్దిష్టం కాదు, సమగ్రం కాదు; తాజాదనానికి హామీ లేదు.",
    inspectSources: "శోధించిన తర్వాత మూల భాగాలను చూడండి",
    howWorks: "ఈ సాధనం ఎలా పనిచేస్తుంది", sourcesFirst: "ముందుగా మూలాలు. అనిశ్చితి స్పష్టంగా.",
    howWorksBody: "సూచనలు చూపే ముందు Know U Right చిన్న స్థానిక సేకరణలో శోధిస్తుంది. మూలం దొరకకపోతే దానిని సమాధానంగా చూపదు.",
    stepChoose: "ప్రాంతాన్ని ఎంచుకోండి", stepChooseBody: "ప్రస్తుత సేకరణలో భారతదేశవ్యాప్త కేంద్ర చట్టాల ఎంపిక చేసిన రికార్డులే ఉన్నాయి.",
    stepSearch: "మూలాలను శోధించండి", stepSearchBody: "పదాల సరిపోలిక సాధ్యమైన భాగాలను కనుగొంటుంది; ఇది న్యాయ పరిశోధన లేదా AI విశ్లేషణ కాదు.",
    stepVerify: "అసలు మూలాన్ని తనిఖీ చేయండి", stepVerifyBody: "సూచనలను అనుసరించండి, ప్రస్తుత స్థితిని తనిఖీ చేయండి, అవసరమైతే అర్హత కలిగిన నిపుణుడిని అడగండి.",
    providerStatusError: "AI ప్రొవైడర్ సెట్టింగ్‌లను ధృవీకరించలేకపోయాం. రూపొందించిన సమాధానం ఇవ్వబడదు.",
    coverageOther: "ఇతర ప్రదేశం / తెలియదు", coverageChoose: "పరిధిని ఎంచుకోండి",
    externalConsentError: "పంపడానికి ముందు AI ప్రొవైడర్ గోప్యతా సమాచారాన్ని నిర్ధారించండి.",
    mainNavigation: "ప్రధాన నావిగేషన్", footerNavigation: "ఫుటర్ నావిగేషన్",
    footerEyebrow: "ప్రజా న్యాయ సమాచార సాధనం", footerHeadline: "స్పష్టమైన తదుపరి అడుగు ఒక ప్రశ్నతో మొదలవుతుంది.",
    footerIntro: "రోజువారీ అంశాలను చూడండి, మూలాన్ని తనిఖీ చేయండి, తదుపరి దారి గురించి ఆలోచించడానికి సమయం తీసుకోండి.",
    footerAsk: "ప్రశ్న అడగండి", footerDisclaimer: "సాధారణ న్యాయ సమాచారం మాత్రమే, న్యాయ సలహా కాదు. ఈ డెమో భారతదేశవ్యాప్త కేంద్ర చట్టాల ఎంపిక చేసిన మూలాలను శోధిస్తుంది. అసలు మూలాన్ని తనిఖీ చేసి, మీ పరిస్థితికి అర్హత కలిగిన సహాయం పొందండి.",
    explorePortals: "ఫిర్యాదు పోర్టల్స్ చూడండి", backHome: "హోమ్‌కు తిరిగి వెళ్ళండి",
    casesEyebrow: "నిజమైన కేసులు · జాగ్రత్తగా వివరించబడినవి", casesTitle: "హక్కుల ప్రశ్నలు కోర్టులకు ఎలా చేరాయి.",
    casesIntro: "ప్రచురిత సుప్రీంకోర్టు తీర్పుల సంక్షిప్త సారాంశాలు. అవి కేసులు ఏమి పరిశీలించాయో వివరిస్తాయి; ఇతర పరిస్థితులకూ అదే ఫలితం వస్తుందని హామీ కాదు.",
    furtherReading: "మరింత చదవండి: ప్రాథమిక హక్కుల పరిచయం", secondaryReading: "వజీరామ్ & రవి సంపాదకీయ వివరణ · అదనపు పఠనం, న్యాయాధికారం కాదు",
    importantLimit: "ముఖ్యమైన పరిమితి:", readJudgment: "తీర్పు పాఠ్యాన్ని చదవండి", searchableCopy: "(శోధించగల పునర్ముద్రణ)",
    libraryEyebrow: "చిన్న, మూలాధారిత గ్రంథాలయం", libraryTitle: "మా వద్ద ఉన్న రికార్డులను చూడండి.",
    libraryIntro: "స్థానిక ప్రాజెక్ట్ సేకరణలోని ఎంపిక చేసిన కేంద్ర చట్టాల సారాంశాలు; చట్టం యొక్క పూర్తి లేదా ప్రస్తుత వివరణ కాదు.",
    loadingSources: "ఆమోదిత మూల రికార్డులు లోడ్ అవుతున్నాయి…", noSourceRecords: "కనెక్ట్ చేసిన మూలాల సేకరణలో ఆమోదిత రికార్డులు లేవు.",
    originalRecord: "అసలు రికార్డును తెరవండి", originalLanguage: "మూల పాఠ్యం దాని అసలు భాషలో చూపబడింది.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function storedLanguage(): AppLanguage {
  try {
    const stored = sessionStorage.getItem("knowright-language");
    return stored === "hi" || stored === "te" ? stored : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setState] = useState<AppLanguage>(storedLanguage);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const setLanguage = (next: AppLanguage) => {
    setState(next);
    try {
      sessionStorage.setItem("knowright-language", next);
    } catch {
      // The selected language still applies for this page session.
    }
    document.documentElement.lang = next;
  };
  const value = useMemo(
    () => ({ language, setLanguage, t: (key: TranslationKey) => translations[language][key] }),
    [language],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
