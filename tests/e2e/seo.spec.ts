import { expect, test } from "@playwright/test";

// seo-metadata und legacy-url-redirects (Tasks 10.1–10.4) gegen den Prod-Nachbau
test.skip(({ isMobile }) => isMobile, "einmal reicht");

const pages = [
  "/",
  "/uber-uns/",
  "/leistungen/",
  "/karriere/",
  "/kontakt/",
  "/impressum/",
  "/datenschutz/",
  "/barrierefreiheit/",
  "/karriere/stellen/bauueberwacher-bahn-ob-kib/",
  "/karriere/stellen/fachbauueberwacher-oberbau/",
  "/karriere/ausbildung/komplettausbildung-bauueberwacher-bahn/",
];

test("Metadaten: lang, eindeutiger Titel mit Suffix, Beschreibung, Canonical, OG", async ({ page }) => {
  const titles = new Set<string>();
  for (const path of pages) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    const title = await page.title();
    expect(title, path).toMatch(/ \| GÖK Bauüberwachung Bahn$/);
    expect(titles.has(title), `doppelter Titel ${title}`).toBe(false);
    titles.add(title);
    const desc = (await page.locator('meta[name="description"]').getAttribute("content"))!;
    expect(desc.length, path).toBeGreaterThanOrEqual(70);
    expect(desc.length, path).toBeLessThanOrEqual(160);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://www.goekbau.de${path}`,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "de_DE");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /og-default\.jpg|static\//,
    );
  }
});

test("JSON-LD der Startseite stimmt mit dem Footer überein und enthält keine E-Mail", async ({ page }) => {
  await page.goto("/");
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  const footerPhone = await page.getByRole("contentinfo").locator('a[href^="tel:"]').getAttribute("href");
  expect(`tel:${ld.telephone}`).toBe(footerPhone);
  expect(JSON.stringify(ld)).not.toContain("@goekbau.de");
});

test("Staging/lokal: noindex per Meta, Header und robots.txt; Sitemap vollständig", async ({
  request,
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect((await request.get("/")).headers()["x-robots-tag"]).toContain("noindex");
  expect(await (await request.get("/robots.txt")).text()).toMatch(/Disallow: \//);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of pages) expect(sitemap).toContain(`<loc>https://www.goekbau.de${path}</loc>`);
  expect(sitemap).not.toContain("styleguide");
  expect(sitemap).not.toContain("404");
});

test.describe("Weiterleitungen alter WordPress-URLs", () => {
  const redirects: [string, string][] = [
    ["/stellenanzeige-2/", "/karriere/stellen/bauueberwacher-bahn-ob-kib/"],
    ["/stellenanzeige-3/", "/karriere/stellen/fachbauueberwacher-oberbau/"],
    ["/stellenanzeige-4/", "/karriere/ausbildung/funktionsausbildung-fachbauueberwacher-oberbau/"],
    ["/stellenanzeige-5/", "/karriere/ausbildung/funktionsausbildung-bauueberwacher-bahn-ob-kib/"],
    ["/stellenanzeige-6/", "/karriere/ausbildung/komplettausbildung-bauueberwacher-bahn/"],
    ["/stellenanzeige-3", "/karriere/stellen/fachbauueberwacher-oberbau/"],
    ["/sitemap_index.xml", "/sitemap.xml"],
    ["/page-sitemap.xml", "/sitemap.xml"],
    ["/wp-sitemap.xml", "/sitemap.xml"],
    ["/feed/", "/"],
    ["/comments/feed/", "/"],
    ["/home/", "/"],
  ];

  for (const [from, to] of redirects) {
    test(`${from} → 301 ${to}, Ziel antwortet 200`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(301);
      const location = new URL(res.headers().location!, "http://localhost:8080");
      expect(location.pathname).toBe(to);
      expect((await request.get(to)).status()).toBe(200);
    });
  }

  test("WordPress-Pfade antworten mit 410", async ({ request }) => {
    for (const path of [
      "/wp-login.php",
      "/wp-admin/",
      "/wp-admin/admin-ajax.php",
      "/wp-json/wp/v2/pages",
      "/xmlrpc.php",
      "/wp-content/uploads/2025/02/x.jpg",
      "/wp-includes/js/jquery/jquery.min.js",
    ]) {
      expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(410);
    }
  });

  test("bisherige Seiten-URLs bleiben mit 200 erreichbar", async ({ request }) => {
    for (const path of [
      "/",
      "/uber-uns/",
      "/leistungen/",
      "/karriere/",
      "/kontakt/",
      "/impressum/",
      "/datenschutz/",
    ]) {
      expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(200);
    }
  });
});
