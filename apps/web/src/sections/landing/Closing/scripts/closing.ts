import { gsap } from 'src/scripts/lenis';

/** Closing: the anchor is completed (outline, fill) and the map pin drops as the section arrives. */
export function initClosing(root: HTMLElement): void {
  const sec = root.querySelector<HTMLElement>('[data-ln="closing"]');
  const card = sec?.querySelector<HTMLElement>('[data-end-card]');
  const outline = sec?.querySelector<SVGPathElement>(
    '[data-end-in] [data-anchor-outline]'
  );
  const clip = sec?.querySelector<SVGRectElement>(
    '[data-end-in] [data-anchor-clip]'
  );
  const pin = sec?.querySelector<SVGGElement>('[data-end-pin]');
  if (!sec || !card || !outline || !clip || !pin) return;
  const ins = sec.querySelectorAll('[data-end-in]');

  gsap.set(ins, { opacity: 0, y: 18 });
  gsap.set(card, { opacity: 0, clipPath: 'inset(6% 4% round 56px)' });
  gsap.set(outline, { strokeDashoffset: 1 });
  gsap.set(clip, { attr: { y: 254 } });
  gsap.set(pin, { opacity: 0, y: -30 });

  gsap
    .timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: sec,
        start: 'top 80%',
        end: 'top 5%',
        scrub: 0.6,
      },
    })
    .to(ins, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, 0)
    .to(
      card,
      { opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 40px)', duration: 1 },
      0.2
    )
    .to(
      outline,
      { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' },
      0.1
    )
    .to(clip, { attr: { y: 0 }, duration: 0.6, ease: 'power2.inOut' }, 0.6)
    .to(pin, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, 1);
}
