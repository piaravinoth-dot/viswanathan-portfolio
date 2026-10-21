# Mobile hiring journey and loading audit

The visitor journey is opening → selected projects → résumé → contact. The portfolio is static; contact prepares a mailto draft for the visitor to review and send. No backend mail delivery is claimed.

## Verified fixes
- Twelve original WebP/SVG files now ship on the portfolio origin with content-hashed filenames and one-year immutable caching. The eleven GitHub files matched repository originals byte for byte; the Behance manifesto file was copied unchanged from its existing URL. Artwork was not regenerated, resized or recompressed.
- Gallery images declare their natural dimensions and decode asynchronously while keeping existing crops and lazy loading.
- Mobile/tablet header links have at least 44 × 44 CSS-pixel targets. The header stays compact and full-width.
- Mobile image-viewer close/next/previous controls increased from 32 to 44 CSS pixels, with additional room around the image.

## Validation
- TypeScript, production build and complete SEO verification passed for all eleven public HTML pages.
- Eleven Chrome scenarios passed: homepage at 320, 375, 390, 430, 768, 844 landscape and 1440 pixels; AI Design Studio and Content Tracker at 375 and 1440 pixels. No horizontal overflow, broken loaded images or automated WCAG A/AA violations were found.
- All six carousel choices opened the corresponding case-study link. Gallery next/close controls worked at phone width. Capabilities remained closed by default. Whitespace-only contact names were rejected without opening an email draft. No site JavaScript errors observed.
- Production dependency audit returned zero known vulnerabilities.
- Initial readable server-rendered content and navigation remain independent of optional 3D loading. No new JavaScript dependency or startup gate was added.

## Limits
Google PageSpeed API returned HTTP 429 for both strategies, but its public interface completed a lab report: mobile performance 76, desktop 99, with accessibility, best practices and SEO all 100. Mobile FCP 2.8s, LCP 3.1s, TBT 0ms and CLS 0.222. Google identified About as the shifting element. Report: https://pagespeed.web.dev/analysis/https-viswanathan-portfolio-iota-vercel-app/60imecrqjf?form_factor=mobile. No real-user Core Web Vitals pass is claimed. Physical iPhone/Safari, hardware WebGL speed and end-to-end sending from a visitor’s mail application remain unverified. The existing optional 3D chunk warning remains.

## Layout stability follow-up
A mobile WebGL capability check now resolves before first paint. Unsupported/software-rendered devices hide the reserved character row before it can shift About. Supported devices reuse that result and retain automatic scene startup. Case-study routes skip the early probe. QA-only layout-shift observers are not included in production. The final Google rerun confirmed mobile 88 and desktop 99.

## Final production verification
Published frontend commit: eb641bcb9b6f5078db53f1d47df1985b348c3177. Vercel deployment dpl_66GZiWPXmcB3gnHUknaZCpZjjS7b is READY and serves the public alias.

Google report: https://pagespeed.web.dev/analysis/https-viswanathan-portfolio-iota-vercel-app/dulbv3txtg?form_factor=mobile

| Lab metric | Mobile | Desktop |
|---|---:|---:|
| Performance | 88 | 99 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| FCP | 2.7 s | 0.7 s |
| LCP | 3.2 s | 0.7 s |
| TBT | 0 ms | 0 ms |
| CLS | 0.025 | 0.001 |
| Speed Index | 3.1 s | 0.7 s |

The prior public-interface mobile run was 76 performance with CLS 0.222. Scores vary between runs. Google has no real-user dataset for this site, so these are lab results, not a field Core Web Vitals pass. Remaining optimization opportunities include render-blocking CSS and responsive image delivery; no claim is made that every performance opportunity is eliminated.

All 26 HTTP checks passed: eleven HTML pages and canonicals, twelve byte-identical media files and their one-year immutable caching, robots, sitemap and valid résumé PDF. Local startup regression scenarios passed again; observed CLS was zero on the tested 375–844px devices and 0.0024 at 320px. Mock capability tests passed for hardware/software/unavailable contexts, desktop skip, reduced motion and case-study skip. Physical iPhone/Safari, hardware 3D speed and final mail sending remain unverified.
