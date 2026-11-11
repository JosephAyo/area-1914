import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

let server;
let App;
let ThemeContext;
let PulseChart;
let TopicRelevanceError;
before(async () => {
  server = await createServer({
    configFile: false,
    plugins: [react()],
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    appType: "custom",
  });
  App = (await server.ssrLoadModule("/src/App.tsx")).default;
  TopicRelevanceError = (await server.ssrLoadModule("/src/services/api.ts"))
    .TopicRelevanceError;
  PulseChart = (await server.ssrLoadModule("/src/components/PulseChart.tsx"))
    .PulseChart;
  ThemeContext = (await server.ssrLoadModule("/src/context/ThemeContext.ts"))
    .ThemeContext;
});
after(async () => {
  await server?.close();
  delete globalThis.window;
});

function renderRoute(path, records = [], failures = []) {
  // Simulated location for server rendering. No browser or live API is used.
  globalThis.window = { location: { pathname: path } };
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryOnMount: false, staleTime: Infinity },
    },
  });
  for (const [key, value] of records) client.setQueryData(key, value);
  for (const [key, error] of failures) {
    client.getQueryCache().build(client, { queryKey: key }).setState({
      status: "error",
      error,
      fetchStatus: "idle",
    });
  }
  const html = renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client },
      createElement(
        ThemeContext.Provider,
        { value: { theme: "light", toggleTheme() {} } },
        createElement(App),
      ),
    ),
  );
  client.clear();
  return html;
}

test("homepage remains useful while live attention data is loading", () => {
  const html = renderRoute("/");
  assert.match(html, /Explore Nigerian history/);
  assert.match(html, /Search people, places and events/);
  assert.match(html, /Loading subjects/);
  assert.match(html, /aria-label="Grid view"[^>]*aria-pressed="true"/);
  assert.doesNotMatch(
    html,
    /The sound|Follow the thread|Cached Wikipedia records/,
  );
  assert.doesNotMatch(html, /illustrative ranking|\+42%/i);
});

test("a direct topic URL renders its identity, recorded totals, gaps, and onward connections", () => {
  const topic = {
    slug: "Fela_Kuti",
    title: "Fela Kuti",
    description: "Nigerian musician and activist",
    pageviews: [
      { date: "2026-06-01", views: 0 },
      { date: "2026-06-03", views: 50 },
    ],
  };
  const html = renderRoute("/topics/Fela_Kuti", [
    [["topic", "Fela_Kuti"], topic],
    [["relatedTopics", "Fela_Kuti"], []],
    [["citations", "Fela_Kuti"], { total_citations: 0 }],
  ]);
  assert.match(html, /<h1>Fela Kuti<\/h1>/);
  assert.match(html, /50<\/strong> recorded views/);
  assert.match(html, /Records across 2 of 3 days/);
  assert.match(html, /Gaps mean no record is available/);
  assert.match(html, /href="\/stories\/afrobeat"/);
  assert.doesNotMatch(html, /Tony Allen/);
  assert.match(html, /Compare/);
  assert.match(html, /Download PNG/);
  assert.match(html, /Report classification/);
  assert.match(html, /href="\/stories\/subjects\/Fela_Kuti"/);
  assert.doesNotMatch(html, /<figure[^>]*><img/);
});

test("rejected subjects can be reported while ordinary loading errors do not imply a classification", () => {
  const key = ["topic", "Rejected_Subject"];
  const rejected = renderRoute(
    "/topics/Rejected_Subject",
    [],
    [[key, new TopicRelevanceError("Not related to Nigeria.")]],
  );
  assert.match(rejected, /Report classification/);
  assert.match(rejected, /Not related to Nigeria/);
  const failed = renderRoute(
    "/topics/Rejected_Subject",
    [],
    [[key, new Error("Failed to fetch topic data.")]],
  );
  assert.doesNotMatch(failed, /Report classification/);
});

test("comparison summaries expose both totals and incomplete coverage over the shared date window", () => {
  const html = renderToStaticMarkup(
    createElement(PulseChart, {
      title: "Lagos",
      pageviews: [
        { date: "2026-06-01", views: 0 },
        { date: "2026-06-03", views: 50 },
      ],
      comparisonTitle: "Abuja",
      comparisonPageviews: [{ date: "2026-06-02", views: 20 }],
    }),
  );
  assert.match(html, /<dt>Lagos<\/dt>/);
  assert.match(html, /<strong>50<\/strong> recorded views/);
  assert.match(html, /Records across 2 of 3 days/);
  assert.match(html, /<dt>Abuja<\/dt>/);
  assert.match(html, /<strong>20<\/strong> recorded views/);
  assert.match(html, /Records across 1 of 3 days/);
  assert.match(html, /Both subjects use the same dates and scale/);
  assert.match(html, /Gaps mean no record is available/);
});

test("an image-free subject with a long name and no reading records remains readable", () => {
  const slug = "2023_Nigerian_presidential_election";
  const html = renderRoute(`/topics/${slug}`, [
    [
      ["topic", slug],
      { slug, title: "2023 Nigerian presidential election", pageviews: [] },
    ],
  ]);
  assert.match(html, /<h1>2023 Nigerian presidential election<\/h1>/);
  assert.match(html, /No reading records are available/);
  assert.match(html, /Read on Wikipedia/);
  assert.doesNotMatch(html, /thread-heading/);
});

test("discover can be opened directly and uses real collection records", () => {
  const html = renderRoute("/discover", [
    [
      ["featuredTopics"],
      [
        {
          name: "Places",
          icon: "",
          topics: [{ slug: "Lagos", title: "Lagos", pageviews: [] }],
        },
      ],
    ],
  ]);
  assert.match(html, /Explore Nigerian history/);
  assert.match(html, /href="\/topics\/Lagos"/);
  assert.match(html, /aria-current="page"[^>]*>Explore/);
});

test("Stories has its own direct route and the sourced narrative stays there", () => {
  const index = renderRoute("/stories");
  assert.match(index, /<h1>Stories<\/h1>/);
  assert.match(index, /href="\/stories\/afrobeat"/);
  assert.match(index, /CC BY-SA 3.0/);
  const article = renderRoute("/stories/afrobeat");
  assert.match(article, /Tony Allen/);
  assert.match(article, /href="\/topics\/Afrobeat"/);
  assert.doesNotMatch(article, /Choose a second subject|Download PNG/);
});

test("article citation breakdowns are reachable in Stories", () => {
  const html = renderRoute("/stories/subjects/Fela_Kuti", [
    [
      ["topic", "Fela_Kuti"],
      {
        slug: "Fela_Kuti",
        title: "Fela Kuti",
        description: "Nigerian musician",
        pageviews: [],
      },
    ],
    [
      ["citations", "Fela_Kuti"],
      {
        total_citations: 3,
        category_breakdown: { book: 3 },
        top_sources: ["A book"],
      },
    ],
  ]);
  assert.match(html, /Wikipedia article background/);
  assert.match(html, /Behind the article/);
  assert.match(html, /3 citations/);
  assert.match(html, /href="\/topics\/Fela_Kuti"/);
});

test("unknown Stories routes recover to the Stories index", () => {
  const html = renderRoute("/stories/does-not-exist");
  assert.match(html, /Story not found/);
  assert.match(html, /href="\/stories"/);
});
