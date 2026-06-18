import { useQuery } from "@tanstack/react-query";
import styles from "./FeaturedTopics.module.scss";
import { MiniPulseChart } from "./MiniPulseChart";
import { Skeleton } from "./Skeleton";
import type { FeaturedCategory } from "../types/index";
import { fetchFeaturedTopics } from "../services/api";

function FeaturedSkeletonCard() {
  return (
    <div className={styles.card} style={{ pointerEvents: "none" }}>
      <div className={styles.cardHeader}>
        <Skeleton width="40px" height="40px" borderRadius="50%" />
        <div className={styles.titleContainer}>
          <Skeleton height="0.95rem" width="70%" />
        </div>
      </div>
      <div className={styles.chartContainer}>
        <Skeleton height="40px" />
      </div>
    </div>
  );
}

interface FeaturedTopicsProps {
  onSelectTopic: (slug: string) => void;
  preview?: boolean;
  onViewAll?: () => void;
}

export function FeaturedTopics({
  onSelectTopic,
  preview = false,
  onViewAll,
}: FeaturedTopicsProps) {
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
        <div className={styles.categoriesWrapper}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={styles.categorySection}>
              <Skeleton
                height="1.2rem"
                width="180px"
                className={styles.categoryTitle}
              />
              <div className={styles.grid}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <FeaturedSkeletonCard key={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {isError && (
        <div className={styles.error}>Could not load curated topics.</div>
      )}

      {!isLoading && !isError && categories && (
        <div className={styles.categoriesWrapper}>
          {(preview ? categories.slice(0, 2) : categories).map((category) => (
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
          {preview && onViewAll && (
            <button className={styles.viewAllBtn} onClick={onViewAll}>
              Browse all topics →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
