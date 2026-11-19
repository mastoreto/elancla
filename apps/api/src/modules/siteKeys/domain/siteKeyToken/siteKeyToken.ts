import { generateSecret } from "../../../../core/crypto";

const KEY_PREFIX = "sk_";
const HINT_ID_LENGTH = 8;
const UUID_PATTERN =
  "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
/** 32 random bytes in base64url. The secret may contain `_` and `-`, so the id is matched first. */
const SECRET_PATTERN = "[A-Za-z0-9_-]{43}";
const KEY_FORMAT = new RegExp(
  `^${KEY_PREFIX}(${UUID_PATTERN})_(${SECRET_PATTERN})$`,
);

export interface ParsedSiteKey {
  id: string;
  secret: string;
}

export function generateSiteKeySecret(): string {
  return generateSecret();
}

/** `sk_<keyId>_<secret>`: the id locates the row, the secret is what proves possession. */
export function formatSiteKey(id: string, secret: string): string {
  return `${KEY_PREFIX}${id}_${secret}`;
}

/** Splits a presented key; anything that is not exactly in the format is `null`. */
export function parseSiteKey(raw: string): ParsedSiteKey | null {
  const match = KEY_FORMAT.exec(raw);
  const id = match?.[1];
  const secret = match?.[2];
  if (!id || !secret) return null;
  return { id, secret };
}

/** What the list shows to recognize a key: not enough to use it. */
export function siteKeyHint(id: string): string {
  return `${KEY_PREFIX}${id.slice(0, HINT_ID_LENGTH)}…`;
}
