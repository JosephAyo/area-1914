import { useQuery } from "@tanstack/react-query";
import { fetchCitationSources } from "../services/api";
import type { CitationData } from "../types/index";
import { Skeleton } from "./Skeleton";
import styles from "./CitationSources.module.scss";

interface CitationSourcesProps {
  slug: string;
}

const cleanSource = (source: string) => {
  // Extract text from Wikipedia link syntax [[Target|DisplayText]] or [[DisplayText]]
  const match = source.match(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/);
  return match ? match[1] : source;
};

export function CitationSources({ slug }: CitationSourcesProps) {
  const { data, isLoading, isError } = useQuery<CitationData>({
    queryKey: ["citations", slug],
    queryFn: () => fetchCitationSources(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Skeleton height="1.25rem" width="200px" />
        <div
          className={styles.breakdownGrid}
          style={{ marginTop: "var(--space-lg)" }}
        >
          <div className={styles.categories}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-md)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                <Skeleton width="90px" height="0.9rem" />
                <Skeleton height="8px" width="auto" style={{ flex: 1 }} />
                <Skeleton width="20px" height="0.85rem" />
              </div>
            ))}
          </div>
          <div className={styles.topSources}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  padding: "var(--space-sm)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                <Skeleton width="1rem" height="0.8rem" />
                <Skeleton height="0.9rem" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
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
                <span className={styles.name}>{cleanSource(source)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
