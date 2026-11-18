const CODE_PREFIX = "ASM-";
const CODE_LENGTH = 6;
// No 0/O or 1/I so a code read aloud in the room is never ambiguous.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** "ASM-" plus six readable characters; `random` is injectable for tests. */
export function generateAccessCode(random: () => number = Math.random): string {
  let suffix = "";
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    suffix += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  }
  return `${CODE_PREFIX}${suffix}`;
}
