import { MAX_MEDIA_FILE_NAME_LENGTH } from "@ancla/contracts";

const FALLBACK_NAME = "file";
// Control characters and the ones Windows and shells treat as special.
// biome-ignore lint/suspicious/noControlCharactersInRegex: stripping them is the point.
const FORBIDDEN_CHARACTERS = /[\u0000-\u001f\u007f<>:"|?*\\/]/g;
const EDGE_DOTS_AND_SPACES = /^[\s.]+|[\s.]+$/g;

function splitExtension(name: string): { stem: string; extension: string } {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return { stem: name, extension: "" };
  return { stem: name.slice(0, dot), extension: name.slice(dot) };
}

/**
 * A file name that is safe to store, show and send in a header: no path, no control or special
 * characters, at most 200 characters (the extension is kept when cutting).
 */
export function sanitizeFileName(rawName: string): string {
  const lastSegment = rawName.split(/[\\/]/).pop() ?? "";
  const cleaned = lastSegment
    .normalize("NFC")
    .replace(FORBIDDEN_CHARACTERS, "")
    .replace(/\s+/g, " ")
    .replace(EDGE_DOTS_AND_SPACES, "");
  if (cleaned === "") return FALLBACK_NAME;
  if (cleaned.length <= MAX_MEDIA_FILE_NAME_LENGTH) return cleaned;
  const { stem, extension } = splitExtension(cleaned);
  const keptExtension =
    extension.length < MAX_MEDIA_FILE_NAME_LENGTH / 2 ? extension : "";
  return (
    stem.slice(0, MAX_MEDIA_FILE_NAME_LENGTH - keptExtension.length) +
    keptExtension
  );
}
