#!/usr/bin/env node
/**
 * Installs git hooks into .githooks/ (gitignored). Sets core.hooksPath so git
 * uses them. Run once after clone, or via npm run prepare.
 */
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const githooksDir = join(root, ".githooks");

const PRE_COMMIT = `#!/bin/sh
set -e
npm run format
npm run lint
npm run test:coverage
`;

async function main() {
  await mkdir(githooksDir, { recursive: true });
  const preCommitPath = join(githooksDir, "pre-commit");
  await writeFile(preCommitPath, PRE_COMMIT, "utf8");
  await chmod(preCommitPath, 0o755);
  try {
    execSync("git config core.hooksPath .githooks", { cwd: root, stdio: "pipe" });
    console.log("Pre-commit hook installed at .githooks/pre-commit (gitignored)");
  } catch {
    console.log("Pre-commit hook written to .githooks/pre-commit. Run: git config core.hooksPath .githooks");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
