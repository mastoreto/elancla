import { type MePermissionsDto, mePermissionsDto } from "@ancla/contracts";

/**
 * Internal request header that carries the access the proxy already loaded, so the layout does not
 * ask the API again. The proxy deletes any copy sent by the client before it sets its own.
 */
export const ACCESS_HEADER = "x-iekklesia-access";

// base64 keeps non-ASCII role names valid in a header value.
export function serializeAccess(access: MePermissionsDto): string {
  return Buffer.from(JSON.stringify(access)).toString("base64");
}

/** The access in a header value, or `null` when it is missing or malformed (caller then fetches). */
export function parseAccess(value: string | null): MePermissionsDto | null {
  if (!value) return null;
  try {
    const parsed = mePermissionsDto.safeParse(
      JSON.parse(Buffer.from(value, "base64").toString("utf8")),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
