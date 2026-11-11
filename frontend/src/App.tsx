import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "./components/Header";
import { TopicSearch } from "./components/TopicSearch";
import { TopicCard } from "./components/TopicCard";
import { ClassificationReport } from "./components/ClassificationReport";
import { PulseChart } from "./components/PulseChart";
import { ExplorePage } from "./components/ExplorePage";
import { StoriesPage } from "./components/StoriesPage";
import { RelatedTopics } from "./components/RelatedTopics";
import { Skeleton } from "./components/Skeleton";
import { fetchTopicData, TopicRelevanceError } from "./services/api";
import { initialBrowseState } from "./utils/explore";
import type { BrowseState } from "./utils/explore";
import { isInAfrobeatThread } from "./content/editorial";
import {
  pushAppRoute,
  readAppRoute,
  topicPath,
  storyPath,
  subjectStoryPath,
} from "./utils/navigation";
import { defaultMetadata, updatePageMetadata } from "./utils/seo";
import ui from "./App.module.scss";

function App() {
  const [route, setRoute] = useState(readAppRoute);
  const [browse, setBrowse] = useState<BrowseState>({ ...initialBrowseState });
  const [comparisonTopic, setComparisonTopic] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const pulseExportRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const browseScrollRef = useRef(0);
  const activeTopic = route.topic;
  const isBrowsing = !activeTopic && route.view !== "stories";
  const restoreBrowseScroll = useCallback(() => {
    window.scrollTo({ top: browseScrollRef.current, behavior: "instant" });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (isBrowsing) browseScrollRef.current = window.scrollY;
      setRoute(readAppRoute());
      setComparisonTopic(null);
      setIsComparing(false);
      setExportError("");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isBrowsing]);
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    if (isBrowsing) restoreBrowseScroll();
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [route, isBrowsing, restoreBrowseScroll]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["topic", activeTopic],
    queryFn: () => fetchTopicData(activeTopic!),
    enabled: !!activeTopic,
    retry: false,
  });
  const {
    data: comparisonData,
    isLoading: isComparisonLoading,
    isError: isComparisonError,
    error: comparisonError,
    refetch: refetchComparison,
  } = useQuery({
    queryKey: ["topic", comparisonTopic],
    queryFn: () => fetchTopicData(comparisonTopic!),
    enabled: isComparing && !!comparisonTopic,
    retry: false,
  });

  useEffect(() => {
    if (data && activeTopic) {
      updatePageMetadata({
        title: `${data.title} Reading History | Nigerian History Pulse`,
        description: `Explore Wikipedia reading interest in ${data.title}, with daily pageviews and connected subjects.`,
        path: topicPath(data.slug),
        image: data.thumbnail_url,
      });
    } else if (route.view === "stories") {
      const title = route.subject
        ? `${route.subject.replace(/_/g, " ")} Article Background`
        : route.story === "afrobeat"
          ? "The People Behind Afrobeat"
          : route.story === "reading-the-pulse"
            ? "Reading the Pulse"
            : "Stories";
      updatePageMetadata({
        title: `${title} | Nigerian History Pulse`,
        description:
          "Historical context, connected subjects, and guides to Wikipedia reading data.",
        path: route.subject
          ? subjectStoryPath(route.subject)
          : storyPath(route.story),
      });
    } else if (route.view === "discover") {
      updatePageMetadata({ ...defaultMetadata, path: "/discover" });
    } else updatePageMetadata(defaultMetadata);
  }, [data, activeTopic, route]);

  const navigate = (path: string) => {
    if (isBrowsing) browseScrollRef.current = window.scrollY;
    pushAppRoute(path);
    setRoute(readAppRoute(path));
    setComparisonTopic(null);
    setIsComparing(false);
    setExportError("");
  };
  const handleGoHome = () => navigate("/");
  const handleSelectTopic = (topic: string) => navigate(topicPath(topic));
  const handleOpenStories = (story: string | null = null, subject?: string) =>
    navigate(subject ? subjectStoryPath(subject) : storyPath(story));
  const handleDownloadPulse = async () => {
    const exportSurface = pulseExportRef.current;
    if (!exportSurface || !data || isExporting) return;
    setExportError("");
    setIsExporting(true);
    try {
      await document.fonts.ready;
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      const { default: html2canvas } = await import("html2canvas");
      // Navigation can unmount the subject while fonts or the library load.
      if (!exportSurface.isConnected) return;
      const canvas = await html2canvas(exportSurface, {
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        scale: 2,
        useCORS: true,
        onclone: (clonedDocument) => {
          // Decorate only the capture. Keep the live chart and viewport still.
          const surface = clonedDocument.querySelector<HTMLElement>(
            "[data-pulse-export]",
          );
          if (surface) {
            // Border-box padding must not shrink the already-rendered SVG.
            surface.style.width = `${surface.getBoundingClientRect().width + 48}px`;
            surface.style.padding = "24px";
          }
          const header = surface?.querySelector<HTMLElement>(
            "[data-export-header]",
          );
          if (header) header.style.display = "flex";
        },
        ignoreElements: (element) =>
          element instanceof HTMLElement &&
          element.dataset.exportIgnore === "true",
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${data.slug.replace(/[^a-z0-9_-]/gi, "_")}-pulse.png`;
      link.click();
    } catch {
      setExportError("The image could not be prepared. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={ui.appContainer}>
      <a className={ui.skipLink} href="#main-content">
        Skip to content
      </a>
      <Header
        onHomeClick={handleGoHome}
        onStoriesClick={() => handleOpenStories()}
        view={activeTopic ? "topic" : route.view}
      />
      <main
        id="main-content"
        tabIndex={-1}
        ref={mainRef}
        className={ui.mainContent}
      >
        {activeTopic && (
          <>
            <div className={ui.searchRow}>
              <TopicSearch
                activeTopic={activeTopic}
                onSearch={(topic) =>
                  topic ? handleSelectTopic(topic) : handleGoHome()
                }
                label="Search people, places and events"
                placeholder="Search another subject…"
              />
            </div>
            <div className={ui.recordNav}>
              <a
                href="/"
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
                  handleGoHome();
                }}
              >
                ← Explore
              </a>
              <span>/</span>
              <span>{activeTopic.replace(/_/g, " ")}</span>
            </div>
          </>
        )}
        {isLoading && (
          <section
            aria-busy="true"
            aria-label="Loading topic"
            className={ui.loading}
          >
            <h1>Opening the subject…</h1>
            <Skeleton height="140px" />
            <Skeleton height="320px" />
          </section>
        )}
        {isError && (
          <section className={ui.error} role="alert">
            <h1>This subject couldn’t be opened.</h1>
            <p>{(error as Error).message}</p>
            {activeTopic && error instanceof TopicRelevanceError && (
              <ClassificationReport
                key={activeTopic}
                slug={activeTopic}
                accepted={false}
              />
            )}
            <button type="button" onClick={() => void refetch()}>
              Try again
            </button>
            <button type="button" onClick={handleGoHome}>
              Back to Explore
            </button>
          </section>
        )}
        {activeTopic && data && !isError && (
          <>
            {isComparing && (
              <h1 className={ui.comparisonTitle}>Compare reading interest</h1>
            )}
            {isComparing && (
              <div className={ui.compareSearch}>
                <TopicSearch
                  autoFocus
                  activeTopic={comparisonTopic}
                  onSearch={setComparisonTopic}
                  label="Compare with another subject"
                  placeholder="Choose a second subject…"
                />
                <p className={ui.compareHint} role="status">
                  {isComparisonLoading
                    ? "Loading the second subject…"
                    : !comparisonTopic
                      ? "Choose a subject to compare daily views on the same scale."
                      : comparisonData && !isComparisonError
                        ? `Comparing ${data.title} with ${comparisonData.title}.`
                        : ""}
                </p>
              </div>
            )}
            {isComparisonError && (
              <div role="alert" className={ui.error}>
                <p>{(comparisonError as Error).message}</p>
                {comparisonTopic &&
                  comparisonError instanceof TopicRelevanceError && (
                    <ClassificationReport
                      key={comparisonTopic}
                      slug={comparisonTopic}
                      accepted={false}
                    />
                  )}
                <button type="button" onClick={() => void refetchComparison()}>
                  Try comparison again
                </button>
              </div>
            )}
            {exportError && (
              <p role="alert" className={ui.error}>
                {exportError}
              </p>
            )}
            <div
              key={data.slug}
              ref={pulseExportRef}
              className={ui.exportSurface}
              data-pulse-export
            >
              <div className={ui.exportHeader} data-export-header>
                <span>The Nigerian History Pulse</span>
                <span>Wikipedia reading history</span>
              </div>
              <div
                className={`${ui.topicHeader} ${isComparing ? ui.comparingHeader : ""}`}
              >
                <div
                  className={`${ui.topicCards} ${isComparing ? ui.comparison : ""}`}
                >
                  <TopicCard
                    key={`primary-${data.slug}`}
                    topic={data}
                    compact={isComparing}
                  />
                  {isComparing && isComparisonLoading && (
                    <Skeleton height="140px" />
                  )}
                  {isComparing && comparisonData && (
                    <TopicCard
                      key={`comparison-${comparisonData.slug}`}
                      topic={comparisonData}
                      compact
                    />
                  )}
                </div>
                <div className={ui.actions} data-export-ignore="true">
                  <button
                    type="button"
                    aria-pressed={isComparing}
                    disabled={isExporting}
                    onClick={() => {
                      if (isComparing) setComparisonTopic(null);
                      setIsComparing(!isComparing);
                    }}
                  >
                    {isComparing ? "Remove comparison" : "Compare"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPulse}
                    disabled={
                      isExporting ||
                      (isComparing &&
                        (isComparisonLoading || isComparisonError))
                    }
                  >
                    {isExporting ? "Preparing image…" : "Download PNG"}
                  </button>
                </div>
              </div>
              <section
                className={ui.chartSection}
                aria-label="Wikipedia reading history"
              >
                <PulseChart
                  key={data.slug}
                  pageviews={data.pageviews}
                  title={data.title}
                  comparisonPageviews={
                    isComparing ? comparisonData?.pageviews : undefined
                  }
                  comparisonTitle={comparisonData?.title}
                />
              </section>
            </div>
            {!isComparing && (
              <>
                <ClassificationReport
                  key={data.slug}
                  slug={data.slug}
                  accepted
                />
                <RelatedTopics
                  slug={activeTopic}
                  onSelectTopic={handleSelectTopic}
                />
                {isInAfrobeatThread(data.slug) && (
                  <a
                    className={ui.readingLink}
                    href="/stories/afrobeat"
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
                      handleOpenStories("afrobeat");
                    }}
                  >
                    <div>
                      <h2>The people behind Afrobeat</h2>
                      <p>Go deeper in Stories, separate from the explorer.</p>
                    </div>
                  </a>
                )}
                <a
                  className={ui.readingLink}
                  href={subjectStoryPath(data.slug)}
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
                    handleOpenStories("subject", data.slug);
                  }}
                >
                  <div>
                    <h2>Behind the Wikipedia article</h2>
                    <p>Read the source breakdown in Stories.</p>
                  </div>
                </a>
              </>
            )}
          </>
        )}
        {!activeTopic &&
          (route.view === "home" || route.view === "discover") && (
            <ExplorePage
              browse={browse}
              onBrowseChange={setBrowse}
              onSelectTopic={handleSelectTopic}
              onDataGuide={() => handleOpenStories("reading-the-pulse")}
              onReady={restoreBrowseScroll}
            />
          )}
        {route.view === "stories" && (
          <StoriesPage
            story={route.story}
            subject={route.subject}
            onOpen={handleOpenStories}
            onSelectTopic={handleSelectTopic}
          />
        )}
      </main>
      <footer className={ui.footer}>
        <div>
          <p>Wikipedia reading history · dates and coverage vary by subject</p>
          <p>
            Descriptions come from Wikipedia and may contain errors or outdated
            information. Verify details using the article’s cited sources.
          </p>
        </div>
        <a
          href="/stories/reading-the-pulse"
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
            handleOpenStories("reading-the-pulse");
          }}
        >
          About the data
        </a>
      </footer>
    </div>
  );
}
export default App;
