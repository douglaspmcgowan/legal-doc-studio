# Work log

## 2026-09-27 — App Repair stage 2, second pass: app.js under strict types

The first pass left `app.js` out of the type-checked set with 90 strict errors
and named it as remaining work. This pass closed it, and closed a defect the
first pass did not notice in its own test harness.

### `app.js` is type-checked, and the change is comment-only by construction

`app.js` is loaded by `<script src>` in an app with no bundler, so renaming it to
`.ts` would mean adding a compiler, which the `BASELINE` verdict forbids. The
floor-level equivalent is `checkJs` coverage in place, so `app.js` joined
`tsconfig.json`'s `include` and the 90 errors were closed with JSDoc.

`npx tsc --noEmit` exits 0 with `app.js` in the checked set.

Six executable deltas exist and they are the whole list; every other change is a
comment. Each is semantically identical to what it replaced:

| Change                                             | Why it is a no-op                                                      |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `isNaN(dt)` to `isNaN(dt.getTime())`               | `isNaN` coerces a `Date` through `valueOf`, which is `getTime`          |
| `(a - bDate)` to `(a.getTime() - bDate.getTime())` | the same coercion, written out                                         |
| `f.options` to `(f.options \|\| [])`               | only reached when `f.type === "select"`, where `options` is always set  |
| `const t = e.target` at three handlers             | binds a value the next line already read                               |
| `esc` and `escAttr` entity maps reformatted        | same keys, same values, Prettier's line breaks                         |
| `let m` gains a type annotation                    | annotation only                                                        |

`window.__recital`, the test hook, is now declared on `Window` in
`types/studio.d.ts` rather than asserted at the assignment.

**Proof that it changed no pixel.** The computed style of all 383 elements over
49 properties was captured with the new `app.js`, with the committed `app.js`
restored, and with the new one again. All three dumps are **byte-identical**, so
the measured noise floor is 0 and the delta is 0. Zero console errors on load in
every capture; 30 sections, 20 fields and 28 citation chips render in each.

### The test suite was green only on an idle machine

Re-running the first pass's suite produced three, four, five and six failures on
successive runs, all `waitForSelector` timeouts, while the app itself rendered
perfectly under a hand-driven browser check. The cause was `fullyParallel` with
the default worker count: six Chromium workers, each loading axe, against
python's `http.server`, on a machine running other repair lanes. The same nine
tests passed in 41s at `--workers=1`.

`playwright.config.ts` is now `fullyParallel: false`, `workers: 1`,
`timeout: 60_000`. Three consecutive runs: 9 passed, 9 passed, 9 passed. Nine
tests do not need parallelism, and a suite that only goes green on an idle box is
not a gate. `waitUntil: "load"` was tried as `"domcontentloaded"` first, made no
difference, and was reverted rather than left as noise in the diff.

### Floor row, this pass

| Column                             | Before this pass | After    |
| ---------------------------------- | ---------------- | -------- |
| Files in the type-checked set      | 5                | 6        |
| `app.js` strict errors             | 90               | 0        |
| Test suite result, three runs      | 6/9, 5/9, 4/9    | 9/9 x3   |
| Computed-style deltas vs committed | n/a              | 0 of 383 |
| Slop-detector findings             | 0                | 0        |
| Console errors on load             | 0                | 0        |

Unchanged and re-verified: `node build-refs.ts` exit 0 with `refs-data.js`
unchanged, the slop detector returns `[]`, `git diff --check` clean, `gitleaks
dir .` and `gitleaks detect` over 19 commits report no leaks.

Nothing visual was touched. The recommendations recorded in the first pass below
still stand and are still Douglas's call.

## 2026-09-27 — App Repair stage 2: the non-visual floor

Verdict `BASELINE`: the framework does not move. The floor was applied in place.

### Floor row, before and after

Measured on the same machine, the same 1440x900 emulated viewport, the same
static server. `styles.css` statics are counted outside every `:root` block.

| Column                                      | Before (`ef59891`) | After |
| ------------------------------------------- | ------------------ | ----- |
| Custom properties declared (`:root`)        | 33                 | 82    |
| `var()` references                          | 160                | 273   |
| Dark-scheme token overrides                 | 0                  | 42    |
| Unique hex literals outside `:root`         | 35                 | 0     |
| `rgb()` / `rgba()` literals outside `:root` | 16                 | 0     |
| Unique `font-size` literals outside `:root` | 18                 | 0     |
| `border-radius` literals outside `:root`    | 9                  | 0     |
| `!important` — real debt                    | 2                  | 0     |
| `!important` — reduced-motion + print       | 8                  | 8     |
| `:focus-visible` selectors                  | 2                  | 24    |
| `prefers-color-scheme` blocks               | 0                  | 1     |
| Transitions on a layout property            | 1                  | 0     |
| Slop-detector findings                      | 2                  | 0     |
| axe serious/critical on the primary surface | 1 rule / 4 nodes   | 0     |
| Automated tests                             | 0                  | 9     |
| Runtime pins                                | 0                  | 2     |
| Console errors on load                      | 0                  | 0     |
| DOM elements on the primary surface         | 383                | 383   |

### Proving the token extraction changed no pixel

The full computed style of all 383 elements over 49 properties was captured
before and after, under Playwright, and diffed element by element. The capture
is byte-reproducible: two independent loads of the unchanged app produced
identical 622,547-byte dumps and pixel-identical screenshots.

**371 of 383 elements are byte-identical.** Every one of the 12 deltas traces to
a named floor fix, and none to the token extraction:

- `.progress__fill` — `width: 16.3125px -> 96px` and
  `transform: none -> scaleX(0.17)`. `96 * 0.17 = 16.32px`, so the meter paints
  where it painted. The change exists because the universal rules allow
  animating only `transform` and `opacity`.
- Eleven `.fgroup__h` / `.count` nodes — `rgb(124,136,144) -> rgb(104,113,118)`.
  `--muted-2` was `#7c8890`, 3.63:1 on `--paper`, which axe reported as a
  serious `color-contrast` violation. `#687176` is 4.99:1 on `--paper` and
  4.63:1 on `--cream`: the smallest change that clears WCAG AA on both.

Screenshot diff: 4,989 of 1,296,000 pixels (0.385%), against a measured noise
floor of exactly 0. Attributed by `elementFromPoint`: 1,348 pixels to the group
labels, 3,616 to `input::placeholder` (the same `--muted-2` fix, reached through
a pseudo-element), 28 to the sub-pixel right cap of the meter. Nothing else.

### Executed

1. **Runtime declared** — `.nvmrc` (24), `.python-version` (3.13), and
   `engines.node` in a new `package.json`. Nothing pinned either before.
2. **Dependencies pinned exactly** — the app still has zero runtime
   dependencies. The four devDependencies carry exact versions, no range
   specifier.
3. **Token layer extracted** — 49 more properties named at their shipped values,
   covering `styles.css` and the inline `fill` and `style=` attributes in
   `index.html`. Six dead tokens removed (`--mint`, `--r-panel`, `--sh-2`,
   `--todo-ink`, `--hl`, `--danger`), all unreferenced.
4. **TypeScript** — `build-refs.mjs` is now `build-refs.ts`, run directly by
   Node with no compile step. `types/studio.d.ts` declares the document model
   that `data.js` publishes on `window`, so `data.js` type-checks against a real
   shape. The test suite is TypeScript. `npx tsc --noEmit` exits 0 under
   `strict`. `app.js` is out of the checked set on purpose — 875 lines of
   hand-rolled DOM reporting 90 strict errors, almost all implicit-`any`
   parameters, which is a change to working demo logic rather than a floor fix.
   The ambient model is in place so that pass starts from types.
5. **`:focus-visible` everywhere** — a blanket rule so a control added later
   cannot ship without one, plus per-control refinements. Before this, the two
   form controls were the only things on the page with a focus indicator.
6. **Keyboard operability** — mappable paragraphs are focus stops with an
   Enter/Space contract; "Read full document" became a real `<button>`, which
   was the only keyboard route to a research memo from the Sources tab. The
   authority card stays a mouse convenience because it already contains a real
   `<button>` doing the same thing; making the card a button too is a
   `nested-interactive` violation, which is how the first attempt failed.
7. **ARIA** — the completion meter is a `progressbar` with a live
   `aria-valuenow`; the context tabs point at a `tabpanel` that tracks the
   selected tab.
8. **`prefers-color-scheme: dark`** — 42 token overrides, no per-component
   rules. Every text and background pair was checked: the lowest is 5.71:1.
9. **`!important` removed** — the two real ones. `.s--active` lost to
   `.s--mappable:hover` on specificity, so it is `.s--mappable.s--active` now.
   The remaining eight sit inside `prefers-reduced-motion` and `@media print`,
   where overriding author styles is the correct construct. The stage-1 note
   that the specification's "10 `!important`" overstates the debt fivefold
   holds: the honest number was 2, and it is now 0.
10. **axe wired in** — `@axe-core/playwright` over the primary surface and both
    context tabs, asserting zero serious or critical. It found and now guards
    the contrast defect above.
11. **Design floor guarded by test** — the literal ban, the `!important` ban,
    the layout-property-transition ban, the coloured `border-left` ban and the
    dark-block requirement are assertions, not conventions.
12. **Universal-rule violations fixed** — the `border-left: 3px solid` on
    `.md blockquote` (the detector's most-reported tell), `transition: width`,
    the contrast failure, and the missing focus indicators. The slop detector
    reports zero findings, down from two.
13. **`DESIGN.md` filled in** — typefaces, token groups and the four live design
    decisions. Its Goals, Constraints and Decisions sections were empty
    headings.

### Recommended, not executed — these change what the app looks like

- **Elevation is declared twice.** `.paper` carries a 1px border *and* a
  three-layer shadow; `.auth` and `.src` carry a border and gain a shadow on
  hover. The universal rules call this the ghost card and ask for one or the
  other. Dropping the border from `.paper` and keeping the shadow would read as
  a sheet of paper rather than a bordered box, but it moves pixels.
- **The app has no narrow-width story.** Below 1080px the fill form and citation
  map disappear entirely. A stacked single-column layout with the form behind a
  sheet would make it usable on a tablet; `body.show-rail-mobile` already exists
  in the CSS with nothing driving it.
- **`Inter Tight` is loaded from Google Fonts and not vendored.** Vendoring the
  woff2 subset would make the app render its intended typography offline and
  remove a third-party request. It is non-visual in intent but changes what
  loads, so it is named here rather than done unannounced.
- **The type scale has 18 steps.** They are all named now, which is the
  non-visual half. Collapsing them to a ratio-based scale of six or seven would
  tighten the rhythm, and that is the visual half.
- **The three-pane workbench has no loading, empty, or error state.** The
  document is embedded, so there is nothing to wait for today; the moment a
  document is fetched, there is.
- **The 3px accent bar beside a selected paragraph** is the one remaining
  side-accent on the page. It is an absolutely positioned `::before` rather than
  a `border-left`, and it is the only indicator of which paragraph the Context
  panel is describing, so removing it removes the affordance. Replacing it with
  a different selected-paragraph treatment is a design decision.

### Not repaired, with the reason

- **`app.js` strict type coverage** — 90 errors, see item 4.
- **`git status` reports `M refs-data.js` with an empty `git diff`.** That is a
  working-copy line-ending marker under this repository's `* text=auto`, on
  every Windows checkout. It is not a content change, and committing the file
  does not fix it.

### Proof

- `node build-refs.ts` -> exit 0; `git diff refs-data.js` shows only the
  generator name in the header comment.
- `npx tsc --noEmit` -> exit 0.
- `npx playwright test` -> 9 passed.
- `node ~/.agents/skills/impeccable/scripts/detect.mjs --json index.html styles.css`
  -> `[]`.
- `gitleaks detect` over 18 commits and `gitleaks dir .` -> no leaks found.
- `git diff --check` -> clean.

## 2026-09-27 — App Repair stage 1

Made the refs build reproducible on a CRLF checkout (`ef59891`): the generator
embedded whatever line endings `reference/*.md` was checked out with, so a
Windows checkout produced carriage returns inside the generated string literals
and left the tree dirty after a no-op build.
