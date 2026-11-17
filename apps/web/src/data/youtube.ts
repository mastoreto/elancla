// Server-only YouTube Data API v3 access (live detection + sermon library).
// Needs YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID; without them every function returns an
// empty result so the page renders its empty state instead of failing.
// ponytail: in-memory cache per server instance; move to a shared cache if it ever runs on many instances.

const API = 'https://www.googleapis.com/youtube/v3';
const MAX_SERMONS = 150; // 3 pages of 50 (1 quota unit each)

export interface Sermon {
  id: string;
  title: string;
  publishedAt: string;
  /** m:ss or h:mm:ss, like YouTube shows it. */
  duration: string;
}

export interface Series {
  id: string;
  title: string;
  count: number;
}

export interface LiveStream {
  id: string;
  title: string;
}

const env = (name: string) =>
  process.env[name] || (import.meta.env[name] as string | undefined);
const apiKey = () => env('YOUTUBE_API_KEY');
const channelId = () => env('YOUTUBE_CHANNEL_ID');
/** Every public upload (live streams included) lives in the "UU…" playlist of the channel. */
const uploadsPlaylist = () => `UU${(channelId() ?? '').slice(2)}`;
const sermonsPlaylist = () =>
  env('YOUTUBE_SERMONS_PLAYLIST_ID') || uploadsPlaylist();

export const isYoutubeConfigured = () => Boolean(apiKey() && channelId());

async function yt<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${API}/${endpoint}`);
  for (const [name, value] of Object.entries({
    ...params,
    key: apiKey() ?? '',
  })) {
    url.searchParams.set(name, value);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube ${endpoint} ${res.status}`);
  return (await res.json()) as T;
}

const cache = new Map<string, { at: number; value: unknown }>();

/** Fresh value if possible, else the stale one, else the fallback. A failed call is never cached. */
async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
  fallback: T
): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  try {
    const value = await load();
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (error) {
    console.error('[youtube]', error);
    return (hit?.value as T | undefined) ?? fallback;
  }
}

interface PlaylistItemsResponse {
  nextPageToken?: string;
  items: { contentDetails: { videoId: string } }[];
}
interface VideosResponse {
  items: {
    id: string;
    snippet: {
      title: string;
      publishedAt: string;
      liveBroadcastContent: 'none' | 'live' | 'upcoming';
    };
    contentDetails?: { duration: string };
  }[];
}

function formatDuration(iso: string): string {
  const [, h = '0', m = '0', s = '0'] =
    /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso) ?? [];
  const sec = s.padStart(2, '0');
  return Number(h) > 0 ? `${h}:${m.padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** The stream that is on air right now, or null. Costs 2 quota units (never use `search`: 100). */
export function getLiveStream(): Promise<LiveStream | null> {
  if (!isYoutubeConfigured()) return Promise.resolve(null);
  return cached<LiveStream | null>(
    'live',
    60_000,
    async () => {
      const recent = await yt<PlaylistItemsResponse>('playlistItems', {
        part: 'contentDetails',
        playlistId: uploadsPlaylist(),
        maxResults: '5',
      });
      const ids = recent.items.map((item) => item.contentDetails.videoId);
      if (!ids.length) return null;
      const videos = await yt<VideosResponse>('videos', {
        part: 'snippet',
        id: ids.join(','),
      });
      const live = videos.items.find(
        (video) => video.snippet.liveBroadcastContent === 'live'
      );
      return live ? { id: live.id, title: live.snippet.title } : null;
    },
    null
  );
}

/** Finished videos of a playlist (default: the sermons playlist, else every upload), newest first. */
export function getSermons(playlistId = sermonsPlaylist()): Promise<Sermon[]> {
  if (!isYoutubeConfigured()) return Promise.resolve([]);
  return cached<Sermon[]>(
    `sermons:${playlistId}`,
    60 * 60_000,
    async () => {
      const ids: string[] = [];
      let pageToken: string | undefined;
      do {
        const page = await yt<PlaylistItemsResponse>('playlistItems', {
          part: 'contentDetails',
          playlistId,
          maxResults: '50',
          ...(pageToken ? { pageToken } : {}),
        });
        ids.push(...page.items.map((item) => item.contentDetails.videoId));
        pageToken = page.nextPageToken;
      } while (pageToken && ids.length < MAX_SERMONS);

      const sermons: Sermon[] = [];
      for (let i = 0; i < ids.length; i += 50) {
        const videos = await yt<VideosResponse>('videos', {
          part: 'snippet,contentDetails',
          id: ids.slice(i, i + 50).join(','),
        });
        for (const video of videos.items) {
          // Skip streams that are live or scheduled; private/deleted videos are not returned at all.
          if (
            video.snippet.liveBroadcastContent !== 'none' ||
            !video.contentDetails
          )
            continue;
          sermons.push({
            id: video.id,
            title: video.snippet.title,
            publishedAt: video.snippet.publishedAt,
            duration: formatDuration(video.contentDetails.duration),
          });
        }
      }
      // `videos` does not keep the playlist order; restore it from `ids`.
      return sermons.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    },
    []
  );
}

/** Playlists of the channel (one per preaching series). */
export function getSeries(): Promise<Series[]> {
  if (!isYoutubeConfigured()) return Promise.resolve([]);
  return cached<Series[]>(
    'series',
    60 * 60_000,
    async () => {
      const res = await yt<{
        items: {
          id: string;
          snippet: { title: string };
          contentDetails: { itemCount: number };
        }[];
      }>('playlists', {
        part: 'snippet,contentDetails',
        channelId: channelId() ?? '',
        maxResults: '50',
      });
      return res.items
        .map((item) => ({
          id: item.id,
          title: item.snippet.title,
          count: item.contentDetails.itemCount,
        }))
        .filter((serie) => serie.count > 0 && serie.id !== sermonsPlaylist());
    },
    []
  );
}

export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const embedUrl = (id: string, autoplay = false) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0${autoplay ? '&autoplay=1' : ''}`;
