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

Static single-page app — no build step. Plain HTML, CSS, and JavaScript.

| File             | Purpose                                                             |
| ---------------- | ------------------------------------------------------------------- |
| `index.html`     | App shell                                                           |
| `styles.css`     | Design system (Sellit Cobalt brand, product register)               |
| `app.js`         | Render engine, field propagation, citation map, reference reader    |
| `data.js`        | The document (sections + field/citation markers), fields, citations |
| `refs-data.js`   | The four research memos, embedded (generated)                       |
| `reference/*.md` | Source for the research memos                                       |
| `build-refs.mjs` | Regenerates `refs-data.js` from `reference/*.md`                    |

To edit a research memo, change the file in `reference/` and run
`node build-refs.mjs`.

## Run locally

```bash
python -m http.server 8911
# open http://localhost:8911
```

## Note

This is a drafting aid grounded in current Pennsylvania and Third Circuit law,
not legal advice. A licensed attorney should review and sign any filing.
