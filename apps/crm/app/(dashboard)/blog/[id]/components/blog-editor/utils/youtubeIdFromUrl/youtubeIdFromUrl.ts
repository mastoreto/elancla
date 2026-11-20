import { YOUTUBE_ID_PATTERN } from "@ancla/contracts";

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);
const SHORT_HOST = "youtu.be";
const PATH_PREFIXES_WITH_ID = ["embed", "shorts", "live", "v"];

function idOrNull(candidate: string | null | undefined): string | null {
  return candidate && YOUTUBE_ID_PATTERN.test(candidate) ? candidate : null;
}

function parseUrl(input: string): URL | null {
  try {
    return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    return null;
  }
}

/**
 * The YouTube video id of a pasted watch, short, embed or shorts URL (or of a bare id);
 * `null` when it is anything else.
 */
export function youtubeIdFromUrl(input: string): string | null {
  const text = input.trim();
  if (YOUTUBE_ID_PATTERN.test(text)) return text;

  const url = parseUrl(text);
  if (!url) return null;
  if (url.hostname === SHORT_HOST) return idOrNull(url.pathname.split("/")[1]);
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;

  const [first, second] = url.pathname.split("/").filter(Boolean);
  if (first === "watch") return idOrNull(url.searchParams.get("v"));
  if (first && PATH_PREFIXES_WITH_ID.includes(first)) return idOrNull(second);
  return null;
}
