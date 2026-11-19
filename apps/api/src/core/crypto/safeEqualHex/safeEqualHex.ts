import { timingSafeEqual } from "node:crypto";

/** Constant-time comparison of two hex digests; different lengths are simply not equal. */
export function safeEqualHex(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left, "hex");
  const rightBytes = Buffer.from(right, "hex");
  if (leftBytes.length !== rightBytes.length) return false;
  return timingSafeEqual(leftBytes, rightBytes);
}
