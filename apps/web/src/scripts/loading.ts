import { gsap } from './scroll/lenis';

const STORAGE_KEY = 'elancla:loader-seen';
const CREAM = '#f4efe6';
const RED = '#a8141b';

type WindowWithLoader = typeof window & { __elanclaLoader?: boolean };

/** First visit only: draw + forge the anchor on dark, fade the ground, fly the anchor to the nav logo. */
export function initLoadingOverlay(): void {
  const w = window as WindowWithLoader;
  if (w.__elanclaLoader) return; // persisted across ClientRouter navigations
  w.__elanclaLoader = true;

  const root = document.documentElement;
  const ground = document.querySelector<HTMLElement>('[data-site-loader]');
  const anchor = document.querySelector<HTMLElement>('[data-ldr-anchor]');
  const cap = document.querySelector<HTMLElement>('[data-ldr-cap]');
  const outline = anchor?.querySelector<SVGPathElement>('[data-anchor-outline]');
  const clip = anchor?.querySelector<SVGRectElement>('[data-anchor-clip]');

  const release = () => root.classList.remove('site-loader-lock', 'site-loader-pending');
  const finish = () => {
    root.classList.remove('site-loader-pending', 'site-loader-lock');
    ground?.classList.remove('is-active');
    anchor?.classList.remove('is-active');
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Storage can be disabled; the intro would simply replay on the next visit.
    }
  };

  const seen = (() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  })();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (seen || reduced || !ground || !anchor || !cap || !outline || !clip) {
    finish();
    return;
  }

  ground.classList.add('is-active');
  anchor.classList.add('is-active');
  gsap.set(cap, { y: 8 });
  root.classList.add('site-loader-lock'); // hold the hero + Lenis until the ground fades
  const navLogo = document.querySelector<HTMLElement>('[data-nav-anchor]');
  if (navLogo) gsap.set(navLogo, { opacity: 0 });

  gsap.set(outline, { strokeDashoffset: 1 });
  gsap.set(clip, { attr: { y: 254 } });
  gsap.set(anchor, { opacity: 1, color: CREAM, transformOrigin: '0 0' });

  const tl = gsap.timeline({ onComplete: finish });
  tl.to(outline, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut' }, 0.4)
    .to(clip, { attr: { y: 0 }, duration: 1.3, ease: 'power2.inOut' }, 1.5)
    .to(cap, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.4)
    .to(cap, { opacity: 0, duration: 0.6, ease: 'power2.in' }, 2.2)
    // Ground fades out, the page underneath is released and the anchor turns red.
    .call(release, [], 3.0)
    .to(ground, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, 3.0)
    .to(anchor, { color: RED, duration: 0.9, ease: 'power2.inOut' }, 3.0)
    .add(() => {
      const target = navLogo?.getBoundingClientRect();
      const from = anchor.getBoundingClientRect();
      if (!target || target.width === 0) {
        gsap.to(anchor, { opacity: 0, duration: 0.6 });
        return;
      }
      gsap.to(anchor, {
        x: target.left - from.left,
        y: target.top - from.top,
        scale: target.width / from.width,
        duration: 1.3,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.set(anchor, { opacity: 0 });
          gsap.set(navLogo, { opacity: 1 });
        },
      });
    }, 3.9)
    .set({}, {}, 5.3);
}
