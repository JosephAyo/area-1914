import test from "node:test";
import assert from "node:assert/strict";
import {
  buildChartData,
  summarizeSeries,
  formatChartDate,
} from "../src/utils/chartData.ts";

test("missing calendar days are gaps while a recorded zero stays zero", () => {
  const result = buildChartData(
    [
      { date: "2026-06-01", views: 0 },
      { date: "2026-06-03", views: 10 },
    ],
    undefined,
    "all",
  );
  assert.deepEqual(
    result.map(({ primaryViews }) => primaryViews),
    [0, null, 10],
  );
  assert.deepEqual(summarizeSeries(result, "primaryViews"), {
    recordedDays: 2,
    total: 10,
  });
});

test("comparison dates stay aligned without fabricating primary or comparison views", () => {
  const result = buildChartData(
    [{ date: "2026-06-01", views: 50 }],
    [{ date: "2026-06-03", views: 20 }],
    "all",
  );
  assert.deepEqual(result, [
    { date: "2026-06-01", primaryViews: 50, comparisonViews: null },
    { date: "2026-06-02", primaryViews: null, comparisonViews: null },
    { date: "2026-06-03", primaryViews: null, comparisonViews: 20 },
  ]);
});

test("30-day window contains exactly 30 calendar days ending on the latest available date", () => {
  const result = buildChartData(
    [
      { date: "2026-01-01", views: 10 },
      { date: "2026-06-30", views: 20 },
    ],
    undefined,
    "30d",
  );
  assert.equal(result.length, 30);
  assert.equal(result[0].date, "2026-06-01");
  assert.equal(result.at(-1).date, "2026-06-30");
});

test("one-year coverage uses UTC calendar arithmetic across a leap year", () => {
  const result = buildChartData(
    [
      { date: "2023-01-01", views: 10 },
      { date: "2024-03-01", views: 20 },
    ],
    undefined,
    "1y",
  );
  assert.equal(result[0].date, "2023-03-02");
  assert.equal(result.length, 366);
  assert.ok(result.some((point) => point.date === "2024-02-29"));
});

test("90-day period includes exactly 90 aligned calendar dates", () => {
  const result = buildChartData(
    [
      { date: "2026-01-01", views: 1 },
      { date: "2026-06-30", views: 3 },
    ],
    undefined,
    "90d",
  );
  assert.equal(result.length, 90);
  assert.equal(result[0].date, "2026-04-02");
  assert.equal(result.at(-1).date, "2026-06-30");
});

test("a one-year window ending on leap day includes the preceding March 1", () => {
  const result = buildChartData(
    [
      { date: "2023-01-01", views: 10 },
      { date: "2024-02-29", views: 20 },
    ],
    undefined,
    "1y",
  );
  assert.equal(result[0].date, "2023-03-01");
  assert.equal(result.length, 366);
});

test("invalid dates and invalid view counts do not enter the displayed series", () => {
  const result = buildChartData(
    [
      { date: "2026-02-30", views: 10 },
      { date: "2026-06-01", views: -1 },
      { date: "invalid", views: 3 },
      { date: "2026-06-02", views: NaN },
    ],
    undefined,
    "all",
  );
  assert.deepEqual(result, []);
  assert.deepEqual(summarizeSeries(result, "primaryViews"), {
    recordedDays: 0,
    total: 0,
  });
});

test("date labels preserve the recorded calendar date", () => {
  assert.equal(formatChartDate("2026-06-01"), "1 Jun 2026");
});
