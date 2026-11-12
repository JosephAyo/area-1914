import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_BROWSER_BINARY,
});
const results = [];
function pass(check) {
  results.push({ check, passed: true });
  console.log("PASS", check);
}
const base = process.env.REVIEW_BASE_URL || "http://127.0.0.1:5174";
const destination = path.resolve(
  import.meta.dirname,
  "../docs/design/qa/hardening",
);
await fs.mkdir(destination, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page
    .locator("h2")
    .filter({ hasText: /\d+ subjects? to explore/ })
    .waitFor();
  assert.equal(await page.getByRole("heading", { level: 2 }).count(), 1);
  pass("Result count retains level-two heading semantics");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await skip.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  assert.ok(await skip.evaluate((el) => el.getBoundingClientRect().top >= 0));
  await page.keyboard.press("Enter");
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "main-content",
  );
  pass("Visible skip link transfers keyboard focus to main");
  await page.keyboard.press("Tab");
  const input = page.getByRole("combobox", {
    name: "Search people, places and events",
  });
  assert.equal(
    await input.evaluate((el) => el === document.activeElement),
    true,
  );
  pass("Tab reaches labeled search after main focus");
  await page.route("**/api/search?*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ title: "Lagos" }, { title: "Lagos State" }]),
    }),
  );
  await input.fill("Lagos");
  await page.getByRole("listbox").getByRole("option").first().waitFor();
  await input.press("ArrowUp");
  assert.equal(
    await page
      .getByRole("listbox")
      .getByRole("option", { name: "Lagos State", exact: true, selected: true })
      .count(),
    1,
  );
  await input.press("ArrowDown");
  assert.equal(
    await page
      .getByRole("listbox")
      .getByRole("option", { name: "Lagos", exact: true, selected: true })
      .count(),
    1,
  );
  await input.press("Escape");
  assert.equal(await input.getAttribute("aria-expanded"), "false");
  pass("ArrowUp/ArrowDown wrap selection and Escape dismisses suggestions");
  await input.press("Tab");
  assert.equal(
    await page
      .getByRole("button", { name: "Clear search", exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page.keyboard.press("Space");
  assert.equal(await input.inputValue(), "");
  assert.equal(
    await input.evaluate((el) => el === document.activeElement),
    true,
  );
  pass("Keyboard clear restores focus to the empty search");
  await page.unroute("**/api/search?*");
  await page.route("**/api/search?*", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );
  await input.fill("Fela Kuti");
  await page
    .getByRole("status")
    .filter({ hasText: /Suggestions are unavailable/ })
    .waitFor();
  await input.press("Enter");
  await page.getByRole("heading", { name: "Fela Kuti", exact: true }).waitFor();
  pass("Explicit keyboard search works when suggestion lookup fails");
  const report = page.getByRole("button", {
    name: "Report classification",
    exact: true,
  });
  await report.focus();
  await report.press("Space");
  await page.keyboard.press("Tab");
  const unrelated = page.getByRole("radio", {
    name: "Not related to Nigeria",
    exact: true,
  });
  assert.equal(
    await unrelated.evaluate((el) => el === document.activeElement),
    true,
  );
  await page.keyboard.press("ArrowUp");
  assert.equal(
    await page
      .getByRole("radio", { name: "Related to Nigeria", exact: true })
      .isChecked(),
    true,
  );
  await page.keyboard.press("Tab");
  assert.equal(
    await page
      .getByLabel("Why should it change?")
      .evaluate((el) => el === document.activeElement),
    true,
  );
  pass("Report disclosure, radio group and explanation work by keyboard");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const motion = await page
    .getByRole("button", { name: "Close report", exact: true })
    .evaluate((el) => ({
      animation: getComputedStyle(el).animationName,
      transition: getComputedStyle(el).transitionDuration,
    }));
  assert.equal(motion.animation, "none");
  assert.equal(motion.transition, "0s");
  pass("Reduced-motion preference disables CSS animation and transitions");
} catch (error) {
  results.push({ check: String(error), passed: false });
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  await fs.writeFile(
    path.join(destination, "keyboard-after.json"),
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        target: base,
        viewport: { width: 390, height: 844 },
        scope:
          "Keyboard and CSS reduced-motion checks in isolated Chromium. Suggestion responses are controlled fixtures; topic lookup uses the local API. No report submitted; not a screen-reader audit.",
        results,
      },
      null,
      2,
    ) + "\n",
  );
}
