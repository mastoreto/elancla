import { YOUTUBE_ID_PATTERN } from "@ancla/contracts";

const PLAYLIST_ID_PATTERN = /^PL[A-Za-z0-9_-]{10,40}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);
const SHORT_HOST = "youtu.be";
/** `/<prefix>/<id>` paths that carry a video id. */
const VIDEO_PATH_PREFIXES = new Set(["embed", "shorts", "live", "v"]);

function parseUrl(input: string): URL | null {
  try {
    const url = new URL(input);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function videoIdFromUrl(url: URL): string | null {
  const segments = url.pathname.split("/").filter(Boolean);
  if (url.hostname === SHORT_HOST) return segments[0] ?? null;
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;
  if (url.pathname === "/watch") return url.searchParams.get("v");
  const [prefix, id] = segments;
  return prefix && VIDEO_PATH_PREFIXES.has(prefix) ? (id ?? null) : null;
}

/** A bare video id, or the id inside a watch / short / embed / live URL. `null` otherwise. */
export function parseYoutubeVideoId(input: string): string | null {
  const text = input.trim();
  if (YOUTUBE_ID_PATTERN.test(text)) return text;
  const url = parseUrl(text);
  const id = url ? videoIdFromUrl(url) : null;
  return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
}

/** A bare playlist id, or the `list` parameter of a YouTube URL. `null` otherwise. */
export function parseYoutubePlaylistId(input: string): string | null {
  const text = input.trim();
  if (PLAYLIST_ID_PATTERN.test(text)) return text;
  const url = parseUrl(text);
  if (!url || !YOUTUBE_HOSTS.has(url.hostname)) return null;
  const id = url.searchParams.get("list");
  return id && PLAYLIST_ID_PATTERN.test(id) ? id : null;
}
