const TIMESTAMP_BYTES = 6;
const UUID_BYTES = 16;
const VERSION_7 = 0x70;
const VERSION_MASK = 0x0f;
const VARIANT_RFC_4122 = 0x80;
const VARIANT_MASK = 0x3f;
const BYTE_RADIX = 256;

/**
 * RFC 9562 UUIDv7 (time-ordered), the same kind Prisma generates for every `id`. Needed when a
 * key derived from the id must exist before the row is inserted. Not `Bun.randomUUIDv7`: the API
 * also runs on Node inside Next.
 */
export function uuidV7(now: number = Date.now()): string {
  const bytes = crypto.getRandomValues(new Uint8Array(UUID_BYTES));
  let remaining = now;
  for (let index = TIMESTAMP_BYTES - 1; index >= 0; index -= 1) {
    bytes[index] = remaining % BYTE_RADIX;
    remaining = Math.floor(remaining / BYTE_RADIX);
  }
  bytes[6] = ((bytes[6] as number) & VERSION_MASK) | VERSION_7;
  bytes[8] = ((bytes[8] as number) & VARIANT_MASK) | VARIANT_RFC_4122;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10).join(""),
  ].join("-");
}
