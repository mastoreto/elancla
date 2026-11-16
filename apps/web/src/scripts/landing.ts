import { initClosing } from './scroll/closing';
import { initDoctrines } from './scroll/doctrines';
import { initGod } from './scroll/god';
import { initHero } from './scroll/hero';
import { getLenis, gsap, ScrollTrigger, startLenis } from './scroll/lenis';
import { initActiveNav, initNavAnchor } from './scroll/nav-anchor';
import { initSunday } from './scroll/sunday';
import { initTogether } from './scroll/together';

type LandingWindow = typeof window & {
  __lnCleanup?: () => void;
  __lnBound?: boolean;
};
const SECTION_IDS = [
  'inicio',
  'dios',
  'doctrinas',
  'juntos',
  'domingo',
  'visitanos',
];

function mount(): void {
  const w = window as LandingWindow;
  const root = document.querySelector<HTMLElement>('.ln');
  if (!root || root.dataset.lnMounted === 'true') return;
  w.__lnCleanup?.();
  root.dataset.lnMounted = 'true';

  // Without motion we keep the page static: no Lenis, no pins, doctrines shown as a list.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('is-static');
    root.querySelectorAll('[data-anchor-clip]').forEach((r) => {
      r.setAttribute('y', '0');
    });
    w.__lnCleanup = undefined;
    return;
  }

  const stopLenis = startLenis();
  const mm = gsap.matchMedia();
  mm.add(
    { desktop: '(min-width: 1024px)', mobile: '(max-width: 1023.98px)' },
    (ctx) => {
      const isDesktop = Boolean(ctx.conditions?.desktop);
      initHero(root);
      initGod(root, isDesktop);
      initDoctrines(root, isDesktop);
      initTogether(root, isDesktop);
      initSunday(root, isDesktop);
      initClosing(root);
      initNavAnchor();
      initActiveNav(SECTION_IDS);
    }
  );

  // In-page links (nav, CTAs) glide through Lenis so pinned sections stay in sync.
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest<HTMLAnchorElement>(
      'a[href*="#"]'
    );
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, window.location.href);
    if (
      url.pathname.replace(/\/$/, '') !==
        window.location.pathname.replace(/\/$/, '') ||
      !url.hash
    )
      return;
    const target = document.querySelector<HTMLElement>(url.hash);
    const lenis = getLenis();
    if (!target || !lenis) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  };
  document.addEventListener('click', onClick);

  w.__lnCleanup = () => {
    document.removeEventListener('click', onClick);
    mm.revert();
    for (const t of ScrollTrigger.getAll()) t.kill();
    stopLenis();
    w.__lnCleanup = undefined;
  };
}

export function initLanding(): void {
  const w = window as LandingWindow;
  if (!w.__lnBound) {
    w.__lnBound = true;
    // ClientRouter swaps the DOM without reloading: tear down before, set up after.
    document.addEventListener('astro:before-swap', () => w.__lnCleanup?.());
    document.addEventListener('astro:page-load', mount);
  }
  mount();
}
