<!-- agent-harness:universal-design:v1:start -->
## Universal interface rules

The authority is `~/.agents/DESIGN.md`, and it is fuller than this. What follows is
carried here rather than only linked because a cloud or container session has no
`~/.agents` to reach — so the rules that actually change what gets built have to survive
in the repository itself.

### Anti-default discipline

Quoted verbatim from the authority rather than paraphrased, because this is the section an
agent most needs and a paraphrase is a second copy that drifts.

The model's house style is recognizable, and reaching for it reads as machine-made. Never
default to: purple-blue gradients, a centered hero over a dark mesh background, three equal
feature cards, ubiquitous glassmorphism, or Inter with slate everywhere. The
beige-brass-espresso "premium consumer" palette is the same tell; rotate off it.

- Lock one accent color page-wide, and one gray family per project.
- Lock one corner-radius system per page. Mix radii only under a rule you can state.
- Keep one theme per page. Sections do not invert light and dark mid-scroll except as a single deliberate composition device.
- A section layout family appears at most once per page. At most two consecutive image-text zigzag splits.
- **No eyebrow labels and no kicker titles on any page, deck, or artifact.** An eyebrow or kicker is the small uppercase or letter-spaced label above a heading; the heading carries its own weight, so delete the label. Ruled 2026-09-30.
- **Never use the middle dot `·` (U+00B7, `&middot;`) or the bullet `•` as an inline divider.** Separate inline items with a semicolon, `|`, a comma, or a line break. The em-dash stays banned as a divider. Ruled 2026-09-30.
- Where a brief reads as an established design system, use that system's official package rather than approximating it. One system per project.
- The brief wins. Honor a pinned aesthetic even when it is not the choice you would make; redirecting a clear brief toward your own taste is failure, not judgment.

### Names that appear here only to be forbidden

The rules above and below name specific typefaces in order to ban them. A project that
scans its own source for banned font names will find those names *here* and report this
file as the violation — measured on `base-flight-finder`, 2026-08-07, whose typography
policy test failed against text whose whole purpose is to forbid the thing it names.

**If you write such a scan, exclude the region between the two `agent-harness:universal-design`
marker comments.** That region is generated and is replaced wholesale on every sync, so
nothing a project owns ever lives inside it. The names are also declared machine-readably
on the next line, so a scanner can subtract them without parsing prose. `Test-DesignBlockScanSafety.ps1`
fails the build if any of them appears outside the markers, which is what makes the
exclusion sufficient rather than merely conventional.

**Match on word boundaries, not substrings.** `Inter` is a prefix of interaction,
interface, internal and interval, so a bare substring scan reports a violation on ordinary
English. That is a second, independent cause of the same false positive, and it lives on
your side of the line rather than in this block — the check above hit it on its own first
run, against the heading "Interaction and accessibility" a few sections down.

<!-- agent-harness:design-prohibited-names: IBM Plex Mono, Inter, Fraunces, Instrument Serif -->

### Everything else

- Never use IBM Plex Mono.
- **Never set anything in a monospace typeface unless it is code.** Not numbers, not labels, not reference tags, not captions, not credits, not timestamps. Monospace outside a code block is a costume that says "technical" and reads as machine output. Numerals that need to line up get `font-variant-numeric: tabular-nums` on the normal face instead.
- **Never use the middle dot as a separator.** No `·`, and no bullet character standing in for it. Separate with an en dash, a slash, a comma, or plain whitespace with a rule. The middle dot reads as machine-assembled metadata everywhere it appears, which is why it is out on every surface, not just decks.
- **Never write a line that is only "The" plus a noun.** "The transfer function", "The result", "The problem" — a bare definite noun phrase standing alone is the most common shape in machine-written copy and carries no more information than the noun alone. A title may open with "The"; a label, a bullet or a caption may not be one.
- **Never title anything as a noun followed by a rhythmic tag.** "The argument, rung by rung", "The story, piece by piece", "Design, from the ground up". The tag adds cadence, not meaning, and it is the tell that a title was composed rather than named. Title the thing by what it is.
- **A reference shown to a reader must be identifiable without the source document.** A bare bracket number or a bare superscript means nothing to someone who does not have the bibliography open, which on a slide or a poster is everyone. Name the author and year, and put the numbering in a source line if the numbering itself matters.
- Default to a sans display face. Use serif only with an articulated reason; `Fraunces` and `Instrument Serif` are banned as defaults specifically because they are the common machine-made choice.
- Hero discipline: the hero fits the first viewport, the headline runs at most two lines, subtext stays under roughly twenty words, and no more than four text elements sit inside it. Trust marks and logo walls go below the hero, never in it.
- A grid has exactly as many cells as there is content for. Reshape the grid rather than pasting in a blank tile.
- Every animation names what it communicates — hierarchy, sequence, feedback, or state change. An animation that names nothing gets cut.
- Reread every visible string before shipping. Never invent a precise-sounding number.
- Use a proportional body face for prose, navigation, labels, dates, names, and human-readable metadata.
- Reserve monospace for code and commands only, and set it in a code block. Identifiers, timestamps and numeric columns take the proportional face.
- Define explicit body and display roles, and a monospace role only where the surface actually renders code. Use tabular numerals on the proportional face for aligned quantities.
- Establish hierarchy through size, weight, spacing, and placement before decoration.
- **Use all-caps titles, labels, and headings very, very sparingly, only when absolutely necessary.** Uppercase letters and `text-transform: uppercase` both count; the default is sentence case. Ruled 2026-09-30.
- Give each screen a clear primary action or reading path. Use spacing and alignment to show relationships.
- Reuse existing tokens and components before adding variants.
- Cover relevant default, hover, focus, active, disabled, loading, empty, error, and success states.
- Use semantic structure and native controls, visible keyboard focus, logical tab order, accessible names, sufficient contrast, and non-color state cues.
- Support narrow, medium, and wide layouts, zoom, text resizing, touch targets, and reduced motion.
- A design skill's silence on accessibility is not an exemption. Seven of the sixteen design-adjacent skill packages carry no accessibility content at all, so the two bullets above are the floor whichever skill is driving.
- A visual world is chosen, not accumulated. Template packs, style presets, and named aesthetics contradict each other by construction — `retro-windows` bans every rounded corner where `capsule` requires a 9999px radius. Commit to one, take its taste entire, and treat the others as unread. The rules here apply to all of them.
- Inspect the existing design system, screenshots, and implementation before proposing a new rule or component.
- Verify browser-visible work with browser or end-to-end tests across responsive, keyboard, loading, empty, and error behavior.

### Design libraries

Concrete things to reach for — animation packages and working skeletons, icon kits, typeface pools, design-system install commands and canonical documentation. Read the leaf you need; each one loads on its own.

- **Index** `~/.agents/design/LIBRARIES.md`
- **Precedence and routing** `~/.agents/design/precedence.md` — which source wins when the universal rules, `impeccable` and a pinned brief disagree, and whether this project's design detector hook is actually wired
- **Stack templates** `~/.agents/design/STACK-TEMPLATES.md` — seven app-kind templates naming an occupant for all 22 stack slots, and the per-slot deviation rules. The selection itself belongs to `~/.agents/skills/stack/SKILL.md`: six observable questions, the scaffold, and `architecture.md`'s import direction. Enter there before choosing a framework, styling method, primitive layer or component source, and read the result in this file's `## Stack selection`; `solo-review` stack mode measures a real repository against it
- **Motion** `~/.agents/design/animation/` — `libraries.md`, `sticky-stack.md`, `horizontal-pan.md`, `scroll-reveal.md`, `liquid-glass.md` (frosted glass), `forbidden.md`
- **Icons** `~/.agents/design/icons/libraries.md`
- **Type** `~/.agents/design/type/families.md`
- **Design systems** `~/.agents/design/systems/install.md` and `sources.md`
- **Design languages** `~/.agents/design/languages/registry.md` — read it before committing a visual world or generating a new design language, and register the world committed for this project there in the same work unit
- **Surface craft** `~/.agents/design/craft/` — `high-end.md` (surface construction), `from-reference.md` (building faithfully from a reference image), `from-code.md` (reading a design system out of a live product's own CSS), `device-mockups.md`
- **Fundamentals** `~/.agents/design/fundamentals.md` — the arithmetic under a decision: palette construction (60-30-10, one accent, warm neutrals, the colourblind-safe sets and the grayscale test), type-scale ratios with a worked scale and measure, and grid selection. Read it when the palette or scale is not already decided
- **Slides and posters** `~/.agents/design/slides-and-posters.md` — the only leaf addressing a non-web medium: deck frameworks, PowerPoint craft, HTML deck frameworks, and the academic poster including A0 sizing and the ≥24pt body floor
- **Pre-ship matrix** `~/.agents/design/preflight.md` — the mechanical finish check for landing, marketing and portfolio surfaces; not dashboards, not product UI
- **Dashboards and data-dense product UI** `~/.agents/design/dashboards.md` — the full system for the surface this tree used to leave uncovered: the three dashboard kinds and why building one while thinking of another causes most of the mistakes, information architecture and the three reading distances, density targets set against marketing spacing, typography and colour for data (sequential, diverging, categorical and semantic scales), chart selection ordered by the Cleveland-McGill perceptual ranking, chart and table craft, the six states every data region has, filters and URL state, interaction, real-time cadence, renderer choice by point count, the charting-library table, the anti-patterns, and a §18 pre-ship matrix that is the entry above's equivalent for this medium. This line used to say the tree did not own dashboards and pointed at the `/design-review` rubric, which critiques a running app rather than generating one; that gap closed on 2026-08-09
- **Mobile, touch and responsive** `~/.agents/design/mobile.md` — the medium, not a surface type: the three kinds of mobile thing and why a responsive site should not get a bottom tab bar, the viewport and its moving parts (`svh`/`lvh`/`dvh`, `viewport-fit=cover`, `env(safe-area-inset-*)` with the `max()` fallback that is the part people omit), the three touch-target floors — WCAG 2.2's 24px, Material's 48dp, Apple's 44pt — and which to design to, thumb reach and what it decides, mobile type including the 16px threshold below which iOS zooms a focused input, breakpoints and container queries, navigation patterns, forms with `inputmode`/`autocomplete`/`enterkeyhint` and the keyboard that covers your action bar, the gestures the OS has already reserved, the states that do not exist without a pointer, scrolling, the motion budget on a mid-tier device, images, offline, touch accessibility, the anti-patterns, a §18 pre-ship matrix, and §19 on the four checks emulation cannot answer. It does not restate `impeccable`'s `reference/adapt.md`, which owns converting an existing surface between contexts
- **Production readiness** `~/.agents/design/ADVISOR-PRODUCTION-READY.md` — what still stands between the design-space explorer and the Work Scope graph and real use
- **Design-space explorer** `~/.agents/design/design-space-explorer/README.md` — the reusable two-axis combination explorer, its intent, specification, design rules, and inspection record
- **Design-space manifests** `~/.agents/design/design-spaces/README.md` — the reusable schema for design-space axes, entries, palettes, templates, and generated-axis sources
- **Mission-control design studies** `~/.agents/design/mission-control/AESTHETIC-OPTIONS.md` and `REPRESENTATIONS.md` — visual-world and information-representation options for that surface

The full universal rules are `~/.agents/DESIGN.md`. Where a library entry and a rule disagree, the rule wins.

**This list is enumerated because it has to be.** A cloud or container session has no `~/.agents` to walk, so this block is the only routing it gets — which also means a leaf missing here is a leaf that session cannot reach at all. `craft/` and `preflight.md` were absent until 2026-08-07 and every project copy inherited the gap. `Test-DesignLibraryIndex.ps1` now fails the build when this list falls behind the tree.
<!-- agent-harness:universal-design:v1:end -->

# Design record

## Goals

Recital has to read as a real filing while behaving as a product. The document
surface is a facsimile of an E.D. Pa. motion — serif, justified, court caption,
signature block — and the chrome around it is product UI. Nothing in the
document may look like a web page, and nothing in the chrome may look like a
court form.

## Constraints

- One accent hue page-wide: Sellit Cobalt, cohesive with amaxeliteseals.org.
- One warm gray family, tuned to the cream canvas rather than to white.
- Desktop-first. Below 1080px the rails are hidden and the document is shown
  read-only with a notice; that is the app's whole responsive story and it is a
  deliberate limit, not an omission.
- No build step for the app itself. Anything that needs compiling cannot ship.

## Typefaces

| Role      | Family                                                                    |
| --------- | ------------------------------------------------------------------------- |
| Chrome    | `Inter Tight`, then `system-ui` / `-apple-system` / Segoe UI / Roboto      |
| Document  | `Iowan Old Style`, then Palatino Linotype / Book Antiqua / Georgia / Times |
| Monospace | `ui-monospace`, then SF Mono / Menlo / Consolas                           |

The chrome face is loaded from Google Fonts and is **not vendored**, so offline
the app falls back to `system-ui`. That is a known gap, recorded here rather
than silently accepted.

## Tokens

`styles.css` opens with one `:root` block holding every colour, type size,
space, radius, elevation, duration and z-layer the product uses. No hex,
`rgb()`, `font-size`, `border-radius` or spacing literal exists outside it;
`tests/smoke.spec.ts` and `tests/design-floor.spec.ts` fail the build if one
appears.

- **Colour:** nine base literals in light mode (`--cobalt`, `--cobalt-deep`,
  `--ink`, `--cream`, `--paper`, `--line`, `--muted`, `--amber`, `--statute`).
  Every wash, tint, underline, ring, scrim and shadow is a `color-mix()` of
  those, so it has no literal of its own. Status (`--amber` for a blank field,
  `--statute` for a statute or rule citation) is kept apart from the accent.
- **Type:** five screen sizes on one ladder: 12, 14, 16, 20 and 24px
  (`--fs-sm` to `--fs-2xl`), plus `--fs-print` 12pt. The default screen
  renders 12, 14 and 16 only. Weights are 400, 600 and 700.
- **Space:** `--sp-1` to `--sp-8` = 4, 8, 12, 16, 24, 32, 48, 64. The paper and
  stage gutters use `clamp()` over that scale.
- **Radius:** `--r-sm` 4px (chips, tokens), `--r-md` 8px (controls, inputs),
  `--r-lg` 12px (paper, cards, drawer), `--r-pill` (meter, segmented track).
- **Elevation:** `--elev-1` resting control, `--elev-2` the sheet and cards,
  `--elev-3` overlays. Every surface declares one of them or a border, never both.
- **Motion:** `--dur-1` 150ms (hover, focus, press), `--dur-2` 300ms (drawer,
  flash, meter), on `--ease-out`. Under reduced motion both durations collapse.
- **Touch:** `--hit` 44px is the minimum for every button, input and tab.

A second `:root` inside `@media (prefers-color-scheme: dark)` redefines the
same nine names; derived tokens recompute. The print tokens (`--print-paper`,
`--print-ink`) are deliberately not among them: paper is paper.

## Formats

- Dates: long US legal form, `April 1, 2026`.
- Numbers: digits with comma thousands; counts read `3 / 18 fields`.
- Units: spelled out after the number, `75 days`; statutes take `§` with a
  non-breaking space, `42 Pa.C.S. § 5524`.
- Inline separators: comma, semicolon or a line break. Never a middle dot.

## Decisions

- **Elevation is declared once per surface** (2026-10-06). `.paper`, `.auth`
  and `.src` keep their soft shadow and lost their 1px border; hover and flash
  use a ring.
- **The 3px accent bar beside a selected paragraph stays.** It is an absolutely
  positioned `::before`, not a `border-left`, and it is the app's only indicator
  of which paragraph the Context panel is describing. Removing it would remove
  the affordance, not the decoration.
- **The party caption's 2px vertical rule stays.** It is a facsimile of a real
  court caption block. `tests/smoke.spec.ts` allows exactly that one rule and
  rejects every other coloured `border-left` of 2px or more. Below 600px the
  caption columns stack.
- **The completion meter scales on X rather than animating width**, because the
  universal rules permit animating only `transform` and `opacity`. The track
  clips to a pill, so the painted result is the same.
- **Court headings inside the document stay in capitals.** They are the text of
  the filing rather than interface labels; the all-caps rule governs chrome.

## Remaining exceptions

- **Inter Tight as the chrome face.** It sits next to the banned default, but it
  is the shipped identity, so this compliance pass keeps it. The design-system
  pull request replaces it.
- **No heading is twice the body size.** The workbench has no page heading
  (the filing's own hierarchy is set at body size, as a court requires). The
  design-system pull request adds a display-size document title.
