import test from "node:test";
import assert from "node:assert/strict";
import {
  readAppRoute,
  topicPath,
  storyPath,
  subjectStoryPath,
} from "../src/utils/navigation.ts";
import { resolveSearchSelection } from "../src/utils/search.ts";
import {
  afrobeatThread,
  isInAfrobeatThread,
} from "../src/content/editorial.ts";

test("topic links round-trip titles with spaces, punctuation and diacritics", () => {
  for (const title of [
    "Fela Kuti",
    "Tony Allen (musician)",
    "Ṣàngó",
    "Lagos / history",
  ]) {
    const route = readAppRoute(topicPath(title));
    assert.equal(route.topic, title.trim().replace(/\s+/g, "_"));
  }
});

test("direct discover routes and malformed topic URLs recover predictably", () => {
  assert.deepEqual(readAppRoute("/discover"), {
    view: "discover",
    topic: null,
  });
  assert.deepEqual(readAppRoute("/topics/%E0%A4%A"), {
    view: "home",
    topic: null,
  });
});

test("search honors the keyboard selection and supports explicit names when suggestions fail", () => {
  const suggestions = [{ title: "Lagos" }, { title: "Lagos State" }];
  assert.equal(resolveSearchSelection("lagos", suggestions, 1), "Lagos State");
  assert.equal(resolveSearchSelection("lagos", suggestions, -1), "Lagos");
  assert.equal(resolveSearchSelection("  Fela Kuti ", [], -1), "Fela Kuti");
  assert.equal(resolveSearchSelection("  ", suggestions, 1), null);
});

test("Stories and article background routes round-trip separately from quick topics", () => {
  assert.deepEqual(readAppRoute(storyPath()), {
    view: "stories",
    topic: null,
    story: null,
  });
  assert.deepEqual(readAppRoute(storyPath("afrobeat")), {
    view: "stories",
    topic: null,
    story: "afrobeat",
  });
  assert.deepEqual(readAppRoute(subjectStoryPath("Fẹlá Kútì")), {
    view: "stories",
    topic: null,
    story: "subject",
    subject: "Fẹlá_Kútì",
  });
  assert.deepEqual(readAppRoute("/stories/subjects/%E0%A4%A"), {
    view: "home",
    topic: null,
  });
});

test("the editorial journey has valid topic destinations and evidence for each step", () => {
  assert.equal(afrobeatThread.length, 3);
  assert.equal(new Set(afrobeatThread.map((step) => step.slug)).size, 3);
  for (const step of afrobeatThread) {
    assert.equal(readAppRoute(topicPath(step.slug)).topic, step.slug);
    assert.ok(step.connection.length > 20);
    assert.equal(new URL(step.source).protocol, "https:");
    assert.ok(isInAfrobeatThread(step.slug));
  }
  assert.ok(isInAfrobeatThread("fela kuti"));
  assert.equal(isInAfrobeatThread("Lagos"), false);
});
