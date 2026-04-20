#!/usr/bin/env node
// Bump the package version in packages/react, commit, and tag.
// Does NOT push. Review locally, then: git push && git push --tags
//
// Usage: node scripts/release.mjs <patch|minor|major>

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const bump = process.argv[2];
if (!["patch", "minor", "major"].includes(bump)) {
  console.error(`Usage: node scripts/release.mjs <patch|minor|major>`);
  process.exit(1);
}

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const pkgPath = resolve(repoRoot, "packages/react/package.json");

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: "inherit", cwd: repoRoot, ...opts });
}
function shOut(cmd) {
  return execSync(cmd, { cwd: repoRoot }).toString().trim();
}

// Preflight
const status = shOut("git status --porcelain");
if (status) {
  console.error("Working tree is not clean. Commit or stash first.");
  process.exit(1);
}

const branch = shOut("git rev-parse --abbrev-ref HEAD");
console.log(`Releasing from branch: ${branch}`);

// Verify before bumping
sh("pnpm -C packages/react typecheck");
sh("pnpm -C packages/react test");
sh("pnpm -C packages/react build");

// Bump version (no npm-managed tag; we manage our own)
sh(`npm version ${bump} --no-git-tag-version`, { cwd: resolve(repoRoot, "packages/react") });

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const version = pkg.version;
const tag = `v${version}`;
console.log(`\nNew version: ${version}`);

// Commit and tag
sh(`git add packages/react/package.json`);
sh(`git commit -m "chore: release ${tag}"`);
sh(`git tag -a ${tag} -m "Release ${tag}"`);

console.log(`
Tagged ${tag}. Review with:
  git show HEAD
  git show ${tag}

To publish, push the commit and tag:
  git push origin ${branch}
  git push origin ${tag}

The release workflow will build and publish to npm.
`);
