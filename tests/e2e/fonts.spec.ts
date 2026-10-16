import { expect, test } from "@playwright/test";

// brand-design-system „Schriften geladen“: alle Schrift-Requests vom eigenen Origin, keiner an Google.
test("Schriften kommen ausschließlich vom eigenen Origin", async ({ page, baseURL }) => {
  const fontRequests: string[] = [];
  page.on("request", (req) => {
    if (req.resourceType() === "font" || /fonts\.(googleapis|gstatic)\.com/.test(req.url())) {
      fontRequests.push(req.url());
    }
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const origin = new URL(baseURL!).origin;
  expect(fontRequests.length).toBeGreaterThan(0);
  for (const url of fontRequests) {
    expect(new URL(url).origin).toBe(origin);
  }
});
