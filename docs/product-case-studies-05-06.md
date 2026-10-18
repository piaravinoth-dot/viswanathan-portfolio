# Product case studies 05–06

## SplitMate

Route: `/work/splitmate` (including trailing slash).

Reviewed the current Floot project `a15b3d83-ec78-4c70-8ab9-23759eda5446`, specifically `pages/_index.tsx`, its CSS and `base.css`, and the live sign-in interface on 18 October 2026. Authenticated screen studies are illustrative reconstructions, clearly labeled. Sample people, balances and invite codes are fictional.

Features grounded in the source: four-digit PIN authentication; private two-person pairs; six-character invite code; a separate shared privacy key; AES-256-GCM event encryption before upload; INR expenses and seven categories; equal, payer-only and other-person-only allocation; settlement entries and balance calculation. Settlement records an external payment; it does not transfer money. The source stores the privacy key locally and has no key recovery.

The sample ledger is consistent: you pay ₹1,200 + ₹500; Sam pays ₹800. Total ₹2,500, equal share ₹1,250, Sam owes you ₹450 before settlement. The separate interactive dinner example illustrates each allocation mode without saving data.

## Clip Studio

Route: `/work/clip-studio` (including trailing slash).

Reviewed `Clip_Studio_V12_Universal_Engine_Offline_Tested.zip`: packaged `site/index.html`, `site/app.css`, `site/app.js`, `server.py`, `README_ENGINE.md` and `TEST_REPORT_V12.md`.

Features shown in the source: supported public URL pattern detection; metadata inspection path; resolution ceiling controls; original / iPhone MP4 / MP3 modes; queue and history; progress, cancellation and error states; duplicate detection; Quick Clip with in/out controls, original/vertical/square/wide presets and fit/fill framing. Clips are limited to 1–180 seconds.

The source package explicitly marks live extractor success, standalone backend deployment and actual iPhone saving as unverified. This case study presents a prototype and claims no live success rate, adoption metrics or user-research results. All UI studies and sample states are labeled reconstructions. Interactive examples explain output decisions and frame ratios; they do not process media.

## Validation and publication

- Vite production build and TypeScript checks passed.
- Desktop and narrow mobile browser previews inspected; interactive selectors verified.
- Root page width matched viewport width at 320px and 390px iframe sizes (excluding browser scrollbar); no text/button overflow detected in those checks.
- Existing case-study components 01–04 and homepage animation components were preserved.
- Vercel production publication was attempted for project `viswanathan-portfolio`, ID `prj_uJpPQEO2pC0Fv7tO0CXxXbQa0Vut`, team `team_8IAldplVZVRzaj3tG7dznMvn` / `viswanathang-9855`. The connected account returned a team-authorization 403.
- The requested public SplitMate URL returned a Vercel 404 during verification. A successful GitHub Vercel status confirms a preview build, not production availability. This was the initial blocked attempt; see the publication update below.

## Production publication update — 18 October 2026

Project-ID-scoped Vercel operations succeeded after reconnection; explicitly team-scoped requests still returned 403. Production deployment `dpl_Tq6hqZHnoLDMRfDiCmKSG6aBYHzZ` published commit `2e37feab39d0325da464816b9a3560663ff015a6` to the existing domain. Both `/work/splitmate` and `/work/clip-studio` loaded in the public browser, their interactive examples worked, and both rendered at a 390px iframe viewport without horizontal page overflow.

Live homepage verification also exposed an existing failure: `THREE.WebGLRenderer` threw during initialization on browsers without WebGL, unmounting the React root. The renderer creation is now guarded. Unsupported browsers complete the existing loading sequence and retain access to the portfolio content; supported browsers continue through the original animation path.

## Final navigation and gallery pass

- Return links to `/#products` now restore the intended section after the loading sequence. The original ScrollSmoother `scrollTo` clamp used the native document height despite the configured 1.7 speed; section offsets now use the smoother’s scrollTop coordinate space. Header clearance is applied.
- Added Products to the main menu; compact mobile navigation and a dark header keep the links readable over the light product section. Hash links, browser hash changes and reduced-motion navigation are handled.
- Artwork viewer is portaled to the document body so transformed smooth-scroll containers do not displace the fixed overlay. Focus enters the viewer, Tab wraps between its controls, arrow keys change artwork, Escape closes it, and focus returns to the selected artwork. Background scrolling is paused while the viewer is open.
- Browser checks covered direct product anchors on desktop and 390px mobile, Contact navigation, viewer keyboard controls and focus restoration. Build and TypeScript checks passed.
