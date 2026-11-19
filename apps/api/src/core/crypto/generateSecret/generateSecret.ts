import { randomBytes } from "node:crypto";

const DEFAULT_SECRET_BYTES = 32;

/** Random bytes in URL-safe base64: 32 bytes give a 43-character string. */
export function generateSecret(bytes: number = DEFAULT_SECRET_BYTES): string {
  return randomBytes(bytes).toString("base64url");
}
