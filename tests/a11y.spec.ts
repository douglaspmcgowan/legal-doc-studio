import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

/** Wait for app.js to have rendered the document, form and context panel. */
async function ready(page: Page) {
  await page.goto("/index.html", { waitUntil: "load" });
  await page.waitForSelector("#paper .s", { state: "attached" });
  await page.waitForSelector(".field input");
  await expect(page.locator("#ctxBody")).not.toBeEmpty();
}

test("primary surface has no serious or critical axe violations", async ({
  page,
}) => {
  await ready(page);
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = violations.filter((v) =>
    ["serious", "critical"].includes(v.impact ?? ""),
  );
  expect(
    blocking.map((v) => `${v.impact} ${v.id}: ${v.nodes.length} node(s)`),
    JSON.stringify(
      blocking.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map((n) => n.target),
      })),
      null,
      2,
    ),
  ).toEqual([]);
});

test("authorities and sources tabs have no serious or critical axe violations", async ({
  page,
}) => {
  await ready(page);
  for (const tab of ["authorities", "sources"]) {
    await page.click(`.ctx__tab[data-tab="${tab}"]`);
    await expect(page.locator("#ctxBody")).not.toBeEmpty();
    const { violations } = await new AxeBuilder({ page })
      .include(".ctx")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blocking = violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(blocking.map((v) => `${tab}: ${v.impact} ${v.id}`)).toEqual([]);
  }
});

test("every interactive element shows a focus indicator when focused by keyboard", async ({
  page,
}) => {
  await ready(page);

  const selectors = [
    ".segmented button",
    "#btnPrint",
    "#btnSample",
    "#btnClear",
    ".ctx__tab",
    ".field input:not([readonly])",
    ".field input[list]",
    "#ctxBody",
    "#paper .tok",
    "#paper .cite",
    "#paper .s--mappable",
  ];

  const failures: string[] = [];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    await expect(el, `${sel} exists`).toHaveCount(1);
    const changed = await el.evaluate((node) => {
      const read = () => {
        const cs = getComputedStyle(node);
        return [
          cs.outlineStyle,
          cs.outlineWidth,
          cs.outlineColor,
          cs.boxShadow,
          cs.borderColor,
          cs.backgroundColor,
        ].join("|");
      };
      const before = read();
      // focusVisible is in the HTML spec but not yet in lib.dom FocusOptions.
      (node as HTMLElement).focus({ focusVisible: true } as FocusOptions);
      const after = read();
      const matches = node.matches(":focus-visible");
      node.blur();
      return { before, after, matches };
    });
    // The indicator must exist; whether this Chromium build honours
    // focusVisible on a programmatic focus is reported but not asserted, since
    // the style delta is the thing a keyboard user actually sees.
    if (changed.before === changed.after) {
      failures.push(
        `${sel} -> focusVisible=${changed.matches} styleChanged=${changed.before !== changed.after}`,
      );
    }
  }
  expect(failures).toEqual([]);
});
