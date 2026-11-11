# Compact explorer prototype

Run `yarn dev` or `npm run dev` from `frontend/`, then open **`/prototypes/explorer/`** on the printed local address. No backend or third-party service is needed.

The prototype is isolated from the main application. It uses plain HTML, CSS and JavaScript with local Noto Sans files. It is not included in the existing Vite production build.

## Try these journeys

1. Search for a subject or choose a category; change the sort order.
2. Open a subject, change the chart period, and expand the daily figures.
3. Choose Compare and select another subject. Download a PNG with the selected period and comparison.
4. Open Stories, read the Afrobeat path or data guide, and return to Explore.
5. Grid is the default. Use the **list and grid icons** above the results to switch browsing layouts; each has a tooltip and accessible name. Grid keeps two columns on narrow screens. Open **Tweaks** at the bottom right to also try C Browse + quick preview; that variant becomes a direct list on narrow screens. Both layout controls stay in sync.
6. Use Tweaks to try compact spacing and the loading, unavailable, and empty collection states. Use a nonsense query to inspect no-results recovery.

The prototype supports hash navigation and browser history. Search, category, sort and layout selections stay in memory when moving between Explore and Stories. Refresh resets those selections. No user preferences or queries are sent to a service.

## Data provenance

`snapshot.js` contains twelve subjects exported read-only from the project's existing SQLite cache on 11 November 2026. Records run through **7 July 2026**. The interface labels that date and does not imply current or live trends.

For duplicate records on the same date, the export retains the last inserted record. Each subject includes up to 366 cached calendar dates. The chart offers 30, 90, and 365 calendar-day windows ending at the common snapshot cutoff. Missing records remain gaps; actual zero counts remain zero.

Explore sorts by the displayed recent 30-day totals by default. Percentage changes appear only when both 30-day periods contain all 30 records and the prior total is at least 50. This prototype intentionally differs from the existing backend's baseline-floor growth score; production integration must choose and document a consistent policy. Rankings apply only to the twelve-subject snapshot. Sparklines have individual scales; comparison charts share a common vertical scale.

Stories contains a short sourced Afrobeat path and a data guide. Tony Allen is linked to Wikipedia because his pageviews are not present in this snapshot. No current news, event explanation, reading-time estimate, or synthetic metric has been added.

## Fonts and assets

- `assets/noto-sans-{400,500,600}.woff`: static instances at normal width, derived from the reviewed upstream Noto Sans variable font. The Latin/extended-Latin, IPA, combining-mark, punctuation, currency and arrow subset preserves every character in our typography probe. OpenType layout features are retained. Browser accent positioning still requires visual review.
- Source font: [Google Fonts Noto Sans](https://github.com/google/fonts/tree/main/ofl/notosans), corresponding to the hash in [coverage.json](../../../docs/design/typography/coverage.json). License: `assets/OFL-Noto-Sans.txt`. No binary font dependency or build step was added to the main app.
- `assets/pulse.svg`: a copy of the current project favicon, retained as the existing mark.
- `assets/fela-kuti.jpg`: [Wikimedia Commons portrait](https://commons.wikimedia.org/wiki/File:Fela_Kuti.jpg). Original credit: MOI MEME; derivative crop/color correction: Klausness. [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Display resized/cropped; source bytes unchanged. Attribution appears on the Stories index.

The PNG download contains chart data and text, not the portrait. It uses a local canvas and labels the snapshot and date range. Fonts are bundled locally; external links only open when selected.

## Verification and limits

- Twenty-one tests, frontend lint and typecheck pass, including six checks specific to the prototype's data and navigation model.
- JavaScript syntax, local asset references, HTML IDs, generated-font probe coverage, and local HTTP delivery checked.
- Browser interaction, screen-reader behavior, rendered layout at target sizes, accent shaping, and PNG visual inspection remain pending. A browser automation tool is not exposed in this session. Model tests and successful HTTP responses do not establish those results.
- Nsibidi remains planned for later in the design backlog. It is not represented by the Latin font or placeholder symbols in this prototype.
