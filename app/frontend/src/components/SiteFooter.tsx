import { ArrowUpRight, ArrowUp, BookOpenText } from "lucide-react";
import { useRef, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export function SiteFooter() {
  const { t, language } = useLanguage();
  const footerWords = language === "hi"
    ? ["सरल भाषा", "स्थान महत्वपूर्ण है", "स्रोत देखें", "सवाल पूछें"]
    : language === "te"
      ? ["సరళమైన భాష", "ప్రాంతం ముఖ్యం", "మూలాన్ని చూడండి", "ప్రశ్నలు అడగండి"]
      : ["Plain language", "Location matters", "Follow the source", "Room to ask questions"];
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      footer.classList.add("is-visible");
      return;
    }

    let frame = 0;
    const updateDepth = () => {
      frame = 0;
      const bounds = footer.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(
          1,
          (window.innerHeight - bounds.top) /
            (window.innerHeight + bounds.height),
        ),
      );
      footer.style.setProperty("--footer-scroll", progress.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateDepth);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) footer.classList.add("is-visible");
      },
      { threshold: 0.08 },
    );

    observer.observe(footer);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <footer className="site-footer" ref={footerRef} aria-labelledby="footer-title">
      <div className="footer-ambient" aria-hidden="true" />
      <div className="footer-grid" aria-hidden="true" />
      <div className="footer-marquee" aria-hidden="true">
        <div className="footer-marquee-track">
          {[...footerWords, ...footerWords].map((word, index) => (
            <span className="footer-marquee-item" key={`${word}-${index}`}>
              {word}<i>✳</i>
            </span>
          ))}
        </div>
      </div>
      <div className="footer-watermark" aria-hidden="true">KNOW U RIGHT</div>
      <div className="footer-main page-wrap">
        <div className="footer-message">
          <p className="eyebrow footer-eyebrow">{t("footerEyebrow")}</p>
          <h2 id="footer-title">{t("footerHeadline")}</h2>
          <p className="footer-intro">{t("footerIntro")}</p>
          <a className="footer-ask" href="#problem">
            {t("footerAsk")} <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
        <div className="footer-details">
          <a className="brand footer-brand" href="#home" aria-label={language === "hi" ? "Know U Right होम" : language === "te" ? "Know U Right హోమ్" : "Know U Right home"}>
            <span className="brand-mark" aria-hidden="true">
              <BookOpenText size={23} strokeWidth={1.65} />
            </span>
            <span>Know U Right<span className="brand-period">.</span></span>
          </a>
          <p className="footer-disclaimer">
            {t("footerDisclaimer")}
          </p>
          <nav className="footer-links" aria-label={t("footerNavigation")}>
            <a href="#grievance-portals">{t("explorePortals")}</a>
            <a href="#how-it-works">{t("howWorks")}</a>
            <a href="#sources">{t("sourceCoverage")}</a>
            <a href="#privacy">{t("privacy")}</a>
          </nav>
          <a className="footer-back-top" href="#home">
            {t("backHome")} <ArrowUp size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
