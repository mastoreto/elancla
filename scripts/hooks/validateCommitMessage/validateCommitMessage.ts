const CONVENTIONAL_HEADER =
  /^(feat|fix|refactor|perf|chore|docs|test|style|build|ci|revert)(\([a-z0-9-]+\))?!?: .+/;
const MAX_HEADER_LENGTH = 100;
const GIT_GENERATED_HEADER = /^(Merge |Revert ")/;
const FORBIDDEN_LINES: readonly { pattern: RegExp; reason: string }[] = [
  {
    pattern: /^co-authored-by:/i,
    reason: "No se permiten líneas Co-Authored-By en este repo.",
  },
  {
    pattern: /generated with .*claude code/i,
    reason: 'No se permiten líneas "Generated with Claude Code" en este repo.',
  },
];
const COMMENT_PREFIX = "#";
const EXAMPLE = "refactor(web): rebuild the 404 page on the obra design";

export interface CommitMessageResult {
  valid: boolean;
  errors: string[];
}

function firstContentLine(message: string): string {
  return (
    message
      .split("\n")
      .find((line) => line.trim() !== "" && !line.startsWith(COMMENT_PREFIX))
      ?.trim() ?? ""
  );
}

/** Conventional Commits header (<= 100 chars) and none of the attribution lines the repo bans. */
export function validateCommitMessage(message: string): CommitMessageResult {
  const errors: string[] = [];
  const header = firstContentLine(message);

  if (!GIT_GENERATED_HEADER.test(header)) {
    if (!CONVENTIONAL_HEADER.test(header)) {
      errors.push(
        `La primera línea debe tener la forma "type(scope): subject", por ejemplo "${EXAMPLE}".`,
      );
    }
    if (header.length > MAX_HEADER_LENGTH) {
      errors.push(
        `La primera línea tiene ${header.length} caracteres; el máximo es ${MAX_HEADER_LENGTH}.`,
      );
    }
  }

  for (const line of message.split("\n")) {
    const forbidden = FORBIDDEN_LINES.find(({ pattern }) =>
      pattern.test(line.trim()),
    );
    if (forbidden && !errors.includes(forbidden.reason))
      errors.push(forbidden.reason);
  }

  return { valid: errors.length === 0, errors };
}
