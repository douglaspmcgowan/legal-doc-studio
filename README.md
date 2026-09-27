# Recital — Legal Document Studio

An interactive viewer, editor, and citation map for a legal document. The demo
document is a **Motion to Dismiss** (U.S. District Court, E.D. Pa.) on
statute-of-limitations grounds under Federal Rule of Civil Procedure 12(b)(6),
applying Pennsylvania substantive law.

Built as a demonstration for the legal-solutions practice at
[amaxeliteseals.org](https://www.amaxeliteseals.org).

## What it does

- **Fill-in form.** Every blank in the document is a field. Type a value once —
  party names, dates, the case number, counsel details — and it propagates to
  every place it appears. Highlighted (amber) tokens are still blank; the form
  shows live completion progress.
- **Smart dates.** The limitations deadline and the number of days the complaint
  was filed late are computed from the incident and filing dates and update live.
- **Type-or-pick fields.** The district field is a combobox — type it or choose
  from the list.
- **Citation map.** Click any paragraph to see the authorities behind it, the
  research memos it draws on, and a note on how it was derived. Click any
  citation to highlight every place it appears. The **Authorities** tab is the
  full table of cases, statutes, and rules, each with its weight (binding /
  controlling / persuasive), holding, and a link to the full text.
- **Source memos.** Four research documents underpin the motion; read them
  in-app and see which sections each one supports.
- **Edit mode.** Revise the prose directly; the linked blanks stay live.
- **Print / PDF.** Court-clean output (blanks become signature lines, citation
  chips become plain text) via the browser print dialog.

Work is saved to the browser automatically.

## Stack

Static single-page app. The browser loads plain HTML, CSS, and JavaScript
directly — there is no bundler, compiler, or runtime dependency. Node and
TypeScript appear only in the build script, the type checker, and the tests.

| File                | Purpose                                                             |
| ------------------- | ------------------------------------------------------------------- |
| `index.html`        | App shell                                                           |
| `styles.css`        | Design system (Sellit Cobalt brand, product register)               |
| `app.js`            | Render engine, field propagation, citation map, reference reader    |
| `data.js`           | The document (sections + field/citation markers), fields, citations |
| `refs-data.js`      | The four research memos, embedded (generated)                       |
| `reference/*.md`    | Source for the research memos                                       |
| `build-refs.ts`     | Regenerates `refs-data.js` from `reference/*.md`                    |
| `types/studio.d.ts` | The document model that `data.js` publishes on `window`             |
| `tests/`            | Playwright smoke, floor, and `@axe-core` accessibility tests        |

To edit a research memo, change the file in `reference/` and run
`npm run build` (`node build-refs.ts`). Node runs TypeScript directly, so the
build script still needs no compile step.

## Runtime

Pinned, not assumed:

| Runtime | Version  | Pinned in                   |
| ------- | -------- | --------------------------- |
| Node    | 24.x     | `.nvmrc`, `package.json`    |
| Python  | 3.13     | `.python-version`           |

Node is needed only for the build script, the type checker, and the tests.
Python is only the static dev server; any static host serves the app.

## Run locally

```bash
python -m http.server 8911
# open http://localhost:8911
```

## Develop

```bash
npm install          # devDependencies only; the app itself has none
npm run build        # regenerate refs-data.js from reference/*.md
npm run typecheck    # tsc --noEmit, strict
npm test             # Playwright: smoke, design floor, axe accessibility
```

`npm test` starts its own static server on port 8912 and asserts, among other
things, that the primary surface has no serious or critical axe violations,
that every interactive element has a visible keyboard focus indicator, that no
colour, font-size or radius literal has escaped the `:root` token layer, and
that the dark-scheme block repaints the surface without touching the print
tokens.

`app.js` is deliberately outside the `checkJs` set in `tsconfig.json`: it is
875 lines of hand-rolled DOM code and, measured 2026-09-27, reports 90 strict
errors — almost all implicit-`any` callback parameters. `types/studio.d.ts`
already types the data model it reads, so that is the starting point for the
pass that closes them.

## Accessibility and appearance

- Every interactive control has a visible `:focus-visible` indicator, and the
  document's field tokens, citation chips, paragraphs, and card actions are all
  operable from the keyboard.
- Colour is expressed entirely through custom properties in a single `:root`
  block, with a `prefers-color-scheme: dark` block that redefines the same
  tokens. The print tokens are deliberately outside that override: paper is
  paper.
- `prefers-reduced-motion: reduce` collapses every transition and animation.

## Note

This is a drafting aid grounded in current Pennsylvania and Third Circuit law,
not legal advice. A licensed attorney should review and sign any filing.
