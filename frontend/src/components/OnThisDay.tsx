import { useQuery } from "@tanstack/react-query";
import { fetchOnThisDayTopics } from "../services/api";
import { Skeleton } from "./Skeleton";
import { TopicLink } from "./TopicLink";
import { formatChartDate } from "../utils/chartData";
import styles from "./OnThisDay.module.scss";
export function OnThisDay({
  onSelectTopic,
}: {
  onSelectTopic: (slug: string) => void;
}) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["onThisDay"],
    queryFn: fetchOnThisDayTopics,
    staleTime: 1000 * 60 * 60,
  });
  return (
    <section
      className={styles.container}
      aria-labelledby="attention-archive-title"
    >
      <div className="section-heading">
        <h2 id="attention-archive-title">From the attention archive</h2>
        <p>Reading activity on this date in previous years</p>
      </div>
      <p className={styles.note}>
        Past moments of unusual Wikipedia interest. These dates describe reading
        activity, not historical event anniversaries.
      </p>
      {isLoading && (
        <div aria-busy="true" aria-label="Loading attention archive">
          <Skeleton height="100px" />
        </div>
      )}
      {isError && (
        <p className="empty-note">
          The attention archive couldn’t be loaded.{" "}
          <button type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </p>
      )}
      {!isLoading && !isError && !data?.length && (
        <p className="empty-note">
          No unusual reading activity was found for this date in the available
          records.
        </p>
      )}
      <div className={styles.list}>
        {!isError &&
          data?.slice(0, 3).map((topic) => (
            <TopicLink
              key={`${topic.slug}-${topic.date}`}
              slug={topic.slug}
              onSelectTopic={onSelectTopic}
              className={styles.card}
            >
              <span className={styles.date}>
                {formatChartDate(topic.date)}
                <small>
                  {topic.years_ago} {topic.years_ago === 1 ? "year" : "years"}{" "}
                  ago
                </small>
              </span>
              <h3>{topic.title}</h3>
              <p>
                {topic.views.toLocaleString()} views ·{" "}
                {topic.lift_score.toFixed(1)}× the surrounding-day average
              </p>
              <span className={styles.link}>Open the record</span>
            </TopicLink>
          ))}
      </div>
    </section>
  );
}
