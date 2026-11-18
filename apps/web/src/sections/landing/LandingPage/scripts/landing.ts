import { initClosing } from 'src/sections/landing/Closing/scripts/closing';
import { initDoctrines } from 'src/sections/landing/Doctrines/scripts/doctrines';
import { initGod } from 'src/sections/landing/God/scripts/god';
import { initHero } from 'src/sections/landing/Hero/scripts/hero';
import { getLenis, gsap, ScrollTrigger, startLenis } from 'src/scripts/lenis';
import { initActiveNav, initNavAnchor } from 'src/sections/landing/LandingPage/scripts/navAnchor';
import { initSunday } from 'src/sections/landing/Sunday/scripts/sunday';
import { initTogether } from 'src/sections/landing/Together/scripts/together';

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

/** Each section rests on the previous one like a laid stone: it rises 24px and settles as it enters. */
function seatSections(root: HTMLElement, isDesktop: boolean): void {
  // Pinned sections (God, Doctrines, Sunday on desktop) are skipped: a transform would shift their pin.
  const names = isDesktop
    ? ['together', 'closing']
    : ['together', 'sunday', 'closing'];
  for (const name of names) {
    const sec = root.querySelector<HTMLElement>(`[data-ln="${name}"]`);
    if (!sec) continue;
    gsap.fromTo(
      sec,
      { y: 24 },
      {
        y: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sec,
          start: 'top bottom',
          end: 'top 70%',
          scrub: true,
        },
      }
    );
  }
}

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
      initHero(root, isDesktop);
      initGod(root, isDesktop);
      initDoctrines(root, isDesktop);
      initTogether(root, isDesktop);
      initSunday(root, isDesktop);
      initClosing(root);
      seatSections(root, isDesktop);
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
