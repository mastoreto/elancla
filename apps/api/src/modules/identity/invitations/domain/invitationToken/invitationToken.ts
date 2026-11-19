import { createHash, randomBytes } from "node:crypto";

export const INVITATION_TTL_DAYS = 7;
const TOKEN_BYTES = 32;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** 32 random bytes, URL-safe. Only its SHA-256 is stored; the token itself exists in the email. */
export function generateInvitationToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function invitationExpiry(now: Date): Date {
  return new Date(now.getTime() + INVITATION_TTL_DAYS * MILLISECONDS_PER_DAY);
}
