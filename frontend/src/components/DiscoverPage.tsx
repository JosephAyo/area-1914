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
          event.preventDefault();
          onBack();
        }}
      >
        ← Back
      </a>
      <FeaturedTopics onSelectTopic={onSelectTopic} />
    </div>
  );
}
