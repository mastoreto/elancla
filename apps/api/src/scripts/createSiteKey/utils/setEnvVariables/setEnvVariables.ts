const ENV_LINE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/;

/**
 * Returns the `.env` text with each variable set: an existing line is replaced in place, a missing
 * one is appended. Every other line (comments, blanks, other variables) is left untouched.
 */
export function setEnvVariables(
  content: string,
  values: Readonly<Record<string, string>>,
): string {
  const pending = new Map(Object.entries(values));
  const lines = content === "" ? [] : content.split("\n");
  const hadTrailingNewline = lines.at(-1) === "";
  if (hadTrailingNewline) lines.pop();

  const rewritten = lines.map((line) => {
    const name = ENV_LINE.exec(line)?.[1];
    if (name === undefined || !pending.has(name)) return line;
    const value = pending.get(name);
    pending.delete(name);
    return `${name}=${value}`;
  });
  for (const [name, value] of pending) rewritten.push(`${name}=${value}`);

  return `${rewritten.join("\n")}\n`;
}
