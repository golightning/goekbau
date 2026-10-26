import { execSync } from "node:child_process";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

// Ende-zu-Ende gegen Apache + PHP + Mailpit (Tasks 7.4, 8.x). Seriell und nur Desktop, weil Rate-Limits
// pro IP gelten; vor jedem Test wird der Zustand (Rate-Limit, Replay-Schutz) im Container zurückgesetzt.
const MAILPIT = process.env.MAILPIT_URL ?? "http://localhost:8025";
const legit = (f: string) => path.resolve(import.meta.dirname, "../../server/tests/fixtures/legit", f);

test.describe.configure({ mode: "serial" });
test.skip(({ isMobile }) => isMobile, "Formular-E2E nur einmal (Desktop)");

type MailSummary = {
  ID: string;
  Subject: string;
  To: { Address: string }[];
  ReplyTo: { Address: string }[];
  Attachments: number;
};

async function mails(): Promise<MailSummary[]> {
  const res = await fetch(`${MAILPIT}/api/v1/messages`);
  return ((await res.json()) as { messages: MailSummary[] }).messages;
}

async function mailDetail(id: string) {
  return (await fetch(`${MAILPIT}/api/v1/message/${id}`)).json() as Promise<{
    Text: string;
    Attachments: { FileName: string; ContentType: string }[];
  }>;
}

test.beforeEach(async () => {
  execSync("docker compose exec -T web sh -c 'rm -rf /var/www/storage/kv'", { stdio: "ignore" });
  await fetch(`${MAILPIT}/api/v1/messages`, { method: "DELETE" });
});

async function fillContact(page: Page, email = "max@example.org") {
  await page.getByLabel(/^Name/).fill("Max Muster");
  await page.getByLabel(/^E-Mail/).fill(email);
  await page
    .getByLabel(/^Nachricht/)
    .fill("Wir planen eine Gleiserneuerung im Frühjahr und suchen Unterstützung.");
  await page.getByRole("checkbox", { name: /Datenschutzhinweise/ }).check();
}

test("Kontaktanfrage kommt per E-Mail an, Antworten gehen an den Absender", async ({ page }) => {
  await page.goto("/kontakt/");
  await expectNoSeriousA11yViolations(page);
  await fillContact(page);
  await page.getByRole("button", { name: "Nachricht senden" }).click();
  await expect(page.getByRole("status")).toContainText("Vielen Dank", { timeout: 20_000 });
  const [mail] = await mails();
  expect(mail!.To[0]!.Address).toBe("info@goekbau.de");
  expect(mail!.ReplyTo[0]!.Address).toBe("max@example.org");
  expect(mail!.Subject).toContain("Kontaktanfrage von Max Muster");
});

test("Bewerbung mit zwei PDFs: neutrale Anhangsnamen, Position im Betreff", async ({ page }) => {
  await page.goto("/karriere/stellen/fachbauueberwacher-oberbau/");
  await page.getByLabel(/^Name/).fill("Erika Muster");
  await page.getByLabel(/^E-Mail/).fill("erika@example.org");
  await page
    .getByLabel(/^Unterlagen/)
    .setInputFiles([legit("lebenslauf-chromium.pdf"), legit("anschreiben-chromium.pdf")]);
  await page.getByRole("checkbox", { name: /Datenschutzhinweise/ }).check();
  await page.getByRole("button", { name: "Bewerbung absenden" }).click();
  await expect(page.getByRole("status")).toContainText("Bewerbung ist bei uns eingegangen", {
    timeout: 20_000,
  });
  const [mail] = await mails();
  expect(mail!.To[0]!.Address).toBe("deniz.goek@goekbau.de");
  expect(mail!.Subject).toContain("Bewerbung: Fachbauüberwacher Oberbau (FBÜ)");
  const detail = await mailDetail(mail!.ID);
  expect(detail.Attachments.map((a) => a.FileName).sort()).toEqual(["bewerbung-1.pdf", "bewerbung-2.pdf"]);
  expect(detail.Text).toContain("SHA-256:");
});

test("getarnte ausführbare Datei wird serverseitig abgelehnt", async ({ page }) => {
  await page.goto("/karriere/");
  await page.getByLabel(/^Name/).fill("Erika Muster");
  await page.getByLabel(/^E-Mail/).fill("erika2@example.org");
  await page.getByLabel(/^Unterlagen/).setInputFiles({
    name: "lebenslauf.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.concat([Buffer.from("MZ\x90\x00"), Buffer.alloc(512)]),
  });
  await page.getByRole("checkbox", { name: /Datenschutzhinweise/ }).check();
  await page.getByRole("button", { name: "Bewerbung absenden" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText(
    "lebenslauf.pdf: Erlaubt sind nur PDF, DOCX, JPG und PNG.",
    { timeout: 20_000 },
  );
  await expect(page.getByLabel(/^Unterlagen/)).toHaveAccessibleDescription(
    /lebenslauf\.pdf: Erlaubt sind nur/,
  );
  expect(await mails()).toHaveLength(0);
});

test("Datei über 10 MB wird schon vor dem Absenden gemeldet", async ({ page }) => {
  await page.goto("/karriere/");
  await page.getByLabel(/^Unterlagen/).setInputFiles({
    name: "gross.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(12 * 1024 * 1024, 32),
  });
  await expect(page.getByText(/größer als 10 MB/)).toBeVisible();
});

test("Honeypot: scheinbarer Erfolg, aber keine E-Mail", async ({ page }) => {
  await page.goto("/kontakt/");
  await fillContact(page, "bot@example.org");
  await page
    .locator('input[name="website"]')
    .evaluate((el: HTMLInputElement) => (el.value = "http://spam.example"));
  await page.getByRole("button", { name: "Nachricht senden" }).click();
  await expect(page.getByRole("status")).toContainText("Vielen Dank", { timeout: 20_000 });
  expect(await mails()).toHaveLength(0);
});

test("Feldfehler werden angesagt und mit dem Feld verknüpft", async ({ page }) => {
  await page.goto("/kontakt/");
  await page.getByLabel(/^E-Mail/).fill("max@");
  await page.getByRole("button", { name: "Nachricht senden" }).click();
  const email = page.getByLabel(/^E-Mail/);
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAccessibleDescription(/gültige E-Mail-Adresse/);
  await expect(page.getByLabel(/^Name/)).toBeFocused();
});

test("Doppelklick löst genau eine Übermittlung aus", async ({ page }) => {
  await page.goto("/kontakt/");
  await fillContact(page, "doppel@example.org");
  let posts = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/submit.php") && r.method() === "POST") posts++;
  });
  await page.getByRole("button", { name: "Nachricht senden" }).dblclick();
  await expect(page.getByRole("status")).toContainText("Vielen Dank", { timeout: 20_000 });
  expect(posts).toBe(1);
});

test("Ausfüllen und Absenden ohne Requests an Dritte", async ({ page, baseURL }) => {
  const foreign: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).origin !== new URL(baseURL!).origin) foreign.push(r.url());
  });
  await page.goto("/kontakt/");
  await fillContact(page, "privat@example.org");
  await page.getByRole("button", { name: "Nachricht senden" }).click();
  await expect(page.getByRole("status")).toContainText("Vielen Dank", { timeout: 20_000 });
  expect(foreign).toEqual([]);
});

test("ohne JavaScript: Hinweis mit Kontaktwegen statt Formular", async ({ request }) => {
  // Playwright deaktiviert JS nur zur Laufzeit, der Parser behandelt <noscript> dann als Text.
  // Deshalb wird das ausgelieferte HTML geprüft: Alternativen im <noscript>, Formular ohne JS verborgen.
  const html = await (await request.get("/kontakt/")).text();
  const noscript = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? "";
  expect(noscript).toContain("Das Formular benötigt JavaScript für den Spam-Schutz.");
  expect(noscript).not.toContain("tel:");
  expect(noscript).toContain('href="https://wa.me/491621991444"');
  expect(noscript).toContain("info [at] goekbau.de");
  expect(noscript).toContain("form[data-js-form]{display:none}");
  expect(html).toMatch(/<form[^>]*data-js-form/);
});

test("sechste Anfrage derselben IP innerhalb einer Stunde → 429", async ({ page, request, baseURL }) => {
  test.setTimeout(120_000); // 6 Anfragen mit je ≥ 3 s Mindestwartezeit (Zeitfenster-Schutz)
  // Fünf gültige Anfragen über den Browser würden zu lange dauern: direkt gegen den Endpoint mit echten Tokens
  for (let i = 0; i < 6; i++) {
    const ch = await (await request.get("/api/challenge.php?form=contact")).json();
    const { solveAltcha } = await import("../../src/forms/altcha");
    const altcha = await solveAltcha(ch.altcha);
    await page.waitForTimeout(3100);
    const res = await request.post("/api/submit.php", {
      headers: { Origin: new URL(baseURL!).origin },
      multipart: {
        _csrf_token: ch.token,
        altcha,
        name: "Max",
        email: `rate${i}@example.org`,
        message: `Anfrage Nummer ${i} zur Gleiserneuerung`,
        privacy: "on",
      },
    });
    if (i < 5) expect(res.status(), await res.text()).toBe(200);
    else {
      expect(res.status()).toBe(429);
      expect(res.headers()["retry-after"]).toBeTruthy();
    }
  }
});
