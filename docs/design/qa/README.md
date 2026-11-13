# Browser and PNG review

11 November 2026: **47 checks passed** in isolated standalone Chromium 156.0.8078.4 against the configured production preview. See [machine-readable results](browser-review.json). Browser contexts used fresh temporary profiles. No personal browser profile or real report queue was accessed.

13 November follow-up: **49 checks pass in each of Chromium, Firefox and WebKit**, including repairs for WebKit date wrapping and the native sort target. See [cross-browser evidence and reproduction](CROSS_BROWSER_REVIEW.md).

Reviewed Explore, a real subject, comparison, Stories and an authored story at 360/390/768/1440px widths in paper and night themes. The harness exercises filters, sorting, grid/list, pagination, back/scroll restoration, live keyboard autocomplete, theme persistence, comparison, chart periods, daily-table focus and emulated touch. Checked layouts have no horizontal overflow and the run has no uncaught page errors.

Report submissions use intercepted responses to exercise failure, retained input, retry and both correction directions. Rejected/long-title/sparse/empty subjects are labeled fixtures. Real report persistence, CORS, approvals, reversal and dismissal were verified separately through the [HTTP/CLI smoke checks](../release-smoke.json).

Representative inspected artifacts:

- [Mobile Explore](explore-360-light.png), [desktop Explore in night mode](explore-1440-dark.png).
- [Mobile topic in night mode](topic-360-dark.png), [tablet Stories](stories-768-dark.png), [mobile authored story](story-mobile-dark.png).
- [Single-topic mobile PNG](export-360-light.png), [desktop PNG in night mode](export-1440-dark.png), [comparison PNG in night mode](export-comparison-mobile-dark.png).
- [Rejected-subject report form](report-rejected-mobile-dark.png), [controlled sparse-data and long-title case](sparse-long-title-touch-fixture.png).

PNG inspection exposed and verified fixes for white chart dots breaking up the solid series and a comparison legend gradient missing from captures. Six actual downloads cover single-topic mobile/desktop and mobile comparison in both themes; titles, dates, source labels and summaries remain visible without clipping.

## Reproduce

Run the backend on port 8000. From `frontend/`, build with the intended API URL and start a preview:

```sh
VITE_API_BASE_URL=http://127.0.0.1:8000/api npm run build
npm run preview -- --host 127.0.0.1 --port 5174
```

From the repository root, use an existing Playwright installation and compatible browser. If they are outside normal module resolution, supply their paths:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
PLAYWRIGHT_BROWSER_BINARY=/absolute/path/to/chromium \
REVIEW_BASE_URL=http://127.0.0.1:5174 \
node scripts/browser_review.mjs
```

The script writes the evidence in this directory and closes its browser contexts. Stop the preview you started after reviewing. No browser-test package was added to the project.

Production builds reject `YOUR_EC2_PUBLIC_IP` in the API address. Environment values are embedded at build time; a local ignored `.env.production` must not accidentally supply that placeholder. Deployment needs the real API address.

## Limits

The original pass covers Chromium; the linked follow-up adds the recorded Firefox and WebKit test versions. These do not certify actual Safari, physical touch devices, native 200% browser zoom, screen readers, all metadata variants, or a complete performance/participant study. Focused reduced-motion and automated accessibility checks are recorded in the [hardening pass](hardening/README.md). Some subject screenshots include asynchronously loading related-topic skeletons; they establish the surrounding layout, not completion of that upstream request.
