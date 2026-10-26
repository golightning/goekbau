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
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Sicher bauen am Gleis.");
    await hero.getByRole("link", { name: "Anfrage stellen" }).click();
    await expect(page).toHaveURL(/\/kontakt\/$/);
  });

  test("enthält Projekte, Leistungen, Über uns, Karriere und Kontakt in dieser Reihenfolge", async ({
    page,
  }) => {
    await page.goto("/");
    const headings = await page.locator("main h2").allTextContents();
    const order = [
      "Von uns erfolgreich begleitet",
      "Was wir für Ihre Baumaßnahme tun",
      "Ihr Partner für die Bauüberwachung im Gleisbau",
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

  test("Streckennetz nennt jede Projektstrecke", async ({ page }) => {
    await page.goto("/");
    const map = page.getByRole("img", { name: /Schema der Projektstrecken/ }).first();
    for (const line of ["4930", "4940", "4540", "5830"])
      await expect(map).toHaveAccessibleName(new RegExp(line));
  });

  // accessibility, WCAG 2.2.2: Endlosbewegung lässt sich anhalten
  test("Animation im Hero lässt sich anhalten und fortsetzen", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("#hero");
    await page.getByRole("button", { name: "Animation anhalten" }).click();
    await expect(hero).toHaveAttribute("data-paused", "");
    expect(
      await hero
        .locator("svg")
        .first()
        .evaluate((svg: SVGSVGElement) => svg.animationsPaused()),
    ).toBe(true);
    await page.getByRole("button", { name: "Animation fortsetzen" }).click();
    await expect(hero).not.toHaveAttribute("data-paused");
  });

  test("3D-Medaille: Standbild sofort, three.js erst nach der ersten Interaktion, Pause hält sie an", async ({
    page,
    isMobile,
  }) => {
    const scripts: string[] = [];
    page.on("request", (r) => r.resourceType() === "script" && scripts.push(r.url()));
    await page.goto("/", { waitUntil: "networkidle" });
    const hero = page.locator("#hero");
    await expect(hero.locator("img[src*='medaille']").filter({ visible: true })).toHaveCount(1);
    await page.waitForTimeout(1000);
    await expect(hero.locator("canvas")).toHaveCount(0);
    const before = scripts.length;

    if (isMobile) await page.touchscreen.tap(10, 10);
    else await page.mouse.move(400, 300);
    const canvas = hero.locator("canvas");
    await expect(canvas).toHaveCount(1);
    expect(scripts.length).toBeGreaterThan(before);
    await expect(canvas).toHaveCSS("opacity", "1"); // Überblendung vom Standbild abgeschlossen

    await page.getByRole("button", { name: "Animation anhalten" }).click();
    await page.waitForTimeout(300);
    const a = await canvas.screenshot();
    await page.waitForTimeout(600);
    expect((await canvas.screenshot()).equals(a)).toBe(true);
    await page.getByRole("button", { name: "Animation fortsetzen" }).click();
    await page.waitForTimeout(600);
    expect((await canvas.screenshot()).equals(a)).toBe(false);
  });

  test("3D-Medaille bleibt bei reduzierter Bewegung ein Standbild", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.mouse.move(400, 300);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1000);
    await expect(page.locator("#hero canvas")).toHaveCount(0);
    await expect(page.locator("#hero img[src*='medaille']").filter({ visible: true })).toHaveCount(1);
    await ctx.close();
  });

  test("bei reduzierter Bewegung gibt es keine Endlosbewegung und keinen Schalter", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Animation anhalten" })).toBeHidden();
    const running = await page.evaluate(() =>
      document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations === Infinity),
    );
    expect(running).toHaveLength(0);
    await expect(page.locator(".hp-track")).not.toHaveAttribute("data-mode");
    await ctx.close();
  });

  test("Projektfahrt: Scrollen verschiebt die Stationen, Tastaturfokus holt sie ins Bild", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 750 } });
    const page = await ctx.newPage();
    await page.goto("/");
    const track = page.locator(".hp-track");
    await expect(track).toHaveAttribute("data-mode", "scroll");
    const strip = page.locator(".hp-track-strip");
    await track.evaluate((el: HTMLElement) =>
      scrollTo(0, el.getBoundingClientRect().top + scrollY + el.offsetHeight / 2),
    );
    await expect.poll(() => strip.evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");

    await page.evaluate(() => scrollTo(0, 0));
    const cta = page.locator("#projekte").getByRole("link", { name: "Anfrage stellen" });
    await cta.focus();
    // Die Seite springt sofort, das Gleis rückt im nächsten Frame nach
    await expect
      .poll(async () => {
        const b = await cta.boundingBox();
        return b !== null && b.x >= 0 && b.x + b.width <= 1500 && b.y >= 0 && b.y + b.height <= 750;
      })
      .toBe(true);
    await ctx.close();
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
  test("Anschrift im address-Element, WhatsApp als Link, keine Telefonnummer", async ({ page }) => {
    await page.goto("/kontakt/");
    const address = page.locator("main address");
    await expect(address).toContainText("Max-Planck-Straße 16");
    await expect(address.locator('a[href^="tel:"]')).toHaveCount(0);
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
