import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Assistant from "@/pages/Assistant";
import Results from "@/pages/Results";
import Sources from "@/pages/Sources";
import Help from "@/pages/Help";
import { submitProblem } from "@/services/api";

export default function App() {
  const [caseData, setCaseData] = useState(null);
  const [jurisdiction, setJurisdiction] = useState("India (Central)");
  const [language, setLanguage] = useState("auto");
  const navigate = useNavigate();
  function saveResult(result, values) {
    setCaseData({ result, values });
  }
  function resetCase() {
    setCaseData(null);
    navigate("/assistant");
  }
  function correctProblem(problem) {
    setCaseData((current) => current ? { ...current, values: { ...current.values, problem } } : current);
  }
  return <div className="site-frame"><a href="#main-content" className="skip-link">Skip to content</a><Navbar jurisdiction={jurisdiction} setJurisdiction={setJurisdiction} language={language} setLanguage={setLanguage} /><div id="main-content"><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/assistant" element={<Assistant onResult={saveResult} jurisdiction={jurisdiction} setJurisdiction={setJurisdiction} language={language} setLanguage={setLanguage} />} />
    <Route path="/results" element={<Results caseData={caseData} onReset={resetCase} onCorrectProblem={correctProblem} onFollowUp={async (question) => {
      return submitProblem({ problem: caseData.values.problem, followUp: `${caseData.values.followUp}\nFollow-up question: ${question}`, language: caseData.values.language, externalAiConsent: caseData.values.externalAiConsent });
    }} />} />
    <Route path="/sources" element={<Sources />} />
    <Route path="/help" element={<Help />} />
    <Route path="*" element={<Home />} />
  </Routes></div><Footer /></div>;
}
