import { test, expect } from "@playwright/test";
import type { Page, APIRequestContext } from "@playwright/test";

async function ready(page: Page) {
  await page.goto("/index.html", { waitUntil: "load" });
  await page.waitForSelector("#paper .s", { state: "attached" });
  await page.waitForSelector(".field input", { state: "attached" });
  await expect(page.locator("#ctxBody")).not.toBeEmpty();
}

async function cssText(request: APIRequestContext) {
  const css = await (await request.get("/styles.css")).text();
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

const stripRoot = (css: string) =>
  css.replace(/:root\s*\{[\s\S]*?\n\s*\}/g, "");

test("no middle dot or bullet divider in rendered body text", async ({ page }) => {
  await ready(page);
  for (const tab of ["context", "authorities", "sources"]) {
    await page.click(`.ctx__tab[data-tab="${tab}"]`);
    const text = await page.evaluate(() => document.body.innerText);
    expect(text, `${tab} tab`).not.toMatch(/[·•]/);
  }
  await page.click("#btnSample");
  const text = await page.evaluate(() => document.body.innerText);
  expect(text).not.toMatch(/[·•]/);
});

test("no uppercase text transform in styles.css", async ({ request }) => {
  expect(await cssText(request)).not.toMatch(/text-transform:\s*uppercase/);
});

test("type scale: at most five --fs-* screen tokens and three weights", async ({ request }) => {
  const css = await cssText(request);
  const sizes = new Set(
    [...css.matchAll(/--fs-([a-z0-9]+):/g)]
      .map((m) => m[1])
      .filter((n) => n !== "print"),
  );
  expect([...sizes].length).toBeLessThanOrEqual(5);
  const weights = new Set(
    [...css.matchAll(/font-weight:\s*(\d+|normal|bold)/g)].map((m) => m[1]),
  );
  expect([...weights].sort()).toEqual(["400", "600", "700"]);
});

test("every margin, padding and gap comes from the --sp scale", async ({ request }) => {
  const body = stripRoot(await cssText(request));
  const offenders: string[] = [];
  for (const m of body.matchAll(
    /(?<![-\w])(margin|padding|gap|row-gap|column-gap)(-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?:\s*([^;]+);/g,
  )) {
    const left = m[3]!
      .replace(/var\(--sp-[a-z0-9-]+\)/g, "")
      .replace(/\b(auto|0|1px|2px)\b/g, "")
      .replace(/[\s,*()-]|calc|-/g, "");
    if (left) offenders.push(m[0].trim());
  }
  expect(offenders).toEqual([]);
});

test("styles.css contains zero !important", async ({ request }) => {
  expect(await cssText(request)).not.toContain("!important");
});

test("no transition or animation uses a bare ease, linear or ease-in-out", async ({ request }) => {
  const css = await cssText(request);
  const bad = (css.match(/(?:transition|animation)[^;]*;/g) || []).filter((d) =>
    /(^|[\s,])(ease|linear|ease-in-out|ease-in)(?=[\s,;])/.test(d),
  );
  expect(bad).toEqual([]);
});

for (const width of [375, 768, 1440]) {
  test(`no horizontal scroll and the paper fits at ${width}px`, async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await ready(page);
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      right: document.querySelector(".paper")!.getBoundingClientRect().right,
      left: document.querySelector(".paper")!.getBoundingClientRect().left,
      clipped: [...document.querySelectorAll(".topbar *, .paper *, .mobilenote")]
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
        })
        .map((e) => e.className || e.tagName),
    }));
    expect(m.sw).toBeLessThanOrEqual(m.cw);
    expect(m.right).toBeLessThanOrEqual(m.cw);
    expect(m.left).toBeGreaterThanOrEqual(0);
    expect(m.clipped).toEqual([]);
    await page.close();
  });
}

test("every button, input, select and tab is at least 44px square at 1440", async ({ page }) => {
  await ready(page);
  const tabs = ["context", "authorities", "sources"];
  const small: string[] = [];
  for (const tab of tabs) {
    await page.click(`.ctx__tab[data-tab="${tab}"]`);
    const found = await page.evaluate(() =>
      [...document.querySelectorAll("button, input, select, textarea, [role=tab]")]
        .filter((e) => {
          const r = e.getBoundingClientRect();
          const cs = getComputedStyle(e);
          return (
            r.width > 0 &&
            r.height > 0 &&
            cs.visibility !== "hidden" &&
            !e.closest(".drawer")
          );
        })
        .map((e) => {
          const r = e.getBoundingClientRect();
          return { id: `${e.tagName}.${e.className}`, w: r.width, h: r.height };
        })
        .filter((x) => x.w < 43.99 || x.h < 43.99),
    );
    small.push(...found.map((f) => `${tab}: ${f.id} ${f.w}x${f.h}`));
  }
  expect(small).toEqual([]);
});

test("page identity: theme-color and a resolvable og:image", async ({ page, request }) => {
  await page.goto("/index.html", { waitUntil: "load" });
  const theme = await page.locator('meta[name="theme-color"]').getAttribute("content");
  expect(theme).toBe("#fbf6eb");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBeTruthy();
  const res = await request.get(new URL(og!, page.url()).toString());
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("image/png");
});

test("the authority card responds to its container, not the viewport", async ({ page }) => {
  await ready(page);
  await page.click('.ctx__tab[data-tab="authorities"]');
  const pad = () =>
    page.evaluate(
      () => getComputedStyle(document.querySelector(".auth")!).paddingLeft,
    );
  const narrow = await pad();
  await page.evaluate(() => {
    (document.querySelector(".ctx__body") as HTMLElement).style.width = "640px";
  });
  const wide = await pad();
  expect(parseFloat(wide)).toBeGreaterThan(parseFloat(narrow));
});
