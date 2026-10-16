import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** accessibility: keine Verstöße der Schwere „serious“ oder „critical“ (WCAG 2.2 AA). */
export async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(serious, serious.join("\n")).toEqual([]);
}
