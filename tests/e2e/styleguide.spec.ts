import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

test.describe("Styleguide", () => {
  test("ist nicht indexierbar und barrierefrei", async ({ page }) => {
    await page.goto("/styleguide/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expectNoSeriousA11yViolations(page);
  });

  test("Tabs sind per Tastatur bedienbar", async ({ page }) => {
    await page.goto("/styleguide/");
    const first = page.getByRole("tab", { name: "Beschreibung" });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Anforderungen" })).toHaveAttribute("aria-selected", "true");
  });

  test("Fehler am Feld ist programmatisch verknüpft", async ({ page }) => {
    await page.goto("/styleguide/");
    const email = page.getByLabel(/E-Mail/);
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAccessibleDescription(/gültige E-Mail-Adresse/);
  });
});
