# Nigerian History Pulse UI and UX Revamp

Created: 10 November 2026. Updated 11 November: the user-approved compact explorer and separate Stories section are integrated into the main application. Status: automated verification complete; main-app browser review pending.

## Product direction

The user clarified that the main app should be simple, direct, and easy to explore. Prioritize search, browsable subjects, concise descriptions, reading charts, comparison, downloads, and related links. Put in-depth writing, curated narratives, and detailed methodology in a separate Stories section. Preserve existing topic URLs for the quick exploration experience.

This brief supersedes the earlier editorial-first homepage direction. The compact explorer system is still being reviewed; its palette and layout have not been approved as a final design. Keep the current product name. Nigerian specificity should come from accurate subjects, writing, and researched visual references.

Typography: the user approved Noto Sans after comparison with Source Sans 3, Public Sans, IBM Plex Sans, Atkinson Hyperlegible Next, and Outfit. See [decision and tradeoffs](TYPOGRAPHY.md). The earlier Outfit/Newsreader proposal is superseded. Noto Sans is now self-hosted in the main application at weights 400, 500 and 600.

## Success criteria

| Criterion                | Acceptance standard                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| Distinctive identity     | Homepage, topic page, and exported image share recognizable typography, imagery, and composition.        |
| Immediate understanding  | A first-time visitor can describe the offering and choose a subject without search.                      |
| Meaningful exploration   | Visitors can move between subjects and understand the reason for each curated connection.                |
| Trustworthy presentation | Historical facts, editorial interpretation, and Wikipedia attention metrics are distinguished.           |
| Usable delivery          | Core journeys work on mobile, desktop, keyboard, and direct links, including loading and failure states. |

## Milestones

The milestones below describe the original implementation sequence. Apply the revised Explore/Stories separation to the next design iteration: replace the editorial homepage emphasis in M3 with direct exploration, and place the deeper M4 narrative content in Stories.

### M1 Product and content foundation

Deliver a screen and interaction inventory; map browse → topic, search → topic, and topic → connected subject; define homepage and topic hierarchy; select representative person, event, place, long-title, and image-free cases; identify API and editorial dependencies.

Acceptance: every proposed section has a purpose, data source, fallback, and destination. Unsupported claims are removed. The existing On This Day endpoint is described as past reading activity, not historical anniversaries.

### M2 Concrete visual direction

Deliver two studies using the same content, each covering homepage and topic page on desktop and mobile. Explore editorial and photographic compositions. Specify typography, color, imagery, spacing, and motion. Show missing imagery, long titles, charts, and search states.

Acceptance: one direction is selected after reviewing real screens. Lead subject, search, and next action are identifiable. Topic pages support reading and data exploration. Ordinary content works as well as the lead subject. Record source, creator, license, and transformations for retained images.

Checkpoint: choose the visual direction before broad application implementation. Early studies may be incomplete; label their data and interaction limits honestly.

### M3 Foundation and homepage

Deliver shared design tokens and masthead, navigation, buttons, search, and editorial layouts. Build a homepage with one lead subject and introduction, Getting attention, a curated exploration entry, and accurately labeled attention history. Maintain lead subjects and editorial copy in a small typed configuration.

Acceptance: visitors can open a subject without search; search supports keyboard input; loading, empty, error, and missing-image states fit the design; no horizontal page overflow at 360, 768, and 1440 CSS pixels; shared foundation supports both existing themes.

### M4 Topic experience and signature interaction

Deliver identity and context → attention chart → connections → sources. Label chart units, selected dates, available coverage, and timeframe. Add one curated Follow the thread journey containing 3–5 subjects with a sourced explanation per connection. Keep algorithmic related-topic suggestions distinguishable from editorial paths.

Acceptance: readers can identify the subject, interpret the chart, and continue exploring; every editorial connection has evidence; sparse data and absent imagery work; comparison remains usable; direct links and browser back/forward work.

### M5 Consistency across discovery and sharing

Deliver redesigned Discover, comparison, downloadable Pulse image, methodology, sources, navigation, controls, and feedback.

Acceptance: all experiences share the identity; comparison series remain distinguishable and date handling is consistent; exports show subject, date range, metric, source, and product identity without clipping; existing URLs and metadata work; methodology explains the data in reader-facing language.

### M6 Validation and release readiness

Deliver responsive and browser checks, accessibility and performance review, core-journey checks, comparison/export checks, release findings, and handoff. Conduct a task-based review with 3–5 participants when available.

Acceptance:

- No blockers in browsing, search, topic navigation, comparison, or export.
- Keyboard access, visible focus, readable contrast, and reduced-motion support.
- No clipped controls or overlapping content at target sizes and 200% zoom.
- Frontend lint, typecheck, and production build pass.
- Relevant backend checks pass when backend behavior changes.
- Performance is compared with the current app and material regressions resolved.
- At least 80% of participants complete the core tasks without guidance when participants are available. Otherwise user validation remains outstanding; developer checks do not substitute for it.

## Scope and sequencing

The first reviewable application implementation covers M1–M4: homepage, topic page, design foundation, and one curated thread. M5–M6 complete the revamp and release readiness. Preserve existing React, Vite, SCSS Modules, React Query, Recharts, and FastAPI architecture unless evidence justifies a change.

Maps, accounts, automated historical explanations, and a CMS are outside this release. Sourced chart annotations follow when we have a reliable editorial process. New event-anniversary content requires a separate dataset. Image provenance and editorial copy are dependencies, not details to fabricate in the interface.

**Planned later: Nsibidi integration.** The user explicitly requested that Nsibidi be added later. Keep it on the roadmap beyond the initial explorer pass. Determine its placement through researched forms, clear meanings and source attribution, appropriate assets, and accessible text labels. Its role is not yet specified, and selecting a Latin UI font does not resolve its representation.

## Delivery method

Use a lightweight Scrum-inspired workflow rather than claiming a full Scrum team or process. Work from a prioritized backlog, select a small cycle goal, limit implementation work in progress to one main item, review a working increment, then record what changes in the next cycle. Formal roles, daily ceremonies, and sprint velocity are unnecessary for this collaboration.

Track Ready → In progress → Review → Done, with Blocked reserved for specific dependencies. Criteria determine completion. Keep estimates provisional until the visual direction and content requirements are settled. Do not equate milestones with fixed-duration sprints.

At cycle start, state the goal and chosen backlog items. During work, record material findings and decisions. At review, provide the working artifact, evidence of checks, known gaps, and the next priority. Continue routine authorized work without repeated approval requests; visual preference is resolved at the M2 checkpoint.

## Definition of ready

A work item has a user outcome, acceptance criteria, known content/data source, relevant states, and identified dependencies. Implementation work needing a visual decision follows the selected direction.

## Definition of done

The item meets its criteria, has appropriate verification evidence, preserves relevant existing behavior, and records known limitations. Visual work requires rendered review before being marked done. No publishing or deployment is included in the current local repository work.

## Current cycle

Goal: verify and review the integrated compact explorer with a separate Stories section.

- M1: source audit complete; rendered baseline inspection still pending.
- M2: two local studies are retained. After the user requested continuation, the recommended editorial edition was carried forward provisionally. Explicit visual preference and browser QA remain open.
- M3–M5: the design foundation, homepage, topic experience, sourced thread, Discover, comparison presentation, export styling, and data notes are implemented for review.
- M6: 15 automated checks, lint, typecheck, production build, core color contrast calculations, and local HTTP checks pass. Browser interaction, responsive, zoom, live-data and PNG inspection remain pending.
- Next: complete the browser checklist in [release review](RELEASE_REVIEW.md), address observed issues, and obtain visual feedback before calling the revamp release-ready.

Latest steering: the user reviewed and approved the compact prototype, including grid as the default, icons with the default on the left, and corrected night mode. That system is now integrated into the main application with real API connections. Thirty-two frontend tests and twenty-five backend tests pass, along with lint, typecheck, build, local HTTP, font and contrast checks. Next: review the main app at `/`, with the backend running, and complete its browser/interaction/export checks. The prototype remains available separately at `/prototypes/explorer/`. Nsibidi remains a planned later addition.

See [audit](AUDIT.md), [backlog](BACKLOG.md), [references](REFERENCES.md), and [progress](PROGRESS.md).
