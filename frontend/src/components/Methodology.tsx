import styles from "./Methodology.module.scss";

export function Methodology() {
  return (
    <section className={styles.methodology}>
      <h2>📊 About the Data & Methodology</h2>
      <div className={styles.content}>
        <div className={styles.card}>
          <h3>Source</h3>
          <p>
            Data is fetched directly from the official{" "}
            <strong>Wikimedia REST API</strong>. Article summaries, thumbnails,
            and daily pageview metrics are retrieved. For relevance, the
            article's Wikipedia categories are checked (via the MediaWiki Action
            API) to ensure it is related to Nigeria before tracking.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Aggregation & Caching</h3>
          <p>
            The <strong>FastAPI backend</strong> acts as an intelligent caching
            layer. When a topic is requested, its historical pageviews (up to 5
            years) are fetched and stored. Subsequent requests pull from the
            local database. Wikipedia is only queried for updates if the data is
            older than 24 hours. The &quot;Trending&quot; topics are calculated
            by comparing the most recent 30-day views to the previous 30-day
            period.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Visualization</h3>
          <p>
            The frontend is built with <strong>React</strong> and{" "}
            <strong>TypeScript</strong>. The interactive pulse charts are
            rendered using <strong>Recharts</strong>, providing a smooth,
            responsive area chart that supports toggling between 30-day, 1-year,
            and maximum historical views.
          </p>
        </div>
      </div>
    </section>
  );
}
