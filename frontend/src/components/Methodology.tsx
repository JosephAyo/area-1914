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
            <strong>Wikimedia REST API</strong>. We retrieve article summaries,
            thumbnails, and daily pageview metrics. For relevance, we check the
            article's Wikipedia categories (via the MediaWiki Action API) to
            ensure it is related to Nigeria before tracking.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Aggregation & Caching</h3>
          <p>
            Our <strong>FastAPI backend</strong> acts as an intelligent caching
            layer. When a topic is requested, we fetch and store its historical
            pageviews (up to 5 years). Subsequent requests pull from our local
            database. We only query Wikipedia for updates if the data is older
            than 24 hours. The &quot;Trending&quot; topics are calculated by
            comparing the most recent 30-day views to the previous 30-day
            period.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Visualization</h3>
          <p>
            The frontend is built with <strong>React</strong> and{" "}
            <strong>TypeScript</strong>. The interactive pulse charts are
            rendered using <strong>Recharts</strong>, providing a smooth,
            responsive area chart that allows you to easily toggle between
            30-day, 1-year, and maximum historical views.
          </p>
        </div>
      </div>
    </section>
  );
}
