import { useRef, type KeyboardEvent } from "react";
import { BookOpenCheck, Scale } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export type ResultTab = "solution" | "sources";

const TABS: { id: ResultTab; label: string; icon: typeof Scale }[] = [
  { id: "solution", label: "Solution", icon: Scale },
  { id: "sources", label: "Sources", icon: BookOpenCheck },
];

export function ResultTabs({
  activeTab,
  onChange,
}: {
  activeTab: ResultTab;
  onChange: (tab: ResultTab) => void;
}) {
  const { t } = useLanguage();
  const tabs = TABS.map((tab) => ({
    ...tab,
    label: tab.id === "solution" ? t("solution") : t("sources"),
  }));
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    let nextIndex = activeIndex;
    if (event.key === "ArrowRight") nextIndex = (activeIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (activeIndex + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = TABS.length - 1;
    else return;
    event.preventDefault();
    const next = tabs[nextIndex];
    onChange(next.id);
    refs.current[nextIndex]?.focus();
  }
  return (
    <div className="result-tabs" role="tablist" aria-label="Solution workspace" onKeyDown={onKeyDown}>
      {tabs.map(({ id, label, icon: Icon }, index) => (
        <button
          aria-controls={`result-panel-${id}`}
          aria-selected={activeTab === id}
          className="result-tab"
          id={`result-tab-${id}`}
          key={id}
          onClick={() => onChange(id)}
          ref={(element) => { refs.current[index] = element; }}
          role="tab"
          tabIndex={activeTab === id ? 0 : -1}
          type="button"
        >
          <Icon size={15} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
