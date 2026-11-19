// CI job `version`: the PR into main must carry a version greater than the last release tag.
//   bun scripts/release/assertVersionBumped/assertVersionBumped.ts [base-ref]   (default origin/main)
import { isVersionBumped } from "./isVersionBumped";

const DEFAULT_BASE_REF = "origin/main";
const FAILURE_CODE = 1;

function latestTagReachableFrom(ref: string): string | null {
  const result = Bun.spawnSync(
    ["git", "describe", "--tags", "--abbrev=0", "--match", "v*", ref],
    {
      stderr: "ignore",
    },
  );
  return result.exitCode === 0 ? result.stdout.toString().trim() : null;
}

const baseRef = Bun.argv[2] ?? DEFAULT_BASE_REF;
const { version } = (await Bun.file("package.json").json()) as {
  version: string;
};
const latestTag = latestTagReachableFrom(baseRef);

if (isVersionBumped(version, latestTag)) {
  console.info(
    `OK: package.json is at ${version} (last release on ${baseRef}: ${latestTag ?? "none"}).`,
  );
} else {
  console.error(
    `package.json is at ${version} but ${baseRef} already has ${latestTag ?? "no tag"}.\n` +
      "Run `bun run release` on develop before opening the PR into main.",
  );
  process.exit(FAILURE_CODE);
}
