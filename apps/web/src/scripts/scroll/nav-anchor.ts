import { ScrollTrigger } from './lenis';

const FULL = 254;

/** Nav logo starts as an outline and fills bottom-up with the page scroll. */
export function initNavAnchor(): void {
  const clip = document.querySelector<SVGRectElement>(
    '[data-nav-anchor] [data-anchor-clip]'
  );
  if (!clip) return;
  clip.setAttribute('y', String(FULL));
  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 0,
    end: 'max',
    onUpdate: (self) =>
      clip.setAttribute('y', String(FULL * (1 - self.progress))),
  });
}

/** Highlights the nav link of the section that currently crosses the middle of the viewport. */
export function initActiveNav(sectionIds: string[]): void {
  const links = document.querySelectorAll<HTMLElement>(
    '.nav-item[data-section]'
  );
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  let current = '';
  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 0,
    end: 'max',
    onUpdate: () => {
      const mid = window.innerHeight * 0.5;
      let active = '';
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= mid) active = section.id;
      }
      if (active === current) return;
      current = active;
      links.forEach((l) => {
        l.dataset.active = l.dataset.section === active ? 'true' : 'false';
      });
    },
  });
}
