# Portfolio capabilities refinement — 18 October 2026

## Scope and baseline

Repository: piaravinoth-dot/viswanathan-portfolio. Branch: malhotra-3d-rebuild.
Baseline: 935100c154b204078ff4097752d5f4bb9dd2e58a.

The live homepage had two capability groups inside `.what-box-in` with computed `display: none`. The six product accordion panels and six individual case-study routes were already present and remain intact.

## Changes

- Replace the hidden, fixed-size capabilities treatment with four numbered, navy/copper editorial accordion rows. Include descriptions, focus tags and links to existing work. The initial row is open; opening another closes the previous row. An open row may also be closed.
- Use semantic heading/button/region relationships, `aria-expanded`, `aria-controls`, inert closed regions, visible focus outlines, Enter/Space activation and Arrow Up/Down/Home/End focus navigation. Use intrinsic CSS grid height transitions rather than a fixed content height. Include a reduced-motion override and 44px mobile evidence links.
- Keep capabilities visible independently of WebGL and remove obsolete GSAP display and section-translation steps. Preserve the character's existing hero/About movement, fading it at the end of About before the capabilities reading area.
- Remove the listener that registered another text-splitting callback on each scroll refresh. Text splitting remains on the existing resize lifecycle.
- Refine About Me around senior product/visual design, creative leadership and practical AI/creative technology, without invented outcomes.
- Remove legacy negative career-section margins and improve small-screen career paragraph spacing. Employment entries and dates are unchanged, including Nation with NaMo, 2019–NOW.
- Extend the previously separated phone hero layout through 1024px: the old tablet layout overlapped the intro and character bounds. Tablet text/character and character/role bounds are now separated.
- No case-study component, product data, product visual identity, route, deployment rewrite or resume file is changed. Creator Community and the Behance gallery CTA remain removed.

Technology claims are limited to source-supported React, TypeScript, CSS, GSAP, Three.js and the existing case studies' AI/workflow design. Next.js, provider-specific OpenAI integration expertise and the other unverified technologies in the brief were not added as skill claims.

## Validation

- `npm run build`, `npx tsc --noEmit` and `git diff --check` pass.
- Browser iframe viewport audit: 320, 375, 390, 430, 768, 1024, 1366 and 1920 CSS pixels, on the homepage and all six case-study routes (56 page/width combinations). Document scroll width did not exceed viewport width in these checks.
- Inspected actual desktop and 390px mobile browser renders of the capabilities area and all six case-study hero layouts. No decoded broken images were detected; offscreen lazy-image completion is not a full image-download guarantee.
- Verified one open capability at a time, zero-height/inert closed panels, Enter, Space, arrow focus movement, Home focus, visible focus outlines, 44px mobile evidence links and case-study link targets. Reduced-motion behavior is implemented in CSS and the timing branch; a device preference toggle was not available in this browser session.
- Verified gallery modal opening and Escape dismissal, preserved Clip Studio product expansion, case-study return navigation to `/#products`, valid homepage hash targets and Contact alignment below the header. Confirmed seven artwork cards, no Creator Community card and no Behance anchors.
- Phone hero bounds at 320/375/390/430 were separated. The corrected 768px tablet layout measured about 24px between introduction and character bounds and 16px between character and role bounds.
- Case-study paths: `/work/ai-design-studio`, `/work/content-studio`, `/work/social-media-intelligence`, `/work/content-tracker`, `/work/splitmate`, `/work/clip-studio`.

## Limits

The cloud browser disables WebGL. It reports the existing Three.js context-creation errors and exercises the portfolio's fallback. Character framing was checked using the reserved DOM bounds; actual GPU rendering, the full 3D scroll choreography, physical touch gestures and iOS Safari were not verified. Browser-extension metadata errors also appeared and are unrelated to the application. No new application runtime errors were observed in the inspected non-WebGL paths. No Core Web Vitals or device performance score is claimed.

The existing Vite warning about the large Three.js-related chunk remains. No dependency or unrelated architecture change was introduced.
