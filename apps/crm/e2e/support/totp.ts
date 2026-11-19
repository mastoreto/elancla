import { createHmac } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BITS_PER_BASE32_CHAR = 5;
const BITS_PER_BYTE = 8;
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;
const HOTP_MODULUS = 10 ** TOTP_DIGITS;
const COUNTER_BYTES = 8;
const LOW_NIBBLE = 0x0f;
const SEVEN_BIT_MASK = 0x7f_ff_ff_ff;

function decodeBase32(encoded: string): Buffer {
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of encoded.replace(/=+$/, "").toUpperCase()) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) throw new Error("The TOTP secret is not valid base32");
    buffer = (buffer << BITS_PER_BASE32_CHAR) | value;
    bits += BITS_PER_BASE32_CHAR;
    if (bits >= BITS_PER_BYTE) {
      bits -= BITS_PER_BYTE;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

/**
 * Current RFC 6238 code (SHA-1, 6 digits, 30 s) for an `otpauth://` URI or a bare base32 secret.
 * Plain node:crypto on purpose: Playwright runs on Node, where the API's Bun-only helper is not
 * available, and the algorithm is small enough not to need a dependency.
 */
export function totp(secretOrUri: string, now: number = Date.now()): string {
  const secret = secretOrUri.startsWith("otpauth://")
    ? new URL(secretOrUri).searchParams.get("secret")
    : secretOrUri;
  if (!secret) throw new Error("The otpauth URI has no secret");
  const counter = Buffer.alloc(COUNTER_BYTES);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 1000 / TOTP_PERIOD_SECONDS)));
  const digest = createHmac("sha1", decodeBase32(secret)).update(counter).digest();
  const offset = (digest[digest.length - 1] ?? 0) & LOW_NIBBLE;
  const code = (digest.readUInt32BE(offset) & SEVEN_BIT_MASK) % HOTP_MODULUS;
  return String(code).padStart(TOTP_DIGITS, "0");
}
