export interface CachedLoaderOptions<T> {
  /** Fetches the value for `key`. May throw: the last known good value (or the fallback) is served. */
  load: (key: string) => Promise<T>;
  /** Value served until the first success for `key`. */
  fallback: (key: string) => T;
  ttlMs: number;
  now?: () => number;
  warn?: (message: string, error: unknown) => void;
}

interface KeyState<T> {
  lastGood: { value: T } | null;
  nextAttemptAt: number;
  inFlight: Promise<T> | null;
}

/**
 * Cached reader with last-known-good per key. One attempt per TTL window (success or failure, so
 * an API that is down is not hit, and waited on, by every request) and one request in flight per
 * key. Before the first success the key's `fallback` is served.
 */
export function createCachedLoader<T>(
  options: CachedLoaderOptions<T>,
): (key: string) => Promise<T> {
  const {
    load,
    fallback,
    ttlMs,
    now = Date.now,
    warn = (message, error) => console.warn(message, error),
  } = options;
  const states = new Map<string, KeyState<T>>();

  function stateFor(key: string): KeyState<T> {
    let state = states.get(key);
    if (!state) {
      state = { lastGood: null, nextAttemptAt: 0, inFlight: null };
      states.set(key, state);
    }
    return state;
  }

  function current(key: string, state: KeyState<T>): T {
    return state.lastGood ? state.lastGood.value : fallback(key);
  }

  async function refresh(key: string, state: KeyState<T>): Promise<T> {
    try {
      state.lastGood = { value: await load(key) };
    } catch (error) {
      // Once per window, because the window is also the retry interval.
      warn(
        "[@ancla/content] public API unavailable, serving the last known value",
        error,
      );
    }
    state.nextAttemptAt = now() + ttlMs;
    return current(key, state);
  }

  return function get(key: string): Promise<T> {
    const state = stateFor(key);
    if (now() < state.nextAttemptAt)
      return Promise.resolve(current(key, state));
    state.inFlight ??= refresh(key, state).finally(() => {
      state.inFlight = null;
    });
    return state.inFlight;
  };
}
