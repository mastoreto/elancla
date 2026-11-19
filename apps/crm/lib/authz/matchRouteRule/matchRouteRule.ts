import { ROUTE_RULES, type RouteRule } from "../routeRules";

const WILDCARD = "*";

function splitPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

function matches(rule: RouteRule, segments: string[]): boolean {
  const ruleSegments = splitPath(rule.path);
  return (
    ruleSegments.length <= segments.length &&
    ruleSegments.every((part, index) => part === WILDCARD || part === segments[index])
  );
}

/** The most specific rule for an internal pathname (longest prefix), or `undefined`. */
export function matchRouteRule(
  pathname: string,
  rules: readonly RouteRule[] = ROUTE_RULES,
): RouteRule | undefined {
  const segments = splitPath(pathname);
  return rules
    .filter((rule) => matches(rule, segments))
    .sort((a, b) => splitPath(b.path).length - splitPath(a.path).length)[0];
}
