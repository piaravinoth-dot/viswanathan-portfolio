# Portfolio coding-agent instructions

## UI and UX skill
For visual or interaction changes in this React/Vite portfolio, read and apply `.agents/skills/ui-ux-pro-max/SKILL.md` and consult its local references, data, and search tool as needed.

Maintain this portfolio's distinct art direction, typography, existing page structure, functional product navigation and six case studies; skill recommendations should guide decisions rather than trigger an unsolicited redesign. Prioritize responsive behavior, keyboard and touch accessibility, motion preferences, and real measured loading performance.

## Web interface quality reviews
For reviews of accessibility, responsive layout, interaction, motion or UI regressions, also read `.agents/skills/web-design-guidelines/SKILL.md`. Its Vercel guidance complements the existing UI/UX Pro Max skill; never apply generic design presets that overwrite the portfolio's specific visual identity.

React implementation/performance checks should use the existing Vercel React best-practices tooling when available. Keep GSAP optional and lazy-loaded and preserve mobile speed.

## Verification
After relevant changes run `npm run build` and the existing browser, Lighthouse, and accessibility QA workflows. Never claim a website change is published until the Vercel production deployment is verified.

The skill itself is source-vendored into `.agents/skills/ui-ux-pro-max`. It is not a runtime dependency and should not be bundled into the website.
