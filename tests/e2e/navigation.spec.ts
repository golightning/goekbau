import { expect, test } from "@playwright/test";

test.describe("Hauptnavigation (Desktop)", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop-Navigation");

  test("markiert die aktuelle Seite mit aria-current", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Hauptnavigation" });
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Kontakt" })).not.toHaveAttribute("aria-current", "page");
  });

  test("Logo führt zur Startseite", async ({ page }) => {
    await page.goto("/styleguide/");
    await page.getByRole("link", { name: /zur Startseite/ }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("Mobile Navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "nur mobil");

  test("öffnet, meldet aria-expanded, schließt mit Escape und gibt den Fokus zurück", async ({ page }) => {
    await page.goto("/");
    // Bei offenem Dialog setzt Radix aria-hidden außerhalb → Trigger per CSS statt Rolle adressieren
    const trigger = page.locator('header button[aria-haspopup="dialog"]');
    await expect(trigger).toHaveAccessibleName("Menü");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const dialog = page.getByRole("dialog", { name: "Menü" });
    await expect(dialog.getByRole("link", { name: "Karriere" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("schließt nach Auswahl eines Menüpunkts", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menü" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Home" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

test.describe("Footer und Kontaktwege", () => {
  test("enthält Rechtliches, Cookie-Einstellungen und keine leeren Social-Icons", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Impressum" })).toHaveAttribute("href", "/impressum/");
    await expect(footer.getByRole("link", { name: "Datenschutz" })).toHaveAttribute("href", "/datenschutz/");
    await expect(footer.getByRole("link", { name: "Cookie-Einstellungen" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Barrierefreiheit" })).toBeVisible();
    // content/company.yaml hat keine Social-Profile → keine Social-Liste
    await expect(footer.getByRole("list", { name: "Social Media" })).toHaveCount(0);
    await expect(footer.locator('a[href="#"]')).toHaveCount(0);
  });

  test("WhatsApp-Link mit internationaler Nummer, ohne Vorab-Requests an WhatsApp/Meta", async ({ page }) => {
    const thirdParty: string[] = [];
    page.on("request", (r) => {
      if (/whatsapp|wa\.me|facebook|meta/i.test(new URL(r.url()).hostname)) thirdParty.push(r.url());
    });
    await page.goto("/");
    await expect(page.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute(
      "href",
      "https://wa.me/491621991444",
    );
    await page.waitForLoadState("networkidle");
    expect(thirdParty).toEqual([]);
  });

  test("E-Mail-Adresse steht nicht im HTML, wird aber nach dem Laden zum mailto-Link", async ({
    page,
    request,
  }) => {
    const html = await (await request.get("/")).text();
    expect(html).not.toMatch(/[\w.+-]+@goekbau\.de/);
    expect(html).toContain("info [at] goekbau.de");
    await page.goto("/");
    await expect(page.getByRole("contentinfo").locator('a[href^="mailto:"]')).toHaveAttribute(
      "href",
      "mailto:info@goekbau.de",
    );
  });
});

test.describe("Sprunglink und Fehlerseite", () => {
  test("erstes Tab zeigt „Zum Inhalt springen“ und springt zum Hauptinhalt", async ({ page, isMobile }) => {
    test.skip(isMobile, "Tastatur-Test auf Desktop");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Zum Inhalt springen" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#inhalt$/);
  });

  test("unbekannte URL: Status 404 mit gestalteter Seite, Navigation und Footer", async ({ page }) => {
    const res = await page.goto("/gibt-es-nicht/");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Diese Seite gibt es nicht");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Kontakt aufnehmen" })).toHaveAttribute(
      "href",
      "/kontakt/",
    );
  });
});
