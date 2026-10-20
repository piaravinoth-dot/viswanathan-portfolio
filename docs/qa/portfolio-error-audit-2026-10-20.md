# Portfolio error audit — 20 October 2026

Base: ab7f56c3c2176285d7050bcb0fe6c6488399723d. Prepared for review; production deployment requires approval.

## Confirmed fixes
- Start the Three.js animation loop with requestAnimationFrame so the callback receives a valid timestamp. This resolves TS2554 and avoids the first undefined-timestamp draw.
- Add Vite client environment declarations. This resolves the ImportMeta.env TypeScript error.
- Normalise the home route to "/" and preserve its 3D-start condition. The homepage client metadata now uses website rather than article, with the correct root canonical URL.
- Add npm run typecheck and run it before every production build.
- Update Vite from 5.4.x to patched 6.4.4, compatible with the current React plugin. Add package-lock.json for reproducible installs.

## Verification
- Fresh npm ci succeeded.
- npm run build succeeded, including tsc --noEmit and SEO checks for 11 generated HTML routes.
- npm audit reports zero known vulnerabilities (previously one high and one moderate finding in development tooling).
- 89 static route, artwork, responsive-image and HTTP checks passed. All 11 public routes returned HTTP 200 with HTML metadata.
- Git blob hashes of the five changed code/dependency files match the tested runner files exactly.
- git diff --check passed.

The 89 checks include repeated references and do not imply 89 unique files or 89 browser interactions. Public HTTP checks ran against the currently deployed version; built-file checks ran against the fixed candidate.

## Remaining verification limits
Fresh interactive browser, physical-device, WebGL and Safari/Firefox testing was unavailable in this session. No claim that every possible UI bug is eliminated is made. Vite's existing warning about the large lazy-loaded 3D bundle remains a performance follow-up rather than a build error.

The temporary isolated runner was stopped after verification. No design or project content was changed.
