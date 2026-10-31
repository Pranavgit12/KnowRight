import { ArrowUpRight, CircleAlert, HeartHandshake, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Help() {
  return <main className="help-page">
    <p className="eyebrow">ABOUT KNOWRIGHT</p><h1>A helpful start, with honest limits.</h1><p className="help-lead">KnowRight is a public legal-information prototype designed to make it easier to explore everyday questions and inspect relevant source passages.</p>
    <div className="help-cards"><article><span><ShieldCheck size={20} /></span><h2>Information, not advice</h2><p>This tool does not know every fact, local rule, or current legal update. It cannot assess your case or guarantee an outcome.</p></article><article><span><CircleAlert size={20} /></span><h2>Small source collection</h2><p>Current coverage is selected India-wide central-law records only. State-specific laws, many subjects, and local processes may be missing.</p></article><article><span><HeartHandshake size={20} /></span><h2>Find qualified help</h2><p>No verified directory of legal aid, authorities, or emergency contacts is included. Use official channels that you can independently confirm.</p></article></div>
    <div className="help-privacy"><h2>Your information</h2><p>Problem text is sent only after you submit it. The local API does not save question or result data by default. If a provider is configured, the form asks for consent before external processing. Avoid identifying and sensitive details. This is not a promise of confidentiality or privilege.</p></div>
    <div className="help-cta"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Start with the question you have.</h2></div><Link to="/assistant" className="button button-green">Open legal assistant <ArrowUpRight size={16} /></Link></div>
  </main>;
}
