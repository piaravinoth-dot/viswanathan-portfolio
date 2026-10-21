Case-study motion preview — 21 October 2026

Private review: https://portfolio-homepage-motion-review.vimad.chatgpt.site
Source candidate: d114176d825b4a5b8fe7926fb666b63b395c6215
Production remains 4917353a1049486bca19c82bbe32c31e992c04a3.

Added optional, lazy-loaded native animation entrances to five product pages and four communication projects. Preserved the existing AI Design Studio pilot and all artwork, content and layout. Individual translate preserves artwork rotations. Motion runs once, cancels on focus, tab hiding and reduced-motion changes, and cleans up on unmount. Phone travel is at most 8px over 380ms. Text opacity is never changed.

Validation: TypeScript, production build and complete SEO checks passed for 11 routes. Chrome tested nine updated routes at 375px and 1440px: 18 scenarios, no horizontal overflow, hidden text, broken loaded images or automated WCAG A/AA violations. Verified preview replay and on/off comparison, scrolling chapter entrances and Clip Studio aspect-ratio control. No site JavaScript errors observed. Mock lifecycle checks passed for one-time reveal, focus cancellation, reduced-motion skip/change, mobile limits and cleanup.

Limits: physical Safari/iPhone, hardware WebGL and a fresh Lighthouse/PageSpeed score were not verified. Existing optional 3D bundle warning remains.
