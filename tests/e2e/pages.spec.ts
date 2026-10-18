import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

const pages = [
  "/",
  "/uber-uns/",
  "/leistungen/",
  "/kontakt/",
  "/impressum/",
  "/datenschutz/",
  "/barrierefreiheit/",
];

test.describe("Unternehmensseiten", () => {
  for (const path of pages) {
    test(`${path}: 200, genau eine h1, lückenlose Überschriften, barrierefrei`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const levels = await page
        .locator("main h1, main h2, main h3, main h4")
        .evaluateAll((els) => els.map((e) => Number(e.tagName[1])));
      for (let i = 1; i < levels.length; i++) {
        expect(
          levels[i]! - levels[i - 1]!,
          `Sprung von h${levels[i - 1]} auf h${levels[i]}`,
        ).toBeLessThanOrEqual(1);
      }
      await expectNoSeriousA11yViolations(page);
    });
  }

  test("Pfad ohne Schrägstrich leitet per 301 auf die kanonische Form", async ({ request }) => {
    const res = await request.get("/kontakt", { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(new URL(res.headers().location!, "http://x").pathname).toBe("/kontakt/");
  });
});

test.describe("Startseite", () => {
  test("Hero ohne doppelte Inhalte, primärer CTA führt zu /kontakt/", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section", { has: page.locator("h1") });
    await expect(hero.getByText("Schienen der Zukunft gestalten")).toHaveCount(1);
    await hero.getByRole("link", { name: "Kontakt aufnehmen" }).click();
    await expect(page).toHaveURL(/\/kontakt\/$/);
  });

  test("enthält Leistungen, Projekte, Team, Karriere und Kontakt-CTA in dieser Reihenfolge", async ({
    page,
  }) => {
    await page.goto("/");
    const headings = await page.locator("main h2").allTextContents();
    const order = [
      "Was wir für Ihre Baumaßnahme tun",
      "Von uns erfolgreich begleitet",
      "Unsere Experten",
      "Wir stellen ein und bilden aus",
      "Bauen Sie die Zukunft der Schiene mit uns",
    ];
    const idx = order.map((h) => headings.indexOf(h));
    expect(
      idx.every((i) => i >= 0),
      headings.join(" | "),
    ).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });
});

test.describe("Leistungen", () => {
  test("geplante Leistungen sind auf Leistungs- und Startseite als „in Vorbereitung“ gekennzeichnet", async ({
    page,
  }) => {
    for (const path of ["/leistungen/", "/"]) {
      await page.goto(path);
      await expect(page.getByText("in Vorbereitung").first()).toBeVisible();
      await expect(page.getByText("Schweißüberwacher", { exact: true })).toBeVisible();
    }
  });
});

test.describe("Über uns", () => {
  test("Kennzahlen stehen ohne JavaScript mit echten Werten im HTML", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/uber-uns/");
    await expect(page.getByText("56.000+")).toBeVisible();
    await expect(page.getByText("170+")).toBeVisible();
    await expect(page.getByText("2023", { exact: true })).toBeVisible();
    await ctx.close();
  });

  test("Teammitglied ohne Foto zeigt Initialen statt eines kaputten Bildes", async ({ page }) => {
    await page.goto("/uber-uns/");
    const card = page.locator("li", { has: page.getByRole("heading", { name: "Cem Baris" }) });
    await expect(card.getByText("CB", { exact: true })).toBeVisible();
    await expect(card.locator("img")).toHaveCount(0);
  });

  test("alle Bilder laden ohne Fehler", async ({ page }) => {
    await page.goto("/uber-uns/");
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
    });
    await page.waitForLoadState("networkidle");
    const broken = await page
      .locator("main img")
      .evaluateAll((imgs) =>
        (imgs as HTMLImageElement[]).filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
      );
    expect(broken).toEqual([]);
  });
});

test.describe("Kontakt", () => {
  test("Anschrift im address-Element, Telefon und WhatsApp als Links", async ({ page }) => {
    await page.goto("/kontakt/");
    const address = page.locator("main address");
    await expect(address).toContainText("Max-Planck-Straße 16");
    await expect(address.getByRole("link", { name: "+49 162 1991444" })).toHaveAttribute(
      "href",
      "tel:+491621991444",
    );
    await expect(address.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute(
      "href",
      "https://wa.me/491621991444",
    );
  });
});

test.describe("Rechtstexte", () => {
  test("Datenschutzerklärung nennt keine entfernten Dienste", async ({ page }) => {
    await page.goto("/datenschutz/");
    const text = await page.locator("main").innerText();
    for (const removed of ["Google Fonts", "reCAPTCHA", "CookieYes", "Elementor", "WPForms"]) {
      expect(text).not.toContain(removed);
    }
    for (const used of ["IONOS", "Google Maps", "WhatsApp", "ALTCHA"]) {
      expect(text).toContain(used);
    }
  });
});
