import { gsap } from './scroll/lenis';

const STORAGE_KEY = 'elancla:loader-seen';
const CREAM = '#f4efe6';
const RED = '#a8141b';
const ROUTE_TIMEOUT_MS = 6000;

type WindowWithLoader = typeof window & { __elanclaLoader?: boolean };

/**
 * Anchor intro: the anchor is drawn and forged on a dark ground, the ground fades while the page is
 * released, and the anchor turns red and flies to the nav logo. Plays on the first visit (full) and on
 * every page change (short: covers the old page, waits for the new one, then reveals it).
 */
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
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const seen = (() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  })();
  const remember = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Storage can be disabled; the full intro would simply replay on the next visit.
    }
  };
  const idle = () => {
    root.classList.remove('site-loader-pending', 'site-loader-lock');
    ground?.classList.remove('is-active');
    anchor?.classList.remove('is-active');
  };

  if (reduced || !ground || !anchor || !cap || !outline || !clip) {
    idle();
    return;
  }
  const els = { ground, anchor, cap, outline, clip };
  const navLogo = () => document.querySelector<HTMLElement>('[data-nav-anchor]');
  const release = () => root.classList.remove('site-loader-lock', 'site-loader-pending');

  /** Ground fades out, the page is released, the anchor turns red and flies to the nav logo. */
  const reveal = (tl: gsap.core.Timeline, at: number) => {
    const logo = navLogo();
    tl.call(() => logo && gsap.set(logo, { opacity: 0 }), [], at)
      .call(release, [], at)
      .to(els.ground, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, at)
      .to(els.anchor, { color: RED, duration: 0.9, ease: 'power2.inOut' }, at)
      .add(() => {
        const target = logo?.getBoundingClientRect();
        const from = els.anchor.getBoundingClientRect();
        if (!target || target.width === 0) {
          gsap.to(els.anchor, { opacity: 0, duration: 0.6 });
          return;
        }
        gsap.to(els.anchor, {
          x: target.left - from.left,
          y: target.top - from.top,
          scale: target.width / from.width,
          duration: 1.3,
          ease: 'power3.inOut',
          onComplete: () => {
            gsap.set(els.anchor, { opacity: 0 });
            if (logo) gsap.set(logo, { opacity: 1 });
          },
        });
      }, at + 0.9)
      .set({}, {}, at + 2.2);
  };

  const resetStage = (groundOpacity: number) => {
    els.ground.classList.add('is-active');
    els.anchor.classList.add('is-active');
    root.classList.add('site-loader-lock'); // hold the hero + Lenis until the ground fades
    gsap.set(els.ground, { opacity: groundOpacity });
    gsap.set(els.outline, { strokeDashoffset: 1 });
    gsap.set(els.clip, { attr: { y: 254 } });
    gsap.set(els.cap, { opacity: 0, y: 8 });
    gsap.set(els.anchor, { x: 0, y: 0, scale: 1, opacity: 1, color: CREAM, transformOrigin: '0 0' });
  };

  const playFirstVisit = () => {
    resetStage(1);
    const logo = navLogo();
    if (logo) gsap.set(logo, { opacity: 0 });
    const tl = gsap.timeline({
      onComplete: () => {
        idle();
        remember();
      },
    });
    tl.to(els.outline, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut' }, 0.4)
      .to(els.clip, { attr: { y: 0 }, duration: 1.3, ease: 'power2.inOut' }, 1.5)
      .to(els.cap, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.4)
      .to(els.cap, { opacity: 0, duration: 0.6, ease: 'power2.in' }, 2.2);
    reveal(tl, 3.0);
  };

  let routeRunning = false;
  let coverDone = false;
  let pageReady = false;
  let routeTimeout: number | undefined;

  const playReveal = () => {
    if (!routeRunning || !coverDone || !pageReady) return;
    routeRunning = false;
    window.clearTimeout(routeTimeout);
    const tl = gsap.timeline({ onComplete: idle });
    reveal(tl, 0);
  };

  const playRouteCover = () => {
    if (routeRunning) return;
    routeRunning = true;
    coverDone = false;
    pageReady = false;
    resetStage(0);
    gsap
      .timeline({
        onComplete: () => {
          coverDone = true;
          playReveal();
        },
      })
      .to(els.ground, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0)
      .to(els.outline, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.15)
      .to(els.clip, { attr: { y: 0 }, duration: 0.6, ease: 'power2.inOut' }, 0.5)
      .to(els.cap, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.3);
    // Never leave the page covered if the navigation stalls or fails.
    routeTimeout = window.setTimeout(() => {
      pageReady = true;
      playReveal();
    }, ROUTE_TIMEOUT_MS);
  };

  document.addEventListener('astro:before-preparation', playRouteCover);
  document.addEventListener('astro:page-load', () => {
    pageReady = true;
    playReveal();
  });

  if (seen) idle();
  else playFirstVisit();
}
