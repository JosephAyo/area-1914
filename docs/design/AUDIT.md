# Revamp foundation audit

Source audit: 10 November 2026. This records code findings, not a completed review of the running interface.

## Current experience

| Surface     | Implementation                                | Observation                                                                                                                                                                                                             |
| ----------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home        | `frontend/src/App.tsx`                        | Centered hero, primary search, featured categories, trending, attention anniversaries, methodology. Trending is reordered on mobile.                                                                                    |
| Topic       | `App.tsx`, `TopicCard`, `PulseChart`          | Topic card and chart share a dashboard grid. Comparison and PNG export are existing functionality.                                                                                                                      |
| Discover    | `DiscoverPage`, `FeaturedTopics`              | Expanded category grid; no dedicated editorial journey.                                                                                                                                                                 |
| Search      | `TopicSearch`                                 | Existing Wikipedia suggestions with thumbnails; retain behavior and inspect keyboard support.                                                                                                                           |
| Related     | `RelatedTopics`, backend `related_manager.py` | Candidates ranked from curation, outgoing links, backlinks, and shared categories. Labels are association evidence, not narrative explanations.                                                                         |
| On This Day | `OnThisDay`, backend `anniversary_manager.py` | Checks cached pageviews on today's month/day 1, 5, or 10 years ago. Compares against available surrounding records. It does not retrieve event dates.                                                                   |
| Trending    | Backend `trending_manager.py`                 | Compares recent and preceding 30-day windows over stored topics. Uses a denominator floor of 50; not always a literal percentage increase. Current API does not describe coverage or baseline adjustment to the reader. |
| Sources     | `CitationSources`                             | Citation counts, categories, and top source names. Does not supply evidence for authored editorial claims.                                                                                                              |
| Themes      | `styles/tokens.scss`, `ThemeProvider`         | Dark default, light alternative; glass surfaces, teal, Inter/system sans, rounded cards.                                                                                                                                |
| Navigation  | `utils/navigation.ts`                         | Home, `/discover`, `/topics/:slug`; manually managed history. Preserve route shape and link semantics.                                                                                                                  |

## Proposed information hierarchy

Homepage: masthead and navigation → lead subject and introduction → compact attention list → curated thread → attention archive → concise data note.

Topic: breadcrumb/back link → title, description, image and credit → attention chart and readable explanation → curated thread if applicable → algorithmic connections → sources and methodology.

Search remains reachable on both. Comparison and download remain contextual topic actions. Move framework/cache implementation prose out of the main reading journey.

## Journey acceptance

1. Browse: visitor chooses the lead subject, reaches its URL, reads context, and finds the chart. Back returns to a usable home state.
2. Search: visitor enters a query, selects a suggestion using keyboard or pointer, reaches the correct subject, and can recover from no results or API failure.
3. Continue: visitor sees why a curated subject connects, follows it, and can return to the previous subject through browser history.

## Data and content contract

| Section                  | Existing source                         | Additional need                                                                        | Fallback and destination                                                               |
| ------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Lead subject             | Topic title, description, thumbnail     | Authored introduction; image credit/license; intentional selection                     | Text-led lead if image unavailable; topic URL                                          |
| Getting attention        | Trending endpoint                       | Explain window, baseline floor, coverage and freshness; consider response metadata     | Explicit unavailable state; browse remains usable; topic URL                           |
| Follow the thread        | Topic endpoint and related associations | Typed ordered path with sourced relationship prose                                     | Omit absent editorial paths; show related associations with accurate labels; topic URL |
| Attention archive        | On This Day endpoint                    | Rename and explain historical pageview date                                            | Omit empty section, concise retry state on failure; topic URL                          |
| Chart                    | Dated pageviews                         | Accessible summary/table; coverage labels; avoid treating missing dates as proven zero | Explicit insufficient-data state; reader can still read topic                          |
| Historical annotations   | No editorial evidence field             | Separate curated sources and dates                                                     | Omit until verified                                                                    |
| Historical anniversaries | No event-date dataset                   | Separate sourced dataset and maintenance                                               | Out of initial scope                                                                   |
| Editorial evidence       | No authored content system              | Maintain source URL per claim/connection and review status                             | Do not publish unsupported prose                                                       |

## Representative content

Use Fela Kuti as the lead and repeated subject across both studies. Exercise Nigerian Civil War (event), Lagos (place), 2023 Nigerian presidential election (long title), and an explicit image-free rendering. These are content cases, not a claim that every current curated slug resolves successfully. Verify resolution before application integration.

Prototype charts and attention rankings use clearly labeled illustrative values. Production screens use API data and must never silently substitute fixtures after failures.

## Risks and next checks

- Five years of default history cannot promise ten-year anniversary coverage; show only returned coverage.
- `PulseChart` currently fills absent series dates with zero. Review missing-data semantics before changing presentation.
- Comparison is local state rather than a shareable URL; preserving current behavior is required, URL expansion is optional later work.
- Export hardcodes a dark capture background. Theme-aware capture and image licensing must be checked before redesigned exports ship.
- Establish rendered screenshots and performance baselines before changing the main app.
- Browser automation is not currently exposed in the available tools; do not mark responsive/visual checks complete from source inspection.
