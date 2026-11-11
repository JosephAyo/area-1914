import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const sandbox = vm.createContext({ window: {} });
for (const file of ["snapshot.js", "model.js"]) {
  vm.runInContext(
    await readFile(
      new URL(`../prototypes/explorer/${file}`, import.meta.url),
      "utf8",
    ),
    sandbox,
  );
}
const data = sandbox.window.EXPLORER_SNAPSHOT;
const model = sandbox.window.ExplorerModel;

test("prototype uses a dated snapshot with unique subjects and valid recorded counts", () => {
  assert.equal(data.subjects.length, 12);
  assert.equal(
    new Set(data.subjects.map((subject) => subject.slug)).size,
    data.subjects.length,
  );
  assert.equal(data.through, "2026-07-07");
  for (const subject of data.subjects) {
    assert.equal(
      new Set(subject.pageviews.map((point) => point.date)).size,
      subject.pageviews.length,
    );
    assert.ok(
      subject.pageviews.every(
        (point) =>
          Number.isInteger(point.views) &&
          point.views >= 0 &&
          point.date <= data.through,
      ),
    );
  }
});

test("prototype search combines category filters and multiple search terms", () => {
  const found = model.filterSubjects(
    data.subjects,
    { query: "Nigerian musician", category: "Culture", sort: "name" },
    data.through,
  );
  assert.equal(found.length, 1);
  assert.equal(found[0].slug, "Fela_Kuti");
  assert.equal(
    model.filterSubjects(
      data.subjects,
      { query: "Nigerian musician", category: "Places" },
      data.through,
    ).length,
    0,
  );
  assert.equal(model.normalize("Fẹlá Kútì"), "fela kuti");
});

test("prototype comparison periods align dates while preserving missing records and zero", () => {
  const subject = {
    pageviews: [
      { date: "2026-07-05", views: 0 },
      { date: "2026-07-07", views: 20 },
    ],
  };
  const series = model.series(subject, 3, data.through);
  assert.equal(series.length, 3);
  assert.equal(series[0].views, 0);
  assert.equal(series[1].views, null);
  assert.equal(series[2].views, 20);
});

test("percentage changes are withheld when prior windows are sparse or tiny", () => {
  assert.equal(
    model.stats(
      { pageviews: [{ date: data.through, views: 200 }] },
      data.through,
    ).growth,
    null,
  );
  const complete = model
    .series({ pageviews: [] }, 60, data.through)
    .map((point, index) => ({
      date: point.date,
      views: index < 30 ? 100 : 200,
    }));
  assert.equal(model.stats({ pageviews: complete }, data.through).growth, 100);
});

test("prototype routes separate Explore, subjects and deeper Stories", () => {
  assert.equal(model.readRoute("#/explore").view, "explore");
  assert.equal(model.readRoute("#/stories").view, "stories");
  assert.equal(model.readRoute("#/stories/afrobeat").view, "story");
  const slug = "Tony_Allen_(musician)";
  assert.equal(model.readRoute(model.topicHref(slug)).slug, slug);
  assert.equal(model.readRoute("#/topics/%E0%A4%A").view, "missing");
});

test("most-read sorting uses the same cached 30-day totals shown in rows", () => {
  const sorted = model.filterSubjects(
    data.subjects,
    { sort: "read" },
    data.through,
  );
  const totals = sorted.map(
    (subject) => model.stats(subject, data.through).total,
  );
  assert.ok(
    totals.every((total, index) => index === 0 || totals[index - 1] >= total),
  );
});
