import { gsap, ScrollTrigger } from './scroll/lenis';

const STORAGE_KEY = 'elancla:loader-seen';
const CREAM = '#f4efe6';
const RED = '#a8141b';
const ROUTE_TIMEOUT_MS = 6000;

type WindowWithLoader = typeof window & { __elanclaLoader?: boolean };

/** `home` plays the full intro and the anchor flight; every other page gets a short, flight-free loader. */
type Mode = 'home' | 'page';
const modeFor = (pathname: string): Mode => (/^\/(pt|en)?\/?$/.test(pathname) ? 'home' : 'page');

/**
 * Two loaders. Home: the anchor is drawn and forged on a dark ground, the ground fades while the page is
 * released, and the anchor turns red; as the visitor scrolls it flies to the nav logo. Plays on the first visit (full) and on
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
  const idleGround = () => {
    root.classList.remove('site-loader-pending', 'site-loader-lock', 'site-loader-page');
    ground?.classList.remove('is-active');
  };
  const idle = () => {
    idleGround();
    anchor?.classList.remove('is-active');
  };

  if (reduced || !ground || !anchor || !cap || !outline || !clip) {
    idle();
    return;
  }
  const hint = document.querySelector<HTMLElement>('[data-ldr-hint]');
  const els = { ground, anchor, cap, outline, clip, hint: hint ?? ground };
  const navLogo = () => document.querySelector<HTMLElement>('[data-nav-anchor]');
  // Only the home has a hero anchor for the intro anchor to replace and carry to the header.
  const isHome = () => !!document.querySelector('.ln-hero__anchor svg');
  const release = () => root.classList.remove('site-loader-lock', 'site-loader-pending', 'site-loader-page');
  const setMode = (mode: Mode) => {
    els.ground.dataset.mode = mode;
    els.anchor.dataset.mode = mode;
  };

  let flight: gsap.core.Tween | undefined;
  let settle: gsap.core.Tween | undefined;
  const killFlight = () => {
    settle?.kill();
    settle = undefined;
    flight?.scrollTrigger?.kill();
    flight?.kill();
    flight = undefined;
    root.classList.remove('ldr-floating');
    gsap.set(els.hint, { opacity: 0 });
  };

  /** The red anchor floats over the page and flies to the nav logo as the visitor scrolls. */
  const armFlight = (logo: HTMLElement | null, instant = false) => {
    killFlight();
    const target = logo?.getBoundingClientRect();
    const from = els.anchor.getBoundingClientRect();
    if (!isHome() || !logo || !target || target.width === 0) {
      // Any other page: no floating anchor, the header's own anchor stays in place.
      if (logo) gsap.set(logo, { clearProps: 'opacity' });
      gsap.to(els.anchor, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => els.anchor.classList.remove('is-active'),
      });
      return;
    }
    root.classList.add('ldr-floating'); // hides the hero's own anchor: this one takes its place
    const sync = (progress: number) => {
      const arrived = progress >= 0.999;
      gsap.set(els.anchor, { opacity: arrived ? 0 : 1 });
      gsap.set(logo, { opacity: arrived ? 1 : 0 });
      if (progress > 0.02) gsap.to(els.hint, { opacity: 0, duration: 0.3, overwrite: true });
    };
    const startFlight = () => {
      if (!instant) gsap.to(els.hint, { opacity: 1, duration: 0.8, delay: 0.3 });
      flight = gsap.to(els.anchor, {
        x: target.left - from.left,
        y: target.top - from.top,
        scale: target.width / from.width,
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: () => window.innerHeight * 0.55,
          scrub: 0.6,
          onUpdate: (self) => sync(self.progress),
        },
      });
      ScrollTrigger.refresh();
      sync(flight.scrollTrigger?.progress ?? 0); // honours a restored scroll position
    };
    // The anchor first settles where the hero's own anchor sits, then travels to the nav on scroll.
    const heroSvg = document.querySelector<SVGElement>('.ln-hero__anchor svg');
    const spot = heroSvg?.getBoundingClientRect();
    if (spot && spot.width > 0) {
      settle = gsap.to(els.anchor, {
        x: spot.left - from.left,
        y: spot.top - from.top,
        scale: spot.width / from.width,
        duration: instant ? 0 : 1.1,
        ease: 'power3.inOut',
        onComplete: startFlight,
      });
    } else {
      startFlight();
    }
  };

  /** Home: ground fades out, the page is released, the anchor turns red and flies to the nav logo. */
  const reveal = (tl: gsap.core.Timeline, at: number) => {
    const logo = navLogo();
    tl.call(() => logo && isHome() && gsap.set(logo, { opacity: 0 }), [], at)
      .call(release, [], at)
      .to(els.ground, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, at)
      .to(els.anchor, { color: RED, duration: 0.9, ease: 'power2.inOut' }, at)
      .add(() => armFlight(logo), at + 0.9)
      .set({}, {}, at + 2.2);
  };

  /** Other pages: no flight. Ground and small anchor fade out over the loaded page; the header logo stays put. */
  const revealPage = (tl: gsap.core.Timeline, at: number) => {
    tl.call(
      () => {
        const logo = navLogo();
        if (logo) gsap.set(logo, { clearProps: 'opacity' });
        release();
      },
      [],
      at
    )
      .to([els.ground, els.anchor], { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, at)
      .call(idle, [], at + 0.4);
  };

  const resetStage = (groundOpacity: number, mode: Mode) => {
    setMode(mode);
    els.ground.classList.add('is-active');
    els.anchor.classList.add('is-active');
    root.classList.add('site-loader-lock'); // hold the hero + Lenis until the ground fades
    gsap.set(els.ground, { opacity: groundOpacity });
    gsap.set(els.outline, { strokeDashoffset: 1 });
    gsap.set(els.clip, { attr: { y: 254 } });
    gsap.set(els.cap, { opacity: 0, y: 8 });
    gsap.set(els.anchor, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: mode === 'home' ? 1 : 0,
      color: mode === 'home' ? CREAM : RED,
      transformOrigin: '0 0',
    });
  };

  /** Short loader of the non-home pages: the small anchor is drawn and filled on a light ground. */
  const drawPageAnchor = (tl: gsap.core.Timeline, draw: number, fill: number) =>
    tl
      .to(els.ground, { opacity: 1, duration: 0.2, ease: 'power2.out' }, 0)
      .to(els.anchor, { opacity: 1, duration: 0.2 }, 0)
      .to(els.outline, { strokeDashoffset: 0, duration: draw, ease: 'power2.inOut' }, 0.05)
      .to(els.clip, { attr: { y: 0 }, duration: fill, ease: 'power2.inOut' }, 0.05 + draw * 0.55);

  const playFirstVisit = () => {
    if (modeFor(location.pathname) === 'page') {
      resetStage(1, 'page');
      const tl = gsap.timeline({
        onComplete: () => {
          idle();
          remember();
        },
      });
      drawPageAnchor(tl, 0.6, 0.45);
      revealPage(tl, 1.1);
      return;
    }
    resetStage(1, 'home');
    const logo = navLogo();
    if (logo && isHome()) gsap.set(logo, { opacity: 0 });
    const tl = gsap.timeline({
      onComplete: () => {
        idleGround();
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
  let routeMode: Mode = 'home';
  let coverDone = false;
  let pageReady = false;
  let routeTimeout: number | undefined;

  const playReveal = () => {
    if (!routeRunning || !coverDone || !pageReady) return;
    routeRunning = false;
    window.clearTimeout(routeTimeout);
    const tl = gsap.timeline({ onComplete: idleGround });
    if (routeMode === 'home') reveal(tl, 0);
    else revealPage(tl, 0);
  };

  /** The loader that covers the old page depends on where the visitor is going. */
  const playRouteCover = (event: Event) => {
    if (routeRunning) return;
    routeRunning = true;
    coverDone = false;
    pageReady = false;
    routeMode = modeFor((event as Event & { to?: URL }).to?.pathname ?? location.pathname);
    killFlight();
    resetStage(0, routeMode);
    const tl = gsap.timeline({
      onComplete: () => {
        coverDone = true;
        playReveal();
      },
    });
    if (routeMode === 'home') {
      tl.to(els.ground, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0)
        .to(els.outline, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.15)
        .to(els.clip, { attr: { y: 0 }, duration: 0.6, ease: 'power2.inOut' }, 0.5)
        .to(els.cap, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.3);
    } else {
      drawPageAnchor(tl, 0.45, 0.35);
    }
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

  /** Later visits skip the intro, but the home anchor still travels to the nav logo on scroll. */
  const playSeenVisit = () => {
    idle();
    if (!isHome()) return; // only the home has an anchor to carry
    const run = () => {
      els.anchor.classList.add('is-active');
      gsap.set(els.outline, { strokeDashoffset: 0 });
      gsap.set(els.clip, { attr: { y: 0 } });
      gsap.set(els.anchor, { x: 0, y: 0, scale: 1, opacity: 1, color: RED, transformOrigin: '0 0' });
      armFlight(navLogo(), true);
    };
    if (document.readyState === 'complete') requestAnimationFrame(run);
    else window.addEventListener('load', () => requestAnimationFrame(run), { once: true });
  };

  if (seen) playSeenVisit();
  else playFirstVisit();
}
