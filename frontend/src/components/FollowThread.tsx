import { afrobeatThread } from "../content/editorial";
import { TopicLink } from "./TopicLink";
import styles from "./FollowThread.module.scss";
export function FollowThread({
  onSelectTopic,
  activeSlug,
}: {
  onSelectTopic: (slug: string) => void;
  activeSlug?: string;
}) {
  return (
    <section className={styles.section} aria-labelledby="thread-heading">
      <div className="section-heading">
        <h2 id="thread-heading">Follow the thread</h2>
        <p>A curated route · 3 connected subjects</p>
      </div>
      <div className={styles.intro}>
        <h3>
          A sound is never
          <br />
          <em>one person.</em>
        </h3>
        <p>
          Begin with a musician. Meet a collaborator. Explore the genre they
          helped develop.
        </p>
      </div>
      <ol className={styles.steps}>
        {afrobeatThread.map((step, index) => (
          <li key={step.slug}>
            <p className="eyebrow">
              0{index + 1} /{" "}
              {activeSlug?.toLowerCase() === step.slug.toLowerCase()
                ? "You are here"
                : step.role}
            </p>
            <TopicLink
              slug={step.slug}
              onSelectTopic={onSelectTopic}
              className={styles.topic}
            >
              {step.title}
            </TopicLink>
            <p>{step.connection}</p>
            <a
              className={styles.source}
              href={step.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              Connection source
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
