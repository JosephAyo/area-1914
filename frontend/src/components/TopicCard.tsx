import type { TopicData } from "../types/index";
import ui from "./TopicCard.module.scss";
export function TopicCard({
  topic,
  compact = false,
}: {
  topic: TopicData;
  compact?: boolean;
}) {
  const Heading = compact ? "h2" : "h1";
  return (
    <article className={`${ui.card} ${compact ? ui.compact : ""}`}>
      <Heading>{topic.title}</Heading>
      <p>
        {topic.description ||
          "Explore the reading history and connections of this subject."}
      </p>
      <a
        href={`https://en.wikipedia.org/wiki/${encodeURIComponent(topic.slug)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Read on Wikipedia
      </a>
    </article>
  );
}
