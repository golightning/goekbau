import { expect, test } from "@playwright/test";

test("Startseite ist deutsch und erreichbar", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
});

test("unbekannte URL liefert 404", async ({ page }) => {
  const response = await page.goto("/gibt-es-nicht/");
  expect(response?.status()).toBe(404);
});
