import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageIntro } from "@/components/PageIntro";
import { topics } from "@/data/topics";

export function TopicsPage() {
  return (
    <div className="page-wrap page-content">
      <PageIntro
        eyebrow="EXPLORE EVERYDAY TOPICS"
        title={<>Start with what’s<br />on your mind.</>}
        description="Pick a topic to see what this small source collection can—and cannot—help you explore."
      />
      <div className="topic-grid topic-grid-page">
        {topics.map(({ slug, title, shortDescription, sourceIds, Icon }, index) => (
          <Link
            className="topic-card"
            to={`/topics/${slug}`}
            key={slug}
            data-reveal
            style={{ "--reveal-delay": `${index * 65}ms` } as React.CSSProperties}
          >
            <span className={`topic-icon topic-icon-${index}`}><Icon size={22} aria-hidden="true" /></span>
            <span className="topic-title">{title}</span>
            <span className="topic-description">{shortDescription}</span>
            <span className="topic-availability">{sourceIds.length ? "Selected source records available" : "No matching sources in this demo"}</span>
            <ArrowUpRight className="topic-arrow" size={17} aria-hidden="true" />
          </Link>
        ))}
      </div>
      <p className="topic-footnote">Topic labels are just starting points. Availability is limited to the sources currently in this demo.</p>
    </div>
  );
}
