import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "#content": fileURLToPath(new URL("./.velite", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts", "tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
