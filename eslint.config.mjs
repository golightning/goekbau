import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// brand-design-system: Farben nur über Design-Tokens. Verboten sind Tailwind-Arbitrary-Colors
// (z. B. `bg-[#ff0000]`, `text-[rgb(…)]`) und Hex-/RGB-/HSL-Literale in Komponenten.
const ARBITRARY_COLOR = String.raw`/\[(?:#|rgb|hsl|oklch|color-mix)/i`;
const COLOR_LITERAL = String.raw`/(?:^|[^&\w])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(?:rgba?|hsla?|oklch)\(/`;
const colorMessage = "Farben nur über Design-Tokens aus src/styles/globals.css (brand-design-system).";

export const colorRules = {
  "no-restricted-syntax": [
    "error",
    { selector: `Literal[value=${ARBITRARY_COLOR}]`, message: colorMessage },
    { selector: `TemplateElement[value.raw=${ARBITRARY_COLOR}]`, message: colorMessage },
    { selector: `Literal[value=${COLOR_LITERAL}]`, message: colorMessage },
    { selector: `TemplateElement[value.raw=${COLOR_LITERAL}]`, message: colorMessage },
  ],
};

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/*.test.ts"],
    rules: colorRules,
  },
  {
    ignores: [".next/**", "out/**", "dist/**", "_wp-export/**", "research/**", "tools/**", "next-env.d.ts"],
  },
];

export default config;
