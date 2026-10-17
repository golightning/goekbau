import { describe, expect, it } from "vitest";
import { isActive } from "./navigation";

describe("isActive", () => {
  it.each([
    ["/", "/", true],
    ["/", "/kontakt/", false],
    ["/karriere/", "/karriere/", true],
    ["/karriere/", "/karriere/stellen/fachbauueberwacher-oberbau/", true],
    ["/karriere/", "/karriere", true],
    ["/kontakt/", "/karriere/", false],
  ])("%s ist aktiv auf %s: %s", (href, path, expected) => {
    expect(isActive(href, path)).toBe(expected);
  });
});
