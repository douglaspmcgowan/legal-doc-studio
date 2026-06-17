# Recital — Design Review

_June 16, 2026 · post-simplicity pass_

## What I researched

I pulled the UI-simplicity principles already in memory (the AI-isms list, the
motion/interaction defaults, the design-tooling shortlist — Refactoring UI,
Anthony Hobday's visual rules, Josh Comeau) and cross-checked them against
current practitioner writing on cognitive load. Four principles drove this pass:

1. **Hierarchy through size, weight, and space — color last.** Not everything
   can be important; when every element competes, nothing wins. De-emphasizing
   secondary content is what makes primary content read clearly. _(Refactoring UI)_
2. **Design in grayscale first; add color only where it carries information.**
   Color used decoratively is the fastest way to make an interface look busy
   and "generated."
3. **Progressive disclosure.** Keep the resting surface calm; reveal complexity
   on engagement (hover, selection) rather than showing it all at once.
4. **Generous whitespace on a constrained scale.** More breathing room than
   feels necessary; group with space, not boxes.

## The audit — what was working against "clean and professional"

The structure, typography split (serif document inside a sans tool), brand
palette, full interaction states, and accessibility were already solid. The
problem was the **document surface itself**:

- **38 amber highlight blocks** for empty fields read like a highlighter was
  taken to the page — useful for "what do I fill in," but loud.
- **28 saturated citation chips** (filled cobalt and green backgrounds) made the
  body look decorated. A real brief doesn't have colored boxes mid-sentence; the
  color was competing with the text instead of serving it.

Together these violated principles 1–3: the document never got to look like a
calm, professional document, because two interaction features were always
shouting at full volume.

## What changed

| Element                 | Before                    | After                                                                                                                                                           |
| ----------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Citations (at rest)** | Filled cobalt/green chips | Quiet slate footnote-style references with a hairline underline. Color coding (cobalt = case, green = statute) reveals on hover and when you locate a citation. |
| **Empty fields**        | Solid amber block, bold   | Light amber tint + dashed underline, regular weight — clearly "still blank," no longer a highlighter                                                            |
| **Filled fields**       | Underlined token          | Seamless — the value becomes part of the prose, so a completed document reads like a real filing                                                                |
| **Selected paragraph**  | —                         | Its own citations quietly light up, reinforcing the section→authority link in place                                                                             |
| **Document shadow**     | Single flat shadow        | Three-layer soft shadow (tinted to the brand, not black) for a more premium paper feel                                                                          |
| **Form inputs**         | Hard bordered boxes       | Calm filled inputs; border strengthens on hover/focus                                                                                                           |
| **Right-panel cards**   | Tight                     | More internal padding and breathing room                                                                                                                        |

The throughline: **the document now reads quietly by default, and the
intelligence reveals itself as you engage.** Hover a citation and it turns
cobalt; click a paragraph and its authorities light up; the fill-in blanks are
findable without dominating the page. Same features, far less noise.

## Scorecard

| Dimension           | Assessment                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Visual hierarchy    | Document is now the clear focus; chrome recedes                                                                          |
| Color discipline    | Functional only — color = information (status, authority type, selection), never decoration                              |
| Cognitive load      | Resting surface is calm; complexity is revealed on demand                                                                |
| Whitespace / rhythm | Consistent scale; generous panel and card spacing                                                                        |
| Typography          | Serif document / sans tool contrast is deliberate and authentic; line length capped ~65ch                                |
| Accessibility       | Empty-field text 5.9:1 contrast (AA); `:focus-visible` rings; reduced-motion honored; full interaction states            |
| AI-isms             | None — no decorative gradients, no mono in chrome, no emoji icons, no colored-text-as-explanation, near-neutral surfaces |
| Motion              | Purposeful only — locate flashes, state transitions; nothing decorative; 80–300ms, ease-out                              |

## What I deliberately kept

- **The fill-in highlight stays a feature** — Doug asked for blanks to be obvious.
  It's now refined (amber underline, not a block), and the left rail's progress
  meter and field dots carry the "what's left" load, so findability didn't drop.
- **The serif document.** Court filings are serif; the contrast with the sans
  tool chrome is intentional, not an AI default-to-serif.
- **Two functional citation colors.** Cobalt vs. green encodes case law vs.
  statute — genuinely useful in legal work, and only shown on engagement.

## Verification

0 console errors; all 30 sections / 63 fields / 28 citations render; live
propagation, citation mapping, section→authority mapping, reference reader, and
all three modes confirmed working after the restyle. Deployed and live at
**https://legal-doc-studio.vercel.app**.

## Sources

- [Refactoring UI — key principles (summary)](https://www.sglavoie.com/posts/book-summary-refactoring-ui/)
- [Top 20 points from Refactoring UI](https://medium.com/design-bootcamp/top-20-key-points-from-refactoring-ui-by-adam-wathan-steve-schoger-d81042ac9802)
- [Cognitive Load UX 2025: Simpler Interfaces](https://redliodesigns.com/blog/cognitive-load-ux-2025-simpler-interfaces)
- [Why Clean Interface Design Enhances User Focus](https://acswebsitedesign.com/2025/11/04/why-clean-interface-design-enhances-user-focus/)
- Internal: AI-isms memory, motion/interaction defaults, design-tooling shortlist (Anthony Hobday's visual rules, Josh Comeau on shadows/color)
