import { defineConfig } from "velite";
import { collections } from "./src/content/schema";
import { crossCheck } from "./src/content/cross-check";

// CONTENT_ROOT erlaubt Tests gegen Fixture-Verzeichnisse (src/content/content.test.ts).
const root = process.env.CONTENT_ROOT ?? "content";
const output = process.env.CONTENT_OUTPUT ?? ".velite";
const assets = process.env.CONTENT_ASSETS ?? "public/static";

export default defineConfig({
  root,
  // content-model: Abbruch bei Schemaverstoß erfolgt über `velite build --strict` (die Config-Option
  // `strict` wird von Velite 0.4 ignoriert und liefert Exit-Code 0).
  output: {
    data: output,
    assets,
    base: "/static/",
    name: "[name]-[hash:8].[ext]",
    clean: true,
  },
  collections,
  prepare: (data) => crossCheck(data),
});
