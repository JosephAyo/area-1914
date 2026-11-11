import styles from "./Methodology.module.scss";
export function Methodology() {
  return (
    <section className={styles.methodology} aria-label="About the data">
      <details>
        <summary>
          Reading the Pulse{" "}
          <span>Sources, coverage &amp; what the numbers mean +</span>
        </summary>
        <div className={styles.content}>
          <div>
            <h3>Attention, in perspective</h3>
            <p>
              Charts show daily Wikipedia pageviews, not a measure of historical
              importance or public opinion. A spike tells us more people opened
              an article; it does not explain why.
            </p>
          </div>
          <div>
            <h3>How the index works</h3>
            <p>
              Getting attention ranks tracked subjects by a growth score
              comparing recent and preceding 30-day windows. The previous period
              uses a minimum baseline of 50 views to temper small jumps.
              Coverage can vary between subjects.
            </p>
          </div>
          <div>
            <h3>Where it comes from</h3>
            <p>
              Article descriptions, images, citations and reading data come from{" "}
              <a
                href="https://www.wikimedia.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Wikimedia
              </a>
              . History covers the available records, usually up to five years,
              and cached data may lag. Missing chart records appear as gaps.
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}
