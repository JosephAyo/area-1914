import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import styles from "./FeaturedTopics.module.scss";
import { CURATED_CATEGORIES } from "../config/curatedTopics";
import { MiniPulseChart } from "./MiniPulseChart";
import type { TopicData, CuratedCategory } from "../types/index";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const BATCH_API_URL = `${API_BASE_URL}/topics/batch`;

async function fetchBatchTopics(
  categories: CuratedCategory[],
): Promise<Record<string, TopicData>> {
  // Extract all unique slugs across all categories
  const allSlugs = categories.flatMap((cat) => cat.slugs);
  const uniqueSlugs = [...new Set(allSlugs)];

  const res = await fetch(BATCH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slugs: uniqueSlugs }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch batch topics");
  }

  const data: TopicData[] = await res.json();
  const dataMap = data.reduce<Record<string, TopicData>>((acc, item) => {
    acc[item.slug] = item;
    return acc;
  }, {});

  return dataMap;
}

interface FeaturedTopicsProps {
  onSelectTopic: (slug: string) => void;
}

export function FeaturedTopics({ onSelectTopic }: FeaturedTopicsProps) {
  const {
    data: topicsData,
    isLoading,
    isError,
  } = useQuery<Record<string, TopicData>>({
    queryKey: ["curatedTopicsBatch"],
    queryFn: () => fetchBatchTopics(CURATED_CATEGORIES),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const displayCategories = useMemo(() => {
    return CURATED_CATEGORIES.map((category) => {
      if (category.randomize) {
        return {
          ...category,
          slugs: [...category.slugs].sort(() => Math.random() - 0.5),
        };
      }
      return category;
    });
  }, []);

  return (
    <div className={styles.container}>
      <h2>✨ Discover History</h2>
      {isLoading && (
        <div className={styles.loading}>Loading curated topics...</div>
      )}
      {isError && (
        <div className={styles.error}>Could not load curated topics.</div>
      )}

      {!isLoading && !isError && topicsData && (
        <div className={styles.categoriesWrapper}>
          {displayCategories.map((category) => (
            <div key={category.name} className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>
                {category.icon} {category.name}
              </h3>
              <div className={styles.grid}>
                {category.slugs.map((slug) => {
                  const topic = topicsData[slug];
                  if (!topic) return null; // Fallback if data is missing

                  return (
                    <div
                      key={slug}
                      className={styles.card}
                      onClick={() => onSelectTopic(slug)}
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
