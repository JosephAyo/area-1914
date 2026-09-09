import { useQuery } from "@tanstack/react-query";
import { fetchRelatedTopics } from "../services/api";
import type { RelatedTopic } from "../types/index";
import { Skeleton } from "./Skeleton";
import styles from "./RelatedTopics.module.scss";
import { TopicLink } from "./TopicLink";

interface RelatedTopicsProps {
  slug: string;
  onSelectTopic: (slug: string) => void;
}

export function RelatedTopics({ slug, onSelectTopic }: RelatedTopicsProps) {
  const { data, isLoading, isError } = useQuery<RelatedTopic[]>({
    queryKey: ["relatedTopics", slug],
    queryFn: () => fetchRelatedTopics(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return (
      <section className={styles.container}>
        <Skeleton height="1.25rem" width="180px" />
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={styles.card}>
              <Skeleton width="48px" height="48px" borderRadius="50%" />
              <div className={styles.cardText}>
                <Skeleton height="1rem" width="70%" />
                <Skeleton height="0.85rem" width="55%" />
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
    <section className={styles.container} aria-labelledby="related-topics">
      <h2 id="related-topics">Connected Topics</h2>
      <div className={styles.grid}>
        {data.map((topic) => (
          <TopicLink
            key={`${topic.connection}-${topic.slug}`}
            slug={topic.slug}
            onSelectTopic={onSelectTopic}
            className={styles.card}
          >
            <div className={styles.thumbnail}>
              {topic.thumbnail_url ? (
                <img src={topic.thumbnail_url} alt="" />
              ) : (
                <span>{topic.title.charAt(0)}</span>
              )}
            </div>
            <span className={styles.cardText}>
              <span className={styles.title}>{topic.title}</span>
              <span className={styles.description}>
                {topic.description || topic.connection}
              </span>
              <span className={styles.connection}>{topic.connection}</span>
            </span>
          </TopicLink>
        ))}
      </div>
    </section>
  );
}
