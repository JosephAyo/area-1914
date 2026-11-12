// Run with an existing Lighthouse/Puppeteer bundle; no app dependency is added.
import fs from "node:fs/promises";
import path from "node:path";
const { puppeteer, lighthouseSnapshot } = await import(
  process.env.REVIEW_LIGHTHOUSE_MODULE
);
const base = process.env.REVIEW_BASE_URL || "http://127.0.0.1:5174";
const destination = path.resolve(
  import.meta.dirname,
  "../docs/design/qa/hardening",
);
await fs.mkdir(destination, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_BROWSER_BINARY,
});
const results = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  for (const state of ["explore", "topic", "report", "stories"]) {
    for (const theme of ["light", "dark"]) {
      await page.goto(
        base +
          "/" +
          (state === "stories"
            ? "stories"
            : state === "explore"
              ? ""
              : "topics/Fela_Kuti"),
        { waitUntil: "domcontentloaded" },
      );
      await page.waitForFunction(
        () =>
          document.querySelector("h1") &&
          !document.querySelector('[aria-label="Loading topic"]'),
      );
      if (state === "explore")
        await page.waitForFunction(() =>
          /\d+ subjects? to explore/.test(document.body.innerText),
        );
      if ((await page.$eval("html", (el) => el.dataset.theme)) !== theme) {
        await page.click(
          `button[aria-label="Switch to ${theme === "dark" ? "night" : "paper"} mode"]`,
        );
      }
      if (state === "report")
        await page.evaluate(() =>
          [...document.querySelectorAll("button")]
            .find((x) => x.textContent.trim() === "Report classification")
            .click(),
        );
      await page.evaluate(() => document.fonts.ready);
      const snapshot = await lighthouseSnapshot(page, {
        flags: { onlyCategories: ["accessibility"], output: "json" },
      });
      const failures = Object.values(snapshot.lhr.audits)
        .filter((a) => a.score === 0)
        .map((a) => ({ id: a.id, title: a.title, details: a.details }));
      const result = {
        state,
        theme,
        score: snapshot.lhr.categories.accessibility.score,
        failures,
      };
      results.push(result);
      console.log(
        JSON.stringify({
          state,
          theme,
          score: result.score,
          failures: failures.map((x) => x.id),
        }),
      );
    }
  }
  const report = {
    recordedAt: new Date().toISOString(),
    target: base,
    browser: await browser.version(),
    tool: "Lighthouse accessibility snapshot",
    viewport: { width: 390, height: 844 },
    scope:
      "Automated rendered-page checks only; not screen-reader, WCAG, physical-device or cross-browser certification.",
    results,
  };
  await fs.writeFile(
    path.join(destination, "accessibility-after.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  if (results.some((x) => x.failures.length)) process.exitCode = 1;
} finally {
  await browser.close();
}
