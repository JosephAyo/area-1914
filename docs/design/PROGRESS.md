# Revamp progress and decisions

## 10 November 2026

- Saved the agreed six-milestone plan in the repository to keep it reviewable with implementation.
- Adopted a lightweight Scrum-inspired backlog and increment review process. No fixed sprint length or formal team roles have been chosen.
- Completed source inventory and data-semantic audit. Rendered baseline review remains open.
- Retained the current name and existing application stack for the design studies.
- Confirmed that attention anniversaries are not historical event anniversaries. Production wording will distinguish them.
- Confirmed that algorithmic association labels need additional sourced writing to become narrated journeys.
- Identified ranking denominator floors, missing chart dates, and export capture background as implementation issues to account for.
- Recorded specific editorial, Nigerian collection, and chart-label references, with visual inspection still pending.
- Cycle 1 visual studies are isolated from the main application and use labeled illustrative data. The M2 selection checkpoint remains open.
- Implemented both studies at `frontend/design-studies/`, with home/topic navigation, direction switching, image fallback, long-title specimen, and links into existing application routes.
- Downloaded the credited CC BY-SA 3.0 portrait and retained its creator, derivative author, license, and CSS cropping information in the visible credit and reference register.
- Verification: JavaScript syntax check, frontend lint, typecheck, and production build passed. The existing build reports Sass import deprecation and a large JavaScript chunk; these remain baseline findings.
- Local HTTP verification returned 200 for the study HTML, CSS, JavaScript, and portrait. Confirmed the studies are absent from production output. Static structure review found and corrected missing home/topic fragment targets.
- Visual, keyboard interaction, zoom, and responsive checks still require a browser; successful HTTP and source checks do not establish their completion.
- Preview: run `cd frontend && yarn dev`, then open `/design-studies/` on the printed local address. The verification server is stopped at handoff.

## Application increment

- User requested continuation. Adopted editorial edition A as the provisional implementation direction; the alternative study remains available for comparison. This does not claim visual signoff.
- Replaced the main app's glass dashboard styling with paper/ink typography, vermilion accents, fine rules, and a coordinated night palette. Saved theme preferences are preserved; new sessions start in paper mode.
- Added an editorial homepage with a credited local portrait, real attention data, and a three-subject Fela Kuti → Tony Allen → Afrobeat path. Sources are available beside each authored connection.
- Reorganized topic pages into identity/context, chart, curated path when applicable, automatic connections, and citations. Discover, source summaries, data notes, favicon, metadata, and footer use the same identity.
- Preserved existing topic URLs and comparison/download actions. Fixed clearing/searching from Discover and clearing stale comparison state on topic navigation.
- Added keyboard suggestion selection, Escape handling, focus feedback, current-query protection, and suggestions-error fallback to explicit subject search.
- Chart records now align on UTC calendar days. Missing dates remain null; recorded zero stays zero. Time windows, leap days, totals, coverage labels, comparison dash patterns, and optional daily tables are explicit.
- Renamed On This Day to From the attention archive. Trending uses a labeled growth score rather than implying the baseline-adjusted result is always a percentage.
- Export capture uses the active theme background and surfaces failures; actual PNG layout is still awaiting inspection.
- Verification: 15 tests pass, including utility cases and server-rendered application routes; lint, typecheck, production build, contrast calculations, and local HTTP checks pass. No browser automation tool is exposed in this session, so rendered pixels, actual keyboard/pointer behavior, history, responsive layout, live API integration, and exports remain open.
- Main JavaScript gzip increased from 178.00 kB to 185.16 kB (about 4%); CSS gzip is 5.51 kB versus 5.50 kB. Added a 74.74 kB portrait. Existing large-chunk warning remains; Sass import deprecation was removed by switching to `@use`.
- See [release review](RELEASE_REVIEW.md) for the remaining checks. No deployment or publication has been performed.

## Revised explorer direction and typography

- User clarified the product should be simple, direct, and easy to explore, with in-depth pages in a separate section. This supersedes the editorial-first homepage emphasis; Explore and Stories are the proposed structure.
- User requested consideration of other fonts before deciding and explicitly asked to record that Nsibidi will be added later. Added D20 and a planned-later note in the main plan.
- Compared full upright variable font files for Noto Sans, Source Sans 3, Public Sans, IBM Plex Sans, Atkinson Hyperlegible Next, and Outfit. Inspected character maps, numeric advances, feature tags, sizes, and a same-content specimen.
- Noto Sans covers the entire selected extended-Latin/combining-mark probe; the other sampled files have gaps. Source Sans 3 is the strongest alternative for compactness but needs fallback for four probe characters. These are file-specific findings, not complete language-support or browser-shaping certification.
- Recommended Noto Sans for the next prototype. Dropped Outfit as the default and left the Stories font choice open. The application font has not been changed in this review.
- Saved findings in [typography decision](TYPOGRAPHY.md), [coverage report](typography/coverage.json), and [comparison specimen](typography/font-comparison.png). The prototype/design checkpoint remains pending.

## 11 November 2026

### Checkpoint commit and release smoke checks

- User authorized a checkpoint commit and continuation. Committed the completed revamp, prototypes, design records and classification reporting as `718d468` (`Revamp history explorer and add classification reporting`). Left separately installed `.agents/` skills and `skills-lock.json` outside the application commit.
- Re-ran all 35 frontend tests, 39 backend tests, lint, typecheck and production build successfully before committing.
- Continued release verification with actual HTTP requests against an isolated FastAPI/SQLite instance and the production Vite preview, plus maintainer CLI commands in separate processes. All 25 smoke checks pass; evidence is in [release-smoke.json](release-smoke.json).
- Checked report CORS, pending receipts, deduplication, queue visibility, approval, reversal, dismissal, private queue access and invalid submission handling. Confirmed pending reports never change relevance. Checked production SPA entry routes, bundle retrieval and all three font files.
- The first smoke run used an overly strict empty-root HTML assertion; corrected it to accept the existing static fallback content and reran successfully. No product change was required.
- Retained a repeatable check script at `scripts/release_smoke.py`. Run `python3 scripts/release_smoke.py` from the repository root after building the frontend. It needs the existing backend virtual environment and frontend dependencies, binds temporary localhost ports, writes the evidence JSON and stops its temporary servers. The real database, queue and classifications are untouched.
- Browser-control tools remain unavailable after rediscovery. Mobile rendering, pointer/keyboard journeys, history/scroll, theme persistence, report-form interaction and downloaded PNG inspection are still open. These smoke checks establish HTTP and CLI behavior, not browser acceptance; D22 remains in progress.

### Classification reporting and reviewed relevance

- User requested reporting of false inclusions and exclusions. Added an expandable Report classification form beneath topic charts and on relevance rejections, including rejected comparison lookups. Readers select the proposed classification, explain the correction, and optionally cite a source. Pending, success/reference, validation and submission-error states use the approved palette and mobile input sizing.
- Added a persistent report endpoint and additive report/override tables. Public responses return only a pending receipt; unreviewed reports have no effect. Identical pending submissions are deduplicated. Report text is excluded from SQL query logs by disabling SQL echo.
- Added a local maintainer review queue with approve/dismiss commands, mandatory review notes, timestamps and retained report history. Approved reports create or update durable relevance overrides. There is no public moderation/list endpoint or new admin authentication flow.
- Applied reviewed relevance to cached/new topic retrieval, featured collection, related suggestions, rankings and attention archive. A later approved report can replace an earlier override. Search remains a Wikipedia search and can still suggest excluded subjects; those subjects retain the reporting action on rejection.
- Verification: 35 frontend tests, 39 backend tests, lint, typecheck and build pass. Backend tests include both directions, invalid payloads, receipt privacy, deduplication, file-backed persistence across sessions, dismissal and decision replacement, plus curated/related/ranking/archive exclusions. Restarted the local backend; health and OpenAPI return 200 and the reporting endpoint is registered. No synthetic reports were added to the real queue and no real classifications were changed.
- Instructions and matching limitations are in [Classification reports](../CLASSIFICATION_REPORTS.md). Interactive browser testing remains unavailable; this is not a form interaction or visual signoff.

### Mobile, navigation, and export source review

- User authorized mobile and export review. Browser-control tools remain unavailable after discovery; no mobile screenshots, browser interactions, downloaded PNGs, or runtime performance measurements were produced. D22 remains in progress.
- Reviewed responsive rules across Explore, topic charts, comparison, search, Stories, citations and the shared header. Narrow-screen navigation now has its own header row, keeping the brand and theme control together above it. Mobile search retains a 16px input font, and long suggestion labels can wrap.
- Lifted the expanded-result count into the existing app-level browse state. It survives subject navigation and grid/list changes; changing query, category or sort resets it to 24. Added a regression test for those state transitions.
- Returning to Explore now restores the saved scroll position after the collection is available. Background refetches do not repeat the restoration. Browser-native scroll restoration is temporarily disabled while the app manages navigation; the previous setting is restored on unmount. Actual back/forward behavior still needs browser verification.
- PNG preparation pins the originating export element, cancels if it was unmounted during asynchronous setup, and disables comparison changes during capture. Export surfaces remount per subject, preventing a cached destination from reusing the originating element. Real PNG dimensions, labels and clipping still need inspection in both themes.
- Verification: all 34 frontend tests, lint, typecheck and production build pass. No backend code changed in this increment. Existing chunk-size warning remains.
- Added the user-approved Wikipedia accuracy notice to the shared footer and fuller API/article discrepancy guidance in the data guide. Removed the two topic-page Stories arrows shown in user feedback.

### Topic-flow review and refinement

- User approved the integrated collection and authorized the next topic-flow review. Continued in Preserve mode: retained the approved Noto Sans, palette, compact subject context, routes, comparison, and separate Stories. No new visual direction or deeper narrative was added to Explore.
- Comparison search now receives focus when opened, announces loading and the selected pair, explains the shared scale, and offers a retry after an API error. Failed comparisons cannot be exported as though the second subject were available.
- Chart summaries now separate subject name, recorded total, and coverage. Both comparison subjects show their recorded-day count against the same calendar window. Missing records remain distinct from zero, and the daily table's scroll region is keyboard focusable.
- PNG branding and padding now apply only to the cloned capture. Removed the live 1200px export layout, which widened the page during preparation. Clone padding preserves the rendered chart's content width. Actual PNG inspection remains outstanding.
- Verification: 33 frontend tests pass, including a comparison-summary regression covering zero views and partial coverage. Lint, typecheck, and production build pass. Main JavaScript is 184.04 kB gzip and CSS is 5.16 kB gzip; the existing chunk warning remains.
- Browser-control and Node browser-runtime tools are not exposed in this session. Responsive pixels, keyboard/pointer execution, history, theme persistence, and downloaded PNGs have not been visually verified; D22 remains in progress.
- Live checks found intermittent 500 responses under concurrent cached-topic reads. The earlier UTC normalization assigned an ORM attribute, causing an autoflush UPDATE while FastAPI loaded pageviews and holding SQLite write locks. Changed that normalization to `set_committed_value`, preserving UTC without marking the cached row dirty. Added a regression asserting cached reads and lazy pageview access execute SELECT statements only.
- All 26 backend tests pass. Restarted the local API with the fix; health and nine concurrent requests across Fela Kuti, Lagos and Nigerian Civil War returned 200. Frontend home, topic and Stories URLs returned 200. These HTTP checks do not establish browser rendering or interaction acceptance.

### Integration of the approved prototype

- User approved the corrected prototype and asked to proceed. Integrated its grid-first layout, grid/list icon order, self-hosted Noto Sans, green/neutral palette and root-scoped night theme into the main React application.
- Home and the existing `/discover` URL now use the compact explorer. Search combines local filtering with Wikipedia autocomplete. Category membership, sorting, pagination and per-subject coverage use API data; no prototype snapshot is imported into production. Browse query, category, sort and layout survive navigation within the session.
- Added `/stories`, `/stories/afrobeat`, `/stories/reading-the-pulse`, and `/stories/subjects/:slug`. Narrative writing, methodology and citation breakdowns are separate from quick topic charts. Updated page metadata and the sitemap.
- Preserved `/topics/:slug`, related topics, direct subject search, comparison and PNG export. Added a 90-day chart window. Export is now also available for comparisons, uses the active theme, waits for layout, and omits interactive controls.
- Extended featured-topic pageview coverage to a 60-day lookback, excluding future-dated records. Production percentages now match the approved prototype policy: two complete 30-day windows and a prior total of at least 50. Missing records and actual zeros remain distinct.
- Full backend checks exposed a pre-existing SQLite naive/aware timestamp error in cache freshness. Restored UTC semantics for cached timestamps and returned values; the existing fresh/stale/legacy timestamp tests now pass.
- Verification: 32 frontend tests, 25 backend tests, lint, typecheck and production build pass. HTTP checks return 200 for home, Discover, topic routes, Stories routes and all three production Noto Sans font files. Character probes and text/accent contrast on page/surface backgrounds pass for both palettes.
- Production build: main JavaScript 183.74 kB gzip, CSS 5.09 kB gzip, font assets 354.78 kB total WOFF. The existing large-chunk warning remains. Browser runtime performance and main-app pixel/interaction/export checks are still pending; prototype approval is not a substitute for those checks.
- No deployment performed. Next: review the integrated main app at `/`, then address observed browser issues before release. Nsibidi remains planned for later.

### Earlier prototype iterations

- Fixed prototype night-mode inheritance: apply the palette to the document root, where the inherited foreground and canvas background are defined. This keeps the page, headings, counts, card surfaces, controls, charts and exported images on the same palette.

- Prototype refinement: grid is now the default, including the Tweaks selector. Replaced the visible List/Grid labels with line icons, preserving 44px targets, tooltips, accessible names and selected states.

- Prototype feedback: Noto Sans approved visually; removed the diagonal subject-row arrows. Added visible List/Grid controls above results and synchronized them with the Tweaks selector. Fixed the mobile grid rule that previously collapsed to a single column; grid now retains two columns with wrapping titles.

- User approved Noto Sans and requested creation of the prototype. Created the isolated `frontend/prototypes/explorer/` preview with Explore, compact topic views, separate Stories, and hash navigation.
- Used twelve real subjects and historical pageview records from the local cache, exported read-only. The interface explicitly labels the common 7 July 2026 cutoff; no live API or synthetic counts are used.
- Added search, category filters, most-read/rising/name sorting, 30/90/365-day chart periods, aligned comparison, an optional daily table, and local PNG export. Topic pages link to deeper reading rather than embedding the narrative path.
- Added review-only Tweaks with list/grid/split-preview variants, density, and loading/error/empty states. Noto Sans 400/500/600 is self-hosted and the generated font subsets retain all selected extended-Latin probe characters. Nsibidi remains a separate future addition.
- Checked 21 tests, lint, typecheck, JavaScript syntax, asset references, unique static HTML IDs, font glyph coverage, and HTTP delivery of the preview and assets. Browser interaction and rendered visual review remain pending because no browser automation tool is exposed.
- The main application remains unchanged in this increment. Next: user reviews the prototype and selects/refines its layout before broad implementation. See the [prototype guide](../../frontend/prototypes/explorer/README.md).
