import { generateSecret, sha256Hex } from "../../../../../core/crypto";

export const INVITATION_TTL_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** 32 random bytes, URL-safe. Only its SHA-256 is stored; the token itself exists in the email. */
export function generateInvitationToken(): string {
  return generateSecret();
}

export function hashInvitationToken(token: string): string {
  return sha256Hex(token);
}

export function invitationExpiry(now: Date): Date {
  return new Date(now.getTime() + INVITATION_TTL_DAYS * MILLISECONDS_PER_DAY);
}
