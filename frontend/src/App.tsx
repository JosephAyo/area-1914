import { useState } from "react";
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
import { Skeleton } from "./components/Skeleton";
import { fetchTopicData } from "./services/api";
import type { TopicData } from "./types/index";
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
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [comparisonTopic, setComparisonTopic] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [view, setView] = useState<View>("home");

  const { data, isLoading, isError, error } = useQuery<TopicData>({
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
  };

  const handleSelectTopic = (slug: string) => {
    setActiveTopic(slug);
    setView("home");
  };

  const handlePrimarySearch = (topic: string | null) => {
    setActiveTopic(topic);
    if (!topic) {
      setComparisonTopic(null);
      setIsComparing(false);
    }
  };

  const handleCompareToggle = () => {
    setIsComparing((current) => {
      if (current) {
        setComparisonTopic(null);
      }
      return !current;
    });
  };

  return (
    <div className={styles.appContainer}>
      <Header onHomeClick={handleGoHome} />
      <main className={styles.mainContent}>
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
              <div className={styles.resultsGrid}>
                <div className={styles.topicCards}>
                  <TopicCard topic={data} compact={isComparing} />
                  {isComparing && isComparisonLoading && (
                    <Skeleton height="120px" borderRadius="var(--radius-md)" />
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
              {!isComparing && <CitationSources slug={activeTopic!} />}
            </>
          )}

          {!activeTopic && !isLoading && view === "discover" && (
            <DiscoverPage
              onSelectTopic={handleSelectTopic}
              onBack={() => setView("home")}
            />
          )}

          {!activeTopic && !isLoading && view === "home" && (
            <div className={styles.homeLayout}>
              <div className={styles.featuredWrapper}>
                <FeaturedTopics
                  onSelectTopic={handleSelectTopic}
                  preview
                  onViewAll={() => setView("discover")}
                />
              </div>
              <div className={styles.trendingWrapper}>
                <TrendingSection onSelectTopic={handleSelectTopic} />
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
