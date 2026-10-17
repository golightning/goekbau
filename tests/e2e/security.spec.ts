import { expect, test } from "@playwright/test";

// web-security: Header, CSP, Server-Härtung, security.txt (Tasks 8.10–8.12)
const routes = [
  "/",
  "/uber-uns/",
  "/leistungen/",
  "/karriere/",
  "/karriere/stellen/fachbauueberwacher-oberbau/",
  "/karriere/ausbildung/komplettausbildung-bauueberwacher-bahn/",
  "/kontakt/",
  "/impressum/",
  "/datenschutz/",
  "/barrierefreiheit/",
  "/gibt-es-nicht/",
];

test.describe("Sicherheits-Header", () => {
  test.skip(({ isMobile }) => isMobile, "einmal reicht");

  test("jede Antwort trägt die Pflicht-Header und kein X-Powered-By", async ({ request }) => {
    for (const path of [...routes, "/api/challenge.php?form=contact"]) {
      const h = (await request.get(path, { maxRedirects: 0 })).headers();
      expect(h["x-content-type-options"], path).toBe("nosniff");
      expect(h["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
      expect(h["permissions-policy"], path).toContain("camera=()");
      expect(h["cross-origin-opener-policy"], path).toBe("same-origin");
      expect(h["strict-transport-security"], path).toContain("max-age=31536000");
      expect(h["content-security-policy"], path).toContain("frame-ancestors 'none'");
      expect(h["x-powered-by"], path).toBeUndefined();
      expect(h["server"] ?? "", path).not.toMatch(/\d/);
    }
  });

  test("Caching: gehashte Assets immutable, HTML revalidiert", async ({ request, page }) => {
    expect((await request.get("/")).headers()["cache-control"]).toBe("no-cache");
    await page.goto("/");
    const js = await page.locator('script[src^="/_next/static/"]').first().getAttribute("src");
    expect((await request.get(js!)).headers()["cache-control"]).toContain("immutable");
  });
});

test.describe("Content Security Policy", () => {
  test.skip(({ isMobile }) => isMobile, "einmal reicht");

  test("keine CSP-Verletzungen auf allen Routen", async ({ page }) => {
    test.setTimeout(90_000); // 11 Routen mit networkidle
    const violations: string[] = [];
    page.on("console", (m) => {
      if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(`${page.url()}: ${m.text()}`);
    });
    for (const path of routes) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1);
    }
    expect(violations).toEqual([]);
  });

  test("Meta-CSP erlaubt kein unsafe-eval und kein unsafe-inline für Skripte", async ({ page }) => {
    await page.goto("/");
    const csp = (await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content"))!;
    const scriptSrc = csp.split(";").find((d) => d.trim().startsWith("script-src"))!;
    expect(scriptSrc).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toMatch(/frame-src https:\/\/www\.google\.com https:\/\/maps\.google\.com/);
  });

  test("eingeschleustes Inline-Skript wird blockiert", async ({ page }) => {
    await page.goto("/");
    const executed = await page.evaluate(async () => {
      (window as unknown as { __pwned?: boolean }).__pwned = false;
      const s = document.createElement("script");
      s.textContent = "window.__pwned = true";
      document.body.appendChild(s);
      await new Promise((r) => setTimeout(r, 100));
      return (window as unknown as { __pwned?: boolean }).__pwned;
    });
    expect(executed).toBe(false);
  });
});

test.describe("Server-Härtung", () => {
  test.skip(({ isMobile }) => isMobile, "einmal reicht");

  test("interne Dateien und Verzeichnisse sind nicht erreichbar", async ({ request }) => {
    for (const path of [
      "/_app/app/bootstrap.php",
      "/_app/vendor/autoload.php",
      "/_app/app/forms.json",
      "/.htaccess",
      "/.user.ini",
      "/.env",
      "/vendor/composer/installed.json",
      "/composer.json",
      "/README.md",
      "/storage/kv/x.json",
    ]) {
      const status = (await request.get(path, { maxRedirects: 0 })).status();
      expect([403, 404], `${path} → ${status}`).toContain(status);
    }
  });

  test("PHP läuft nur für die drei Endpoints", async ({ request }) => {
    expect((await request.get("/api/ping.php")).status()).toBe(404);
    expect((await request.get("/index.php")).status()).toBe(404);
    expect((await request.get("/api/submit.php")).status()).toBe(405);
  });

  test("Verzeichnisse werden nicht gelistet", async ({ request }) => {
    const res = await request.get("/_next/static/");
    expect(res.status()).not.toBe(200);
  });

  test("Fehler verraten keine internen Details", async ({ request }) => {
    const res = await request.post("/api/submit.php", {
      headers: { Origin: "http://localhost:8080", "Content-Type": "application/x-www-form-urlencoded" },
      data: "_csrf_token[]=x&altcha[]=y",
    });
    const body = await res.text();
    expect(body).not.toMatch(/\/var\/www|Stack trace|\.php on line|Fatal error|Warning:/i);
  });

  test("security.txt nach RFC 9116 mit Ablaufdatum in der Zukunft", async ({ request }) => {
    const res = await request.get("/.well-known/security.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toMatch(/^Contact: https:\/\/www\.goekbau\.de\/kontakt\/$/m);
    const expires = new Date(text.match(/^Expires: (.+)$/m)![1]!);
    expect(expires.getTime()).toBeGreaterThan(Date.now());
  });
});
