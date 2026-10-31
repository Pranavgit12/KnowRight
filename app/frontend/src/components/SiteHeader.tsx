import { ArrowUpRight, BookOpenText } from "lucide-react";
import { LiquidGlassNavbar } from "@/components/ui/liquid-glass-navbar";
import { useLanguage, type AppLanguage } from "@/components/LanguageProvider";

export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <header className="site-header">
      <a href="#home" className="brand" aria-label={language === "hi" ? "Know U Right होम" : language === "te" ? "Know U Right హోమ్" : "Know U Right home"}>
        <span className="brand-mark" aria-hidden="true">
          <BookOpenText size={23} strokeWidth={1.65} />
        </span>
        <span>
          Know U Right<span className="brand-period">.</span>
        </span>
      </a>
      <LiquidGlassNavbar />
      <label className="language-switcher">
        <span className="sr-only">{t("selectLanguage")}</span>
        <select
          aria-label={t("selectLanguage")}
          value={language}
          onChange={(event) => setLanguage(event.target.value as AppLanguage)}
        >
          <option value="en">{t("english")}</option>
          <option value="hi">{t("hindi")}</option>
          <option value="te">{t("telugu")}</option>
        </select>
      </label>
      <a className="header-question" href="#problem">{t("askQuestion")} <ArrowUpRight size={16} aria-hidden="true" /></a>
    </header>
  );
}
