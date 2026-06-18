import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "./components/Header";
import { TopicSearch } from "./components/TopicSearch";
import { TopicCard } from "./components/TopicCard";
import { PulseChart } from "./components/PulseChart";
import { TrendingSection } from "./components/TrendingSection";
import { FeaturedTopics } from "./components/FeaturedTopics";
import { Methodology } from "./components/Methodology";
import { CitationSources } from "./components/CitationSources";
import { Skeleton } from "./components/Skeleton";
import { fetchTopicData } from "./services/api";
import type { TopicData } from "./types/index";
import styles from "./App.module.scss";

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

  const { data, isLoading, isError, error } = useQuery<TopicData>({
    queryKey: ["topic", activeTopic],
    queryFn: () => fetchTopicData(activeTopic!),
    enabled: !!activeTopic,
    retry: false,
  });

  const handleGoHome = () => {
    setActiveTopic(null);
  };

  return (
    <div className={styles.appContainer}>
      <Header onHomeClick={handleGoHome} />
      <main className={styles.mainContent}>
        <TopicSearch
          activeTopic={activeTopic}
          onSearch={(topic: string | null) => setActiveTopic(topic)}
        />

        <div className={styles.dashboardArea}>
          {isLoading && <PulseSkeletonView />}
          {isError && (
            <div className={styles.error}>
              Error: {(error as Error).message}
            </div>
          )}

          {data && (
            <>
              <button className={styles.mobileCloseBtn} onClick={handleGoHome}>
                ✕ Close Pulse
              </button>
              <div className={styles.resultsGrid}>
                <TopicCard topic={data} />
                <div className={styles.chartSection}>
                  <PulseChart pageviews={data.pageviews} />
                </div>
              </div>
              <CitationSources slug={activeTopic!} />
            </>
          )}

          {!activeTopic && !isLoading && (
            <div className={styles.homeLayout}>
              <div className={styles.featuredWrapper}>
                <FeaturedTopics onSelectTopic={setActiveTopic} />
              </div>
              <div className={styles.trendingWrapper}>
                <TrendingSection onSelectTopic={setActiveTopic} />
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
