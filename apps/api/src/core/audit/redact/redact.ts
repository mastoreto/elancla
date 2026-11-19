import type { Prisma } from "@ancla/db";

export const REDACTED = "[redacted]";

/** Exact key names (compared lowercase). Not `code`: it would also hide currency and MOV-… codes. */
const SECRET_KEYS: ReadonlySet<string> = new Set(
  [
    "password",
    "newPassword",
    "currentPassword",
    "token",
    "tokenHash",
    "secret",
    "backupCodes",
    "totpURI",
  ].map((key) => key.toLowerCase()),
);

/**
 * Defense in depth: audit payloads should already be DTOs without secrets, but a field added
 * later must not leak into a log nobody can edit. Returns plain JSON.
 */
export function redact(value: unknown): Prisma.InputJsonValue {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [
          key,
          SECRET_KEYS.has(key.toLowerCase()) ? REDACTED : redact(entry),
        ]),
    );
  }
  return (value ?? null) as Prisma.InputJsonValue;
}
