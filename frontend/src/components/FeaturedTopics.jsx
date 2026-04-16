import { useQuery } from '@tanstack/react-query';
import styles from './FeaturedTopics.module.scss';
import { CURATED_CATEGORIES } from '../config/curatedTopics';
import { MiniPulseChart } from './MiniPulseChart';

const BATCH_API_URL = 'http://localhost:8000/api/topics/batch';

async function fetchBatchTopics(categories) {
  // Extract all unique slugs across all categories
  const allSlugs = categories.flatMap(cat => cat.slugs);
  const uniqueSlugs = [...new Set(allSlugs)];

  const res = await fetch(BATCH_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slugs: uniqueSlugs })
  });

  if (!res.ok) {
    throw new Error('Failed to fetch batch topics');
  }

  const data = await res.json();
  const dataMap = data.reduce((acc, item) => {
    acc[item.slug] = item;
    return acc;
  }, {});

  return dataMap;
}

export function FeaturedTopics({ onSelectTopic }) {
  const { data: topicsData, isLoading, isError } = useQuery({
    queryKey: ['curatedTopicsBatch'],
    queryFn: () => fetchBatchTopics(CURATED_CATEGORIES),
    staleTime: 1000 * 60 * 60 // Cache for 1 hour
  });

  return (
    <div className={styles.container}>
      <h2>✨ Discover History</h2>
      {isLoading && <div className={styles.loading}>Loading curated topics...</div>}
      {isError && <div className={styles.error}>Could not load curated topics.</div>}

      {!isLoading && !isError && topicsData && (
        <div className={styles.categoriesWrapper}>
          {CURATED_CATEGORIES.map((category) => (
            <div key={category.name} className={styles.categorySection}>
              <h3 className={styles.categoryTitle}>{category.icon} {category.name}</h3>
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
                            <img src={topic.thumbnail_url} alt={topic.title} className={styles.thumbnail} />
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
