# Status

## Working

- The tracked static single-page application renders an interactive legal-document viewer, fill-in editor, citation map, reference reader, and print-oriented output; repository evidence: `README.md` and `docs/archive/legacy/CURRENT-TASK-2026-07-30.md` at base `8a00cc9`.
- `reference/*.md` is the authored memo source and `node build-refs.mjs` regenerates the committed `refs-data.js` projection.
- The completed design-simplicity pass and its browser evidence are recorded in `DESIGN-REVIEW.md`.

## Known limits

- The product is a drafting aid and requires licensed-attorney review before any filing.
- The external repository-map update remains blocked until its current authority is confirmed.
- Domain attachment and additional demo documents remain optional, unapproved follow-ups.
- `build-refs.mjs` currently produces a line-ending-only `refs-data.js` rewrite in a clean Windows worktree; the generated file was restored and no application source change is included in onboarding.
