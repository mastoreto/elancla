const HONORIFICS = new Set([
  "pr",
  "pra",
  "ps",
  "pbro",
  "dr",
  "dra",
  "lic",
  "ing",
  "sr",
  "sra",
  "srta",
  "hno",
  "hna",
  "rev",
  "mr",
  "mrs",
  "ms",
]);

const COMBINING_MARKS = /\p{M}/gu;
const LETTER = /\p{L}/u;

function isHonorific(word: string): boolean {
  return HONORIFICS.has(word.replace(/\.$/, "").toLowerCase());
}

function firstLetterOf(word: string): string {
  const plain = word.normalize("NFD").replace(COMBINING_MARKS, "");
  return (plain.match(LETTER)?.[0] ?? "").toUpperCase();
}

/**
 * Up to two capitals: the first letter of the first and of the last word, without accents and
 * ignoring honorifics ("Pr. Juan Olivera" -> "JO", "María José Pérez" -> "MP").
 */
export function initials(name: string): string {
  const words = name
    .split(/\s+/)
    .filter((word) => word !== "" && !isHonorific(word))
    .filter((word) => LETTER.test(word));
  const first = words[0];
  if (first === undefined) return "";
  const last = words.length > 1 ? (words[words.length - 1] as string) : "";
  return `${firstLetterOf(first)}${last ? firstLetterOf(last) : ""}`;
}
