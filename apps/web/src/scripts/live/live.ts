// Site-wide live detection: polls /api/live and shows the red bar + header chip while the stream is on air.
// Dispatches `ancla:live` so the sermons page can swap its hero without a reload.
export interface LiveState {
  live: boolean;
  id?: string;
  title?: string;
}

const POLL_MS = 60_000;
const DISMISSED_KEY = 'elancla:live-dismissed';
let timer: number | undefined;
let last: LiveState | null = null;

function apply(state: LiveState): void {
  last = state;
  // Lets CSS make room for the bar (it pushes the fixed nav down).
  document.documentElement.classList.toggle('has-live-bar', state.live);
  document.querySelectorAll<HTMLElement>('[data-live-bar]').forEach((el) => {
    el.hidden = !state.live;
  });
  document.querySelectorAll<HTMLElement>('[data-live-on]').forEach((el) => {
    el.hidden = !state.live;
  });
  document.querySelectorAll<HTMLElement>('[data-live-off]').forEach((el) => {
    el.hidden = state.live;
  });
  showPopup(state);
  document.dispatchEvent(
    new CustomEvent<LiveState>('ancla:live', { detail: state })
  );
}

async function poll(): Promise<void> {
  if (document.hidden) return;
  try {
    const res = await fetch('/api/live');
    if (res.ok) apply((await res.json()) as LiveState);
  } catch {
    // Offline or API down: keep whatever is shown.
  }
}

export function initLive(): void {
  window.clearInterval(timer);
  bindPopup();
  // The header is re-rendered on every navigation: restore the last known state before polling again.
  if (last) apply(last);
  void poll();
  timer = window.setInterval(poll, POLL_MS);
}

/** Opens the "we are live" popup once per stream and session; never over the sermons page, whose hero already shows it. */
function showPopup(state: LiveState, attempt = 0): void {
  const dialog =
    document.querySelector<HTMLDialogElement>('[data-live-dialog]');
  if (!dialog || !state.live || !state.id || dialog.open) return;
  if (/^(\/(pt|en))?\/sermones(\/|$)/.test(location.pathname)) return;
  try {
    if (sessionStorage.getItem(DISMISSED_KEY) === state.id) return;
  } catch {
    // Storage blocked: the popup may show again on the next page.
  }
  // Wait for the loading animation to finish (up to ~10 s).
  const root = document.documentElement;
  if (
    root.classList.contains('site-loader-pending') ||
    root.classList.contains('site-loader-lock')
  ) {
    if (attempt < 20)
      window.setTimeout(() => showPopup(state, attempt + 1), 500);
    return;
  }
  dialog.dataset.videoId = state.id;
  dialog
    .querySelector<HTMLAnchorElement>('[data-live-dialog-youtube]')
    ?.setAttribute('href', `https://www.youtube.com/watch?v=${state.id}`);
  const thumb = dialog.querySelector<HTMLImageElement>(
    '[data-live-dialog-thumb]'
  );
  if (thumb) {
    thumb.hidden = false;
    thumb.onerror = () => {
      thumb.hidden = true; // no frame yet: the dark card with the play button still works
    };
    thumb.src = `https://i.ytimg.com/vi/${state.id}/mqdefault_live.jpg`;
  }
  dialog.showModal();
}

function bindPopup(): void {
  const dialog =
    document.querySelector<HTMLDialogElement>('[data-live-dialog]');
  if (!dialog || dialog.dataset.bound) return;
  dialog.dataset.bound = 'true';
  dialog.addEventListener('close', () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, dialog.dataset.videoId ?? '');
    } catch {
      // ignore
    }
  });
  dialog.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    // Backdrop click (target is the dialog itself) or any close control, links included.
    if (target === dialog || target.closest('[data-live-dialog-close]'))
      dialog.close();
  });
}
