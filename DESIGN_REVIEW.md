# TeaMap design review — 2026-11-17

Scope: UI, accessibility and artwork only. Preserved the interrupted two-row sidebar header; no changes to map/data handlers, API, routing, favorites storage, or payment destinations. Compared navigation source with pre-redesign `62e3e4a` using `git show`; `d0de0fe` is the latest pre-today redesign commit. No resets or pushes.

Direction: botanical atlas, with the existing custom tea-ceremony SVG as the signature illustration. Retained semantic porcelain/forest/jade/amber tokens, Fraunces display and Inter body type; kept reading surfaces opaque above map tiles. Adapted company kit principles to this existing React/Vite application rather than importing Next.js components.

- Pass 1: inspected live 375px screenshot; fixed transparent sidebar/art surfaces, small touch targets, header truncation, unlabeled search, missing selected states, and cramped tea-card scrolling. Milestone: `377a3c1`.
- Pass 2: inspected 320px reference/tea views and desktop dark theme; fixed narrow footer wrapping, tiny category/body text, unsupported token opacity utilities, modal separation and tea-card focus restoration. Follow-up donation audit found horizontal overflow; fixed card minimum width and contact wrapping, then verified at 320/375/1280px.
- Playwright: no document/sidebar horizontal overflow at 320/375/768/1024/1280/1440px; sidebar buttons >=44px tall. Exercised EN/RU search, tea overview/history, empty favorites, donation open/Escape, tea dialog Shift+Tab containment, Escape and return focus. Reduced-motion emulation produced a 0.00001s body transition. Browser console: no errors during reviewed session.
- Measured dark token contrasts: text/surface 15.43:1, muted/surface 7.38:1, primary/surface 8.82:1, on-primary/primary 9.02:1. These sampled pairs are not a full contrast or WCAG audit.
- Checks: production build, oxlint and `git diff --check` pass. Vite retains a >500kB map chunk warning (214.19kB gzip); app chunk 77.91kB gzip. No dependencies added.

Limits: no Lighthouse/axe, screen-reader, real-device or user study performed; no performance score claimed. Existing external font/tile dependencies and map chunk remain. Untracked `.agents/`, `DESIGN_TASK.md`, `PROMPT.md` preserved outside commits. No blocking build or visual-review issue remains in the inspected states.
