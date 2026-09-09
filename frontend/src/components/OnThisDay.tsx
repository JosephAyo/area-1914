import { useQuery } from "@tanstack/react-query";
import { fetchOnThisDayTopics } from "../services/api";
import type { OnThisDayTopic } from "../types/index";
import { Skeleton } from "./Skeleton";
import styles from "./OnThisDay.module.scss";
import { TopicLink } from "./TopicLink";

interface OnThisDayProps {
  onSelectTopic: (slug: string) => void;
}

const formatAnniversaryDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export function OnThisDay({ onSelectTopic }: OnThisDayProps) {
  const { data, isLoading, isError } = useQuery<OnThisDayTopic[]>({
    queryKey: ["onThisDay"],
    queryFn: fetchOnThisDayTopics,
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <section className={styles.container}>
        <Skeleton height="1.25rem" width="180px" />
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={styles.card}>
              <Skeleton width="44px" height="44px" borderRadius="50%" />
              <div className={styles.content}>
                <Skeleton height="1rem" width="60%" />
                <Skeleton height="0.85rem" width="80%" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError || !data || data.length === 0) {
    return null;
  }

  return (
    <section className={styles.container} aria-labelledby="on-this-day-title">
      <div className={styles.header}>
        <h2 id="on-this-day-title">On This Day</h2>
        <span>Unusual 1, 5, and 10 year echoes</span>
      </div>
      <div className={styles.list}>
        {data.map((topic) => (
          <TopicLink
            key={`${topic.slug}-${topic.date}`}
            slug={topic.slug}
            onSelectTopic={onSelectTopic}
            className={styles.card}
          >
            <div className={styles.thumbnail}>
              {topic.thumbnail_url ? (
                <img src={topic.thumbnail_url} alt="" />
              ) : (
                <span>{topic.years_ago}y</span>
              )}
            </div>
            <span className={styles.content}>
              <span className={styles.title}>{topic.title}</span>
              <span className={styles.meta}>
                {topic.lift_score.toFixed(1)}x usual activity on{" "}
                {formatAnniversaryDate(topic.date)}
              </span>
              <span className={styles.description}>
                {topic.views.toLocaleString()} views, normally around{" "}
                {Math.round(topic.baseline_views).toLocaleString()} ·{" "}
                {topic.years_ago} years ago
                {topic.description ? ` · ${topic.description}` : ""}
              </span>
            </span>
          </TopicLink>
        ))}
      </div>
    </section>
  );
}
