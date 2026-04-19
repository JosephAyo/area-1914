import styles from "./TopicCard.module.scss";
import type { TopicData } from "../types/index";

interface TopicCardProps {
  topic: TopicData;
}

export function TopicCard({ topic }: TopicCardProps) {
  if (!topic) return null;

  return (
    <div className={styles.card}>
      {topic.thumbnail_url && (
        <div className={styles.imageContainer}>
          <img src={topic.thumbnail_url} alt={topic.title} />
        </div>
      )}
      <div className={styles.content}>
        <h3>{topic.title}</h3>
        {topic.description ? (
          <p>{topic.description}</p>
        ) : (
          <p className={styles.noDesc}>No description available.</p>
        )}
        <div className={styles.meta}>
          <a
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(topic.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.badge}
            title="Read full article on Wikipedia"
          >
            Read on Wikipedia ↗
          </a>
        </div>
      </div>
    </div>
  );
}
