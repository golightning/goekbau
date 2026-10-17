// performance-budget (Task 11.2): Lighthouse mobil (simuliertes langsames 4G) gegen den Prod-Nachbau.
const pages = ["/", "/uber-uns/", "/karriere/", "/kontakt/"];
const base = process.env.LHCI_BASE_URL ?? "http://localhost:8080";

module.exports = {
  ci: {
    collect: {
      url: pages.map((p) => base + p),
      numberOfRuns: 3,
      settings: {
        // Standard-Preset = mobil mit simulierter Drosselung
        chromeFlags: "--headless=new --no-sandbox",
        skipAudits: ["is-crawlable"], // lokal/Staging bewusst noindex
      },
    },
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: ".*",
          assertions: {
            "categories:performance": ["error", { minScore: 0.9, aggregationMethod: "median-run" }],
            "largest-contentful-paint": ["error", { maxNumericValue: 2500, aggregationMethod: "median-run" }],
            "cumulative-layout-shift": ["error", { maxNumericValue: 0.1, aggregationMethod: "median-run" }],
            "total-blocking-time": ["error", { maxNumericValue: 200, aggregationMethod: "median-run" }],
            "categories:accessibility": ["error", { minScore: 0.95 }],
          },
        },
        {
          // Ressourcen-Budget der Startseite (Transfergrößen, komprimiert)
          matchingUrlPattern: "^https?://[^/]+/$",
          assertions: {
            "resource-summary:total:count": ["error", { maxNumericValue: 30 }],
            "resource-summary:script:size": ["error", { maxNumericValue: 120 * 1024 }],
            "resource-summary:stylesheet:size": ["error", { maxNumericValue: 40 * 1024 }],
          },
        },
      ],
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/reports" },
  },
};
