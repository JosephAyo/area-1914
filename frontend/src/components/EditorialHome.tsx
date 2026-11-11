import portrait from "../assets/fela-kuti.jpg";
import { leadSubject } from "../content/editorial";
import { TopicLink } from "./TopicLink";
import { TrendingSection } from "./TrendingSection";
import { FollowThread } from "./FollowThread";
import { OnThisDay } from "./OnThisDay";
import styles from "./EditorialHome.module.scss";
export function EditorialHome({
  onSelectTopic,
  onDiscover,
}: {
  onSelectTopic: (slug: string) => void;
  onDiscover: () => void;
}) {
  return (
    <>
      <div className={styles.rule}>
        <span>01 / In focus</span>
        <span>Arts &amp; culture</span>
        <span>Nigeria, in perspective</span>
      </div>
      <section className={styles.lead} aria-labelledby="edition-title">
        <div className={styles.copy}>
          <p className="eyebrow">A life in the archive</p>
          <h1 id="edition-title">
            The sound.
            <br />
            The voice.
            <br />
            <em>Fela.</em>
          </h1>
          <p className={styles.intro}>{leadSubject.introduction}</p>
          <TopicLink
            slug={leadSubject.slug}
            onSelectTopic={onSelectTopic}
            className={styles.open}
          >
            Open the Fela Kuti record
          </TopicLink>
          <p className={styles.context}>
            An editorial starting point.{" "}
            <a
              href={leadSubject.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              About this subject
            </a>
          </p>
        </div>
        <figure className={styles.portrait}>
          <span className={styles.plate}>FK / 01</span>
          <img
            src={portrait}
            width="192"
            height="369"
            alt="Fela Kuti holding a saxophone"
          />
          <figcaption>
            Fela Kuti · archival portrait
            <br />
            <a
              href="https://commons.wikimedia.org/wiki/File:Fela_Kuti.jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              MOI MEME; crop/color: Klausness
            </a>
            <br />
            <a
              href="https://creativecommons.org/licenses/by-sa/3.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY-SA 3.0
            </a>{" "}
            · resized for display
          </figcaption>
        </figure>
        <TrendingSection onSelectTopic={onSelectTopic} />
      </section>
      <FollowThread onSelectTopic={onSelectTopic} />
      <section className={styles.browse}>
        <div>
          <p className="eyebrow">Keep looking</p>
          <h2>
            Many histories.
            <br />
            <em>More ways in.</em>
          </h2>
        </div>
        <p>
          From kingdoms and cities to art, politics and everyday life. Choose a
          subject and see how reading interest has changed.
        </p>
        <a
          href="/discover"
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
            onDiscover();
          }}
        >
          Explore the archive
        </a>
      </section>
      <OnThisDay onSelectTopic={onSelectTopic} />
    </>
  );
}
