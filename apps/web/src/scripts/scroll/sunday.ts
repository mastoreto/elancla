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

  let current = -1;
  const mark = (i: number) => {
    if (i === current) return;
    current = i;
    rows.forEach((r, k) => {
      r.classList.toggle('is-active', k === i);
    });
  };

  if (isDesktop) {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: '+=110%',
      pin: true,
      toggleClass: { targets: sec, className: 'is-pinned' },
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
    // Stacked layout: highlight the row closest to the reading line.
    const pick = () => {
      const line = window.innerHeight * 0.55;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      rows.forEach((row, k) => {
        const r = row.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - line);
        if (dist < bestDist) {
          bestDist = dist;
          best = k;
        }
      });
      mark(best);
    };
    ScrollTrigger.create({
      trigger: sec,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: pick,
      onRefresh: pick,
    });
  }
}
