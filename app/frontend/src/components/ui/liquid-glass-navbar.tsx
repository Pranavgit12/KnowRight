import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BookOpenCheck, Compass, FileSearch, House, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

export function LiquidGlassNavbar() {
  const { t } = useLanguage();
  const links = [
    { href: "#home", label: t("home"), icon: House },
    { href: "#problem", label: t("ask"), icon: MessageCircleQuestion },
    { href: "#rights-library", label: t("rights"), icon: Compass },
    { href: "#case-studies", label: t("caseStudiesTab"), icon: BookOpenCheck },
    { href: "#grievance-portals", label: t("grievance"), icon: FileSearch },
  ];
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState("#home");

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const activeLink = nav.querySelector<HTMLElement>(".glass-nav-link.is-active");
    if (!activeLink) return;
    nav.style.setProperty("--nav-indicator-x", `${activeLink.offsetLeft}px`);
    nav.style.setProperty("--nav-indicator-width", `${activeLink.offsetWidth}px`);
    nav.style.setProperty("--nav-indicator-opacity", "1");
    const observer = new ResizeObserver(() => {
      nav.style.setProperty("--nav-indicator-x", `${activeLink.offsetLeft}px`);
      nav.style.setProperty("--nav-indicator-width", `${activeLink.offsetWidth}px`);
    });
    observer.observe(nav);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    const sections = links
      .map(({ href }) => document.querySelector<HTMLElement>(href))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActive(`#${current.target.id}`);
      },
      { rootMargin: "-22% 0px -63% 0px", threshold: [0, 0.1, 0.35, 0.65] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="glass-nav" aria-label={t("mainNavigation")} ref={navRef}>
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          aria-current={active === href ? "location" : undefined}
          aria-label={label}
          className={cn("glass-nav-link", active === href && "is-active")}
          onClick={() => setActive(href)}
        >
          <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
