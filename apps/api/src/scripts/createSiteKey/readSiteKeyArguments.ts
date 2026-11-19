interface SiteKeyArguments {
  name: string | undefined;
}

/** Parses `--name <label>`. The label may be several words when the shell passes it as one. */
export function readSiteKeyArguments(
  argv: readonly string[],
): SiteKeyArguments {
  const flag = argv.indexOf("--name");
  const name = flag === -1 ? undefined : argv[flag + 1];
  return { name };
}
