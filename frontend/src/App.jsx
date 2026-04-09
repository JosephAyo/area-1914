import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from './components/Header';
import { TopicSearch } from './components/TopicSearch';
import { TopicCard } from './components/TopicCard';
import { PulseChart } from './components/PulseChart';
import { TrendingSection } from './components/TrendingSection';
import { FeaturedTopics } from './components/FeaturedTopics';
import { CitationSources } from './components/CitationSources';
import { fetchTopicData } from './services/api';
import styles from './App.module.scss';

function App() {
  const [activeTopic, setActiveTopic] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['topic', activeTopic],
    queryFn: () => fetchTopicData(activeTopic),
    enabled: !!activeTopic,
    retry: false
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
          onSearch={(topic) => setActiveTopic(topic)}
        />

        <div className={styles.dashboardArea}>
          {isLoading && <div className={styles.loading}>Generating pulse for {activeTopic}...</div>}
          {isError && <div className={styles.error}>Error: {error.message}</div>}

          {data && (
            <>
              <div className={styles.resultsGrid}>
                <TopicCard topic={data} />
                <div className={styles.chartSection}>
                  <h2>30-Day Pulse</h2>
                  <PulseChart pageviews={data.pageviews} />
                </div>
              </div>
              <CitationSources slug={activeTopic} />
            </>
          )}

          {!activeTopic && !isLoading && (
            <>
              <FeaturedTopics onSelectTopic={setActiveTopic} />
              <TrendingSection onSelectTopic={setActiveTopic} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
