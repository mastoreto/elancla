import { gsap, ScrollTrigger } from './lenis';

/** First Sunday: the card reveals on entry; rows highlight one by one as the section is pinned. */
export function initSunday(root: HTMLElement, isDesktop: boolean): void {
  const sec = root.querySelector<HTMLElement>('[data-ln="sunday"]');
  const photo = sec?.querySelector<HTMLElement>('[data-sun-photo]');
  if (!sec || !photo) return;
  const ins = sec.querySelectorAll('[data-sun-in]');
  const rows = [...sec.querySelectorAll<HTMLElement>('[data-sun-row]')];

  gsap.set(photo, { opacity: 0, clipPath: 'inset(8% 6% round 56px)' });
  gsap.set(ins, { opacity: 0, y: 18 });

  gsap
    .timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: sec,
        start: 'top 85%',
        end: 'top 15%',
        scrub: 0.6,
      },
    })
    .to(
      photo,
      { opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 40px)', duration: 1 },
      0
    )
    .to(ins, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.1);

  if (isDesktop) {
    let current = -1;
    const mark = (i: number) => {
      if (i === current) return;
      current = i;
      rows.forEach((r, k) => {
        r.classList.toggle('is-active', k === i);
      });
    };
    ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: '+=180%',
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) =>
        mark(
          Math.min(rows.length - 1, Math.floor(self.progress * rows.length))
        ),
      onRefresh: (self) =>
        mark(
          Math.min(rows.length - 1, Math.floor(self.progress * rows.length))
        ),
    });
  } else {
    for (const row of rows) {
      ScrollTrigger.create({
        trigger: row,
        start: 'top 65%',
        end: 'bottom 45%',
        toggleClass: { targets: row, className: 'is-active' },
      });
    }
  }
}
