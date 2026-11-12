import path from "node:path";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_BROWSER_BINARY,
});
const samples = [];
const base = process.env.REVIEW_BASE_URL || "http://127.0.0.1:5174";
const destination = path.resolve(
  import.meta.dirname,
  "../docs/design/qa/hardening",
);
await fs.mkdir(destination, { recursive: true });
try {
  for (let i = 0; i < 3; i++) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    await context.addInitScript(() => {
      window.__lab = { lcp: [], shifts: [], longTasks: [] };
      for (const [type, key] of [
        ["largest-contentful-paint", "lcp"],
        ["layout-shift", "shifts"],
        ["longtask", "longTasks"],
      ]) {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            window.__lab[key].push({
              startTime: e.startTime,
              duration: e.duration,
              value: e.value,
              hadRecentInput: e.hadRecentInput,
            });
        }).observe({ type, buffered: true });
      }
    });
    const page = await context.newPage();
    await page.goto(base + "/", { waitUntil: "domcontentloaded" });
    await page
      .locator("h2")
      .filter({ hasText: /\d+ subjects? to explore/ })
      .waitFor();
    await page.evaluate(() => document.fonts.ready);
    const readyMs = await page.evaluate(() => performance.now());
    await page.waitForTimeout(150);
    const sample = await page.evaluate(
      (readyMs) => ({
        firstContentfulPaintMs: performance.getEntriesByName(
          "first-contentful-paint",
        )[0]?.startTime,
        lastObservedLcpMs: window.__lab.lcp.at(-1)?.startTime,
        collectionAndFontsReadyMs: readyMs,
        noInputLayoutShiftSum: window.__lab.shifts
          .filter((e) => !e.hadRecentInput)
          .reduce((sum, e) => sum + e.value, 0),
        longTaskCount: window.__lab.longTasks.length,
        collectionRequestMs: performance
          .getEntriesByType("resource")
          .find((e) => e.name.endsWith("/api/topics/featured"))?.duration,
        javascriptDecodedBytes: performance
          .getEntriesByType("resource")
          .filter((e) => e.name.endsWith(".js"))
          .reduce((sum, e) => sum + e.decodedBodySize, 0),
      }),
      readyMs,
    );
    samples.push(sample);
    console.log(JSON.stringify(sample));
    await context.close();
  }
  await fs.writeFile(
    path.join(destination, "native-timing-after.json"),
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        target: base + "/",
        samples,
        conditions:
          "Fresh isolated Chromium contexts at 390x844; local unthrottled production preview, warmed backend missing-page cache; ready means collection and fonts available. No-input layout-shift sum is a short observation, not field CLS. LCP is last observed before leaving the page. Not a production network or field web-vitals study.",
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
