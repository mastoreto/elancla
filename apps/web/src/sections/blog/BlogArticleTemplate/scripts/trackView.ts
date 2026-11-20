// Counts one anonymous view of the post being read: after 10 seconds or at half the scroll,
// whichever comes first, once per load. The beacon goes to the web's own `/api/views`, which
// forwards it to the API (the browser never talks to the content API).

const VIEWS_ENDPOINT = '/api/views';
const VIEW_DELAY_MS = 10_000;
const SCROLL_THRESHOLD = 0.5;

/** Whether the reader has scrolled through at least half of what there is to scroll. */
export function hasScrolledHalf(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number
): boolean {
  const scrollable = scrollHeight - clientHeight;
  return scrollable > 0 && scrollTop / scrollable >= SCROLL_THRESHOLD;
}

function sendView(slug: string): void {
  const body = JSON.stringify({ slug });
  const sent =
    typeof navigator.sendBeacon === 'function' &&
    navigator.sendBeacon(
      VIEWS_ENDPOINT,
      new Blob([body], { type: 'application/json' })
    );
  if (sent) return;
  fetch(VIEWS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // A lost view is not worth bothering the reader.
  });
}

let stopTracking: (() => void) | null = null;

/** Starts tracking the post on the page (if any). Safe to call on every `astro:page-load`. */
export function trackView(): void {
  stopTracking?.();
  stopTracking = null;
  const slug = document.querySelector<HTMLElement>('[data-blog-view-slug]')
    ?.dataset.blogViewSlug;
  if (!slug) return;

  const controller = new AbortController();
  let timer = 0;
  const stop = () => {
    window.clearTimeout(timer);
    controller.abort();
  };
  const report = () => {
    stop();
    sendView(slug);
  };
  const onScroll = () => {
    const root = document.documentElement;
    if (hasScrolledHalf(root.scrollTop, root.scrollHeight, root.clientHeight)) {
      report();
    }
  };

  timer = window.setTimeout(report, VIEW_DELAY_MS);
  window.addEventListener('scroll', onScroll, {
    passive: true,
    signal: controller.signal,
  });
  // Leaving through the client router before either moment is not a view.
  document.addEventListener('astro:before-swap', stop, {
    once: true,
    signal: controller.signal,
  });
  stopTracking = stop;
}
