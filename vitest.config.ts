import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "dist/**",
        "migrations/**",
        "*.config.*",
        "**/config/**",
        "**/types/**",
        "**/db/**",
        "**/rateLimiter.ts",
        "**/*.d.ts",
        "**/*.test.ts",
        "src/index.ts",
        "src/constants/**",
      ],
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: "node",
    exclude: [...configDefaults.exclude, "migrations/**"],
    globals: true,
  },
});
