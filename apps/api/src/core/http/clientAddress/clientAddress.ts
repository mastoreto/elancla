/**
 * The caller's address, or `null` when no proxy told us.
 * ponytail: trusts the first `X-Forwarded-For` hop; the production proxy (0.8) must overwrite it.
 * Until then the address can be forged, so treat it as a lead, not as proof.
 */
export function clientAddress(forwardedFor: string | undefined): string | null {
  return forwardedFor?.split(",")[0]?.trim() || null;
}
