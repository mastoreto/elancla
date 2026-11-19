import { LOGIN_PATH, PUBLIC_ROUTE_SEGMENTS } from "../constants";

export function splitSegments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

/** The login page and the pages that work without a session. */
export function isPublicPath(pathname: string): boolean {
  return (
    pathname === LOGIN_PATH || PUBLIC_ROUTE_SEGMENTS.includes(splitSegments(pathname)[0] ?? "")
  );
}
