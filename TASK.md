# Task

## Goal

App Repair stage 2 — bring Recital to the universal design floor without
changing what it looks like. Verdict `BASELINE`: the framework does not move.

## Active

<!-- Move the item currently being worked here. -->

## Queue

- [ ] Close the 90 strict type errors in `app.js` and add it to the `checkJs`
      set in `tsconfig.json`. `types/studio.d.ts` already types the data model
      it reads; the remainder is mostly implicit-`any` callback parameters.

## Blocked

<!-- Record externally blocked work here. -->

## Needs decision

Each of these changes what the app looks like, so it is Douglas's call, not the
repair agent's. Full reasoning in `LOG.md`, 2026-09-27.

- [?] Declare elevation once per surface. `.paper`, `.auth` and `.src` each
      carry a border and a shadow, which the universal rules call the ghost
      card.
- [?] Give the app a narrow-width layout. Below 1080px the fill form and the
      citation map disappear entirely.
- [?] Vendor the `Inter Tight` woff2 subset so the app renders its intended
      typography offline and drops a third-party request.
- [?] Collapse the 18-step type scale to a ratio-based scale.
- [?] Replace or keep the 3px accent bar beside the selected paragraph, the one
      remaining side-accent on the page.

## Completed

- [x] Runtime declared: `.nvmrc` (24), `.python-version` (3.13),
      `engines.node`.
- [x] devDependencies pinned to exact versions; the app itself still has zero
      runtime dependencies.
- [x] Token layer extracted across `styles.css` and `index.html`. No hex,
      `rgb()`, `font-size` or `border-radius` literal survives outside `:root`.
- [x] `build-refs.mjs` -> `build-refs.ts`, run directly by Node.
      `types/studio.d.ts` types the document model. `npx tsc --noEmit` exits 0.
- [x] `:focus-visible` on every interactive element, with a blanket rule so a
      later control cannot ship without one.
- [x] Mappable paragraphs and the "Read full document" action are keyboard
      operable; the meter is a `progressbar`; the context tabs address a
      `tabpanel`.
- [x] `prefers-color-scheme: dark` expressed as 42 token overrides, lowest
      measured contrast 5.71:1.
- [x] Both real `!important` declarations removed; the eight that remain are
      inside `prefers-reduced-motion` and `@media print`.
- [x] `@axe-core/playwright` wired in: zero serious or critical on the primary
      surface and both context tabs.
- [x] Universal-rule violations fixed: the coloured `border-left` on
      `.md blockquote`, `transition: width`, the WCAG AA contrast failure on
      `--muted-2`, and the missing focus indicators.
- [x] `DESIGN.md` design record filled in; it was empty headings.
- [x] `verify` CI workflow added alongside `gitleaks`.

## Verification

- `npx tsc --noEmit` -> exit 0
- `npx playwright test` -> 9 passed
- `node build-refs.ts` -> exit 0, `git diff refs-data.js` clean apart from the
  generator name in the header comment
- `node ~/.agents/skills/impeccable/scripts/detect.mjs --json index.html styles.css`
  -> `[]`
- `gitleaks detect` and `gitleaks dir .` -> no leaks found
- `git diff --check` -> clean
- Computed-style diff over 383 elements: 371 byte-identical, 12 deltas each
  traced to a named floor fix. See `LOG.md`.
- Next: `npm run typecheck && npm test`

<!--
Markers use a space for queued work, a tilde for active work, x for complete,
an exclamation mark for blocked work, and a question mark for decisions.
Required delegated work may be nested under its parent with agent provenance.
Optional discoveries belong in BACKBURNER.md.
Parallel mode applies to three or more independent, file-disjoint items.
-->
