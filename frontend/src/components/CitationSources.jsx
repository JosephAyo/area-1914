import { useQuery } from '@tanstack/react-query';
import { fetchCitationSources } from '../services/api';
import styles from './CitationSources.module.scss';

export function CitationSources({ slug }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['citations', slug],
    queryFn: () => fetchCitationSources(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className={styles.container}><div className={styles.loading}>Analyzing sources...</div></div>;
  }

  if (isError || !data || data.total_citations === 0) {
    return null;
  }

  const { category_breakdown, top_sources, total_citations } = data;

  return (
    <div className={styles.container}>
      <h2>📚 Known Sources ({total_citations})</h2>

      <div className={styles.breakdownGrid}>
        <div className={styles.categories}>
          <h3>By Category</h3>
          <ul className={styles.categoryList}>
            {Object.entries(category_breakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
              <li key={category}>
                <span className={styles.label}>{category}</span>
                <span className={styles.barContainer}>
                  <div
                    className={`${styles.bar} ${styles[category] || styles.other}`}
                    style={{ width: `${(count / total_citations) * 100}%` }}
                  />
                </span>
                <span className={styles.count}>{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.topSources}>
          <h3>Top Sources</h3>
          <ul className={styles.sourceList}>
            {top_sources.slice(0, 5).map((source, idx) => (
              <li key={idx}>
                <span className={styles.rank}>{idx + 1}</span>
                <span className={styles.name}>{source}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
