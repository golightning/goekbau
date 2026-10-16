import { readFileSync } from "node:fs";
import path from "node:path";
import { compile } from "@tailwindcss/node";
import { describe, expect, it } from "vitest";

const cssPath = path.resolve(import.meta.dirname, "globals.css");
const css = readFileSync(cssPath, "utf8");

const colors = Object.fromEntries(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]!.toLowerCase()]),
);

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe("Design-Tokens", () => {
  it("enthalten die Markenfarben aus dem Elementor-Kit", () => {
    expect(colors["bronze-500"]).toBe("#a6875c");
    expect(colors["slate"]).toBe("#54595f");
    expect(colors["ink"]).toBe("#141414");
  });

  // accessibility: Text ≥ 4,5:1, große Schrift / Bedienelemente ≥ 3:1
  it.each([
    ["ink", "white", 4.5],
    ["ink", "mist", 4.5],
    ["slate", "white", 4.5],
    ["bronze-700", "white", 4.5],
    ["bronze-700", "mist", 4.5],
    ["bronze-700", "bronze-50", 4.5],
    ["bronze-800", "bronze-100", 4.5],
    ["bronze-800", "bronze-200", 4.5],
    ["ink", "bronze-100", 4.5],
    ["slate", "bronze-50", 4.5],
    ["white", "bronze-700", 4.5],
    ["white", "bronze-800", 4.5],
    ["ink", "bronze-500", 4.5],
    ["ink", "bronze-300", 4.5],
    ["white", "ink", 4.5],
    ["danger", "white", 4.5],
    ["success", "white", 4.5],
    ["bronze-500", "white", 3],
  ])("%s auf %s erreicht mindestens %d:1", (fg, bg, min) => {
    expect(contrast(colors[fg]!, colors[bg]!)).toBeGreaterThanOrEqual(min);
  });

  it("erzeugt keine Tailwind-Standardfarben, nur Marken-Tokens", async () => {
    const compiler = await compile(css, { base: path.dirname(cssPath), onDependency: () => {} });
    const out = compiler.build(["bg-red-500", "text-blue-600", "bg-bronze-500", "text-ink"]);
    expect(out).not.toMatch(/\.bg-red-500|\.text-blue-600/);
    expect(out).toMatch(/\.bg-bronze-500/);
    expect(out).toMatch(/\.text-ink/);
  });
});
