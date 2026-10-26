import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";

describe("next.config", () => {
  it("erzeugt einen statischen Export mit abschließendem Schrägstrich", () => {
    expect(nextConfig.output).toBe("export");
    expect(nextConfig.trailingSlash).toBe(true);
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  // design-drafts „Entwürfe nicht im auslieferbaren Artefakt“
  it("kennt Entwurfsseiten im auslieferbaren Build nicht", () => {
    expect(nextConfig.pageExtensions).not.toContain("draft.tsx");
    expect(nextConfig.distDir).toBeUndefined();
  });

  describe("Prüfbuild", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
      vi.resetModules();
    });

    it("nimmt Entwurfsseiten nur auf ausdrückliche Anforderung auf und schreibt in ein eigenes Verzeichnis", async () => {
      vi.stubEnv("GOEKBAU_DRAFT_BUILD", "1");
      vi.resetModules();
      const { default: draftConfig } = await import("../../next.config");
      expect(draftConfig.pageExtensions).toContain("draft.tsx");
      expect(draftConfig.distDir).toBe("out-drafts");
      expect(draftConfig.output).toBe("export");
    });
  });
});
