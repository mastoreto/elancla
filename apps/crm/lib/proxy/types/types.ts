import type { MePermissionsDto } from "@ancla/contracts";

/** What the proxy decided for a request; `applyDecision` is the only place that builds responses. */
export type ProxyDecision =
  | { type: "next"; access?: MePermissionsDto }
  | { type: "redirect"; pathname: string; keepSearch: boolean }
  | { type: "rewrite"; pathname: string; access?: MePermissionsDto }
  | { type: "notFound" };

/** Loads the permissions of the session in this cookie header; `null` when it is not valid. */
export type AccessLoader = (cookie: string | null) => Promise<MePermissionsDto | null>;

export interface ProxyRequestFacts {
  pathname: string;
  cookie: string | null;
  hasSessionCookie: boolean;
  isDevBypass: boolean;
  isInternalRewrite: boolean;
}
