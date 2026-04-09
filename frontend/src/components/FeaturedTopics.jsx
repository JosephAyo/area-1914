import styles from './FeaturedTopics.module.scss';

const FEATURED_TOPICS = [
  { slug: "Nigeria", title: "Nigeria", icon: "🇳🇬", desc: "The Giant of Africa" },
  { slug: "Lagos", title: "Lagos", icon: "🏙️", desc: "Economic hub and megacity" },
  { slug: "Fela_Kuti", title: "Fela Kuti", icon: "🎷", desc: "Afrobeat pioneer" },
  { slug: "Igbo_people", title: "Igbo People", icon: "🏛️", desc: "Major ethnic group" },
  { slug: "Nigerian_Civil_War", title: "Civil War", icon: "⚔️", desc: "1967–1970 conflict" },
  { slug: "Chinua_Achebe", title: "Chinua Achebe", icon: "📚", desc: "Author of Things Fall Apart" }
];

export function FeaturedTopics({ onSelectTopic }) {
  return (
    <div className={styles.container}>
      <h2>✨ Discover History</h2>
      <div className={styles.grid}>
        {FEATURED_TOPICS.map((topic) => (
          <div
            key={topic.slug}
            className={styles.card}
            onClick={() => onSelectTopic(topic.slug)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.icon}>{topic.icon}</div>
            <div className={styles.content}>
              <h3>{topic.title}</h3>
              <p>{topic.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
