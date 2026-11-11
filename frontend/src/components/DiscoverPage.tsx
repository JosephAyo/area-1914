import { FeaturedTopics } from "./FeaturedTopics";
import styles from "./DiscoverPage.module.scss";

interface DiscoverPageProps {
  onSelectTopic: (slug: string) => void;
  onBack: () => void;
}

export function DiscoverPage({ onSelectTopic, onBack }: DiscoverPageProps) {
  return (
    <div className={styles.container}>
      <a
        href="/"
        className={styles.backBtn}
        onClick={(event) => {
          if (
            event.button ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          event.preventDefault();
          onBack();
        }}
      >
        ← Back
      </a>
      <header className={styles.intro}>
        <p className="eyebrow">
          The collection / People, places &amp; turning points
        </p>
        <h1>
          Many histories.
          <br />
          <em>Find your way in.</em>
        </h1>
        <p>
          Choose a subject, explore its reading history, and follow its
          connections.
        </p>
      </header>
      <FeaturedTopics onSelectTopic={onSelectTopic} />
    </div>
  );
}
