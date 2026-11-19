interface SiteKeyArguments {
  name: string | undefined;
  writeEnv: boolean;
  apiUrl: string | undefined;
}

function readValue(argv: readonly string[], flag: string): string | undefined {
  const position = argv.indexOf(flag);
  return position === -1 ? undefined : argv[position + 1];
}

/**
 * Parses `--name <label>` (the label may be several words when the shell passes it as one),
 * `--write-env` and `--api-url <origin>`.
 */
export function readSiteKeyArguments(
  argv: readonly string[],
): SiteKeyArguments {
  return {
    name: readValue(argv, "--name"),
    writeEnv: argv.includes("--write-env"),
    apiUrl: readValue(argv, "--api-url"),
  };
}
