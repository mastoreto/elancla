import {
  type PersonContext,
  type PublicPersonDto,
  type PublicSiteSettingsDto,
  type PublicVisitDto,
  publicPersonDto,
  publicSiteSettingsDto,
  publicVisitDto,
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
}

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

  async function getJson(path: string): Promise<unknown> {
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
    if (!response.ok) {
      throw new PublicApiError(
        `Public API answered ${response.status}`,
        response.status,
      );
    }
    return response.json();
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
  };
}
