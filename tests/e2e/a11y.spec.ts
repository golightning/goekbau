import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yViolations } from "./a11y";

// accessibility „WCAG-2.2-AA-Konformität“ (Task 11.1): jede Route, Desktop und Mobil
const routes = [
  "/",
  "/uber-uns/",
  "/leistungen/",
  "/karriere/",
  "/karriere/stellen/bauueberwacher-bahn-ob-kib/",
  "/karriere/stellen/fachbauueberwacher-oberbau/",
  "/karriere/ausbildung/funktionsausbildung-fachbauueberwacher-oberbau/",
  "/karriere/ausbildung/funktionsausbildung-bauueberwacher-bahn-ob-kib/",
  "/karriere/ausbildung/komplettausbildung-bauueberwacher-bahn/",
  "/kontakt/",
  "/impressum/",
  "/datenschutz/",
  "/barrierefreiheit/",
  "/gibt-es-nicht/",
];

for (const path of routes) {
  test(`axe ohne serious/critical: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expectNoSeriousA11yViolations(page);
  });
}

test("Gate greift: ein Feld ohne Label ist ein kritischer Verstoß", async ({ page }) => {
  await page.setContent(
    '<html lang="de"><body><main><h1>Test</h1><form><input type="email"></form></main></body></html>',
  );
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.some((v) => v.id === "label" && v.impact === "critical")).toBe(true);
});
