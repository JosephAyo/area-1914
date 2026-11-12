# Release hardening: 12 November 2026

This pass preserves the approved visual design and addresses measured accessibility and loading issues.

## Changes and evidence

Explore's result count had `role="status"` on its `h2`, replacing heading semantics and leaving subject `h3` headings below an `h1`. The live region now sits inside the `h2`. The original Lighthouse snapshot flagged heading order (98/100); [eight subsequent snapshots](accessibility-after.json) across Explore, topic, open report form and Stories in both themes report 100/100 with no automated failures. This is not WCAG or screen-reader certification. [Baseline findings](baseline-accessibility.json) retain the failing element.

[Eight keyboard checks pass](keyboard-after.json): heading semantics, visible skip link and main focus, Tab into labeled search, suggestion ArrowUp/ArrowDown wrapping and Escape, clearing search without losing focus, explicit search during suggestion failure, the report disclosure/radio group/explanation, and CSS reduced-motion behavior. Suggestion responses are fixtures; real topic lookup uses the local API. No report was submitted.

Repeated collection requests were rechecking the same missing Wikipedia pages. The service now caches only confirmed summary-API 404s for five minutes, with at most 256 URLs per process. The cache is neither persistent nor shared across workers. Pageview gaps, server errors and exhausted rate limits are not cached as missing. A newly created or renamed article may take up to five minutes to be rechecked by that process. Four regression tests cover expiry/recovery, exclusions, rate limits and the size bound.

[Local endpoint timing](collection-timing.json):

| Sample | Median response |
| --- | --- |
| Before, three repeated requests | 5.504 seconds |
| After, three warmed requests | 1.263 seconds |
| After, first process request | 5.583 seconds |

Each response contained the same 73 unique subjects. This small sequential sample uses the existing local database and uncontrolled upstream Wikimedia timings. It is not a load test; the first request still performs upstream lookups and remains a release-performance consideration.

[Native browser timing samples](native-timing-after.json) use three fresh Chromium contexts at 390×844 against the unthrottled local production preview, with the backend cache warmed. Collection-and-font readiness ranged from 1.36 to 1.91 seconds. Paint, short-window layout-shift and long-task observations are included as local diagnostics, not field web-vitals or representative network/device performance.

The available bundled Lighthouse runner did not populate numeric FCP/LCP/TBT/Speed Index timings. Its aggregate performance score was discarded rather than presented as a valid result; see [measurement limitation](lighthouse-metric-limit.json).

## Reproduce

Use the backend and configured production preview described in the [parent review](../README.md). The scripts use existing external browser tooling; no package was added to the application:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
PLAYWRIGHT_BROWSER_BINARY=/absolute/path/to/chromium \
node scripts/keyboard_review.mjs

PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
PLAYWRIGHT_BROWSER_BINARY=/absolute/path/to/chromium \
node scripts/browser_timing.mjs

REVIEW_LIGHTHOUSE_MODULE=/absolute/path/to/chrome-devtools-mcp/build/src/third_party/index.js \
PLAYWRIGHT_BROWSER_BINARY=/absolute/path/to/chromium \
node scripts/accessibility_review.mjs
```

All three accept `REVIEW_BASE_URL` (default `http://127.0.0.1:5174`). They close their isolated browsers and write JSON evidence here. Timing should follow a warmed collection request if comparing with this sample. Tests, lint, typecheck and the configured production build pass: 35 frontend tests and 43 backend tests.

Physical devices, native browser zoom, real assistive technology, representative network/performance measurements and participant review remain open. Automated audit scores do not establish those outcomes.
