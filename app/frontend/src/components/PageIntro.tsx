import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <header className="page-intro" data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-intro-description">{description}</p>
    </header>
  );
}
