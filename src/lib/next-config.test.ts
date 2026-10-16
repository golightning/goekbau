import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("next.config", () => {
  it("erzeugt einen statischen Export mit abschließendem Schrägstrich", () => {
    expect(nextConfig.output).toBe("export");
    expect(nextConfig.trailingSlash).toBe(true);
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});
