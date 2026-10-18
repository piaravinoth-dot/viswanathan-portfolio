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

## Follow-up: front-page animation regression

The supplied desktop screenshot exposed a WebGL-path layout error that the initial fallback-only browser checks had missed. The character's CSS `translateX(-50%)` centering was being overwritten by a GSAP pixel `x: 0` start value, placing the canvas centre at the viewport's right edge. The desktop About reveal also applied a negative half-section translation before it was visible, and competing SplitText loops could overlap the two role variants.

Corrections:

- Preserve canvas centering with explicit `xPercent: -50, x: 0`; use percent-based scroll positions without overwriting the base transform. Subsequent scene motion uses `to` transitions instead of prematurely applying later `fromTo` start states.
- Reveal About within its own normal-flow section, and keep Career in normal flow. Use one clipped CSS track per rotating role line, with a static reduced-motion alternative.
- Do not let a canvas resize kill unrelated ScrollTriggers or ScrollSmoother. Own scene timelines in a reversible GSAP context. Remove random-interval leakage.
- Cancel render frames, loading/intro/touch timers and named listeners on scene teardown. Dispose model/renderer resources, reject stale async results and release model blob URLs. Prevent late environment-map completion from resetting the final lighting intensity.
- Move intro and career animation ownership out of the disposable loading screen and WebGL loader. Schedule loader timers in effects, with cleanup; the slow-load fallback always unlocks the homepage.
- Revert old SplitText wrappers and their triggers before responsive rebuilds, including when crossing into mobile. Keep the native and smooth-scroll coordinate scale at 1:1. Let the transparent canvas pass clicks through, while retaining only the face's small hover region.

A local, unpublished regression harness exercised the actual desktop GSAP timeline with a Three.js object/camera but without requiring a GPU-rendered model. At 1920px, the canvas bounds were 0–1920, with centre 960. At 1366px, the bounds were 0–1366, with centre 683. About content started below the hero. Both role tracks had distinct nonoverlapping rows. After desktop → mobile → desktop resizing, the model host count remained one and the visible scroll-trigger diagnostic returned to the same desktop count (5 → 1 → 5), rather than accumulating. Desktop About and Contact navigation retained header clearance; mobile View projects landed at about 69px under the 57px header. The deliberately stalled loading test exited with the loader removed, body scrolling enabled and the homepage visible.

The normal homepage was rechecked at all eight widths with no document overflow, four capabilities and six products. These tests validate layout and animation lifecycle, not a real GPU screenshot or physical Safari/touch behavior.

The final production navigation check additionally found that the VG brand link changed to an empty hash without resetting ScrollSmoother. Empty-hash navigation and the explicit `/#` brand link now share the same return-to-top handler. The decorative cursor's render frame, hover listeners and mouse listener are also cleaned up on unmount instead of accumulating in development remounts.

## October 18 screenshot follow-up

- Both capabilities and product accordions now initialize with no selection. Activation toggles an item closed; selecting another keeps at most one open. The fully closed desktop product collection fills the available width.
- Hide the complete multi-material monitor group during hero/About close-ups, rather than fading just one of its mesh primitives. Disable baked screen-light and ground planes to remove opaque rectangular overlays. Finish the scene fade before capabilities enters the main reading area.
- Verified initial ten closed triggers, keyboard open/close, and exclusive product selection in the browser. Production build, TypeScript and whitespace checks passed. This browser still cannot render WebGL, so the model correction is based on inspection of the actual GLB node/material structure and supplied GPU screenshots; a real GPU visual recheck remains necessary.

## About working-pose placement

Move the existing seated typing/workstation reveal from the end of About to the hero-to-About transition. Settle the camera at z75/y8.4 with the scene on the left; reveal the monitor only after the camera begins pulling back. Keep biography opacity intact throughout About. Preserve typing/blink animation and the separate fade before capabilities. Mobile retains the established non-overlapping layout. Real GPU rendering is unavailable in this browser; camera/DOM animation checks do not verify the final GPU image.

## PROFILE edge placement and WebGL diagnosis

PROFILE now stays rotated -90 degrees along the far-right viewport edge on desktop and mobile, with a 44px touch target and visible focus outline. Its placement includes viewport gutters and safe-area insets. The remote QA browser reports GL_VENDOR/GL_RENDERER Disabled while creating a WebGL context; this is a browser environment restriction, not a website setting that can be enabled by frontend code. User-supplied screenshots demonstrate GPU rendering in the user's browser. No security or browser GPU settings were changed.
