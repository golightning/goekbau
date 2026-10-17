import { expect, test } from "@playwright/test";

// performance-budget „Optimierte Bilder“ (Task 11.3)
test("Smartphone (390 px, DPR 2) lädt eine Hero-Variante von höchstens 800 px als AVIF/WebP", async ({
  browser,
}) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto("/");
  const hero = page.locator("section").first().locator("img");
  await expect(hero).toHaveAttribute("fetchpriority", "high");
  await expect(hero).toHaveAttribute("loading", "eager");
  const current = await hero.evaluate((img: HTMLImageElement) => img.currentSrc);
  expect(current).toMatch(/-(400|800)\.(avif|webp)$/);
  await ctx.close();
});

test("Bilder unterhalb des sichtbaren Bereichs werden lazy geladen und haben feste Abmessungen", async ({
  page,
}) => {
  await page.goto("/uber-uns/");
  const imgs = page.locator("main img");
  const n = await imgs.count();
  expect(n).toBeGreaterThan(5);
  for (let i = 0; i < n; i++) {
    const img = imgs.nth(i);
    await expect(img).toHaveAttribute("width", /\d+/);
    await expect(img).toHaveAttribute("height", /\d+/);
  }
  const lazy = await page.locator('main img[loading="lazy"]').count();
  expect(lazy).toBeGreaterThanOrEqual(n - 1);
});
