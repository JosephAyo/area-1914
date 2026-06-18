import { useQuery } from "@tanstack/react-query";
import { fetchTrendingData } from "../services/api";
import type { TrendingArticle } from "../types/index";
import { Skeleton } from "./Skeleton";
import styles from "./TrendingSection.module.scss";

function TrendingSkeletonCard() {
  return (
    <div className={styles.card} style={{ pointerEvents: "none" }}>
      <Skeleton width="2.5rem" height="2.5rem" />
      <div className={styles.content}>
        <Skeleton height="1rem" width="60%" />
        <Skeleton height="0.8rem" width="40%" />
      </div>
      <div className={styles.stats}>
        <Skeleton height="0.95rem" width="60px" />
        <Skeleton height="0.8rem" width="80px" />
      </div>
    </div>
  );
}

interface TrendingSectionProps {
  onSelectTopic: (slug: string) => void;
}

export function TrendingSection({ onSelectTopic }: TrendingSectionProps) {
  const {
    data: trendingArticles,
    isLoading,
    isError,
  } = useQuery<TrendingArticle[]>({
    queryKey: ["trending"],
    queryFn: fetchTrendingData,
  });

  if (isLoading) {
    return (
      <div className={styles.trendingContainer}>
        <h2>🔥 Trending Nigerian Topics</h2>
        <div className={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <TrendingSkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !trendingArticles || trendingArticles.length === 0) {
    return null;
  }

  return (
    <div className={styles.trendingContainer}>
      <h2>🔥 Trending Nigerian Topics</h2>
      <div className={styles.list}>
        {trendingArticles.map((article, index) => (
          <div
            key={article.slug}
            className={styles.card}
            onClick={() => onSelectTopic(article.slug)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.rank}>#{index + 1}</div>
            <div className={styles.content}>
              <h3 className={styles.title}>{article.title}</h3>
              <p className={styles.description}>
                {article.description || "No description available"}
              </p>
            </div>
            <div className={styles.stats}>
              <div
                className={`${styles.trend} ${article.trend_score >= 0 ? styles.positive : styles.negative}`}
              >
                {article.trend_score >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(article.trend_score).toFixed(1)}%
              </div>
              <div className={styles.views}>
                {article.current_views.toLocaleString()} views
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
