import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedTopics } from "../services/api";
import {
  collectSubjects,
  latestCollectionDate,
  selectSubjects,
  EXPLORE_GROUPS,
  updateBrowseState,
} from "../utils/explore";
import type { BrowseState } from "../utils/explore";
import { formatChartDate } from "../utils/chartData";
import { TopicSearch } from "./TopicSearch";
import { TopicLink } from "./TopicLink";
import { LayoutSwitch } from "./LayoutSwitch";
import { Skeleton } from "./Skeleton";
import ui from "./ExplorePage.module.scss";

interface ExplorePageProps {
  browse: BrowseState;
  onBrowseChange: (next: BrowseState) => void;
  onSelectTopic: (slug: string) => void;
  onDataGuide: () => void;
  onReady: () => void;
}
function Sparkline({ points }: { points: { views: number | null }[] }) {
  const max = Math.max(1, ...points.map((point) => point.views ?? 0));
  let path = "",
    connected = false;
  points.forEach((point, index) => {
    if (point.views === null) {
      connected = false;
      return;
    }
    path += `${connected ? "L" : "M"}${((index / Math.max(1, points.length - 1)) * 136 + 2).toFixed(2)},${(35 - (point.views / max) * 30).toFixed(2)} `;
    connected = true;
  });
  return (
    <svg
      className={ui.spark}
      width="140"
      height="40"
      viewBox="0 0 140 40"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
export function ExplorePage({
  browse,
  onBrowseChange,
  onSelectTopic,
  onDataGuide,
  onReady,
}: ExplorePageProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["featuredTopics"],
    queryFn: fetchFeaturedTopics,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const subjects = useMemo(() => collectSubjects(data ?? []), [data]);
  const through = useMemo(() => latestCollectionDate(subjects), [subjects]);
  const filtered = useMemo(
    () => selectSubjects(subjects, browse, through),
    [subjects, browse, through],
  );
  const visibleCount = browse.visibleCount;
  const restoredPosition = useRef(false);
  const changeBrowse = (changes: Partial<BrowseState>) =>
    onBrowseChange(updateBrowseState(browse, changes));
  useEffect(() => {
    if (data && !isLoading && !restoredPosition.current) {
      restoredPosition.current = true;
      onReady();
    }
  }, [data, isLoading, onReady]);
  const groups = EXPLORE_GROUPS.filter(
    (group) =>
      group === "All subjects" ||
      subjects.some((subject) => subject.groups.includes(group)),
  );
  return (
    <>
      <div className={ui.heading}>
        <div>
          <h1>Explore Nigerian history</h1>
          <p>Find a subject. See how reading interest changes.</p>
        </div>
        <p className={ui.date}>
          {through ? (
            <>
              Wikipedia pageviews
              <br />
              Through {formatChartDate(through)}
            </>
          ) : (
            "Wikipedia reading history"
          )}
        </p>
      </div>
      <TopicSearch
        activeTopic={null}
        onSearch={(topic) => {
          if (topic) onSelectTopic(topic);
        }}
        queryValue={browse.query}
        onQueryChange={(query) => changeBrowse({ query })}
        label="Search people, places and events"
        placeholder="Search people, places and events…"
      />
      <div className={ui.filters}>
        <div
          className={ui.categories}
          role="group"
          aria-label="Subject category"
        >
          {(groups.length > 1 ? groups : EXPLORE_GROUPS).map((category) => (
            <button
              type="button"
              key={category}
              aria-pressed={browse.category === category}
              onClick={() => changeBrowse({ category })}
            >
              {category}
            </button>
          ))}
        </div>
        <label className={ui.sort}>
          Sort by{" "}
          <select
            value={browse.sort}
            onChange={(event) =>
              changeBrowse({
                sort: event.target.value as BrowseState["sort"],
              })
            }
          >
            <option value="read">Most read</option>
            <option value="rising">Fastest rising</option>
            <option value="name">A–Z</option>
          </select>
        </label>
      </div>
      <div className={ui.resultsHeading}>
        <h2 role="status" aria-live="polite">
          {isLoading
            ? "Loading subjects…"
            : isError
              ? "Collection unavailable"
              : `${filtered.length} ${filtered.length === 1 ? "subject" : "subjects"}${browse.query ? ` matching “${browse.query}”` : " to explore"}`}
        </h2>
        <div className={ui.tools}>
          <p>Views · most recent 30 returned days</p>
          <LayoutSwitch
            value={browse.layout}
            onChange={(layout) => changeBrowse({ layout })}
          />
        </div>
      </div>
      {isLoading ? (
        <div
          className={ui.grid}
          aria-busy="true"
          aria-label="Loading collection"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height="165px" />
          ))}
        </div>
      ) : isError ? (
        <div className={ui.empty} role="alert">
          <h2>The collection couldn’t be loaded.</h2>
          <p>
            You can still search Wikipedia above, or try loading the subjects
            again.
          </p>
          <button type="button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : !filtered.length ? (
        <div className={ui.empty}>
          <h2>
            {subjects.length
              ? "No matching subjects."
              : "No curated subjects are available yet."}
          </h2>
          <p>
            {subjects.length
              ? "Try a shorter name or another category. Search suggestions can also take you beyond this collection."
              : "Search above to open a Nigerian subject on Wikipedia."}
          </p>
          {subjects.length > 0 && (
            <button
              type="button"
              onClick={() =>
                changeBrowse({
                  query: "",
                  category: "All subjects",
                })
              }
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={browse.layout === "grid" ? ui.grid : ui.list}>
            {filtered.slice(0, visibleCount).map(({ subject, metrics }) => (
              <TopicLink
                key={subject.slug}
                slug={subject.slug}
                onSelectTopic={onSelectTopic}
                className={ui.subject}
              >
                <div className={ui.identity}>
                  <h3>{subject.title}</h3>
                  {subject.description && <p>{subject.description}</p>}
                  <span>{subject.groups.join(" · ")}</span>
                </div>
                <div className={ui.stat}>
                  {metrics.recordedDays ? metrics.total.toLocaleString() : "—"}
                  <small>
                    {metrics.growth !== null
                      ? `${metrics.growth >= 0 ? "+" : ""}${metrics.growth.toFixed(1)}% vs prior 30 days`
                      : `${metrics.recordedDays}/30 recorded days`}
                  </small>
                </div>
                <Sparkline points={metrics.recent} />
              </TopicLink>
            ))}
          </div>
          {filtered.length > visibleCount && (
            <button
              className={ui.more}
              type="button"
              onClick={() => changeBrowse({ visibleCount: visibleCount + 24 })}
            >
              Show more subjects ({filtered.length - visibleCount} remaining)
            </button>
          )}
        </>
      )}
      <div className={ui.caption}>
        <p>
          Percent changes require two complete 30-day windows. Sparklines use
          each subject’s own scale.
        </p>
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
            onDataGuide();
          }}
        >
          How to read this data
        </a>
      </div>
    </>
  );
}
