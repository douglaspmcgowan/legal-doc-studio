import { test, expect } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

test("app boots clean and renders the document, fields and citations", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/index.html", { waitUntil: "load" });
  await page.waitForSelector("#paper .s");

  await expect(page).toHaveTitle(/Recital/);
  await expect(page.locator(".field")).toHaveCount(20);
  await expect(page.locator("#paper .cite")).toHaveCount(28);
  expect(
    await page.evaluate(() => Object.keys(window.STUDIO_REFS).length),
  ).toBe(4);
  expect(errors).toEqual([]);
});

test("the completion meter reports its value and animates transform, not width", async ({
  page,
}) => {
  await page.goto("/index.html", { waitUntil: "load" });
  await page.waitForSelector("#paper .s");

  const meter = page.locator("#progress");
  await expect(meter).toHaveAttribute("role", "progressbar");
  const before = Number(await meter.getAttribute("aria-valuenow"));
  expect(Number.isInteger(before) && before >= 0 && before < 100).toBe(true);

  await page.click("#btnSample");
  await expect(meter).toHaveAttribute("aria-valuenow", "100");

  const fill = await page
    .locator("#progFill")
    .evaluate((n) => getComputedStyle(n).transitionProperty);
  expect(fill, "the meter must not animate a layout property").toBe("transform");
});

/** styles.css with every :root block and every comment removed. */
async function cssBody(request: APIRequestContext) {
  const css = await (await request.get("/styles.css")).text();
  return css
    .replace(/:root\s*\{[\s\S]*?\n\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

test("no !important appears anywhere in styles.css", async ({ request }) => {
  const css = await (await request.get("/styles.css")).text();
  expect(css.match(/!important/g) || []).toEqual([]);
});

test("no colour, font-size or radius literal survives outside :root", async ({
  request,
}) => {
  const body = await cssBody(request);
  const offenders: string[] = [];
  for (const [label, re] of [
    ["hex colour", /#[0-9a-fA-F]{3,8}\b/g],
    ["rgb/rgba literal", /\brgba?\(\s*[\d.]/g],
    ["font-size literal", /font-size:[^;]*?(?<!var\([^;]{0,40})\b\d[^;]*;/g],
    ["radius literal", /border-radius:\s*[^;]*\d[^;]*;/g],
  ]) {
    for (const m of body.match(re) || []) {
      if (/var\(/.test(m)) continue;
      offenders.push(`${label}: ${m.trim()}`);
    }
  }
  expect(offenders).toEqual([]);
});

test("a thick coloured border-left never lands on a card or callout", async ({
  request,
}) => {
  const body = await cssBody(request);
  const offenders = (body.match(/border-left:\s*[^;]+;/g) || []).filter((d) => {
    const px = Number((d.match(/(\d+(?:\.\d+)?)px/) || [0, 0])[1]);
    return px >= 2;
  });
  // The party caption's vertical rule is a facsimile of a real court caption
  // block, not a decorative accent, and it is the only one allowed.
  expect(offenders).toEqual(["border-left: 2px solid var(--ink);"]);
});

test("a dark-scheme token block repaints the surface without touching print", async ({
  browser,
  request,
}) => {
  const css = await (await request.get("/styles.css")).text();
  expect(css).toContain("@media (prefers-color-scheme: dark)");

  const backgrounds: Record<string, Record<string, string>> = {};
  for (const scheme of ["light", "dark"] as const) {
    const page = await browser.newPage({ colorScheme: scheme });
    await page.goto("/index.html", { waitUntil: "load" });
    await page.waitForSelector("#paper .s");
    backgrounds[scheme] = await page.evaluate(() => {
      const cs = getComputedStyle(document.body);
      const root = getComputedStyle(document.documentElement);
      return {
        body: cs.backgroundColor,
        ink: cs.color,
        printPaper: root.getPropertyValue("--print-paper").trim(),
        printInk: root.getPropertyValue("--print-ink").trim(),
      };
    });
    await page.close();
  }
  expect(backgrounds["light"]!["body"]).toBe("rgb(238, 240, 242)");
  expect(backgrounds["dark"]!["body"]).not.toBe(backgrounds["light"]!["body"]);
  expect(backgrounds["dark"]!["ink"]).not.toBe(backgrounds["light"]!["ink"]);
  // Paper is paper: the print tokens are not part of the scheme override.
  expect(backgrounds["dark"]!["printPaper"]).toBe(backgrounds["light"]!["printPaper"]);
  expect(backgrounds["dark"]!["printInk"]).toBe(backgrounds["light"]!["printInk"]);
});
