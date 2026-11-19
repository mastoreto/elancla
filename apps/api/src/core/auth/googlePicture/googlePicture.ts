/**
 * Reads the `picture` claim of a Google id token without verifying it: the token was already
 * verified by Better Auth when the account was linked. Claim name: core
 * dist/social-providers/google.mjs (`image: user.picture`).
 */
export function readGooglePicture(
  idToken: string | null | undefined,
): string | null {
  const payload = idToken?.split(".")[1];
  if (!payload) return null;
  try {
    const claims: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (typeof claims !== "object" || claims === null) return null;
    const picture = (claims as { picture?: unknown }).picture;
    return typeof picture === "string" && picture.startsWith("https://")
      ? picture
      : null;
  } catch {
    return null;
  }
}
