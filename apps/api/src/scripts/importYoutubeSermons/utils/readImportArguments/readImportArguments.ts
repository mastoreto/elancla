export interface ImportArguments {
  org: string | undefined;
  playlist: string | undefined;
  dryRun: boolean;
}

function readFlagValue(
  argv: readonly string[],
  flag: string,
): string | undefined {
  const index = argv.indexOf(flag);
  const value = index === -1 ? undefined : argv[index + 1];
  return value === undefined || value.startsWith("--") ? undefined : value;
}

/** Parses `--org <slug> --playlist <id> [--dry-run]` in any order. */
export function readImportArguments(argv: readonly string[]): ImportArguments {
  return {
    org: readFlagValue(argv, "--org"),
    playlist: readFlagValue(argv, "--playlist"),
    dryRun: argv.includes("--dry-run"),
  };
}
