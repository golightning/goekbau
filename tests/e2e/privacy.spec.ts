import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

// privacy-consent (Tasks 9.1–9.3)
const routes = [
  "/",
  "/uber-uns/",
  "/leistungen/",
  "/karriere/",
  "/karriere/stellen/bauueberwacher-bahn-ob-kib/",
  "/karriere/ausbildung/funktionsausbildung-fachbauueberwacher-oberbau/",
  "/kontakt/",
  "/impressum/",
  "/datenschutz/",
  "/barrierefreiheit/",
];

test.describe("Keine Drittanbieter ohne Einwilligung", () => {
  for (const path of routes) {
    test(`${path}: nur Requests an den eigenen Origin, keine Cookies, kein Speicher`, async ({
      page,
      context,
      baseURL,
    }) => {
      const foreign: string[] = [];
      page.on("request", (r) => {
        const url = new URL(r.url());
        if (!["http:", "https:"].includes(url.protocol)) return;
        if (url.origin !== new URL(baseURL!).origin) foreign.push(r.url());
      });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);
      expect(foreign).toEqual([]);
      expect(await context.cookies()).toEqual([]);
      const storage = await page.evaluate(() => ({
        local: localStorage.length,
        session: sessionStorage.length,
      }));
      expect(storage).toEqual({ local: 0, session: 0 });
    });
  }

  test("kein Cookie-Banner überlagert die Startseite", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(/Cookies akzeptieren|Alle akzeptieren/i)).toHaveCount(0);
  });
});

test.describe("Google Maps nur nach Zustimmung", () => {
  test("Platzhalter ohne Google-Request; nach Klick wird die Karte eingebettet", async ({ page }) => {
    const google: string[] = [];
    page.on("request", (r) => {
      if (/google\./.test(new URL(r.url()).hostname)) google.push(r.url());
    });
    await page.goto("/kontakt/");
    await page.waitForLoadState("networkidle");
    expect(google).toEqual([]);
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /In Google Maps öffnen/ })).toHaveAttribute(
      "href",
      /google\.com\/maps\/search/,
    );
    await expectNoSeriousA11yViolations(page);

    await page.getByRole("button", { name: "Karte laden" }).click();
    await expect(page.locator("iframe")).toHaveAttribute("src", /^https:\/\/maps\.google\.com\/maps\?q=/);
    await expect(page.locator("iframe")).toHaveAttribute("title", /Karte: GÖK Bauüberwachung Bahn GmbH/);
    // ohne „Entscheidung merken“ wird nichts gespeichert
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
  });

  test("„Entscheidung merken“ lädt künftig automatisch, Widerruf stellt den Platzhalter wieder her", async ({
    page,
  }) => {
    await page.goto("/kontakt/");
    await page.getByLabel(/Entscheidung merken/).check();
    await page.getByRole("button", { name: "Karte laden" }).click();
    await page.reload();
    await expect(page.locator("iframe")).toHaveCount(1);

    await page.goto("/datenschutz/#einstellungen");
    await expect(page.getByRole("status").filter({ hasText: "dauerhaft erlaubt" })).toBeVisible();
    await page.getByRole("button", { name: "Einwilligung widerrufen" }).click();
    await expect(page.getByRole("status").filter({ hasText: "nicht dauerhaft erlaubt" })).toBeVisible();

    await page.goto("/kontakt/");
    await expect(page.getByRole("button", { name: "Karte laden" })).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
  });

  test("Footer-Link „Cookie-Einstellungen“ führt zu den Einstellungen", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Cookie-Einstellungen" }).click();
    await expect(page).toHaveURL(/\/datenschutz\/#einstellungen$/);
    await expect(page.getByRole("heading", { name: "Cookie- und Datenschutz-Einstellungen" })).toBeVisible();
  });
});
