import type { AppType } from "@ancla/api";
import { hc } from "hono/client";

/**
 * Typed API client for the browser: same origin, so the session cookie travels by itself.
 * Server Components use `createServerApiClient` instead, which skips the network.
 */
export const apiClient = hc<AppType>("/api");
