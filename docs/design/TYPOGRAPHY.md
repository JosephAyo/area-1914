# Explorer typography decision

Reviewed: 10 November 2026. **User approved Noto Sans** and subsequently approved the compact-explorer prototype. On 11 November, Noto Sans weights 400, 500, and 600 were integrated into the main application as self-hosted assets in `frontend/public/fonts/`, with the license retained. The production font files pass the selected character probe; main-app browser shaping and visual QA remain open.

## What the font needs to do

The main app is a simple explorer: search, subject lists, short descriptions, charts, comparison, and downloads. Deeper writing belongs in a separate Stories section. Typography should make those tasks easy and remain reliable when names include diacritics and extended Latin letters.

Priorities, in order: character coverage, readable interface text, clear numerals, manageable line wrapping, visual tone, and delivery cost. A font's language-count claim is not sufficient evidence for this project's actual text.

## Comparison

The visual advantages and disadvantages below are design judgments based on a same-content specimen. Character findings apply to the exact downloaded full font files, not every version, subset, or related family.

| Font                       | Advantages for this app                                                                                                                                                 | Disadvantages and evidence                                                                                                                                                     | Decision                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Noto Sans                  | Quiet, straightforward letterforms; covers the full extended Latin/combining-mark probe; equal-width default digits and a tabular-figures feature in the inspected file | Less expressive as a brand voice. The long-title specimen is wider than Source Sans 3. Full variable TTF is about 2.05 MB, so production needs carefully chosen WOFF2 delivery | Primary prototype candidate                                                                    |
| Source Sans 3              | Adobe explicitly designed it for UI environments. Compact, open text; the narrowest long-title specimen here. Default digits have equal advances                        | Missing Ƙ, ƙ, Ƴ, and ƴ in this file. A fallback would be required for those letters; mixed-font words add complexity                                                           | Strong alternative if a tested fallback strategy is acceptable                                 |
| Public Sans                | Neutral, direct appearance; a recognizable lowercase l; tabular-figure feature                                                                                          | Missing eight hooked-letter probe characters. The official repository now says it is not actively maintained. Less characterful than other options                             | Secondary option                                                                               |
| IBM Plex Sans              | Distinctive, structured forms; fits analytical content; equal-width default digits                                                                                      | More technical in tone than this casual explorer needs. Missing ten probe characters, including Ṣ and ṣ                                                                        | Not preferred                                                                                  |
| Atkinson Hyperlegible Next | Distinctive forms for commonly confused characters; worth considering for a reading-focused accessibility treatment                                                     | Missing nineteen probe characters in this file, including underdotted letters. Its recognizable letterforms are more visually noticeable                                       | Not the default; do not equate its name or design goals with proven readability for every user |
| Outfit                     | Friendly geometric rhythm and a more stylized display voice                                                                                                             | Missing the same nineteen probe characters. Geometric repetition is less quiet in dense lists. Its branding character does not outweigh the coverage gap                       | Drop the earlier recommendation                                                                |

## Direct checks

Downloaded upright variable TTFs from the Google Fonts repository into a temporary review folder. Inspected each Unicode cmap and digit advances using FontTools; inspected OpenType feature tags; rendered the same specimen at weight 400 using Pillow. File versions, SHA-256 hashes, source URLs, raw sizes, and individual missing characters are in [coverage.json](typography/coverage.json).

Probe: `Ẹ ẹ Ọ ọ Ṣ ṣ Ụ ụ Ị ị Ń ń Ɓ ɓ Ɗ ɗ Ƙ ƙ Ƴ ƴ` and combining grave, acute, macron, and dot below. This is a practical extended-Latin probe, not a complete Nigerian-language coverage test. Passing it does not establish correct browser shaping, every tone-mark combination, every orthography, or Nsibidi support.

The sample phrase `2023 Nigerian presidential election` measures approximately 260.5 px in Noto Sans and 233 px in Source Sans 3 at 16px regular under this measurement setup. The design should allow wrapping rather than shrink or clip subject names to force a single line.

View the [six-font specimen](typography/font-comparison.png). Missing-glyph boxes intentionally reveal absent glyphs; the specimen does not silently borrow a fallback font. This is a type specimen, not a browser screenshot of the app.

## Proposed use

- Noto Sans 400 for body copy and descriptions, 500 for controls, and 600 for subject headings.
- Start body text at 16px and avoid light weights for core UI. Use a comfortable line height and moderate headings.
- Use tabular numerals for counts, chart labels, and comparisons.
- Start the explorer with one family. Choose a separate Stories display/body pairing only when reviewing the actual long-form layout; Newsreader is no longer an automatic second-font decision.
- Use a system fallback stack and `font-display: swap`. Self-host appropriately licensed webfonts and measure layout shift and transfer size. Preserve required characters in any subset.
- Verify the actual shipped WOFF2 files in browser text at 360px and 200% zoom, including composed and decomposed accents. Re-check the coverage after conversion or subsetting.

## Sources

- [Noto Sans official specimen](https://notofonts.github.io/noto-docs/specimen/NotoSans/) and [source repository](https://github.com/notofonts/latin-greek-cyrillic).
- [Adobe Source Sans repository](https://github.com/adobe-fonts/source-sans).
- [Public Sans official repository](https://github.com/uswds/public-sans), including its current maintenance notice.
- [IBM typeface documentation](https://www.ibm.com/design/language/typography/typeface/).
- [Braille Institute font documentation](https://www.brailleinstitute.org/freefont/) and [Atkinson Next repository](https://github.com/googlefonts/atkinson-hyperlegible-next).
- [Outfit source repository](https://github.com/Outfitio/Outfit-Fonts).
- Inspected binaries: [Google Fonts](https://github.com/google/fonts/tree/main/ofl), with exact source directories recorded in the JSON report. Raw TTF sizes are comparison evidence, not proposed production payloads.
