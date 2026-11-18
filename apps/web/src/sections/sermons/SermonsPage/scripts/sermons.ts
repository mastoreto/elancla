import type { LiveState } from 'src/scripts/live';

const embed = (id: string, autoplay: boolean) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0${autoplay ? '&autoplay=1' : ''}`;
const normalize = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function initSermons(): void {
  const routeState = window as typeof window & {
    __elanclaSermonsController?: AbortController;
  };
  routeState.__elanclaSermonsController?.abort();
  const controller = new AbortController();
  routeState.__elanclaSermonsController = controller;
  const { signal } = controller;

  const hero = document.querySelector<HTMLElement>('[data-sermons-hero]');
  if (!hero) return;
  const frame = hero.querySelector<HTMLIFrameElement>('[data-player]');
  const title = hero.querySelector<HTMLElement>('[data-player-title]');
  const eyebrow = hero.querySelector<HTMLElement>('[data-player-eyebrow]');
  const chip = hero.querySelector<HTMLElement>('[data-player-chip]');

  function play(
    id: string,
    name: string,
    meta: string,
    autoplay: boolean,
    chipText?: string
  ): void {
    if (!frame) return;
    frame.src = embed(id, autoplay);
    if (title) title.textContent = name;
    if (eyebrow) eyebrow.textContent = meta;
    if (chip && chipText) chip.textContent = chipText;
  }

  // Click a sermon: play it in the hero player. Modified clicks keep the normal link to YouTube.
  const cards = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-sermon-card]')
  );
  for (const card of cards) {
    card.addEventListener(
      'click',
      (event) => {
        if (
          !frame ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        const { videoId = '', title: name = '', meta = '' } = card.dataset;
        play(videoId, name, meta, true, hero.dataset.playingChip);
        // Playing a sermon overrides the "live" look of the hero only for the player, not the stream state.
        frame
          .closest<HTMLElement>('[data-sermons-player]')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      { signal }
    );
  }

  // Stream started or ended while the page is open.
  document.addEventListener(
    'ancla:live',
    (event) => {
      const state = (event as CustomEvent<LiveState>).detail;
      const isLive = hero.dataset.live === 'true';
      if (state.live === isLive) return;
      // The server rendered the page without a player (no videos yet): easiest is to render it again.
      if (!frame) return location.reload();
      hero.dataset.live = String(state.live);
      if (state.live && state.id) {
        play(state.id, state.title ?? '', hero.dataset.liveMeta ?? '', false);
        hero
          .querySelector<HTMLAnchorElement>('[data-live-link]')
          ?.setAttribute('href', `https://www.youtube.com/watch?v=${state.id}`);
      } else if (hero.dataset.latestId) {
        play(
          hero.dataset.latestId,
          hero.dataset.latestTitle ?? '',
          hero.dataset.latestMeta ?? '',
          false,
          hero.dataset.latestChip
        );
      }
    },
    { signal }
  );

  // Search + "load more" over the cards already on the page.
  const list = document.querySelector<HTMLElement>('[data-sermons-list]');
  if (!list || cards.length === 0) return;
  const pageSize = Number(list.dataset.pageSize) || 9;
  const search = list.querySelector<HTMLInputElement>('[data-sermons-search]');
  const more = list.querySelector<HTMLElement>('[data-sermons-more]');
  const empty = list.querySelector<HTMLElement>('[data-sermons-empty]');
  let limit = pageSize;

  const render = () => {
    const query = normalize(search?.value.trim() ?? '');
    let matches = 0;
    for (const card of cards) {
      const match =
        !query || normalize(card.dataset.title ?? '').includes(query);
      if (match) matches += 1;
      card.hidden = !(match && matches <= limit);
    }
    if (more) more.hidden = matches <= limit;
    if (empty) empty.hidden = matches > 0;
  };

  search?.addEventListener(
    'input',
    () => {
      limit = pageSize;
      render();
    },
    { signal }
  );
  more?.addEventListener(
    'click',
    () => {
      limit += pageSize;
      render();
    },
    { signal }
  );
}
