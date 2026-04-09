import styles from './TopicCard.module.scss';

export function TopicCard({ topic }) {
  if (!topic) return null;

  return (
    <div className={styles.card}>
      {topic.thumbnail_url && (
        <div className={styles.imageContainer}>
          <img src={topic.thumbnail_url} alt={topic.title} />
        </div>
      )}
      <div className={styles.content}>
        <h3>{topic.title}</h3>
        {topic.description ? (
          <p>{topic.description}</p>
        ) : (
          <p className={styles.noDesc}>No description available.</p>
        )}
        <div className={styles.meta}>
          <span className={styles.badge}>Wikipedia Topic</span>
        </div>
      </div>
    </div>
  );
}
