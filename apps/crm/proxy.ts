import { DEV_BYPASS_ACCESS } from "./lib/authz/devBypassAccess";
import { loadAccessFromApi } from "./lib/authz/loadAccessFromApi";
import { isDevAuthBypassEnabled } from "./lib/dev-auth-bypass";
import { createProxy } from "./lib/proxy/createProxy";
import { readMediaOrigins } from "./lib/security";

export const proxy = createProxy({
  // The development bypass has no session to ask the API about.
  loadAccess: (cookie) =>
    isDevAuthBypassEnabled() ? Promise.resolve(DEV_BYPASS_ACCESS) : loadAccessFromApi(cookie),
  isDevBypass: isDevAuthBypassEnabled,
  isDevelopment: () => process.env.NODE_ENV === "development",
  mediaOrigins: () => readMediaOrigins(process.env),
  createNonce: () => Buffer.from(crypto.randomUUID()).toString("base64"),
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
