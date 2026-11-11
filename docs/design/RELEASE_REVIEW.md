# Compact explorer release review

Application integration: 11 November 2026. The user-approved prototype is integrated into the main app. Automated checks pass; main-app browser and release checks remain open.

## Verified

- Frontend: `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` pass.
- Thirty-five frontend tests cover chart gaps/zeros, 30/90-day and yearly windows, comparison alignment and summary coverage, calendar/Unicode routes, collection merging, category/query filtering, sorting, pagination retention/reset, real percentage rules, search resolution and server-rendered app routes, including reporting actions for accepted/rejected subjects.
- Backend: `.venv/bin/python -m pytest -q` passes all thirty-nine tests, including collection coverage, no writes during cached serialization, report validation/privacy/persistence and reviewed relevance overrides across topic and discovery surfaces.
- Fixed the cache freshness failure caused by subtracting a timezone-naive SQLite timestamp from a timezone-aware UTC timestamp. Existing fresh/stale/legacy timestamp tests pass.
- Fixed a follow-on SQLite lock failure: UTC normalization now preserves committed ORM state, avoiding autoflush writes during response serialization. The restarted local API returned 200 for health and nine concurrent cached-subject requests across a person, place and event. These live checks establish local HTTP behavior, not general upstream availability or load capacity.
- Local HTTP responses return 200 for `/`, `/discover`, `/topics/Fela_Kuti`, `/stories`, both authored Stories, `/stories/subjects/Fela_Kuti`, and the three production font files.
- Production Noto Sans files at 400/500/600 retain the selected extended Latin and combining-mark probe.
- Primary/secondary text, accent and comparison colors exceed 4.5:1 against both page and surface colors in paper and night palettes.
- The production build excludes prototype code and its data snapshot. The app uses the real API; Stories uses explicitly sourced writing and existing citation data.
- Existing topic and Discover URLs work through the app route parser. Stories routes have page metadata, direct-load checks and sitemap entries.

Server-rendered tests use seeded query data and do not render browser pixels or simulate browser interactions. Backend tests use fixtures and mocked external requests; they do not establish current Wikimedia availability.

## Delivered behavior

- Grid-first Explore with icon controls, grid on the left, no diagonal arrows on subject cards, and a two-column mobile grid.
- Search filters the returned collection while preserving Wikipedia autocomplete and direct topic lookup. Browse query/category/sort/layout stay in memory when moving between screens.
- Deduplicated subjects retain their category memberships. Pages show 24 subjects initially with a load-more action.
- Featured-topic responses include a 60-day lookback, bounded by today. Counts use a common latest returned date. Percentages require two complete 30-day windows and a prior total of at least 50; otherwise coverage is shown. This is intentionally distinct from the old baseline-floor trending score.
- Topic pages focus on short context and charts. The chart offers 30 days, 90 days, one year, and all available history, plus a daily table.
- Comparison and PNG export remain available, including export of comparisons. Export waits for fonts/layout and omits controls. No dynamic article photo is included in the quick-page export.
- Comparison search receives focus on opening and includes loading feedback, selected-pair confirmation and error retry. Failed comparisons disable export. Chart totals and recorded-day coverage are presented separately for each subject.
- Export branding and padding are applied to the capture clone; the live page no longer expands to 1200px during image preparation. Downloaded-image inspection remains pending.
- Narratives, the data guide, and per-subject citation breakdowns live in Stories.
- Theme variables are set on the document root. The saved theme preference key is preserved.
- Narrow-screen header navigation occupies a separate row; mobile search retains 16px text and long suggestion labels can wrap. These are source-reviewed changes awaiting rendered verification.
- Expanded results stay in app-level browse state, survive layout switching, and reset when filters change. Returning to Explore restores its saved scroll position after collection loading; actual browser history/scroll behavior remains unverified.
- Export preparation cancels if navigation unmounts the originating subject before capture begins. Comparison changes are disabled while preparing an image. Actual image inspection remains pending.
- The shared footer warns that Wikipedia descriptions can contain errors or outdated details. The data guide explains that summary API descriptions can differ from the article and directs readers to cited sources.
- Accepted subjects and relevance rejections offer Report classification, including rejected comparison subjects. Reports persist as pending and do not change relevance automatically. A local maintainer queue applies or dismisses corrections with a note and timestamp. See [review instructions](../CLASSIFICATION_REPORTS.md). Browser form interaction remains pending.

## Build comparison

| Asset                | Original baseline | Integrated app     | Interpretation                                          |
| -------------------- | ----------------- | ------------------ | ------------------------------------------------------- |
| Main JavaScript gzip | 178.00 kB         | 185.21 kB          | Modest increase; runtime measurement still needed       |
| CSS gzip             | 5.50 kB           | 5.41 kB            | Smaller                                                 |
| Noto Sans WOFF files | None              | 354.78 kB combined | Three self-hosted weights; browser loads matching faces |
| Stories portrait     | None              | 74.74 kB           | Local image, credited on the Stories index              |

The existing JavaScript chunk-size warning remains. No browser LCP, CLS or INP measurements have been performed. Transfer sizes alone are not runtime performance evidence.

## Browser checklist

Run the frontend and configured backend, then check:

- [ ] Home/Discover, person, event, place, long-title and image-free subjects at 360, 768 and 1440 CSS pixels.
- [ ] Default grid, icon ordering, list/grid switching, category filters, sort and load more.
- [ ] Paper/night themes across Explore, subjects, Stories, inputs, selected states and chart/tooltips; remembered preference after reload.
- [ ] 200% zoom, wrapping names, no clipped controls or unintended horizontal scrolling.
- [ ] Skip link and search ArrowUp/ArrowDown/Enter/Escape; pointer selection and recovery from suggestion errors.
- [ ] Explore → topic → Stories → Explore, plus back/forward and preserved browse state.
- [ ] Direct URL loads, page title, canonical URL and social metadata after navigation.
- [ ] Loading, API error/retry, no results, empty collections, absent/sparse pageviews and partial comparison data.
- [ ] Comparison selection/removal and navigation to a new primary subject without stale secondary data.
- [ ] Chart timeframes, sparse points, dashed series, tooltips, daily table and touch interaction.
- [ ] Downloaded PNG in each theme and from narrow/wide screens: titles, selected dates, source, comparison and no clipping.
- [ ] Noto Sans composed/decomposed accents, focus visibility, reduced motion and screen-reader output.
- [ ] Runtime performance under comparable network/data conditions.

Browser automation is not exposed in the current session. Prototype feedback established the preferred direction; these integrated-app checks remain open.

## Content and future work

- User approved the prototype's font, grid default, icon order, and corrected night mode.
- Confirm source quality and expand Stories only with researched content.
- Keep Nsibidi on the later roadmap; no substitute symbols or assumed Latin-font support.
- Conduct the planned 3–5 participant task review when available, or leave that validation outstanding.

## Local handoff

Run the backend and `cd frontend && yarn dev`, then open the normal app root `/`. The prototype remains at `/prototypes/explorer/` for reference. No deployment is included in this increment.
