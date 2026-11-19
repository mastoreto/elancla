import type { GoogleCredentials } from "../../src/core/auth";

export interface FakeGoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified?: boolean;
}

function encodeSegment(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

/**
 * Stands in for Google without network: ids tokens are unsigned and only the ones minted here
 * verify. Better Auth is told to use these through the provider's `verifyIdToken` / `getUserInfo`
 * options (core dist/oauth2/verify-id-token.mjs, dist/social-providers/google.mjs).
 */
export function createFakeGoogle(): {
  credentials: GoogleCredentials;
  idTokenFor(profile: FakeGoogleProfile): string;
} {
  const minted = new Set<string>();
  return {
    credentials: {
      clientId: "fake-client-id",
      clientSecret: "fake-client-secret",
      overrides: {
        verifyIdToken: async (token) => minted.has(token),
        getUserInfo: async (tokens) => {
          const payload = tokens.idToken?.split(".")[1];
          if (!payload) return null;
          const claims = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf8"),
          );
          return {
            user: {
              id: claims.sub,
              name: claims.name,
              email: claims.email,
              image: claims.picture,
              emailVerified: claims.email_verified,
            },
            data: claims,
          };
        },
      },
    },
    idTokenFor(profile) {
      const token = [
        encodeSegment({ alg: "none" }),
        encodeSegment({
          sub: profile.sub,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          email_verified: profile.emailVerified ?? true,
        }),
        "fake-signature",
      ].join(".");
      minted.add(token);
      return token;
    },
  };
}
