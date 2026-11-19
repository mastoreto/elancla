export interface RegisteredRoute {
  method: string;
  /** Hono path pattern, e.g. `/api/roles/:id`. */
  path: string;
}

export interface MatrixCall {
  method: string;
  /** Concrete path the matrix requested, with the `/api` prefix. */
  path: string;
  /** Status the matrix row expects. */
  expected: number;
}

const DENIED_STATUSES: readonly number[] = [401, 403];
/** `app.use` middleware is registered with this method; it is not an endpoint. */
const MIDDLEWARE_METHOD = "ALL";
const WILDCARD_SUFFIX = "/*";

function escapeRegex(text: string): string {
  return text.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
}

/** `/api/roles/:id` -> a regex that matches `/api/roles/<one segment>`. */
function patternToRegex(pattern: string): RegExp {
  const source = pattern
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) return "[^/]+";
      if (segment === "*") return ".*";
      return escapeRegex(segment);
    })
    .join("/");
  return new RegExp(`^${source}$`);
}

function isPublic(path: string, publicRoutes: readonly string[]): boolean {
  return publicRoutes.some((entry) =>
    entry.endsWith(WILDCARD_SUFFIX)
      ? path.startsWith(entry.slice(0, -1))
      : entry === path,
  );
}

/**
 * `METHOD path` of every registered endpoint that no matrix row proves is guarded, i.e. none expects
 * 401/403 for it. Endpoints listed in `publicRoutes` (exact path, or a prefix ending in `/*`) are
 * exempt: they are public on purpose and have their own tests.
 */
export function findUnguardedRoutes(
  routes: readonly RegisteredRoute[],
  calls: readonly MatrixCall[],
  publicRoutes: readonly string[],
): string[] {
  const denied = calls.filter((call) =>
    DENIED_STATUSES.includes(call.expected),
  );
  const keys = new Set<string>();
  for (const route of routes) {
    if (
      route.method === MIDDLEWARE_METHOD ||
      isPublic(route.path, publicRoutes)
    )
      continue;
    const matcher = patternToRegex(route.path);
    const covered = denied.some(
      (call) => call.method === route.method && matcher.test(call.path),
    );
    if (!covered) keys.add(`${route.method} ${route.path}`);
  }
  return [...keys].sort();
}
