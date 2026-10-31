import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { useLanguage, type AppLanguage } from "@/components/LanguageProvider";
import { findAssistantResult, findSourcePassages } from "@/services/legalInfoService.ts";
import type { AssistantResult, SourceHit } from "@/types/legal";

type Role = "assistant" | "user";
type Stage = "initial" | "place" | "basis" | "impact" | "context" | "organization" | "specialFollowup" | "state" | "providerFollowup" | "finalizing" | "done";
type IssueTrack = "discrimination" | "consumer" | "domestic-violence" | "rti" | "general";
type ReplyOption = { label: string; value: string };

interface ChatLine {
  id: string;
  role: Role;
  text: string;
  createdAt: string;
  replies?: ReplyOption[];
}

interface GuidedAnswers {
  problem: string;
  issueTrack: IssueTrack;
  place: string;
  basis: string;
  impact: string;
  context: string;
  organization: string;
  state: string;
  additional: string;
}

const EMPTY_ANSWERS: GuidedAnswers = {
  problem: "", issueTrack: "general", place: "", basis: "", impact: "", context: "", organization: "", state: "", additional: "",
};

const CONSTITUTION_URL = "https://www.legislative.gov.in/static/uploads/2025/07/359f70a69695affb9d72f8393102bd2e.pdf";

const copy = {
  en: {
    title: "Let's understand what happened", intro: "A few short questions help me point you toward a useful next step.",
    welcome: "Hi, I’m Know U Right. Tell me what happened in your own words. Please leave out names and private details.",
    empathy: "I’m sorry you’re experiencing this. Discrimination can raise important legal concerns. I’ll ask a few short questions so I can guide you carefully.",
    generalEmpathy: "Thanks for sharing that. I’ll ask one short question at a time, then show what the available information can and cannot tell you.",
    placeQuestion: "Where are you experiencing this?", basisQuestion: "Is this connected to your race or ethnicity, nationality, or appearance?",
    impactQuestion: "Has anyone threatened you, denied you an opportunity or service, or repeatedly treated you unfairly?",
    workQuestion: "Is this a government/public-sector employer or a private company?",
    schoolQuestion: "Was this about being admitted, or treatment after you enrolled?",
    schoolTypeQuestion: "Is the school or college government-run, state-aided, private, or are you unsure?",
    publicQuestion: "Was access to a service or place denied, or were you threatened or physically harmed?",
    onlineQuestion: "Did this involve threats, personal details being shared, or repeated targeting?",
    housingQuestion: "Was a rental or housing opportunity denied, or were you threatened or repeatedly treated unfairly?",
    otherQuestion: "What happened most recently, and what would you like help understanding?",
    stateQuestion: "Which Indian state or Union Territory did this happen in? You can say “not sure.”",
    placeOptions: ["At my workplace", "At my college or school", "In a public place", "At my rented accommodation", "Online", "Somewhere else"],
    basisOptions: ["Race or ethnicity", "Nationality", "Appearance", "I'm not sure"],
    impactOptions: ["Yes", "No", "I'm not sure"],
    workOptions: ["Government / public employer", "Private company", "I'm not sure"],
    schoolOptions: ["Admission", "Treatment after enrolling", "Something else / not sure"],
    schoolTypeOptions: ["Government-run", "State-aided", "Private", "I'm not sure"],
    publicOptions: ["Access or service was denied", "Threatened or harmed", "Both", "I'm not sure"],
    onlineOptions: ["Threats", "Private details shared", "Repeated targeting", "I'm not sure"],
    housingOptions: ["Rental was denied", "Threatened or harmed", "Repeated unfair treatment", "I'm not sure"],
    unsure: "I'm not sure", send: "Send", placeholder: "Type a short answer…", restart: "Restart conversation",
    demo: "Guided demo · no AI provider configured", ready: "Guided flow · optional AI analysis",
    consent: "For this result only, send my problem and answers with retrieved source passages to the configured AI provider. I have left out sensitive details.",
    localNotice: "This guided demo uses preset questions and local source lookup. It does not claim to provide AI analysis.",
    privacy: "Your conversation stays in this page. It is not saved to the server by default.",
    progress: "Question", of: "of", finalizing: "Putting your next steps together…",
    finalMessage: "Thanks for explaining. Here is a short, source-linked guide based on what you shared.",
    aiFailure: "The configured AI provider was unavailable. This card uses the guided demo and retrieved sources only.",
    problemHeading: "Possible legal issue", rightsHeading: "Relevant legal protection", stepsHeading: "What you can do",
    importantHeading: "Important", sourceHeading: "Official source", moreSources: "Other retrieved sources",
    expand: "Read the legal context", generated: "Optional AI draft grounded in the sources below",
    noVerifiedMatch: "This guided demo does not have a verified provision for that issue. It will not guess a law. Consider speaking with a qualified lawyer or legal-aid service.",
    issueRace: "Your answers describe possible unfair treatment connected to {basis} in {place}. This is a concern to assess, not a finding that a law was violated.",
    issueOther: "You described an issue in {place}. The facts may matter, and this short guided flow cannot determine whether an offence or legal violation occurred.",
    workPublic: "Articles 14 and 15(1) may be relevant to discrimination by the State. If the job is employment or appointment under the State, Article 16(2) also expressly addresses discrimination on listed grounds including race.",
    workPrivate: "Articles 14 and 15(1) constrain the State, and Article 16 concerns employment or appointment under the State. They do not automatically create a constitutional claim against every private employer. Other facts, policies, or laws may matter.",
    schoolAdmission: "Article 29(2) says a citizen cannot be denied admission to an educational institution maintained by the State or receiving State aid only on listed grounds, including race and language. It is about admission, not every form of treatment after enrollment.",
    publicAccess: "Article 15(2) covers specified public access, including shops, public restaurants, hotels, places of public entertainment, and certain public facilities. It does not automatically cover every dispute in every public place.",
    stateAction: "Articles 14 and 15(1) may be relevant where the conduct is by the State or a public authority. Article 15(1) lists race among its grounds. A private setting needs separate fact-specific assessment.",
    basisCaution: "Articles 15 and 16 list particular grounds. Race is listed; nationality and appearance are not separately named as grounds in those clauses. How a fact fits the law depends on the full situation.",
    stepOne: "Write down the date, place, exact words or actions, and any witnesses.",
    stepTwo: "Keep original emails, messages, notices, screenshots, and relevant work or school records.",
    stepThree: "Use the relevant internal complaint route or speak with a lawyer or State/District Legal Services Authority about options.",
    disclaimer: "This is general legal information, not legal advice. It does not decide eligibility, prove discrimination, or predict an outcome.",
    constitution: "Constitution of India · official Legislative Department PDF", modeDemo: "Guided demo", modeAI: "AI-assisted draft",
    providerQuestion: "I need one more detail before I can prepare the source-grounded summary:",
    caseStudiesTab: "Case studies",
  },
  hi: {
    title: "आइए समझें कि क्या हुआ", intro: "उपयोगी अगले कदम तक पहुँचने के लिए मैं कुछ छोटे सवाल पूछूँगा/पूछूँगी।",
    welcome: "नमस्ते, मैं Know U Right हूँ। अपनी बात अपने शब्दों में बताइए। कृपया नाम और निजी जानकारी साझा न करें।",
    empathy: "आपको यह अनुभव हो रहा है, इसका मुझे खेद है। भेदभाव से जुड़े कानूनी प्रश्न हो सकते हैं। सही दिशा देने के लिए मैं कुछ छोटे सवाल पूछूँगा/पूछूँगी।",
    generalEmpathy: "यह बात साझा करने के लिए धन्यवाद। मैं एक बार में एक छोटा सवाल पूछूँगा/पूछूँगी, फिर उपलब्ध जानकारी की सीमाएँ बताऊँगा/बताऊँगी।",
    placeQuestion: "यह किस जगह हो रहा है?", basisQuestion: "क्या यह आपकी नस्ल या जातीय पहचान, राष्ट्रीयता या रूप-रंग से जुड़ा है?",
    impactQuestion: "क्या किसी ने धमकी दी, अवसर या सेवा से वंचित किया, या बार-बार अनुचित व्यवहार किया?",
    workQuestion: "क्या यह सरकारी/सार्वजनिक क्षेत्र का नियोक्ता है या निजी कंपनी?",
    schoolQuestion: "क्या यह प्रवेश से जुड़ा था या प्रवेश के बाद के व्यवहार से?",
    schoolTypeQuestion: "स्कूल या कॉलेज सरकारी, सरकारी सहायता-प्राप्त, निजी है या आपको पता नहीं?",
    publicQuestion: "क्या किसी सेवा या जगह तक पहुँच रोकी गई, या आपको धमकी दी गई/शारीरिक नुकसान पहुँचाया गया?",
    onlineQuestion: "क्या इसमें धमकी, निजी जानकारी साझा करना या बार-बार निशाना बनाना शामिल था?",
    housingQuestion: "क्या किराये/आवास का अवसर रोका गया, या आपको धमकी अथवा बार-बार अनुचित व्यवहार मिला?",
    otherQuestion: "हाल में क्या हुआ, और आप किस बात को समझने में मदद चाहते हैं?",
    stateQuestion: "यह किस भारतीय राज्य या केंद्रशासित प्रदेश में हुआ? आप “पता नहीं” कह सकते हैं।",
    placeOptions: ["मेरे कार्यस्थल पर", "कॉलेज या स्कूल में", "सार्वजनिक जगह पर", "मेरे किराये के घर में", "ऑनलाइन", "कहीं और"],
    basisOptions: ["नस्ल या जातीय पहचान", "राष्ट्रीयता", "रूप-रंग", "मुझे पता नहीं"],
    impactOptions: ["हाँ", "नहीं", "मुझे पता नहीं"],
    workOptions: ["सरकारी / सार्वजनिक नियोक्ता", "निजी कंपनी", "मुझे पता नहीं"],
    schoolOptions: ["प्रवेश", "प्रवेश के बाद का व्यवहार", "कुछ और / पता नहीं"],
    schoolTypeOptions: ["सरकारी", "सरकारी सहायता-प्राप्त", "निजी", "मुझे पता नहीं"],
    publicOptions: ["प्रवेश या सेवा रोकी गई", "धमकी या नुकसान", "दोनों", "मुझे पता नहीं"],
    onlineOptions: ["धमकी", "निजी जानकारी साझा हुई", "बार-बार निशाना बनाया", "मुझे पता नहीं"],
    housingOptions: ["किराया/आवास देने से मना किया", "धमकी या नुकसान", "बार-बार अनुचित व्यवहार", "मुझे पता नहीं"],
    unsure: "मुझे पता नहीं", send: "भेजें", placeholder: "छोटा जवाब लिखें…", restart: "बातचीत फिर शुरू करें",
    demo: "निर्देशित डेमो · AI प्रदाता सेट नहीं है", ready: "निर्देशित बातचीत · वैकल्पिक AI विश्लेषण",
    consent: "केवल इस परिणाम के लिए मेरी समस्या, जवाब और मिले स्रोत-अंश कॉन्फ़िगर किए AI प्रदाता को भेजें। मैंने संवेदनशील जानकारी नहीं दी है।",
    localNotice: "यह डेमो तयशुदा सवालों और स्थानीय स्रोत-खोज का उपयोग करता है। यह AI विश्लेषण का दावा नहीं करता।",
    privacy: "आपकी बातचीत इसी पेज में रहती है। यह डिफ़ॉल्ट रूप से सर्वर पर सहेजी नहीं जाती।",
    progress: "सवाल", of: "में से", finalizing: "अगले कदम तैयार किए जा रहे हैं…",
    finalMessage: "बात साझा करने के लिए धन्यवाद। आपके जवाबों के आधार पर यह छोटा, स्रोत-सहित मार्गदर्शन है।",
    aiFailure: "AI प्रदाता उपलब्ध नहीं था। यह कार्ड केवल निर्देशित डेमो और मिले स्रोतों पर आधारित है।",
    problemHeading: "संभावित कानूनी मुद्दा", rightsHeading: "संबंधित कानूनी सुरक्षा", stepsHeading: "आप क्या कर सकते हैं",
    importantHeading: "महत्वपूर्ण", sourceHeading: "आधिकारिक स्रोत", moreSources: "अन्य मिले स्रोत",
    expand: "कानूनी संदर्भ पढ़ें", generated: "नीचे के स्रोतों पर आधारित वैकल्पिक AI प्रारूप",
    noVerifiedMatch: "इस निर्देशित डेमो में इस मुद्दे के लिए सत्यापित प्रावधान नहीं है। यह कानून का अनुमान नहीं लगाएगा। विकल्प समझने के लिए योग्य वकील या कानूनी सहायता सेवा से बात करें।",
    issueRace: "आपके जवाब {place} पर {basis} से जुड़े संभावित अनुचित व्यवहार का वर्णन करते हैं। यह जाँचने योग्य चिंता है, कानून-उल्लंघन का निष्कर्ष नहीं।",
    issueOther: "आपने {place} से जुड़ा मुद्दा बताया। तथ्य महत्वपूर्ण हो सकते हैं; यह छोटा संवाद यह तय नहीं कर सकता कि अपराध या कानूनी उल्लंघन हुआ है।",
    workPublic: "राज्य के भेदभावपूर्ण व्यवहार में अनुच्छेद 14 और 15(1) प्रासंगिक हो सकते हैं। यदि नौकरी राज्य के अधीन है, तो अनुच्छेद 16(2) भी सूचीबद्ध आधारों, जिनमें नस्ल शामिल है, पर भेदभाव को संबोधित करता है।",
    workPrivate: "अनुच्छेद 14 और 15(1) राज्य पर लागू होते हैं और अनुच्छेद 16 राज्य के अधीन रोजगार से जुड़ा है। ये हर निजी नियोक्ता के विरुद्ध अपने-आप संवैधानिक दावा नहीं बनाते। अन्य तथ्य, नीतियाँ या कानून मायने रख सकते हैं।",
    schoolAdmission: "अनुच्छेद 29(2) कहता है कि राज्य द्वारा संचालित या राज्य-सहायता प्राप्त शैक्षणिक संस्था में सूचीबद्ध आधारों, जैसे नस्ल और भाषा, पर ही प्रवेश से वंचित नहीं किया जा सकता। यह प्रवेश के बारे में है, प्रवेश के बाद के हर व्यवहार के बारे में नहीं।",
    publicAccess: "अनुच्छेद 15(2) कुछ सार्वजनिक स्थानों तक पहुँच से जुड़ा है, जैसे दुकानें, सार्वजनिक रेस्तराँ, होटल, सार्वजनिक मनोरंजन स्थल और कुछ सार्वजनिक सुविधाएँ। यह हर सार्वजनिक स्थान के विवाद पर अपने-आप लागू नहीं होता।",
    stateAction: "राज्य या सार्वजनिक प्राधिकरण के व्यवहार में अनुच्छेद 14 और 15(1) प्रासंगिक हो सकते हैं। अनुच्छेद 15(1) में नस्ल सूचीबद्ध है। निजी स्थिति का अलग, तथ्य-आधारित आकलन चाहिए।",
    basisCaution: "अनुच्छेद 15 और 16 में कुछ खास आधार सूचीबद्ध हैं। नस्ल सूचीबद्ध है; राष्ट्रीयता और रूप-रंग अलग आधार के रूप में नहीं लिखे हैं। तथ्य कानून में कैसे आते हैं, यह पूरी स्थिति पर निर्भर है।",
    stepOne: "तारीख, जगह, सटीक शब्द या कार्रवाई और गवाहों के नाम लिखें।",
    stepTwo: "मूल ईमेल, संदेश, नोटिस, स्क्रीनशॉट और काम या पढ़ाई के रिकॉर्ड सुरक्षित रखें।",
    stepThree: "उचित आंतरिक शिकायत प्रक्रिया अपनाएँ या विकल्पों के लिए वकील/राज्य या जिला विधिक सेवा प्राधिकरण से बात करें।",
    disclaimer: "यह सामान्य कानूनी जानकारी है, कानूनी सलाह नहीं। यह पात्रता तय नहीं करती, भेदभाव साबित नहीं करती और परिणाम की गारंटी नहीं देती।",
    constitution: "भारत का संविधान · विधायी विभाग की आधिकारिक PDF", modeDemo: "निर्देशित डेमो", modeAI: "AI-सहायता प्राप्त प्रारूप",
    providerQuestion: "स्रोतों पर आधारित सारांश तैयार करने से पहले एक और जानकारी चाहिए:",
    caseStudiesTab: "न्यायिक मामले",
  },
  te: {
    title: "ఏం జరిగిందో తెలుసుకుందాం", intro: "ఉపయోగకరమైన తదుపరి అడుగు చూపడానికి కొన్ని చిన్న ప్రశ్నలు అడుగుతాను.",
    welcome: "నమస్కారం, నేను Know U Right. మీ మాటల్లో ఏమి జరిగిందో చెప్పండి. పేర్లు, వ్యక్తిగత వివరాలు పంచుకోవద్దు.",
    empathy: "మీకు ఇది ఎదురవుతున్నందుకు విచారంగా ఉంది. వివక్షకు సంబంధించిన న్యాయపరమైన ప్రశ్నలు ఉండవచ్చు. సరైన దారి చూపడానికి కొన్ని చిన్న ప్రశ్నలు అడుగుతాను.",
    generalEmpathy: "వివరించినందుకు ధన్యవాదాలు. ఒక్కసారి ఒక చిన్న ప్రశ్న అడిగి, అందుబాటులో ఉన్న సమాచారం ఏమి చెప్పగలదో వివరిస్తాను.",
    placeQuestion: "ఇది ఎక్కడ జరుగుతోంది?", basisQuestion: "ఇది మీ జాతి లేదా జాతి సమూహం, జాతీయత లేదా రూపంతో సంబంధముందా?",
    impactQuestion: "ఎవరైనా బెదిరించారా, అవకాశం లేదా సేవ నిరాకరించారా, లేదా పదేపదే అన్యాయంగా ప్రవర్తించారా?",
    workQuestion: "ఇది ప్రభుత్వ/ప్రభుత్వ రంగ సంస్థనా, లేక ప్రైవేట్ కంపెనీనా?",
    schoolQuestion: "ఇది ప్రవేశానికి సంబంధించినదా, లేక చేరిన తర్వాతి ప్రవర్తనకా?",
    schoolTypeQuestion: "పాఠశాల లేదా కళాశాల ప్రభుత్వ, ప్రభుత్వ సహాయం పొందిన, ప్రైవేట్, లేక తెలియదా?",
    publicQuestion: "సేవ లేదా ప్రదేశానికి ప్రవేశం నిరాకరించారా, లేక బెదిరింపు/శారీరక హాని జరిగిందా?",
    onlineQuestion: "బెదిరింపులు, వ్యక్తిగత వివరాల పంచుకోవడం లేదా పదేపదే లక్ష్యంగా చేసుకోవడం జరిగిందా?",
    housingQuestion: "అద్దె/నివాస అవకాశం నిరాకరించారా, లేక బెదిరింపు లేదా పదేపదే అన్యాయ ప్రవర్తన జరిగిందా?",
    otherQuestion: "ఇటీవల ఏమి జరిగింది, దేనిని అర్థం చేసుకోవడంలో సహాయం కావాలి?",
    stateQuestion: "ఇది ఏ భారత రాష్ట్రం లేదా కేంద్రపాలిత ప్రాంతంలో జరిగింది? “తెలియదు” అని చెప్పవచ్చు.",
    placeOptions: ["నా కార్యాలయంలో", "కళాశాల లేదా పాఠశాలలో", "బహిరంగ ప్రదేశంలో", "నా అద్దె నివాసంలో", "ఆన్‌లైన్‌లో", "మరెక్కడైనా"],
    basisOptions: ["జాతి లేదా జాతి సమూహం", "జాతీయత", "రూపం", "నాకు తెలియదు"],
    impactOptions: ["అవును", "కాదు", "నాకు తెలియదు"],
    workOptions: ["ప్రభుత్వ / ప్రభుత్వ రంగ యజమాని", "ప్రైవేట్ కంపెనీ", "నాకు తెలియదు"],
    schoolOptions: ["ప్రవేశం", "చేరిన తర్వాతి ప్రవర్తన", "మరేదైనా / తెలియదు"],
    schoolTypeOptions: ["ప్రభుత్వం", "ప్రభుత్వ సహాయం పొందిన", "ప్రైవేట్", "నాకు తెలియదు"],
    publicOptions: ["ప్రవేశం లేదా సేవ నిరాకరణ", "బెదిరింపు లేదా హాని", "రెండూ", "నాకు తెలియదు"],
    onlineOptions: ["బెదిరింపులు", "వ్యక్తిగత వివరాల పంచుకోవడం", "పదేపదే లక్ష్యంగా చేయడం", "నాకు తెలియదు"],
    housingOptions: ["అద్దె నిరాకరణ", "బెదిరింపు లేదా హాని", "పదేపదే అన్యాయం", "నాకు తెలియదు"],
    unsure: "నాకు తెలియదు", send: "పంపండి", placeholder: "చిన్న సమాధానం రాయండి…", restart: "సంభాషణను మళ్లీ ప్రారంభించండి",
    demo: "మార్గదర్శక డెమో · AI ప్రొవైడర్ సెట్ కాలేదు", ready: "మార్గదర్శక సంభాషణ · ఐచ్ఛిక AI విశ్లేషణ",
    consent: "ఈ ఫలితం కోసం మాత్రమే నా సమస్య, సమాధానాలు మరియు పొందిన మూల భాగాలను కాన్ఫిగర్ చేసిన AI ప్రొవైడర్‌కు పంపండి. సున్నితమైన వివరాలు ఇవ్వలేదు.",
    localNotice: "ఈ మార్గదర్శక డెమో ముందుగా రూపొందించిన ప్రశ్నలు, స్థానిక మూల శోధనను ఉపయోగిస్తుంది. AI విశ్లేషణ చేస్తున్నట్టు చెప్పదు.",
    privacy: "మీ సంభాషణ ఈ పేజీలోనే ఉంటుంది. డిఫాల్ట్‌గా సర్వర్‌లో భద్రపరచబడదు.",
    progress: "ప్రశ్న", of: "లో", finalizing: "తదుపరి అడుగులను సిద్ధం చేస్తున్నాం…",
    finalMessage: "వివరించినందుకు ధన్యవాదాలు. మీరు పంచుకున్న వివరాల ఆధారంగా సంక్షిప్త మూల-ఆధారిత మార్గదర్శకం ఇది.",
    aiFailure: "కాన్ఫిగర్ చేసిన AI ప్రొవైడర్ అందుబాటులో లేదు. ఈ కార్డు మార్గదర్శక డెమో, పొందిన మూలాలనే ఉపయోగిస్తుంది.",
    problemHeading: "సంభావ్య న్యాయ సమస్య", rightsHeading: "సంబంధిత న్యాయ రక్షణ", stepsHeading: "మీరు చేయగలిగేది",
    importantHeading: "ముఖ్యమైనది", sourceHeading: "అధికారిక మూలం", moreSources: "ఇతరంగా పొందిన మూలాలు",
    expand: "న్యాయ నేపథ్యాన్ని చదవండి", generated: "క్రింది మూలాలపై ఆధారపడిన ఐచ్ఛిక AI ముసాయిదా",
    noVerifiedMatch: "ఈ మార్గదర్శక డెమోలో ఈ సమస్యకు ధృవీకరించిన నిబంధన లేదు. చట్టాన్ని ఊహించదు. మార్గాల కోసం అర్హత కలిగిన న్యాయవాది లేదా న్యాయ సహాయ సేవను సంప్రదించండి.",
    issueRace: "మీ సమాధానాలు {place} వద్ద {basis}కు సంబంధించిన అన్యాయ ప్రవర్తన ఉండవచ్చని సూచిస్తున్నాయి. ఇది పరిశీలించాల్సిన విషయం మాత్రమే; చట్ట ఉల్లంఘన నిర్ధారణ కాదు.",
    issueOther: "మీరు {place}లో జరిగిన సమస్యను వివరించారు. వాస్తవాలు ముఖ్యం; ఈ చిన్న మార్గదర్శకం నేరం లేదా చట్ట ఉల్లంఘన జరిగిందని నిర్ణయించదు.",
    workPublic: "రాష్ట్ర చర్యలో వివక్ష ఉంటే అధికరణాలు 14, 15(1) సంబంధం కలిగి ఉండవచ్చు. ఉద్యోగం రాష్ట్రం కింద ఉంటే, జాతి సహా పేర్కొన్న ఆధారాలపై వివక్షను అధికరణ 16(2) కూడా స్పష్టంగా ప్రస్తావిస్తుంది.",
    workPrivate: "అధికరణాలు 14, 15(1) రాష్ట్రాన్ని పరిమితం చేస్తాయి; అధికరణ 16 రాష్ట్రం కింద ఉద్యోగానికి సంబంధించినది. ప్రతి ప్రైవేట్ యజమానిపై ఇవి ఆటోమేటిక్‌గా రాజ్యాంగ హక్కు కల్పించవు. ఇతర వాస్తవాలు, విధానాలు, చట్టాలు ముఖ్యం కావచ్చు.",
    schoolAdmission: "అధికరణ 29(2) ప్రకారం రాష్ట్రం నిర్వహించే లేదా రాష్ట్ర సహాయం పొందే విద్యాసంస్థలో జాతి, భాష వంటి పేర్కొన్న ఆధారాలపైనే ప్రవేశం నిరాకరించరాదు. ఇది ప్రవేశం గురించి; చేరిన తర్వాతి ప్రతి ప్రవర్తన గురించి కాదు.",
    publicAccess: "అధికరణ 15(2) దుకాణాలు, ప్రజా రెస్టారెంట్లు, హోటళ్లు, ప్రజా వినోద స్థలాలు, కొన్ని ప్రజా సదుపాయాలకు ప్రవేశం వంటి నిర్దిష్ట అంశాలను కవర్ చేస్తుంది. ప్రతి బహిరంగ ప్రదేశ వివాదానికి ఇది ఆటోమేటిక్‌గా వర్తించదు.",
    stateAction: "రాష్ట్రం లేదా ప్రజా అధికార సంస్థ చర్యలో అధికరణాలు 14, 15(1) సంబంధం కలిగి ఉండవచ్చు. అధికరణ 15(1)లో జాతి పేర్కొనబడింది. ప్రైవేట్ సందర్భాన్ని వేరుగా, వాస్తవాల ఆధారంగా పరిశీలించాలి.",
    basisCaution: "అధికరణాలు 15, 16 కొన్ని నిర్దిష్ట ఆధారాలను పేర్కొంటాయి. జాతి పేర్కొనబడింది; జాతీయత, రూపం ప్రత్యేక ఆధారాలుగా పేర్కొనబడలేదు. వాస్తవాలు ఎలా వర్తిస్తాయో మొత్తం పరిస్థితిపై ఆధారపడి ఉంటుంది.",
    stepOne: "తేదీ, ప్రదేశం, ఖచ్చితమైన మాటలు లేదా చర్యలు, సాక్షుల వివరాలు రాసుకోండి.",
    stepTwo: "అసలు ఇమెయిల్స్, సందేశాలు, నోటీసులు, స్క్రీన్‌షాట్లు, పని లేదా చదువు రికార్డులు భద్రపరచండి.",
    stepThree: "సంబంధిత అంతర్గత ఫిర్యాదు మార్గాన్ని ఉపయోగించండి లేదా న్యాయవాది/రాష్ట్ర లేదా జిల్లా న్యాయ సేవల సంస్థను సంప్రదించండి.",
    disclaimer: "ఇది సాధారణ న్యాయ సమాచారం మాత్రమే; న్యాయ సలహా కాదు. అర్హతను నిర్ణయించదు, వివక్షను నిరూపించదు, ఫలితాన్ని హామీ ఇవ్వదు.",
    constitution: "భారత రాజ్యాంగం · శాసన శాఖ అధికారిక PDF", modeDemo: "మార్గదర్శక డెమో", modeAI: "AI సహాయక ముసాయిదా",
    providerQuestion: "మూలాల ఆధారిత సారాంశం సిద్ధం చేయడానికి ఇంకో వివరాన్ని తెలుసుకోవాలి:",
    caseStudiesTab: "న్యాయ కేసులు",
  },
} satisfies Record<AppLanguage, Record<string, string | string[]>>;

export interface GuidedLegalChatProps {
  jurisdiction: string;
  providerConfigured: boolean;
  providerConsent: boolean;
  onProviderConsentChange: (value: boolean) => void;
  onSituationChange: (problem: string) => void;
}

function line(role: Role, text: string, replies?: ReplyOption[]): ChatLine {
  return { id: crypto.randomUUID(), role, text, replies, createdAt: new Date().toISOString() };
}

function placeFromText(text: string): string {
  const value = text.toLowerCase();
  if (/work|office|boss|employer|job|company/.test(value)) return "workplace";
  if (/school|college|university|campus|admission|student/.test(value)) return "school";
  if (/public place|street|shop|restaurant|hotel|store/.test(value)) return "public";
  if (/rent|rental|landlord|tenant|accommodation|house|apartment/.test(value)) return "housing";
  if (/online|internet|social media|website|message/.test(value)) return "online";
  return "";
}

function isDiscrimination(problem: string): boolean {
  return /discriminat|racis|\brace\b|ethnic|caste|religio|gender|nationality|skin|appearance|origin|bias/i.test(problem);
}

function isRaceRelated(problem: string): boolean {
  return /racis|\brace\b|ethnic|skin colou?r/i.test(problem);
}

function classifyIssue(problem: string): IssueTrack {
  if (/domestic violence|abuse at home|partner abuse|spousal abuse/i.test(problem)) return "domestic-violence";
  if (/consumer|refund|defect|faulty|product|delivery|billing|overcharg|service provider/i.test(problem)) return "consumer";
  if (/\brti\b|right to information|information request/i.test(problem)) return "rti";
  if (isDiscrimination(problem)) return "discrimination";
  return "general";
}

function localized(language: AppLanguage, en: string, hi: string, te: string): string {
  return language === "hi" ? hi : language === "te" ? te : en;
}

function sourceLead(language: AppLanguage): string {
  return localized(language,
    "These are possible source records returned by a local search. Check the original text and facts before relying on them; a search match does not establish that a law applies.",
    "स्थानीय खोज में ये संभावित स्रोत रिकॉर्ड मिले हैं। भरोसा करने से पहले मूल पाठ और तथ्यों की जाँच करें; खोज मिलान यह साबित नहीं करता कि कोई कानून लागू होता है।",
    "స్థానిక శోధనలో ఈ సంభావ్య మూల రికార్డులు లభించాయి. వాటిపై ఆధారపడే ముందు అసలు పాఠ్యం, వాస్తవాలను తనిఖీ చేయండి; శోధనలో సరిపోవడం చట్టం వర్తిస్తుందని నిరూపించదు.");
}

function sourcePassagesLabel(language: AppLanguage): string {
  return localized(language, "Source passages from this search", "इस खोज से मिले स्रोत अंश", "ఈ శోధనలో లభించిన మూల భాగాలు");
}

function localeIndex(language: AppLanguage): "en" | "hi" | "te" {
  return language;
}

function replyOptions(labels: string[], values: string[]): ReplyOption[] {
  return labels.map((label, index) => ({ label, value: values[index] }));
}

function transcriptFor(answers: GuidedAnswers): string {
  return [
    `Issue type: ${answers.issueTrack}`,
    `Location: ${answers.place}`,
    `Possible basis: ${answers.basis}`,
    `Threat, denial, or repeated treatment: ${answers.impact}`,
    `Specific context: ${answers.context}`,
    `Employer or institution: ${answers.organization}`,
    `State or Union Territory: ${answers.state}`,
    `Additional details: ${answers.additional}`,
  ].filter((item) => !item.endsWith(": ")).join("\n").slice(-12_000);
}

export function ChatMessage({
  message,
  isLatest,
  onReply,
  assistantName,
  youLabel,
  locale,
}: {
  message: ChatLine;
  isLatest: boolean;
  onReply?: (reply: ReplyOption) => void;
  assistantName: string;
  youLabel: string;
  locale: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      className={`guided-message guided-${message.role}`}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : .2 }}
    >
      <span className="guided-avatar" aria-hidden="true">{message.role === "assistant" ? "K" : "•"}</span>
      <div className="guided-message-content">
        <div className="guided-message-meta">
          <strong>{message.role === "assistant" ? assistantName : youLabel}</strong>
          <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</time>
        </div>
        <p>{message.text}</p>
        {isLatest && message.replies && onReply && <QuickReplyChips options={message.replies} onSelect={onReply} />}
      </div>
    </motion.article>
  );
}

export function QuickReplyChips({ options, onSelect }: { options: ReplyOption[]; onSelect: (reply: ReplyOption) => void }) {
  return (
    <div className="guided-quick-replies" aria-label="Suggested answers">
      {options.map((option) => (
        <button key={option.value} type="button" onClick={() => onSelect(option)}>{option.label}</button>
      ))}
    </div>
  );
}

export function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="guided-typing" role="status" aria-label={label}>
      <span /><span /><span /><small>{label}</small>
    </div>
  );
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
  sendLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  placeholder: string;
  sendLabel: string;
}) {
  return (
    <form className="guided-composer" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="guided-chat-input">{placeholder}</label>
      <textarea
        id="guided-chat-input"
        value={value}
        maxLength={2000}
        rows={2}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <button type="submit" aria-label={sendLabel} disabled={disabled || !value.trim()}>
        <Send size={17} aria-hidden="true" /><span>{sendLabel}</span>
      </button>
    </form>
  );
}

function placeLabel(place: string, language: AppLanguage): string {
  const values = {
    en: { workplace: "your workplace", school: "your school or college", public: "a public place", housing: "rented accommodation", online: "online", other: "the place you described" },
    hi: { workplace: "आपके कार्यस्थल", school: "आपके स्कूल या कॉलेज", public: "सार्वजनिक जगह", housing: "किराये के आवास", online: "ऑनलाइन", other: "बताई गई जगह" },
    te: { workplace: "మీ కార్యాలయం", school: "మీ పాఠశాల లేదా కళాశాల", public: "బహిరంగ ప్రదేశం", housing: "అద్దె నివాసం", online: "ఆన్‌లైన్", other: "మీరు తెలిపిన ప్రదేశం" },
  } as const;
  return values[language][place as keyof typeof values.en] ?? values[language].other;
}

export function LegalGuidanceCard({
  answers,
  result,
  sources,
  localOnly,
  providerFailed,
}: {
  answers: GuidedAnswers;
  result: AssistantResult | null;
  sources: SourceHit[];
  localOnly: boolean;
  providerFailed: boolean;
}) {
  const { language } = useLanguage();
  const c = copy[localeIndex(language)];
  const reduceMotion = useReducedMotion();
  const related = isRaceRelated(answers.problem);
  const basisNames: Record<string, string> = {
    race: localized(language, "race or ethnicity", "नस्ल या जातीय पहचान", "జాతి లేదా జాతి సమూహం"),
    nationality: localized(language, "nationality", "राष्ट्रीयता", "జాతీయత"),
    appearance: localized(language, "appearance", "रूप-रंग", "రూపురేఖలు"),
    unsure: c.unsure,
  };
  const basis = basisNames[answers.basis] ?? (answers.basis || localized(language, "race or ethnicity", "नस्ल या जातीय पहचान", "జాతి లేదా జాతి సమూహం"));
  const place = placeLabel(answers.place, language);
  const issue = related
    ? c.issueRace.replace("{basis}", basis).replace("{place}", place)
    : c.issueOther.replace("{place}", place);
  const isPublicEmployer = /public|government|सरकारी|ప్రభుత్వ/i.test(answers.organization);
  const isPrivateEmployer = /private|निजी|ప్రైవేట్/i.test(answers.organization);
  const admission = /admission|प्रवेश|ప్రవేశ/i.test(answers.context);
  const publicAccess = /access|service|प्रवेश|सेवा|ప్రవేశం|సేవ/i.test(answers.context);
  let protection = c.noVerifiedMatch;
  if (related) {
    if (answers.place === "workplace" && isPublicEmployer) protection = c.workPublic;
    else if (answers.place === "workplace" && isPrivateEmployer) protection = c.workPrivate;
    else if (answers.place === "school" && admission && /government|aided|सरकारी|సహాయం|ప్రభుత్వ/i.test(answers.organization)) protection = c.schoolAdmission;
    else if (answers.place === "public" && publicAccess) protection = c.publicAccess;
    else protection = c.stateAction;
  } else if (result?.mode === "ai_assisted" && result.sections.rights) {
    protection = result.sections.rights;
  } else if (sources.length > 0) {
    protection = sourceLead(language);
  }
  const generatedRights = result?.mode === "ai_assisted" ? result.sections.rights : "";
  const relevantSources = sources.filter((hit) => hit.source_id !== "india-constitution-equality-14-16-29");
  const displayedSources = sources.filter((hit) => hit.source_id !== "india-constitution-equality-14-16-29");
  const cautionBasis = related && !/race|नस्ल|జాతి/i.test(basis) ? c.basisCaution : "";

  return (
    <motion.section className="legal-guidance-card" aria-labelledby="legal-card-title" initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .24 }}>
      <div className="legal-card-topline"><span><ShieldCheck size={16} aria-hidden="true" /> {result?.mode === "ai_assisted" ? c.modeAI : c.modeDemo}</span><span>{localOnly ? c.demo : "India · central law"}</span></div>
      <h3 id="legal-card-title">{c.problemHeading}</h3>
      <p className="legal-card-issue">{issue}</p>
      {answers.issueTrack === "domestic-violence" && /yes|हाँ|అవును/i.test(answers.context) && <p className="legal-card-caution">{localized(language, "If you are in immediate danger, contact local emergency services or a trusted person now.", "यदि आप तत्काल खतरे में हैं, तो अभी स्थानीय आपातकालीन सेवा या किसी भरोसेमंद व्यक्ति से संपर्क करें।", "మీరు తక్షణ ప్రమాదంలో ఉంటే, ఇప్పుడే స్థానిక అత్యవసర సేవను లేదా నమ్మకమైన వ్యక్తిని సంప్రదించండి.")}</p>}
      {related && <p className="legal-card-protection"><strong>{c.rightsHeading}</strong>{protection}{cautionBasis && <span className="legal-card-caution">{cautionBasis}</span>}</p>}
      {!related && <p className="legal-card-protection"><strong>{c.rightsHeading}</strong>{protection}</p>}
      {generatedRights && generatedRights !== protection && (
        <details className="legal-card-details"><summary>{c.generated}</summary><p>{generatedRights.slice(0, 760)}</p></details>
      )}
      <div className="legal-card-steps">
        <strong>{c.stepsHeading}</strong>
        <ol><li>{c.stepOne}</li><li>{c.stepTwo}</li><li>{c.stepThree}</li></ol>
      </div>
      <details className="legal-card-details">
        <summary>{c.expand}</summary>
        <p>{related ? c.basisCaution : c.noVerifiedMatch}</p>
        {related && <p>{answers.place === "workplace" && isPrivateEmployer ? c.workPrivate : c.stateAction}</p>}
      </details>
      <div className="legal-card-sources">
        <strong>{c.sourceHeading}</strong>
        {related && <a href={CONSTITUTION_URL} target="_blank" rel="noopener noreferrer">{c.constitution} <ArrowUpRight size={14} aria-hidden="true" /></a>}
        {displayedSources.map((hit) => (
          <a href={hit.source_url} key={hit.source_id} target="_blank" rel="noopener noreferrer">
            {hit.title} <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        ))}
        {relevantSources.length > 0 && <span className="legal-card-source-note">{c.moreSources}</span>}
        {relevantSources.length > 0 && <details className="legal-card-details"><summary>{sourcePassagesLabel(language)}</summary>{relevantSources.slice(0, 3).map((hit) => <p key={hit.passage_id}><strong>{hit.title}:</strong> {hit.passage}</p>)}</details>}
      </div>
      <div className="legal-card-important"><strong>{c.importantHeading}</strong><p>{c.disclaimer}</p></div>
      {(localOnly || providerFailed || result?.mode !== "ai_assisted") && <p className="legal-card-mode-note">{providerFailed ? c.aiFailure : result?.mode === "ai_assisted" ? "" : c.localNotice}</p>}
    </motion.section>
  );
}

export function ConversationController({
  jurisdiction,
  providerConfigured,
  providerConsent,
  onProviderConsentChange,
  onSituationChange,
}: GuidedLegalChatProps) {
  const { language } = useLanguage();
  const c = copy[localeIndex(language)];
  const reduceMotion = useReducedMotion();
  const threadRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("initial");
  const [answers, setAnswers] = useState<GuidedAnswers>(EMPTY_ANSWERS);
  const [messages, setMessages] = useState<ChatLine[]>([line("assistant", c.welcome)]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [sources, setSources] = useState<SourceHit[]>([]);
  const [providerFailed, setProviderFailed] = useState(false);
  const [extraQuestionCount, setExtraQuestionCount] = useState(0);

  function ask(question: string, replies?: ReplyOption[]) {
    setMessages((items) => [...items, line("assistant", question, replies)]);
  }

  function askState(next: GuidedAnswers) {
    setAnswers(next);
    setStage("state");
    ask(c.stateQuestion, replyOptions([c.unsure], ["not-sure"]));
  }

  async function finish(next: GuidedAnswers, questionRounds = extraQuestionCount) {
    setAnswers(next);
    setResult(null);
    setTyping(true);
    setStage("finalizing");
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    let hits: SourceHit[] = [];
    let aiResult: AssistantResult | null = null;
    let failed = false;
    const query = `${next.problem}\n${transcriptFor(next)}`.slice(0, 1000);

    if (jurisdiction === "India (Central)") {
      try {
        const local = await findSourcePassages(query, jurisdiction);
        hits = local.hits;
      } catch {
        // The guided demo still provides its limited, explicitly qualified summary.
      }
      if (providerConfigured && providerConsent) {
        try {
          aiResult = await findAssistantResult({
            problem: next.problem,
            followUp: transcriptFor(next),
            jurisdiction: "India (Central)",
            language,
            externalAiConsent: true,
          });
          if (aiResult.mode === "clarification_required" && aiResult.clarification_questions[0] && questionRounds < 2) {
            setSources(aiResult.hits);
            setResult(null);
            setExtraQuestionCount(questionRounds + 1);
            setStage("providerFollowup");
            setTyping(false);
            ask(`${c.providerQuestion} ${aiResult.clarification_questions[0]}`);
            return;
          }
        } catch {
          failed = true;
        }
      }
    }

    setSources(aiResult?.hits?.length ? aiResult.hits : hits);
    setResult(aiResult?.mode === "ai_assisted" ? aiResult : null);
    setProviderFailed(failed);
    setTyping(false);
    setStage("done");
    ask(c.finalMessage);
    window.requestAnimationFrame(() => {
      threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  function contextQuestion(next: GuidedAnswers) {
    if (next.place === "workplace") {
      setStage("organization");
      if (next.issueTrack === "discrimination") {
        ask(c.workQuestion, replyOptions(c.workOptions, ["public", "private", "unknown"]));
      } else {
        setStage("context");
        ask(localized(language, "What is the main issue at work?", "काम पर मुख्य समस्या क्या है?", "పనిలో ప్రధాన సమస్య ఏమిటి?"), replyOptions(
          language === "en"
            ? ["Pay or benefits", "Dismissal or job loss", "Harassment or unsafe conditions", "Discrimination", "Something else / not sure"]
            : language === "hi"
              ? ["वेतन या लाभ", "नौकरी से निकालना", "उत्पीड़न या असुरक्षित स्थिति", "भेदभाव", "कुछ और / पता नहीं"]
              : ["జీతం లేదా ప్రయోజనాలు", "ఉద్యోగం నుంచి తొలగింపు", "వేధింపు లేదా అసురక్షిత పరిస్థితి", "వివక్ష", "మరేదైనా / తెలియదు"],
          ["pay", "dismissal", "harassment", "discrimination", "other"],
        ));
      }
    } else if (next.place === "school") {
      setStage("context");
      ask(c.schoolQuestion, replyOptions(c.schoolOptions, ["admission", "enrolled", "other"]));
    } else if (next.place === "public") {
      setStage("context");
      ask(c.publicQuestion, replyOptions(c.publicOptions, ["access-denied", "threat-or-harm", "both", "unknown"]));
    } else if (next.place === "online") {
      setStage("context");
      ask(c.onlineQuestion, replyOptions(c.onlineOptions, ["threats", "private-details", "repeated-targeting", "unknown"]));
    } else if (next.place === "housing") {
      setStage("context");
      ask(c.housingQuestion, replyOptions(c.housingOptions, ["rental-denied", "threat-or-harm", "repeated-unfair-treatment", "unknown"]));
    } else {
      setStage("context");
      ask(c.otherQuestion);
    }
  }

  async function handleAnswer(text: string, value = text) {
    const visible = text.trim();
    if (!visible || typing || stage === "finalizing") return;
    setDraft("");
    setMessages((items) => [...items, line("user", visible)]);
    setTyping(true);
    await new Promise((resolve) => window.setTimeout(resolve, 240));
    setTyping(false);

    if (stage === "initial") {
      const place = placeFromText(value) || placeFromText(visible);
      const issueTrack = classifyIssue(visible);
      const next = { ...EMPTY_ANSWERS, problem: visible, issueTrack, place };
      setAnswers(next);
      onSituationChange(visible);
      if (["consumer", "domestic-violence", "rti"].includes(issueTrack)) {
        setStage("specialFollowup");
        if (issueTrack === "consumer") {
          ask(localized(language, "What went wrong with the product or service?", "वस्तु या सेवा में क्या समस्या हुई?", "వస్తువు లేదా సేవలో ఏమి సమస్య వచ్చింది?"), replyOptions(
            language === "en" ? ["Product or service was defective", "Refund or delivery problem", "Billing or charges", "Other / not sure"]
              : language === "hi" ? ["वस्तु या सेवा में दोष", "रिफंड या डिलीवरी की समस्या", "बिल या शुल्क", "कुछ और / पता नहीं"]
                : ["వస్తువు లేదా సేవలో లోపం", "వాపసు లేదా డెలివరీ సమస్య", "బిల్లింగ్ లేదా ఛార్జీలు", "మరేదైనా / తెలియదు"],
            ["defect", "refund-delivery", "billing", "other"],
          ));
        } else if (issueTrack === "domestic-violence") {
          ask(localized(language, "Are you in immediate danger right now?", "क्या आप अभी तत्काल खतरे में हैं?", "మీరు ప్రస్తుతం తక్షణ ప్రమాదంలో ఉన్నారా?"), replyOptions(
            language === "en" ? ["Yes", "No", "I'm not sure"] : language === "hi" ? ["हाँ", "नहीं", "पता नहीं"] : ["అవును", "కాదు", "తెలియదు"],
            ["yes", "no", "unsure"],
          ));
        } else {
          ask(localized(language, "What is happening with your Right to Information request?", "आपके सूचना का अधिकार अनुरोध के साथ क्या हुआ?", "మీ సమాచార హక్కు అభ్యర్థన విషయంలో ఏమి జరిగింది?"), replyOptions(
            language === "en" ? ["I need to file a request", "No response yet", "I received a response", "Other / not sure"]
              : language === "hi" ? ["मुझे अनुरोध दर्ज करना है", "अभी तक जवाब नहीं", "जवाब मिला", "कुछ और / पता नहीं"]
                : ["నేను అభ్యర్థన దాఖలు చేయాలి", "ఇంకా సమాధానం రాలేదు", "సమాధానం వచ్చింది", "మరేదైనా / తెలియదు"],
            ["file-request", "no-response", "received-response", "other"],
          ));
        }
        return;
      }
      if (place) {
        if (isRaceRelated(visible)) {
          setStage("basis");
          ask(`${c.empathy} ${c.basisQuestion}`, replyOptions(c.basisOptions, ["race", "nationality", "appearance", "unsure"]));
        } else if (isDiscrimination(visible)) {
          setStage("basis");
          ask(`${c.generalEmpathy} ${localized(language, "What do you think this treatment is based on? You can describe it in your own words.", "आपको क्या लगता है कि यह व्यवहार किस वजह से हो रहा है? अपने शब्दों में बताएं।", "ఈ ప్రవర్తన దేనికి సంబంధించినదని మీరు భావిస్తున్నారు? మీ మాటల్లో చెప్పండి.")}`);
        } else {
          contextQuestion(next);
        }
      } else {
        setStage("place");
        ask(`${isDiscrimination(visible) ? c.empathy : c.generalEmpathy} ${c.placeQuestion}`, replyOptions(c.placeOptions, ["workplace", "school", "public", "housing", "online", "other"]));
      }
      return;
    }

    if (stage === "place") {
      const place = ["workplace", "school", "public", "housing", "online"].includes(value) ? value : placeFromText(value) || "other";
      const next = { ...answers, place };
      setAnswers(next);
      if (isRaceRelated(answers.problem)) {
        setStage("basis");
        ask(c.basisQuestion, replyOptions(c.basisOptions, ["race", "nationality", "appearance", "unsure"]));
      } else if (isDiscrimination(answers.problem)) {
        setStage("basis");
        ask(localized(language, "What do you think this treatment is based on? You can describe it in your own words.", "आपको क्या लगता है कि यह व्यवहार किस वजह से हो रहा है? अपने शब्दों में बताएं।", "ఈ ప్రవర్తన దేనికి సంబంధించినదని మీరు భావిస్తున్నారు? మీ మాటల్లో చెప్పండి."));
      } else {
        contextQuestion(next);
      }
      return;
    }

    if (stage === "basis") {
      const next = { ...answers, basis: value };
      setAnswers(next);
      setStage("impact");
      ask(c.impactQuestion, replyOptions(c.impactOptions, ["yes", "no", "unsure"]));
      return;
    }

    if (stage === "impact") {
      const next = { ...answers, impact: value };
      setAnswers(next);
      contextQuestion(next);
      return;
    }

    if (stage === "context") {
      const next = { ...answers, context: value };
      setAnswers(next);
      if (next.place === "school") {
        setStage("organization");
        ask(c.schoolTypeQuestion, replyOptions(c.schoolTypeOptions, ["government", "aided", "private", "unknown"]));
      } else if (next.place === "workplace" && next.issueTrack !== "discrimination") {
        setStage("organization");
        ask(c.workQuestion, replyOptions(c.workOptions, ["public", "private", "unknown"]));
      } else {
        askState(next);
      }
      return;
    }

    if (stage === "organization") {
      const next = { ...answers, organization: value };
      if (next.place === "school" && !next.context) {
        setAnswers(next);
        askState(next);
      } else {
        askState(next);
      }
      return;
    }

    if (stage === "state") {
      const next = { ...answers, state: value };
      await finish(next);
      return;
    }

    if (stage === "specialFollowup") {
      askState({ ...answers, context: value });
      return;
    }

    if (stage === "providerFollowup") {
      const next = { ...answers, additional: `${answers.additional}\n${visible}`.trim() };
      await finish(next, extraQuestionCount);
      return;
    }

    if (stage === "done") {
      const next = { ...answers, additional: `${answers.additional}\n${visible}`.trim() };
      await finish(next);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleAnswer(draft);
  }

  function restart() {
    setStage("initial");
    setAnswers(EMPTY_ANSWERS);
    setMessages([line("assistant", c.welcome)]);
    setDraft("");
    setTyping(false);
    setResult(null);
    setSources([]);
    setProviderFailed(false);
    setExtraQuestionCount(0);
    onSituationChange("");
  }

  const questionNumber = stage === "initial" ? 1 : stage === "place" ? 1 : stage === "basis" ? 2 : stage === "impact" ? 3 : stage === "context" || stage === "organization" ? 4 : 5;
  const currentLocale = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN";

  return (
    <section className="guided-chat-card" aria-labelledby="guided-chat-title">
      <header className="guided-chat-header">
        <div className="guided-chat-heading">
          <span className="guided-chat-mark" aria-hidden="true"><ShieldCheck size={19} /></span>
          <div><p className="eyebrow">{providerConfigured ? c.ready : c.demo}</p><h3 id="guided-chat-title">{c.title}</h3><p>{c.intro}</p></div>
        </div>
        <div className="guided-chat-header-actions">
          {stage !== "initial" && <span className="guided-progress">{c.progress} {questionNumber} {c.of} 5</span>}
          <button className="guided-restart" type="button" onClick={restart}><RotateCcw size={15} aria-hidden="true" /><span>{c.restart}</span></button>
        </div>
      </header>

      {providerConfigured && (
        <label className="guided-consent">
          <input type="checkbox" checked={providerConsent} onChange={(event) => onProviderConsentChange(event.target.checked)} />
          <span>{c.consent}</span>
        </label>
      )}

      <div className="guided-chat-thread" ref={threadRef} aria-live="polite" aria-relevant="additions text">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
              onReply={(reply) => void handleAnswer(reply.label, reply.value)}
              assistantName="Know U Right"
              youLabel={language === "en" ? "You" : language === "hi" ? "आप" : "మీరు"}
              locale={currentLocale}
            />
          ))}
        </AnimatePresence>
        {typing && <TypingIndicator label={stage === "finalizing" ? c.finalizing : language === "en" ? "One moment…" : language === "hi" ? "एक पल…" : "ఒక్క క్షణం…"} />}
        {stage === "done" && <LegalGuidanceCard answers={answers} result={result} sources={sources} localOnly={!providerConfigured || !providerConsent} providerFailed={providerFailed} />}
      </div>

      <ChatInput value={draft} onChange={setDraft} onSubmit={submit} disabled={typing} placeholder={c.placeholder} sendLabel={c.send} />
      <div className="guided-chat-footer"><p><ShieldCheck size={13} aria-hidden="true" /> {providerConfigured ? c.privacy : c.localNotice}</p><span><Check size={13} aria-hidden="true" /> {c.disclaimer}</span></div>
    </section>
  );
}

export function GuidedLegalChat(props: GuidedLegalChatProps) {
  return <ConversationController {...props} />;
}
