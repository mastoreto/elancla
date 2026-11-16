import { gsap } from './lenis';

/** "Dios no se quedó lejos": the statement is revealed word by word while the section is pinned. */
export function initGod(root: HTMLElement, isDesktop: boolean): void {
  const sec = root.querySelector<HTMLElement>('[data-ln="god"]');
  if (!sec) return;
  const items = sec.querySelectorAll<HTMLElement>(
    '[data-god-w], [data-god-pic]'
  );
  const foot = sec.querySelector<HTMLElement>('[data-god-foot]');
  if (!foot || items.length === 0) return;

  gsap.set(sec.querySelectorAll('[data-god-w]'), { opacity: 0.13 });
  gsap.set(sec.querySelectorAll('[data-god-pic]'), { opacity: 0, scale: 0.6 });
  gsap.set(foot, { opacity: 0, y: 16 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: sec,
      start: 'top top',
      end: isDesktop ? '+=170%' : '+=140%', // ~1.7 screens: the statement reads in one deliberate gesture
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
    },
  });
  items.forEach((el, i) => {
    const at = i * 0.4;
    if (el.hasAttribute('data-god-pic')) {
      tl.to(
        el,
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.6)' },
        at
      );
    } else {
      tl.to(el, { opacity: 1, duration: 0.8 }, at);
    }
  });
  tl.to(foot, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '>');
  tl.to({}, { duration: 1 }); // hold the finished statement before unpinning
}
