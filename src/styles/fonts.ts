import localFont from "next/font/local";

// Selbst gehostet (brand-design-system, privacy-consent): keine Requests an Google Fonts.
// Quelle: @fontsource (SIL Open Font License). Der Font-Loader verlangt reine Literale.
// performance-budget: next/font lädt alle Dateien einer Familie vor – daher genau ein Schnitt je Familie
// (Raleway 700 = Überschriften und UI, Roboto Slab 400 = Fließtext mit synthetischem Fettdruck).
// Zwei Schriften statt drei: Ergebnis des Design-Durchgangs (design-taste-frontend) vom 17.10.2026.
// "latin" deckt Deutsch inkl. ä/ö/ü/ß ab. "latin-ext" ist eine eigene Familie mit unicode-range und dient nur
// als Glyph-Fallback (z. B. ş, ı in Namen); der Browser lädt sie nur bei Bedarf.

export const raleway = localFont({
  src: "../../node_modules/@fontsource/raleway/files/raleway-latin-700-normal.woff2",
  weight: "700",
  variable: "--font-raleway",
  display: "swap",
  adjustFontFallback: "Arial",
});
export const ralewayExt = localFont({
  src: "../../node_modules/@fontsource/raleway/files/raleway-latin-ext-700-normal.woff2",
  weight: "700",
  variable: "--font-raleway-ext",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
});

export const robotoSlab = localFont({
  src: "../../node_modules/@fontsource/roboto-slab/files/roboto-slab-latin-400-normal.woff2",
  weight: "400",
  variable: "--font-roboto-slab",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
export const robotoSlabExt = localFont({
  src: "../../node_modules/@fontsource/roboto-slab/files/roboto-slab-latin-ext-400-normal.woff2",
  weight: "400",
  variable: "--font-roboto-slab-ext",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
});

export const fontVariables = [raleway, ralewayExt, robotoSlab, robotoSlabExt]
  .map((f) => f.variable)
  .join(" ");
