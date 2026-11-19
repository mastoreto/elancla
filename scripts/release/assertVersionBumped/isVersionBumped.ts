const TAG_PREFIX = "v";
const INITIAL_VERSION = "0.0.0";
const NEWER = 1;

/** Whether `currentVersion` is strictly greater than the version of the latest release tag. */
export function isVersionBumped(
  currentVersion: string,
  latestTag: string | null,
): boolean {
  const released = latestTag
    ? latestTag.replace(new RegExp(`^${TAG_PREFIX}`), "")
    : INITIAL_VERSION;
  return Bun.semver.order(currentVersion, released) === NEWER;
}
