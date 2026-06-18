import { FeaturedTopics } from "./FeaturedTopics";
import styles from "./DiscoverPage.module.scss";

interface DiscoverPageProps {
  onSelectTopic: (slug: string) => void;
  onBack: () => void;
}

export function DiscoverPage({ onSelectTopic, onBack }: DiscoverPageProps) {
  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={onBack}>
        ← Back
      </button>
      <FeaturedTopics onSelectTopic={onSelectTopic} />
    </div>
  );
}
