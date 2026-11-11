// Use an existing Playwright installation; this script adds no project dependencies.
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
const destination = path.resolve(import.meta.dirname, "../docs/design/qa");
await fs.mkdir(destination, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_BROWSER_BINARY,
});
const results = [],
  errors = [];
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  acceptDownloads: true,
});
const page = await context.newPage();
page.setDefaultTimeout(20000);
page.on("pageerror", (error) => errors.push(error.message));
const base = process.env.REVIEW_BASE_URL || "http://localhost:5173";
const browserVersion = await browser.version();
function pass(name) {
  results.push({ check: name, passed: true });
  console.log("PASS", name);
}
async function readyExplore() {
  await page
    .locator("h2")
    .filter({ hasText: /\d+ subjects? to explore/ })
    .waitFor({ timeout: 60000 });
}
async function readyTopic(title) {
  await page.getByRole("heading", { name: title, exact: true }).waitFor();
  await page.locator(".recharts-surface").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(name) {
  const widths = await page.evaluate(() => [
    innerWidth,
    document.documentElement.scrollWidth,
  ]);
  assert.ok(widths[1] <= widths[0] + 1, `${name}: ${widths}`);
  pass(name + " no overflow");
}
async function theme(value) {
  if ((await page.locator("html").getAttribute("data-theme")) !== value)
    await page
      .getByRole("button", {
        name: `Switch to ${value === "dark" ? "night" : "paper"} mode`,
      })
      .click();
}
async function screenshot(name) {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: path.join(destination, name + ".png"),
    fullPage: true,
  });
}
async function download(name) {
  const waiting = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG", exact: true }).click();
  const file = await waiting;
  assert.equal(await file.failure(), null);
  const target = path.join(destination, name + ".png");
  await file.saveAs(target);
  const data = await fs.readFile(target);
  assert.equal(data.subarray(1, 4).toString(), "PNG");
  const dimensions = [data.readUInt32BE(16), data.readUInt32BE(20)];
  assert.ok(dimensions[0] > 500 && dimensions[1] > 500);
  pass(name + " downloaded " + dimensions.join("×"));
  await noOverflow(name + " after download");
}
try {
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await readyExplore();
  assert.equal(
    await page
      .getByRole("button", { name: "Grid view", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("button", { name: "Culture", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Culture", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("combobox", { name: /Sort by/ }).selectOption("name");
  assert.equal(
    await page.getByRole("combobox", { name: /Sort by/ }).inputValue(),
    "name",
  );
  await page.getByRole("button", { name: "All subjects", exact: true }).click();
  await page.getByRole("combobox", { name: /Sort by/ }).selectOption("read");
  pass("Category and sort controls");
  await page.getByRole("button", { name: "List view", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "List view", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await noOverflow("Mobile list");
  await page.getByRole("button", { name: "Grid view", exact: true }).click();
  pass("Grid/list switching");
  await page.getByRole("button", { name: /Show more subjects/ }).click();
  const cards = page
    .locator('a[href^="/topics/"]')
    .filter({ has: page.locator("h3") });
  assert.equal(await cards.count(), 48);
  await cards.last().scrollIntoViewIfNeeded();
  const previousScroll = await page.evaluate(() => scrollY);
  await cards.last().click();
  await page.locator(".recharts-surface").first().waitFor();
  await page.goBack();
  await readyExplore();
  assert.equal(await cards.count(), 48);
  await page.waitForTimeout(150);
  assert.ok(
    Math.abs((await page.evaluate(() => scrollY)) - previousScroll) < 50,
  );
  pass("Back navigation restores expanded results and scroll");
  await page.goto(base + "/topics/Fela_Kuti", {
    waitUntil: "domcontentloaded",
  });
  await readyTopic("Fela Kuti");
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const value of ["light", "dark"]) {
      await theme(value);
      await noOverflow(`Topic ${width} ${value}`);
      await screenshot(`topic-${width}-${value}`);
      if (width !== 768) await download(`export-${width}-${value}`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await theme("light");
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  const comparison = page.getByRole("combobox", {
    name: "Compare with another subject",
  });
  assert.equal(
    await comparison.evaluate((el) => el === document.activeElement),
    true,
  );
  await comparison.fill("Tony Allen (musician)");
  await comparison.press("Enter");
  await page
    .getByRole("heading", { name: "Tony Allen (musician)", exact: true })
    .waitFor();
  await noOverflow("Mobile comparison");
  await screenshot("comparison-mobile-light");
  await download("export-comparison-mobile-light");
  await theme("dark");
  await screenshot("comparison-mobile-dark");
  await download("export-comparison-mobile-dark");
  await page
    .getByRole("button", { name: "Remove comparison", exact: true })
    .click();
  assert.equal(
    await page.getByRole("heading", { name: "Fela Kuti", exact: true }).count(),
    1,
  );
  pass("Comparison focus, selection and removal");
  await page.getByRole("button", { name: "90 days", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "90 days", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("button", { name: "30 days", exact: true }).click();
  pass("Chart timeframe switching");
  await page.getByRole("button", { name: /Read the daily figures/ }).click();
  await page.getByRole("region", { name: "Daily reading figures" }).focus();
  assert.equal(
    await page
      .getByRole("region", { name: "Daily reading figures" })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  pass("Daily table keyboard focus");
  const reports = [];
  let failReport = true;
  await page.route("**/api/classification-reports", async (route) => {
    reports.push(route.request().postDataJSON());
    await route.fulfill({
      status: failReport ? 503 : 201,
      contentType: "application/json",
      body: JSON.stringify(
        failReport
          ? { detail: "Test outage" }
          : { id: 9001, status: "pending" },
      ),
    });
  });
  await page
    .getByRole("button", { name: "Report classification", exact: true })
    .click();
  const reason =
    "This subject has no documented connection in the supplied source.";
  await page.getByLabel("Why should it change?").fill(reason);
  await page
    .getByLabel("Source link (optional)")
    .fill("https://en.wikipedia.org/wiki/Fela_Kuti");
  await page.getByRole("button", { name: "Send report", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: /couldn’t be saved/ })
    .waitFor();
  assert.equal(
    await page.getByLabel("Why should it change?").inputValue(),
    reason,
  );
  failReport = false;
  await page.getByRole("button", { name: "Send report", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: /awaiting review/ })
    .waitFor();
  assert.equal(reports.at(-1).requested_relevance, false);
  await screenshot("report-accepted-success");
  pass("Accepted report failure/retry preserves input and sends exclusion");
  await page.route("**/api/topics/Release_Rejected", (route) =>
    route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "This subject does not appear to be related to Nigeria.",
      }),
    }),
  );
  await page.goto(base + "/topics/Release_Rejected", {
    waitUntil: "domcontentloaded",
  });
  await page
    .getByRole("button", { name: "Report classification", exact: true })
    .click();
  await page
    .getByLabel("Why should it change?")
    .fill("A cited source establishes a Nigerian connection.");
  await screenshot("report-rejected-mobile-dark");
  await page.getByRole("button", { name: "Send report", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: /awaiting review/ })
    .waitFor();
  assert.equal(reports.at(-1).requested_relevance, true);
  pass("Rejected subject report sends inclusion");
  await page.unroute("**/api/classification-reports");
  await page.goto(base + "/stories", { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Stories", exact: true }).waitFor();
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const value of ["light", "dark"]) {
      await theme(value);
      await noOverflow(`Stories ${width} ${value}`);
      await screenshot(`stories-${width}-${value}`);
    }
  }
  await page
    .getByRole("link")
    .filter({
      has: page.getByRole("heading", { name: "The people behind Afrobeat" }),
    })
    .click();
  await page
    .getByRole("heading", { name: "The people behind Afrobeat", exact: true })
    .waitFor();
  await page.setViewportSize({ width: 360, height: 844 });
  await noOverflow("Mobile story");
  await screenshot("story-mobile-dark");
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await readyExplore();
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const value of ["light", "dark"]) {
      await theme(value);
      await noOverflow(`Explore ${width} ${value}`);
      await screenshot(`explore-${width}-${value}`);
    }
  }
  await page.reload({ waitUntil: "domcontentloaded" });
  await readyExplore();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  pass("Saved theme survives reload");
  await page.setViewportSize({ width: 390, height: 844 });
  const search = page.getByRole("combobox", {
    name: "Search people, places and events",
  });
  await search.fill("Lagos");
  await page.getByRole("listbox").getByRole("option").first().waitFor();
  await search.press("ArrowDown");
  const selected = await page
    .getByRole("listbox")
    .getByRole("option", { selected: true })
    .innerText();
  await search.press("Escape");
  assert.equal(await search.getAttribute("aria-expanded"), "false");
  await search.press("ArrowDown");
  await search.press("Enter");
  await page
    .getByRole("heading", { name: selected.trim(), exact: true })
    .waitFor();
  pass("Live autocomplete ArrowDown/Escape/Enter navigation");
  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const touchPage = await touch.newPage();
  touchPage.on("pageerror", (error) => errors.push(error.message));
  await touchPage.goto(base + "/topics/Fela_Kuti", {
    waitUntil: "domcontentloaded",
  });
  await touchPage
    .getByRole("heading", { name: "Fela Kuti", exact: true })
    .waitFor();
  await touchPage.getByRole("button", { name: "Compare", exact: true }).tap();
  assert.equal(
    await touchPage
      .getByRole("combobox", { name: "Compare with another subject" })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await touchPage
    .getByRole("button", { name: "Remove comparison", exact: true })
    .tap();
  await touchPage.getByRole("button", { name: "Switch to night mode" }).tap();
  assert.equal(
    await touchPage.locator("html").getAttribute("data-theme"),
    "dark",
  );
  pass("Emulated touch comparison and theme controls");
  await touchPage.route("**/api/topics/Release_Long_Title/related", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await touchPage.route("**/api/topics/Release_Long_Title", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 999,
        slug: "Release_Long_Title",
        title: "2023 Nigerian presidential election",
        description:
          "Controlled QA fixture: long title, no image, missing dates and a recorded zero.",
        pageviews: [
          { date: "2026-06-01", views: 0 },
          { date: "2026-06-03", views: 50 },
        ],
      }),
    }),
  );
  await touchPage.goto(base + "/topics/Release_Long_Title", {
    waitUntil: "domcontentloaded",
  });
  await touchPage
    .getByRole("heading", {
      name: "2023 Nigerian presidential election",
      exact: true,
    })
    .waitFor();
  await touchPage
    .getByText("Records across 2 of 3 days", { exact: true })
    .waitFor();
  assert.ok(
    await touchPage.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await touchPage.screenshot({
    path: path.join(destination, "sparse-long-title-touch-fixture.png"),
    fullPage: true,
  });
  pass("Controlled long-title, image-free, sparse/zero-data mobile state");
  await touchPage.route("**/api/topics/Release_Empty/related", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await touchPage.route("**/api/topics/Release_Empty", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 998,
        slug: "Release_Empty",
        title: "Empty records (QA fixture)",
        pageviews: [],
      }),
    }),
  );
  await touchPage.goto(base + "/topics/Release_Empty", {
    waitUntil: "domcontentloaded",
  });
  await touchPage.getByText(/No reading records are available/).waitFor();
  assert.ok(
    await touchPage.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  pass("Controlled empty-history mobile state");
  await touch.close();
  assert.deepEqual(errors, []);
  pass("No browser page errors");
  await fs.rm(path.join(destination, "failure.png"), { force: true });
} catch (error) {
  await page
    .screenshot({ path: path.join(destination, "failure.png"), fullPage: true })
    .catch(() => {});
  results.push({ check: String(error), passed: false });
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  await fs.writeFile(
    path.join(destination, "browser-review.json"),
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        browser: "Isolated standalone Chromium " + browserVersion,
        target: base,
        viewports: [360, 390, 768, 1440],
        reportSubmission:
          "Intercepted browser responses; real HTTP persistence and CLI validated separately; real queue untouched",
        edgeCases:
          "Long-title, sparse/zero-data and empty-history subjects are explicitly labeled browser fixtures.",
        errors,
        results,
      },
      null,
      2,
    ) + "\n",
  );
}
