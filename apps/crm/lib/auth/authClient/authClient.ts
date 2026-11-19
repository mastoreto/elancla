"use client";

import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client for the browser. The server lives in `@ancla/api` (`/api/auth/*`, same
 * origin), so the session cookie travels by itself.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [twoFactorClient()],
});
