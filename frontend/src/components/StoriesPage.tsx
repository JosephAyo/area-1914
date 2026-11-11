import { useQuery } from "@tanstack/react-query";
import { afrobeatThread } from "../content/editorial";
import { fetchTopicData } from "../services/api";
import { storyPath } from "../utils/navigation";
import { TopicLink } from "./TopicLink";
import { CitationSources } from "./CitationSources";
import { Skeleton } from "./Skeleton";
import portrait from "../assets/fela-kuti.jpg";
import type { MouseEvent, ReactNode } from "react";
import ui from "./StoriesPage.module.scss";

function StoryLink({
  story = null,
  children,
  onOpen,
  className,
}: {
  story?: string | null;
  children: ReactNode;
  onOpen: (story: string | null) => void;
  className?: string;
}) {
  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    onOpen(story);
  };
  return (
    <a href={storyPath(story)} onClick={open} className={className}>
      {children}
    </a>
  );
}
interface StoriesProps {
  story: string | null;
  subject?: string;
  onOpen: (story: string | null) => void;
  onSelectTopic: (slug: string) => void;
}
export function StoriesPage({
  story,
  subject,
  onOpen,
  onSelectTopic,
}: StoriesProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["topic", subject ?? null],
    queryFn: () => fetchTopicData(subject!),
    enabled: story === "subject" && !!subject,
    retry: false,
  });
  if (!story)
    return (
      <>
        <header className={ui.heading}>
          <h1>Stories</h1>
          <p>Historical context, connected subjects, and guides to the data.</p>
        </header>
        <div className={ui.cards}>
          <StoryLink story="afrobeat" onOpen={onOpen} className={ui.card}>
            <div className={ui.portrait}>
              <img src={portrait} alt="" width="46" height="64" />
              <p>Culture · 3 connected subjects</p>
            </div>
            <h2>The people behind Afrobeat</h2>
            <p>
              Start with Fela Kuti, meet Tony Allen, and follow the music that
              connects them.
            </p>
            <span>Explore the story</span>
          </StoryLink>
          <StoryLink
            story="reading-the-pulse"
            onOpen={onOpen}
            className={ui.card}
          >
            <p className={ui.tag}>A guide to the data</p>
            <h2>What does a pulse actually tell us?</h2>
            <p>
              A short guide to pageviews, time windows, and the difference
              between attention and importance.
            </p>
            <span>Read the guide</span>
          </StoryLink>
        </div>
        <p className={ui.credit}>
          Portrait:{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Fela_Kuti.jpg"
            target="_blank"
            rel="noopener noreferrer"
          >
            MOI MEME; crop/color by Klausness
          </a>{" "}
          ·{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY-SA 3.0
          </a>{" "}
          · resized/cropped for display.
        </p>
      </>
    );
  if (story === "subject" && subject)
    return (
      <>
        <StoryLink onOpen={onOpen} className={ui.back}>
          ← Stories
        </StoryLink>
        {isLoading ? (
          <div aria-busy="true" aria-label="Loading article background">
            <Skeleton height="200px" />
          </div>
        ) : isError ? (
          <div className="empty-note" role="alert">
            <h1>Article background couldn’t be loaded.</h1>
            <button type="button" onClick={() => void refetch()}>
              Try again
            </button>
          </div>
        ) : (
          data && (
            <>
              <header className={ui.heading}>
                <p className={ui.tag}>Wikipedia article background</p>
                <h1>{data.title}</h1>
                <p>{data.description}</p>
                <TopicLink
                  slug={data.slug}
                  onSelectTopic={onSelectTopic}
                  className={ui.subjectLink}
                >
                  Open reading history
                </TopicLink>
              </header>
              <p className={ui.note}>
                This breakdown describes references found in the Wikipedia
                article. Counts and categories do not establish the reliability
                of an individual claim.
              </p>
              <CitationSources slug={data.slug} />
              <a
                className={ui.subjectLink}
                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(data.slug)}#References`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the article and its full references
              </a>
            </>
          )
        )}
      </>
    );
  if (story !== "afrobeat" && story !== "reading-the-pulse")
    return (
      <div className={ui.heading}>
        <h1>Story not found.</h1>
        <StoryLink onOpen={onOpen}>Browse Stories</StoryLink>
      </div>
    );
  const afrobeat = story === "afrobeat";
  return (
    <article className={ui.article}>
      <StoryLink onOpen={onOpen} className={ui.back}>
        ← Stories
      </StoryLink>
      <p className={ui.tag}>
        {afrobeat ? "Culture · A connected path" : "A guide to the data"}
      </p>
      <h1>
        {afrobeat
          ? "The people behind Afrobeat"
          : "What does a pulse actually tell us?"}
      </h1>
      <p className={ui.lede}>
        {afrobeat
          ? "A musician, a collaborator, and a genre. Follow their connections, then explore their reading history."
          : "Pageviews show what people opened on Wikipedia. They are a starting point for curiosity, not a verdict on history."}
      </p>
      {afrobeat ? (
        afrobeatThread.map((step) => (
          <section key={step.slug} className={ui.step}>
            <p className={ui.tag}>{step.role}</p>
            <h2>{step.title}</h2>
            <p>{step.connection}</p>
            <div className={ui.links}>
              <TopicLink slug={step.slug} onSelectTopic={onSelectTopic}>
                Explore {step.title}
              </TopicLink>
              <a href={step.source} target="_blank" rel="noopener noreferrer">
                Connection source
              </a>
            </div>
          </section>
        ))
      ) : (
        <>
          <section>
            <h2>Read the window, not just the number.</h2>
            <p>
              Explore uses the latest date returned for the collection as its
              common cutoff. View totals cover the most recent 30 calendar days
              ending there. Percent changes compare those days with the
              preceding 30 days, only when both periods have complete records
              and the previous total is at least 50 views. Otherwise, we show
              recorded-day coverage.
            </p>
            <p>
              “Most read” and “Fastest rising” apply to the returned collection,
              not every Nigerian subject on Wikipedia. Sparklines use individual
              scales; comparison charts use one shared vertical scale.
            </p>
          </section>
          <section>
            <h2>A gap is not zero.</h2>
            <p>
              Missing records mean no count is available for that date. Charts
              break the line at those dates. An actual zero stays zero. Open the
              daily figures to inspect the records directly.
            </p>
          </section>
          <section>
            <h2>Attention needs context.</h2>
            <p>
              A peak means more people opened an article. It does not establish
              the cause, represent public opinion, or measure historical
              importance. Charts and Stories serve different purposes.
            </p>
          </section>
          <section>
            <h2>Where the records come from.</h2>
            <p>
              Descriptions come from Wikipedia and may contain errors or
              outdated information. We display the descriptions supplied by its
              API; these can differ from the article itself. Verify biographical
              dates and other factual details using the article’s cited sources.
            </p>
            <p>
              Descriptions, article images, references, and pageviews come from
              Wikimedia. Topic pages show the history available in the returned
              records, usually up to five years. Cached records can lag; dates
              and coverage are shown rather than assumed.
            </p>
            <a
              href="https://www.wikimedia.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              About Wikimedia
            </a>
          </section>
        </>
      )}
    </article>
  );
}
