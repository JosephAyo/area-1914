import { useQuery } from "@tanstack/react-query";
import styles from "./FeaturedTopics.module.scss";
import { MiniPulseChart } from "./MiniPulseChart";
import type { FeaturedCategory } from "../types/index";
import { fetchFeaturedTopics } from "../services/api";

interface FeaturedTopicsProps {
  onSelectTopic: (slug: string) => void;
}

export function FeaturedTopics({ onSelectTopic }: FeaturedTopicsProps) {
  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery<FeaturedCategory[]>({
    queryKey: ["featuredTopics"],
    queryFn: fetchFeaturedTopics,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  return (
    <div className={styles.container}>
      <h2>✨ Discover History</h2>
      {isLoading && (
        <div className={styles.loading}>Loading curated topics...</div>
      )}
      {isError && (
        <div className={styles.error}>Could not load curated topics.</div>
      )}

      {!isLoading && !isError && categories && (
        <div className={styles.categoriesWrapper}>
          {categories.map((category) => (
            <div key={category.name} className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>
                {category.icon} {category.name}
              </h3>
              <div className={styles.grid}>
                {category.topics.map((topic) => (
                  <div
                    key={topic.slug}
                    className={styles.card}
                    onClick={() => onSelectTopic(topic.slug)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.iconContainer}>
                        {topic.thumbnail_url ? (
                          <img
                            src={topic.thumbnail_url}
                            alt={topic.title}
                            className={styles.thumbnail}
                          />
                        ) : (
                          <span className={styles.fallbackIcon}>📚</span>
                        )}
                      </div>
                      <div className={styles.titleContainer}>
                        <h4>{topic.title}</h4>
                      </div>
                    </div>

                    <div className={styles.chartContainer}>
                      <MiniPulseChart pageviews={topic.pageviews} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
