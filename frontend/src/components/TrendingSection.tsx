import { useQuery } from "@tanstack/react-query";
import { fetchTrendingData } from "../services/api";
import { Skeleton } from "./Skeleton";
import { TopicLink } from "./TopicLink";
import styles from "./TrendingSection.module.scss";
export function TrendingSection({
  onSelectTopic,
}: {
  onSelectTopic: (slug: string) => void;
}) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrendingData,
  });
  return (
    <aside
      className={styles.trendingContainer}
      aria-labelledby="attention-title"
    >
      <p className="eyebrow">The attention index</p>
      <h2 id="attention-title">
        Getting
        <br />
        <em>attention.</em>
      </h2>
      <p className={styles.note}>
        Recent reading activity across tracked Wikipedia subjects.
      </p>
      {isLoading && (
        <div aria-busy="true" aria-label="Loading attention index">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} height="54px" style={{ marginBottom: "16px" }} />
          ))}
        </div>
      )}
      {isError && (
        <div className="empty-note">
          The index is unavailable.
          <br />
          <button type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      )}
      {!isLoading && !isError && !data?.length && (
        <p className="empty-note">
          No reading trends to show yet. Start with a subject in the archive.
        </p>
      )}
      {data && !isError && (
        <ol className={styles.list}>
          {data.slice(0, 5).map((article, index) => (
            <li key={article.slug}>
              <TopicLink
                slug={article.slug}
                onSelectTopic={onSelectTopic}
                className={styles.card}
              >
                <span className={styles.rank}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.content}>
                  <span className={styles.title}>{article.title}</span>
                  <small>
                    {article.current_views.toLocaleString()} views · recent 30
                    days
                  </small>
                </span>
                <span className={styles.stats}>
                  <span>
                    {article.trend_score >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(article.trend_score).toFixed(0)}
                  </span>
                  <small>growth score</small>
                </span>
              </TopicLink>
            </li>
          ))}
        </ol>
      )}
      <p className={styles.note}>
        Two 30-day windows. A baseline floor tempers small jumps; the growth
        score is not always a literal percentage change.
      </p>
    </aside>
  );
}
