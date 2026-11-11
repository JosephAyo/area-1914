import type {
  FeaturedCategory,
  PageviewEntry,
  TopicData,
} from "../types/index";

export const EXPLORE_GROUPS = [
  "All subjects",
  "Culture",
  "People",
  "Places",
  "Events",
  "Society",
] as const;
export type ExploreGroup = (typeof EXPLORE_GROUPS)[number];
export interface BrowseState {
  query: string;
  category: ExploreGroup;
  sort: "read" | "rising" | "name";
  layout: "grid" | "list";
  visibleCount: number;
}
export const initialBrowseState: BrowseState = {
  query: "",
  category: "All subjects",
  sort: "read",
  layout: "grid",
  visibleCount: 24,
};
export function updateBrowseState(
  current: BrowseState,
  changes: Partial<BrowseState>,
): BrowseState {
  const next = { ...current, ...changes };
  if (
    next.query !== current.query ||
    next.category !== current.category ||
    next.sort !== current.sort
  )
    next.visibleCount = 24;
  return next;
}
export interface ExploreSubject extends TopicData {
  groups: ExploreGroup[];
}
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
function categoryGroup(name: string): ExploreGroup {
  if (/leader|president|nationalist|people/i.test(name)) return "People";
  if (/kingdom|empire|place|cities/i.test(name)) return "Places";
  if (/event|election|politic|conflict|security|colonial/i.test(name))
    return "Events";
  if (/art|culture/i.test(name)) return "Culture";
  return "Society";
}
function validEntries(entries: PageviewEntry[]) {
  return entries.filter(
    (entry) =>
      /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
      Number.isFinite(Date.parse(entry.date)) &&
      new Date(entry.date).toISOString().slice(0, 10) === entry.date &&
      Number.isFinite(entry.views) &&
      entry.views >= 0,
  );
}
export function collectSubjects(
  categories: FeaturedCategory[],
): ExploreSubject[] {
  const subjects = new Map<string, ExploreSubject>();
  for (const category of categories) {
    const group = categoryGroup(category.name);
    for (const topic of category.topics) {
      const key = topic.title.trim().replace(/\s+/g, "_").toLowerCase();
      const existing = subjects.get(key);
      if (existing) {
        if (!existing.groups.includes(group)) existing.groups.push(group);
        if (topic.pageviews.length > existing.pageviews.length)
          existing.pageviews = validEntries(topic.pageviews);
      } else
        subjects.set(key, {
          ...topic,
          pageviews: validEntries(topic.pageviews),
          groups: [group],
        });
    }
  }
  return [...subjects.values()];
}
export function latestCollectionDate(subjects: ExploreSubject[]) {
  let latest: string | null = null;
  for (const subject of subjects)
    for (const point of subject.pageviews)
      if (!latest || point.date > latest) latest = point.date;
  return latest;
}
export function subjectMetrics(subject: TopicData, through: string | null) {
  if (!through)
    return {
      total: 0,
      recordedDays: 0,
      growth: null,
      recent: [] as { date: string; views: number | null }[],
    };
  const byDate = new Map(
    validEntries(subject.pageviews).map((entry) => [entry.date, entry.views]),
  );
  const end = Date.parse(through);
  const points = Array.from({ length: 60 }, (_, index) => {
    const date = new Date(end - (59 - index) * 86_400_000)
      .toISOString()
      .slice(0, 10);
    return { date, views: byDate.get(date) ?? null };
  });
  const recent = points.slice(30),
    previous = points.slice(0, 30);
  const currentRecords = recent.filter((point) => point.views !== null),
    previousRecords = previous.filter((point) => point.views !== null);
  const total = currentRecords.reduce(
    (sum, point) => sum + (point.views ?? 0),
    0,
  );
  const priorTotal = previousRecords.reduce(
    (sum, point) => sum + (point.views ?? 0),
    0,
  );
  const growth =
    currentRecords.length === 30 &&
    previousRecords.length === 30 &&
    priorTotal >= 50
      ? ((total - priorTotal) / priorTotal) * 100
      : null;
  return { total, recordedDays: currentRecords.length, growth, recent };
}
export function selectSubjects(
  subjects: ExploreSubject[],
  state: BrowseState,
  through: string | null,
) {
  const terms = normalizeSearch(state.query.trim())
    .split(/\s+/)
    .filter(Boolean);
  return subjects
    .map((subject) => ({ subject, metrics: subjectMetrics(subject, through) }))
    .filter(
      ({ subject }) =>
        (state.category === "All subjects" ||
          subject.groups.includes(state.category)) &&
        terms.every((term) =>
          normalizeSearch(
            `${subject.title} ${subject.description ?? ""} ${subject.groups.join(" ")}`,
          ).includes(term),
        ),
    )
    .sort((a, b) => {
      if (state.sort === "name")
        return a.subject.title.localeCompare(b.subject.title);
      const difference =
        state.sort === "rising"
          ? (b.metrics.growth ?? -Infinity) - (a.metrics.growth ?? -Infinity)
          : (b.metrics.recordedDays ? b.metrics.total : -1) -
            (a.metrics.recordedDays ? a.metrics.total : -1);
      return difference || a.subject.title.localeCompare(b.subject.title);
    });
}
