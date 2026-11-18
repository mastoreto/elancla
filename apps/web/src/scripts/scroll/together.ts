import { gsap } from './lenis';

/** Ministries wall: tiles are laid like stones, bottom row first. */
export function initTogether(root: HTMLElement, isDesktop: boolean): void {
  const sec = root.querySelector<HTMLElement>('[data-ln="together"]');
  const rows = sec?.querySelector<HTMLElement>('[data-tog-rows]');
  const head = sec?.querySelector<HTMLElement>('[data-tog-head]');
  if (!sec || !rows || !head) return;
  const tiles = [...sec.querySelectorAll<HTMLElement>('[data-tile]')].sort(
    (a, b) => Number(a.dataset.tile) - Number(b.dataset.tile)
  );

  gsap.fromTo(
    head,
    { opacity: 0, y: 18 },
    {
      opacity: 1,
      y: 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: head,
        start: 'top 90%',
        end: 'top 60%',
        scrub: 0.5,
      },
    }
  );
  if (!isDesktop) {
    // Stacked layout: reading order, each tile enters on its own.
    for (const tile of sec.querySelectorAll<HTMLElement>('[data-tile]')) {
      gsap.fromTo(
        tile,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: tile,
            start: 'top 95%',
            end: 'top 72%',
            scrub: 0.5,
          },
        }
      );
    }
    return;
  }

  gsap.fromTo(
    tiles,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: rows,
        start: 'top 88%',
        end: 'bottom 72%',
        scrub: 0.5,
      },
    }
  );
}
