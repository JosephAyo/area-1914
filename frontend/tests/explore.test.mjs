import test from "node:test";
import assert from "node:assert/strict";
import {
  collectSubjects,
  latestCollectionDate,
  subjectMetrics,
  selectSubjects,
  initialBrowseState,
  updateBrowseState,
} from "../src/utils/explore.ts";

test("expanded results survive layout changes while new filters restart pagination", () => {
  const expanded = updateBrowseState(initialBrowseState, { visibleCount: 48 });
  const list = updateBrowseState(expanded, { layout: "list" });
  assert.equal(list.visibleCount, 48);
  assert.equal(updateBrowseState(list, { layout: "grid" }).visibleCount, 48);
  for (const change of [
    { query: "Lagos" },
    { category: "Culture" },
    { sort: "name" },
  ]) {
    assert.equal(updateBrowseState(list, change).visibleCount, 24);
  }
  assert.equal(expanded.visibleCount, 48);
  assert.equal(initialBrowseState.visibleCount, 24);
});

function entries(recent = 20, previous = 10) {
  return Array.from({ length: 60 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 5, 30) - (59 - index) * 86_400_000)
      .toISOString()
      .slice(0, 10),
    views: index < 30 ? previous : recent,
  }));
}

test("duplicate subjects are merged while preserving browse memberships", () => {
  const topic = {
    slug: "Olusegun_Obasanjo",
    title: "Olusegun Obasanjo",
    pageviews: entries(),
  };
  const collection = collectSubjects([
    { name: "Military Leaders", icon: "", topics: [topic] },
    {
      name: "Major Events",
      icon: "",
      topics: [{ ...topic, slug: "Olusegun Obasanjo" }],
    },
  ]);
  assert.equal(collection.length, 1);
  assert.deepEqual(collection[0].groups, ["People", "Events"]);
  assert.equal(topic.groups, undefined);
});

test("percentage changes compare complete, aligned calendar windows", () => {
  const subject = { slug: "Lagos", title: "Lagos", pageviews: entries() };
  const metrics = subjectMetrics(subject, "2026-06-30");
  assert.equal(metrics.total, 600);
  assert.equal(metrics.recordedDays, 30);
  assert.equal(metrics.growth, 100);
  assert.equal(metrics.recent[0].date, "2026-06-01");
  assert.equal(metrics.recent.at(-1).date, "2026-06-30");
});

test("partial data is not promoted to a percentage or fabricated zero", () => {
  const subject = {
    slug: "Lagos",
    title: "Lagos",
    pageviews: [{ date: "2026-06-29", views: 0 }],
  };
  const metrics = subjectMetrics(subject, "2026-06-30");
  assert.equal(metrics.growth, null);
  assert.equal(metrics.recordedDays, 1);
  assert.equal(metrics.recent.at(-2).views, 0);
  assert.equal(metrics.recent.at(-1).views, null);
  assert.equal(
    subjectMetrics({ ...subject, pageviews: entries(2, 0) }, "2026-06-30")
      .growth,
    null,
  );
});

test("the collection uses one cutoff and rejects malformed or negative records", () => {
  const collection = collectSubjects([
    {
      name: "Culture",
      icon: "",
      topics: [
        {
          slug: "Fela_Kuti",
          title: "Fela Kuti",
          pageviews: [
            { date: "2026-06-30", views: 5 },
            { date: "2026-02-30", views: 99 },
            { date: "2027-01-01", views: -3 },
          ],
        },
      ],
    },
  ]);
  assert.equal(collection[0].pageviews.length, 1);
  assert.equal(latestCollectionDate(collection), "2026-06-30");
  assert.equal(latestCollectionDate([]), null);
});

test("query and category filtering cooperate and keep Noto-friendly diacritics searchable", () => {
  const collection = collectSubjects([
    {
      name: "Culture",
      icon: "",
      topics: [
        {
          slug: "Fela_Kuti",
          title: "Fẹlá Kútì",
          description: "Nigerian musician",
          pageviews: entries(),
        },
      ],
    },
  ]);
  const state = {
    ...initialBrowseState,
    query: "fela musician",
    category: "Culture",
  };
  assert.equal(selectSubjects(collection, state, "2026-06-30").length, 1);
  assert.equal(
    selectSubjects(collection, { ...state, category: "Places" }, "2026-06-30")
      .length,
    0,
  );
});

test("sorting uses displayed totals or valid growth, and grid remains the default", () => {
  const collection = collectSubjects([
    {
      name: "Places",
      icon: "",
      topics: [
        { slug: "A", title: "A", pageviews: entries(100, 90) },
        { slug: "B", title: "B", pageviews: entries(20, 1) },
        { slug: "C", title: "C", pageviews: [] },
      ],
    },
  ]);
  assert.equal(initialBrowseState.layout, "grid");
  assert.equal(
    selectSubjects(collection, initialBrowseState, "2026-06-30")[0].subject
      .slug,
    "A",
  );
  // B's previous 30-day sum is below the 50-view threshold.
  assert.equal(
    selectSubjects(
      collection,
      { ...initialBrowseState, sort: "rising" },
      "2026-06-30",
    )[0].subject.slug,
    "A",
  );
});
