import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

test.describe("Karriere-Übersicht", () => {
  test("zeigt 2 Stellen und 3 Ausbildungen in getrennten Listen mit Links (Schrägstrich am Ende)", async ({
    page,
  }) => {
    await page.goto("/karriere/");
    const jobs = page.locator("#stellen li");
    const trainings = page.locator("#ausbildung li");
    await expect(jobs).toHaveCount(2);
    await expect(trainings).toHaveCount(3);
    for (const href of await page
      .locator("#stellen a, #ausbildung a")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")))) {
      expect(href).toMatch(/^\/karriere\/(stellen|ausbildung)\/[a-z0-9-]+\/$/);
    }
    await expectNoSeriousA11yViolations(page);
  });

  test("Karriere ist in der Navigation auf Detailseiten aktiv", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop-Navigation");
    await page.goto("/karriere/stellen/fachbauueberwacher-oberbau/");
    await expect(
      page.getByRole("navigation", { name: "Hauptnavigation" }).getByRole("link", { name: "Karriere" }),
    ).toHaveAttribute("aria-current", "page");
  });
});

test.describe("Detailseiten", () => {
  test("Stelle: Titel, Aufgaben, Profil, Bewerbungsbereich, JobPosting-JSON-LD", async ({ page }) => {
    const res = await page.goto("/karriere/stellen/fachbauueberwacher-oberbau/");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fachbauüberwacher Oberbau (FBÜ)");
    await expect(page.getByRole("heading", { name: "Ihre Aufgaben" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ihr Profil" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Bewerben Sie sich für diese Stelle" })).toBeVisible();
    await expect(page.locator('[data-slot="bewerbungsformular"]')).toHaveAttribute(
      "data-position",
      "Fachbauüberwacher Oberbau (FBÜ)",
    );
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(ld["@type"]).toBe("JobPosting");
    expect(ld.title).toBe("Fachbauüberwacher Oberbau (FBÜ)");
    await expectNoSeriousA11yViolations(page);
  });

  test("Ausbildung: eigene URL, kein JobPosting", async ({ page }) => {
    const res = await page.goto("/karriere/ausbildung/komplettausbildung-bauueberwacher-bahn/");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Komplettausbildung");
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
    await expectNoSeriousA11yViolations(page);
  });

  test("nicht existierendes Angebot liefert 404", async ({ page }) => {
    const res = await page.goto("/karriere/stellen/gibt-es-nicht/");
    expect(res?.status()).toBe(404);
  });
});
