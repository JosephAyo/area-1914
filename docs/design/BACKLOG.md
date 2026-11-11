# Revamp delivery backlog

Updated: 11 November 2026. States: Ready, In progress, Review, Done, Blocked. Priority order is top to bottom. No sprint velocity or duration has been assumed.

## Current priority after user feedback

The main app should be a simple, direct explorer. In-depth pages belong in a separate Stories section. This supersedes the editorial-first emphasis in the earlier cycles below.

| ID  | Item and acceptance                                                                                              | State                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| D17 | Compare UI fonts for coverage, numerals, wrapping, tone, and delivery; document the recommendation               | Done — Noto Sans selected, user reviewed and approved; delivered files retain the character probe |
| D18 | Prototype compact Explore and separate Stories with existing topic routes and useful search/browse behavior      | Done — prototype delivered and revised through user review                                        |
| D19 | Review the small prototype before expanding the next UI pass                                                     | Done — user approved grid first, icon ordering, Noto Sans and corrected night mode                |
| D20 | Add Nsibidi later; research forms, meanings, attribution, assets and accessible labels before deciding placement | Planned later — explicitly requested by user; outside initial explorer pass                       |

## Main application integration

| ID  | Item and acceptance                                                                                             | State                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| D21 | Integrate the approved grid-first explorer, fonts, themes, Stories and quick topic flow using API data          | Review — implemented; 32 frontend and 25 backend tests plus build checks pass |
| D22 | Review the integrated app in the browser, including autocomplete, history, responsive layouts and exported PNGs | In progress — mobile/navigation/export source fixes; 34 frontend tests pass; browser execution and PNG inspection remain open |

## Cycle 1

Goal: establish the foundation and make two visual directions reviewable.

| ID  | Item and acceptance                                                                           | State  | Dependency                                                                              |
| --- | --------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| D01 | Save plan with milestone criteria, scope, delivery method, and completion rules               | Done   | None                                                                                    |
| D02 | Audit screens, journeys, API semantics, editorial gaps, and representative content            | Review | Source audit written; running-app baseline still required                               |
| D03 | Annotated reference board connecting named sources to proposed design choices                 | Review | Visual reference inspection remains pending                                             |
| D04 | Two responsive studies with the same home/topic content and review controls                   | Review | Files serve successfully; rendered QA remains pending                                   |
| D05 | Inspect desktop/mobile, missing image, long title, chart, and search states; select direction | Review | Editorial direction implemented provisionally; visual preference and browser QA pending |

## Cycle 2

Goal: carry the recommended editorial direction into the application while preserving existing routes and topic actions. Implementation is available; Review means acceptance still requires browser evidence, not that the item is release-ready.

| ID  | User outcome and acceptance                                                                           | Milestone | State                                                                      |
| --- | ----------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------- |
| D06 | Reusable visual foundation: typography, spacing, color, focus, reduced motion, and both themes        | M3        | Review — core colors checked; rendered review pending                      |
| D07 | Editorial home: open lead without search; attention, thread, archive sections have honest states      | M3        | Review — implemented; HTTP and server rendering checked                    |
| D08 | Search: complete pointer and keyboard journeys, including empty/error/loading states                  | M3        | Review — implemented; selection logic tested; browser pending              |
| D09 | Topic: readable subject → chart → connections → sources, with accurate coverage and no-image layout   | M4        | Review — direct routes and edge cases tested in server rendering           |
| D10 | Curated 3–5 subject thread: each edge explained and sourced; valid destinations and return navigation | M4        | Review — three subjects with sources; live destinations/history pending    |
| D11 | Discover: category exploration follows selected identity and existing route behavior                  | M5        | Review — implemented and server-rendered route checked                     |
| D12 | Comparison: distinguishable series, appropriate handling of missing dates, existing actions preserved | M5        | Review — series alignment tested; browser interaction pending              |
| D13 | Export: legible branded image with dates, metric, source, credits, theme-safe capture                 | M5        | Review — theme-aware capture implemented; PNG inspection pending           |
| D14 | Data notes: explain ranking floor, date coverage, and archive meaning; remove implementation prose    | M5        | Review — implemented with accurate growth-score and archive wording        |
| D15 | Release checks: accessibility, responsive layouts, direct links, history, metadata, lint/types/build  | M6        | Review — automated checks pass; browser checklist remains                  |
| D16 | Performance comparison and task-based participant review; record remaining release risks              | M6        | Review — build sizes recorded; runtime metrics and participant review open |

## Classification feedback

| ID | Item and acceptance | State |
| --- | --- | --- |
| D23 | Report false inclusions/exclusions, persist for review, and apply approved relevance overrides | Review — implemented; 35 frontend and 39 backend tests pass; browser form interaction pending |

See [maintainer instructions](../CLASSIFICATION_REPORTS.md) for the local review queue.

## Deferred features

Maps, accounts, CMS, AI-generated historical explanations, separately sourced historical anniversaries, and editorial chart annotations. Revisit after the initial release demonstrates a useful reading and exploration experience.

Nsibidi integration is also planned for later (D20), as requested by the user.
