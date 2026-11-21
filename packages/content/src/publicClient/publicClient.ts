import {
  type PersonContext,
  type PublicBlogIndexDto,
  type PublicMinistriesDto,
  type PublicMinistryDto,
  type PublicPageDto,
  type PublicPageSummaryDto,
  type PublicPersonDto,
  type PublicPostDto,
  type PublicSiteSettingsDto,
  type PublicVisitDto,
  publicBlogIndexDto,
  publicMinistriesDto,
  publicMinistryDto,
  publicPageDto,
  publicPageListDto,
  publicPersonDto,
  publicPostDto,
  publicSiteSettingsDto,
  publicVisitDto,
  type RecordPostViewBody,
} from "@ancla/contracts";

const DEFAULT_TIMEOUT_MS = 2000;

export interface PublicClientOptions {
  /** Origin of the API, e.g. `https://crm.example.org` (the `/api` prefix is added here). */
  baseUrl: string;
  /** The site key: `sk_<keyId>_<secret>`. Server side only, never shipped to the browser. */
  apiKey: string;
  churchSlug: string;
  /** Injectable for tests. */
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
}

export interface PublicClient {
  /** Site settings in `locale` (the church default when omitted or not enabled). */
  getSettings(locale?: string): Promise<PublicSiteSettingsDto>;
  /** People visible in `context`, already ordered by the API, with bio and title in `locale`. */
  getPeople(context: PersonContext, locale: string): Promise<PublicPersonDto[]>;
  /** Visit page directions and editable FAQ, resolved by the API in `locale` with fallback. */
  getVisit(locale: string): Promise<PublicVisitDto>;
  /** Published simple pages (title and slug) in `locale`, for the footer, sitemap and llms.txt. */
  getPages(locale: string): Promise<PublicPageSummaryDto[]>;
  /** One simple page by the slug of any of its languages; `null` when it does not exist or is paused. */
  getPage(slug: string, locale: string): Promise<PublicPageDto | null>;
  /** The blog index (visible posts, featured, categories, series, archive...) in `locale`. */
  getPosts(locale: string): Promise<PublicBlogIndexDto>;
  /** One visible post by the slug of any of its languages; `null` when there is none. */
  getPost(slug: string, locale: string): Promise<PublicPostDto | null>;
  /** The visible ministries and the ordered landing mosaic in `locale`. */
  getMinistries(locale: string): Promise<PublicMinistriesDto>;
  /** One visible ministry by the slug of any of its languages; `null` when there is none. */
  getMinistry(slug: string, locale: string): Promise<PublicMinistryDto | null>;
  /**
   * Counts an anonymous view. `visitor.ip` is also sent as `x-forwarded-for`: the API rate limits
   * per forwarded address, so without it every visitor of the site would share one bucket.
   */
  recordPostView(slug: string, visitor: RecordPostViewBody): Promise<void>;
}

// What `fetch` accepts as a header value, and what an address looks like: anything else is not
// forwarded (the body still carries it for the hash).
const FORWARDABLE_ADDRESS = /^[0-9a-fA-F:.]{1,64}$/;

/** The API answered with something other than success, or not with what the contract says. */
export class PublicApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
    this.name = "PublicApiError";
  }
}

/**
 * Client of the public content API (`/api/public/v1/:churchSlug/...`). Every response is parsed
 * with the shared contract at the border, so a drifting API fails here, not deep in a page.
 * Each phase adds its endpoint (posts, events, ministries...) next to `getSettings`.
 */
export function createPublicClient(options: PublicClientOptions): PublicClient {
  const {
    apiKey,
    churchSlug,
    fetch: fetchImplementation = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;
  const baseUrl = options.baseUrl.replace(/\/+$/, "");

  /** `null` for a 404 only when the caller asks: for a page by slug it means "does not exist". */
  async function getJson(
    path: string,
    options?: { nullOn404: true },
  ): Promise<unknown> {
    const response = await fetchImplementation(
      `${baseUrl}/api/public/v1/${encodeURIComponent(churchSlug)}${path}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
    if (options?.nullOn404 && response.status === 404) return null;
    if (!response.ok) {
      throw new PublicApiError(
        `Public API answered ${response.status}`,
        response.status,
      );
    }
    return response.json();
  }

  async function postView(
    slug: string,
    visitor: RecordPostViewBody,
  ): Promise<void> {
    const response = await fetchImplementation(
      `${baseUrl}/api/public/v1/${encodeURIComponent(churchSlug)}/posts/${encodeURIComponent(slug)}/views`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(FORWARDABLE_ADDRESS.test(visitor.ip)
            ? { "X-Forwarded-For": visitor.ip }
            : {}),
        },
        body: JSON.stringify({ ip: visitor.ip, userAgent: visitor.userAgent }),
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
    if (!response.ok) {
      throw new PublicApiError(
        `Public API answered ${response.status}`,
        response.status,
      );
    }
  }

  return {
    async getSettings(locale) {
      const query = locale ? `?locale=${encodeURIComponent(locale)}` : "";
      const parsed = publicSiteSettingsDto.safeParse(
        await getJson(`/settings${query}`),
      );
      if (!parsed.success) {
        throw new PublicApiError(
          "Public API settings do not match the contract",
          null,
        );
      }
      return parsed.data;
    },
    async getPeople(context, locale) {
      const query = `?context=${encodeURIComponent(context)}&locale=${encodeURIComponent(locale)}`;
      const body = await getJson(`/people${query}`);
      const parsed = Array.isArray(body)
        ? body.map((item) => publicPersonDto.safeParse(item))
        : [];
      if (!Array.isArray(body) || parsed.some((result) => !result.success)) {
        throw new PublicApiError(
          "Public API people do not match the contract",
          null,
        );
      }
      return parsed.flatMap((result) => (result.success ? [result.data] : []));
    },
    async getVisit(locale) {
      const parsed = publicVisitDto.safeParse(
        await getJson(`/visit?locale=${encodeURIComponent(locale)}`),
      );
      if (!parsed.success) {
        throw new PublicApiError(
          "Public API visit does not match the contract",
          null,
        );
      }
      return parsed.data;
    },
    async getPages(locale) {
      const parsed = publicPageListDto.safeParse(
        await getJson(`/pages?locale=${encodeURIComponent(locale)}`),
      );
      if (!parsed.success) {
        throw new PublicApiError(
          "Public API pages do not match the contract",
          null,
        );
      }
      return parsed.data.items;
    },
    async getPage(slug, locale) {
      const body = await getJson(
        `/pages/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
        { nullOn404: true },
      );
      if (body === null) return null;
      const parsed = publicPageDto.safeParse(body);
      if (!parsed.success) {
        throw new PublicApiError(
          "Public API page does not match the contract",
          null,
        );
      }
      return parsed.data;
    },
    async getPosts(locale) {
      const parsed = publicBlogIndexDto.safeParse(
        await getJson(`/posts?locale=${encodeURIComponent(locale)}`),
      );
      if (!parsed.success) {
        throw new PublicApiError(
          "Public API posts do not match the contract",
          null,
        );
      }
      return parsed.data;
    },
    async getPost(slug, locale) {
      const body = await getJson(
        `/posts/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
        { nullOn404: true },
      );
      if (body === null) return null;
      const parsed = publicPostDto.safeParse(body);
      if (!parsed.success) {
        throw new PublicApiError(
          "Public API post does not match the contract",
          null,
        );
      }
      return parsed.data;
    },
    async getMinistries(locale) {
      const parsed = publicMinistriesDto.safeParse(
        await getJson(`/ministries?locale=${encodeURIComponent(locale)}`),
      );
      if (!parsed.success) {
        throw new PublicApiError(
          "Public API ministries do not match the contract",
          null,
        );
      }
      return parsed.data;
    },
    async getMinistry(slug, locale) {
      const body = await getJson(
        `/ministries/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
        { nullOn404: true },
      );
      if (body === null) return null;
      const parsed = publicMinistryDto.safeParse(body);
      if (!parsed.success) {
        throw new PublicApiError(
          "Public API ministry does not match the contract",
          null,
        );
      }
      return parsed.data;
    },
    recordPostView: postView,
  };
}
