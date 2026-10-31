import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { JurisdictionProvider } from "@/components/JurisdictionProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import "@/styles/main.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <JurisdictionProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </JurisdictionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
