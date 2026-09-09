import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "./components/Header";
import { TopicSearch } from "./components/TopicSearch";
import { TopicCard } from "./components/TopicCard";
import { PulseChart } from "./components/PulseChart";
import { TrendingSection } from "./components/TrendingSection";
import { FeaturedTopics } from "./components/FeaturedTopics";
import { DiscoverPage } from "./components/DiscoverPage";
import { Methodology } from "./components/Methodology";
import { CitationSources } from "./components/CitationSources";
import { RelatedTopics } from "./components/RelatedTopics";
import { OnThisDay } from "./components/OnThisDay";
import { Skeleton } from "./components/Skeleton";
import { fetchTopicData } from "./services/api";
import type { TopicData } from "./types/index";
import {
  normalizeTopicSlug,
  pushAppRoute,
  readAppRoute,
  topicPath,
} from "./utils/navigation";
import { defaultMetadata, updatePageMetadata } from "./utils/seo";
import styles from "./App.module.scss";

type View = "home" | "discover";

function PulseSkeletonView() {
  return (
    <div className={styles.resultsGrid}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
        }}
      >
        <Skeleton height="200px" borderRadius="var(--radius-md)" />
        <Skeleton height="1.2rem" width="60%" />
        <Skeleton height="0.9rem" width="80%" />
        <Skeleton height="0.9rem" width="70%" />
        <Skeleton height="0.9rem" width="50%" />
      </div>
      <div className={styles.chartSection}>
        <Skeleton height="1.25rem" width="40%" />
        <Skeleton
          height="260px"
          borderRadius="var(--radius-sm)"
          style={{ marginTop: "var(--space-lg)" }}
        />
        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            marginTop: "var(--space-md)",
          }}
        >
          <Skeleton
            width="60px"
            height="32px"
            borderRadius="var(--radius-xl)"
          />
          <Skeleton
            width="60px"
            height="32px"
            borderRadius="var(--radius-xl)"
          />
          <Skeleton
            width="60px"
            height="32px"
            borderRadius="var(--radius-xl)"
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [initialRoute] = useState(readAppRoute);
  const [activeTopic, setActiveTopic] = useState<string | null>(
    initialRoute.topic,
  );
  const [comparisonTopic, setComparisonTopic] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [view, setView] = useState<View>(initialRoute.view);
  const pulseExportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePopState = () => {
      const route = readAppRoute();
      setActiveTopic(route.topic);
      setComparisonTopic(null);
      setIsComparing(false);
      setView(route.view);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const { data, isLoading, isError, error } = useQuery<TopicData>({
    queryKey: ["topic", activeTopic],
    queryFn: () => fetchTopicData(activeTopic!),
    enabled: !!activeTopic,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      updatePageMetadata({
        title: `${data.title} Interest & Pageview History | Nigerian History Pulse`,
        description: `Explore five years of Wikipedia interest in ${data.title}${data.description ? `, ${data.description.toLowerCase()}` : ""}, with interactive daily pageview trends.`,
        path: topicPath(data.slug),
        image: data.thumbnail_url,
      });
    } else if (view === "discover") {
      updatePageMetadata({
        title: "Discover Nigerian History Topics | Nigerian History Pulse",
        description:
          "Browse Nigerian leaders, major events, kingdoms, culture, politics, conflicts, and society through interactive Wikipedia interest data.",
        path: "/discover",
      });
    } else {
      updatePageMetadata(defaultMetadata);
    }
  }, [data, view]);

  const {
    data: comparisonData,
    isLoading: isComparisonLoading,
    isError: isComparisonError,
    error: comparisonError,
  } = useQuery<TopicData>({
    queryKey: ["topic", comparisonTopic],
    queryFn: () => fetchTopicData(comparisonTopic!),
    enabled: isComparing && !!comparisonTopic,
    retry: false,
  });

  const handleGoHome = () => {
    setActiveTopic(null);
    setComparisonTopic(null);
    setIsComparing(false);
    setView("home");
    pushAppRoute("/");
  };

  const handleSelectTopic = (topic: string) => {
    const slug = normalizeTopicSlug(topic);
    setActiveTopic(slug);
    setView("home");
    pushAppRoute(topicPath(slug));
  };

  const handlePrimarySearch = (topic: string | null) => {
    const slug = topic ? normalizeTopicSlug(topic) : null;
    setActiveTopic(slug);
    if (!topic) {
      setComparisonTopic(null);
      setIsComparing(false);
      pushAppRoute("/");
    } else {
      pushAppRoute(topicPath(slug!));
    }
  };

  const handleOpenDiscover = () => {
    setView("discover");
    pushAppRoute("/discover");
  };

  const handleCompareToggle = () => {
    setIsComparing((current) => {
      if (current) {
        setComparisonTopic(null);
      }
      return !current;
    });
  };

  const handleDownloadPulse = async () => {
    if (!pulseExportRef.current || !data) {
      return;
    }

    setIsExporting(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(pulseExportRef.current, {
        backgroundColor: "#0b0c10",
        scale: 2,
        useCORS: true,
        ignoreElements: (element) =>
          element instanceof HTMLElement &&
          element.dataset.exportIgnore === "true",
      });
      const imageUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${data.slug.replace(/[^a-z0-9_-]/gi, "_")}-pulse.png`;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.appContainer}>
      <Header onHomeClick={handleGoHome} />
      <main className={styles.mainContent}>
        {!activeTopic && view === "home" && (
          <section className={styles.hero}>
            <h1>Explore the pulse of Nigerian history</h1>
            <p>
              Discover how interest in Nigeria&apos;s people, culture, politics,
              and defining events has changed through five years of Wikipedia
              data.
            </p>
          </section>
        )}
        <TopicSearch
          activeTopic={activeTopic}
          onSearch={handlePrimarySearch}
          label="Primary topic"
          placeholder="Search primary topic (e.g. Lagos, Fela Kuti)..."
        />

        <div className={styles.dashboardArea}>
          {isLoading && <PulseSkeletonView />}
          {isError && (
            <div className={styles.error}>
              Error: {(error as Error).message}
            </div>
          )}

          {activeTopic && !isLoading && !isError && (
            <div className={styles.compareBar}>
              <button
                type="button"
                className={isComparing ? styles.compareActive : ""}
                onClick={handleCompareToggle}
                aria-pressed={isComparing}
              >
                {isComparing ? "Exit comparison" : "Compare"}
              </button>
              {isComparing && (
                <TopicSearch
                  activeTopic={comparisonTopic}
                  onSearch={(topic: string | null) => setComparisonTopic(topic)}
                  label="Compare with topic"
                  placeholder="Compare with another topic..."
                />
              )}
            </div>
          )}

          {isComparisonError && (
            <div className={styles.error}>
              Error: {(comparisonError as Error).message}
            </div>
          )}

          {data && (
            <>
              <button className={styles.mobileCloseBtn} onClick={handleGoHome}>
                ✕ Close Pulse
              </button>
              {!isComparing && (
                <div className={styles.exportActions}>
                  <button
                    type="button"
                    onClick={handleDownloadPulse}
                    disabled={isExporting}
                  >
                    {isExporting ? "Preparing..." : "Download Pulse"}
                  </button>
                </div>
              )}
              <div
                ref={pulseExportRef}
                className={`${styles.exportSurface} ${isExporting ? styles.exporting : ""}`}
              >
                <div className={styles.exportHeader}>
                  <span>The Nigerian History Pulse</span>
                  <span>area1914</span>
                </div>
                <div className={styles.resultsGrid}>
                  <div className={styles.topicCards}>
                    <TopicCard topic={data} compact={isComparing} />
                    {isComparing && isComparisonLoading && (
                      <Skeleton
                        height="120px"
                        borderRadius="var(--radius-md)"
                      />
                    )}
                    {isComparing && comparisonData && (
                      <TopicCard topic={comparisonData} compact />
                    )}
                  </div>
                  <div className={styles.chartSection}>
                    <PulseChart
                      pageviews={data.pageviews}
                      title={data.title}
                      comparisonPageviews={
                        isComparing ? comparisonData?.pageviews : undefined
                      }
                      comparisonTitle={comparisonData?.title}
                    />
                  </div>
                </div>
              </div>
              {!isComparing && (
                <>
                  <RelatedTopics
                    slug={activeTopic!}
                    onSelectTopic={handleSelectTopic}
                  />
                  <CitationSources slug={activeTopic!} />
                </>
              )}
            </>
          )}

          {!activeTopic && !isLoading && view === "discover" && (
            <DiscoverPage
              onSelectTopic={handleSelectTopic}
              onBack={handleGoHome}
            />
          )}

          {!activeTopic && !isLoading && view === "home" && (
            <div className={styles.homeLayout}>
              <div className={styles.featuredWrapper}>
                <FeaturedTopics
                  onSelectTopic={handleSelectTopic}
                  preview
                  onViewAll={handleOpenDiscover}
                />
              </div>
              <div className={styles.trendingWrapper}>
                <TrendingSection onSelectTopic={handleSelectTopic} />
              </div>
              <div className={styles.anniversaryWrapper}>
                <OnThisDay onSelectTopic={handleSelectTopic} />
              </div>
              <div className={styles.methodologyWrapper}>
                <Methodology />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
