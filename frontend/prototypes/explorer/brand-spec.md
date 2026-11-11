# Compact explorer design specification

Approved inputs: simple/direct main app, separate deeper-reading section, and Noto Sans. Prototype created 11 November 2026; broad application implementation follows review.

## Design read

Artifact: an interactive exploration prototype for casual visitors browsing Nigerian subjects. Mode: redesign overhaul of presentation and navigation emphasis, preserving the product's search, charts, comparison and export purpose. Existing application code and topic URLs are unchanged by this isolated prototype.

Visual language: a quiet information browser with open subject rows and restrained controls. Variation 3/10 produces a stable grid; motion 1/10 limits animation to feedback; density 5/10 puts useful subjects in the first viewport; asset dependence 2/10 means the interface works without hero photography; brand fidelity 5/10 retains the product name and existing pulse mark while exploring a new interface system.

## Screen roles

| Screen  | Role and temperature                                                   | Viewing and capacity                                                                        |
| ------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Explore | Direct entry, quiet and inviting; search and subjects carry the screen | Phone/laptop; no cover screen or editorial hero; twelve records can be scanned and filtered |
| Subject | Short context and a readable data view                                 | Phone/laptop; one main chart, explicit dates, optional comparison and daily table           |
| Stories | Slower contextual reading, separate from browsing                      | Phone/laptop; constrained text column and links back to relevant subject records            |

## System

- Ground `#F8FAF7`, surface `#FFFFFF`, ink `#1E2C24`, primary green `#246343`, comparison slate `#526C85`, muted text `#627068`, reference rules `#DCE3DB`.
- Night equivalents live in `prototype.css` and preserve the same semantic color roles. Solid green and dashed slate distinguish comparison series in both themes.
- Noto Sans 400 for body, 500 for controls/numbers, 600 for headings. Body starts at 16px; compact metadata is subordinate. Long names wrap. No extra Stories typeface has been introduced.
- Base spacing: 4/8/12/16/24/32/48. Small 4px corners, no panel shadows except floating review controls and feedback.
- The current pulse mark is an actual local SVG asset. Cached subjects and actual dated data provide content identity; no invented graphic symbols or Nsibidi substitutes.
- Motion is limited to a short hover-state transition. Reduced motion disables transitions. Focus outlines and touch target sizes are declared in CSS.

## Variants and assumptions

The Tweaks panel exposes three structural variants: compact rows, subject grid, and browse plus quick preview. All use the same content, counts and type, so layout comparisons are meaningful. Comfortable/compact spacing and data states can be changed independently. These are review controls, not proposed product settings.

This prototype prioritizes choosing a subject over reading an essay. Short descriptions remain on topic pages; sourced longer paths and methodology live under Stories. The twelve-subject cache is a bounded sample, not a complete taxonomy or live popularity feed.
