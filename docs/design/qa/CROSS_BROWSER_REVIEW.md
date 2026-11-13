# Cross-browser review — 13 November 2026

The completed revamp checkpoints through `0fada4a` were pushed to `origin/main` at the user's request. This follow-up checked the configured production preview in three isolated test engines.

| Engine | Version | Result | Evidence |
| --- | --- | --- | --- |
| Chromium | 156.0.8078.4 | 49/49 checks pass | [Results](chromium/browser-review.json) |
| Firefox | 146.0.1 | 49/49 checks pass | [Results](firefox/browser-review.json) |
| WebKit | 26.0 | 49/49 checks pass | [Results](webkit/browser-review.json) |

The matrix covers the earlier Explore/topic/Stories, navigation, keyboard autocomplete, comparison, report-form, sparse/empty-data and PNG checks, plus assertions for the two-line collection date and a 44px sort target. Widths are 360/390/768/1440px in both themes. Firefox uses mobile-width viewports and touch events without Playwright's unsupported Firefox `isMobile` option. Report responses and edge-case subjects remain controlled fixtures; the real report queue and classifications were untouched.

## Findings and repairs

- WebKit wrapped the collection date into four lines. Its measured desktop height was 72px. `white-space: nowrap` preserves the explicit two-line break; the corrected height is 36px.
- WebKit rendered the native sort select at 23px despite `min-height: 44px`. An explicit `height: 44px` restores the intended target. Firefox and Chromium retain their existing size. [Final measured geometry](cross-browser-controls.json) records the desktop controls; the matrix also checks the mobile target with a 0.01px tolerance for engine rounding.
- Actual single/comparison PNGs were downloaded and representative exports inspected in all three engines. Labels, dates, solid/dashed series, summaries and both themes remain legible without clipping. Font metrics produce small expected height differences between engines; no pixel-identical rendering claim is made.

Representative inspected artifacts: [WebKit collection after repair](webkit/explore-1440-light.png), [WebKit mobile PNG in night mode](webkit/export-360-dark.png), [WebKit comparison PNG](webkit/export-comparison-mobile-light.png), [Firefox mobile PNG](firefox/export-360-dark.png), [Firefox report form](firefox/report-rejected-mobile-dark.png), and [Chromium mobile subject](chromium/topic-360-dark.png).

## Reproduce

Use the backend on port 8000 and the configured production preview on port 5174 described in the [main QA guide](README.md). Select a compatible existing Playwright module and browser binary:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core/index.mjs \
PLAYWRIGHT_BROWSER_BINARY=/absolute/path/to/browser \
REVIEW_BROWSER=webkit \
REVIEW_BASE_URL=http://127.0.0.1:5174 \
REVIEW_SCREENSHOTS=key \
node scripts/browser_review.mjs
```

`REVIEW_BROWSER` accepts `chromium`, `firefox` or `webkit`. Firefox/WebKit evidence defaults to their named subdirectories. `REVIEW_EVIDENCE_DIR` can preserve a separate run directory; the current Chromium follow-up uses `docs/design/qa/chromium`. `REVIEW_SCREENSHOTS=key` retains representative screenshots while all six actual PNG downloads and all checks still run.

The cached Firefox/WebKit binaries needed a compatible driver. Playwright Core 1.58.2 was installed only in temporary storage with scripts disabled; its [upstream browser manifest](https://raw.githubusercontent.com/microsoft/playwright/v1.58.2/packages/playwright-core/browsers.json) matches Firefox revision 1509 and WebKit revision 2248. No browser download, personal profile, or application dependency/lockfile change was required. The initially mismatched probe was closed before retrying.

Validation: all 35 frontend tests, lint, typecheck and configured production build pass. Backend source is unchanged from the 43 passing tests. This is scoped engine compatibility with the recorded cached versions, not certification of current Firefox/Safari releases or physical devices. Actual Safari, native zoom, screen readers, representative network/device performance and participant review remain open. Some subject screenshots retain asynchronously loading related-topic skeletons.
