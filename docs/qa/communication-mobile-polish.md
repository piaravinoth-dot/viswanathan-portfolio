# Communication case-study mobile review

Prepared for approval on 20 October 2026. Production is unchanged by this branch.

## Changes

- Add responsive hero image selection and matching HTML preload hints to the four communication case studies. The full-resolution originals remain available.
- Correct the VG home link's accessible name to include its visible label.
- Increase the checked navigation, footer and artwork-link hit areas to at least 44 CSS pixels in height.
- Add a full-resolution artwork link beneath every story panel.
- Add a role description and three project-specific design decisions to each case study, grounded in the artwork already presented. No new research, client results or performance claims are invented.
- Preserve the four-project communication gallery, original visual archive and dedicated six-product section.

## Validation

All four case studies were rendered in Chromium iframe viewports at 320, 375, 425, 768 and 1440 CSS pixels. All 20 scenarios passed horizontal-overflow checks, the selected 44-pixel navigation target checks and axe-core's WCAG 2 A/AA, WCAG 2.1 A/AA and best-practice rules with zero reported violations. The homepage also passed accessibility and overflow checks at 375 and 1440 pixels, with four communication projects, zero duplicate product cards and six dedicated product cards.

Keyboard navigation was exercised from Nation Building to Telangana Manifesto and back to the work gallery. The full-resolution link opened the original Nation Building artwork (1400 × 1510) in a new tab.

These are browser viewport tests, not physical iPhone/Android or Safari/Firefox certification. The Google PageSpeed Insights API returned HTTP 429, so no new Lighthouse score is claimed.

### Hero image file sizes

| Project | Full export | Responsive 800px export | Reduction |
| --- | ---: | ---: | ---: |
| Nation Building | 60,670 B | 22,942 B | 62.2% |
| Telangana Manifesto | 145,474 B | 37,912 B | 73.9% |
| LED Rath Yatra | 174,586 B | 46,934 B | 73.1% |
| Samvidhan | 204,370 B | 58,572 B | 71.3% |

The 375px Chromium previews selected the 800px variants. Higher-density screens may select a larger file as needed; the table measures image bytes, not overall page-speed improvement.

Raw viewport/audit results: `communication-responsive-2026-10-20.json`.

Temporary local review fixtures and axe scripts are excluded from the source change and production build.
