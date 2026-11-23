export interface TtlCache<Value> {
  get(key: string): Value | undefined;
  set(key: string, value: Value): void;
  clear(): void;
}

/** In-memory cache whose entries expire `ttlMs` after being set. `now` is injected for tests. */
export function createTtlCache<Value>(
  ttlMs: number,
  now: () => number = Date.now,
): TtlCache<Value> {
  const entries = new Map<string, { value: Value; expiresAt: number }>();
  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt <= now()) {
        entries.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key, value) {
      entries.set(key, { value, expiresAt: now() + ttlMs });
    },
    clear() {
      entries.clear();
    },
  };
}
