import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: ["migrations/**", "src/config/**"],
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      thresholds: {
        branches: 65,
        functions: 65,
        lines: 65,
        statements: 65,
      },
    },
    environment: "node",
    exclude: [...configDefaults.exclude, "migrations/**"],
    globals: true,
  },
});
