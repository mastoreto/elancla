import { gsap, whenUnlocked } from './lenis';

/** Hero: time-based entrance (outline draws, then the anchor is forged), scroll-based exit. */
export function initHero(root: HTMLElement): void {
  const hero = root.querySelector<HTMLElement>('[data-ln="hero"]');
  if (!hero) return;
  const q = <T extends Element>(s: string) => hero.querySelector<T>(s);
  const ins = hero.querySelectorAll('[data-hero-in]');
  const facts = hero.querySelectorAll('.ln-fact');
  const photo = q<HTMLElement>('[data-hero-photo]');
  const photoImg = q<HTMLElement>('[data-hero-photo] img');
  const anchorBox = q<HTMLElement>('[data-hero-anchor]');
  const anchorSvg = q<SVGElement>('[data-hero-anchor] svg');
  const outline = q<SVGPathElement>('[data-hero-anchor] [data-anchor-outline]');
  const clip = q<SVGRectElement>('[data-hero-anchor] [data-anchor-clip]');
  const tag = q<HTMLElement>('[data-hero-tag]');
  const text = q<HTMLElement>('.ln-hero__text');
  const factsBox = q<HTMLElement>('.ln-hero__facts');
  if (
    !photo ||
    !photoImg ||
    !anchorBox ||
    !anchorSvg ||
    !outline ||
    !clip ||
    !tag ||
    !text ||
    !factsBox
  )
    return;

  gsap.set(ins, { opacity: 0, y: 22, filter: 'blur(6px)' });
  gsap.set(facts, { opacity: 0, y: 22 });
  gsap.set(photo, { opacity: 0, y: 22 });
  gsap.set(outline, { strokeDashoffset: 1 });
  gsap.set(clip, { attr: { y: 254 } });
  gsap.set(tag, { opacity: 0, y: 8 });

  const intro = gsap.timeline({ paused: true });
  intro
    .to(photo, { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out' }, 0.2)
    .to(
      ins,
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.4,
        stagger: 0.15,
        ease: 'power3.out',
      },
      0.1
    )
    .to(
      facts,
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out' },
      1
    )
    .to(
      outline,
      { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut' },
      0.5
    )
    .to(clip, { attr: { y: 0 }, duration: 2.4, ease: 'power2.inOut' }, 2.6)
    .to(tag, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.8)
    .to(tag, { opacity: 0, duration: 0.7 }, 4.4);
  whenUnlocked(() => intro.play());

  // ponytail: gentle float only starts after the forge, like the design (loops forever).
  gsap.to(anchorSvg, {
    y: -8,
    duration: 3.5,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    delay: 5,
  });

  const scrub = {
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  };
  gsap.to(photoImg, { yPercent: -10, ease: 'none', scrollTrigger: scrub });
  gsap.to(anchorBox, { y: -140, ease: 'none', scrollTrigger: scrub });
  gsap.to(text, {
    y: -60,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { ...scrub, end: 'bottom 35%' },
  });
  gsap.to(factsBox, {
    y: -40,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { ...scrub, end: 'bottom 35%' },
  });
}
