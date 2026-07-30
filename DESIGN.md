# Project design rules

<!-- agent-harness:universal-design:v1:start -->
## Universal interface rules

- Never use IBM Plex Mono.
- Use a proportional body face for prose, navigation, labels, dates, names, and human-readable metadata.
- Reserve monospace for code, commands, identifiers, timestamps, and genuinely tabular numeric data.
- Define explicit body, display, and monospace roles. Use tabular numerals on the proportional face for aligned quantities.
- Establish hierarchy through size, weight, spacing, and placement before decoration.
- Give each screen a clear primary action or reading path. Use spacing and alignment to show relationships.
- Reuse existing tokens and components before adding variants.
- Cover relevant default, hover, focus, active, disabled, loading, empty, error, and success states.
- Use semantic structure and native controls, visible keyboard focus, logical tab order, accessible names, sufficient contrast, and non-color state cues.
- Support narrow, medium, and wide layouts, zoom, text resizing, touch targets, and reduced motion.
- Inspect the existing design system, screenshots, and implementation before proposing a new rule or component.
- Verify browser-visible work with browser or end-to-end tests across responsive, keyboard, loading, empty, and error behavior.
<!-- agent-harness:universal-design:v1:end -->

## Product-specific typography

- Body: a readable serif face inside the legal document; proportional sans-serif UI text in the surrounding tool chrome.
- Display: the established Sellit Cobalt proportional display treatment from `styles.css`.
- Monospace: none in routine product chrome; reserve monospace only for actual code or identifiers.

## Tokens and components

- Preserve the quiet grayscale-first document surface, cobalt case-law state, green statute state, amber incomplete-field state, constrained document measure, and soft paper shadow.
- Reuse the existing three-pane layout, field controls, citation references, mode controls, reference cards, and print treatment before adding variants.

## Interaction and accessibility

- Preserve progressive disclosure, visible `:focus-visible` treatment, reduced-motion support, AA incomplete-field contrast, and functional color cues with non-color structure.
- Keep citation locate, paragraph selection, field propagation, reference reading, fill/read/edit modes, desktop panes, mobile collapse, and print behavior in browser verification for affected changes.

## Exceptions

- The legal document intentionally uses serif typography because court filings are document-centric; the surrounding product UI remains proportional sans-serif.
