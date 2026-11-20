import { createHmac } from "node:crypto";

interface VisitorHashInput {
  /** `VIEW_HASH_SECRET`. */
  secret: string;
  /** `YYYY-MM-DD` in the organization time zone (see `urlDate`). */
  day: string;
  ip: string;
  userAgent: string;
}

/**
 * Anonymous visitor of one day: `HMAC-SHA256(secret, day + ip + userAgent)` in hex. The IP and
 * the user agent are never stored; the day in the input makes the hash useless across days.
 */
export function visitorHash({
  secret,
  day,
  ip,
  userAgent,
}: VisitorHashInput): string {
  return createHmac("sha256", secret)
    .update(`${day}\n${ip}\n${userAgent}`)
    .digest("hex");
}
