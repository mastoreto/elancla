export function initContentPage(): void {
  const routeState = window as typeof window & {
    __elanclaRouteController?: AbortController;
  };
  routeState.__elanclaRouteController?.abort();
  const controller = new AbortController();
  routeState.__elanclaRouteController = controller;

  initScrollReveal();
  initReadProgress(controller.signal);
  initTocActiveState();
  initTocSmoothScroll(controller.signal);
}

function initScrollReveal(): void {
  const elements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

function initReadProgress(signal: AbortSignal): void {
  const progress = document.getElementById('readprog');
  const nav = document.getElementById('nav');

  const update = () => {
    if (progress) {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const percent = max > 0 ? (root.scrollTop / max) * 100 : 0;
      progress.style.width = `${percent}%`;
    }

    if (nav) {
      if (window.scrollY > 40) {
        nav.style.background = 'color-mix(in srgb, var(--color-paper) 92%, transparent)';
        nav.style.boxShadow = '0 8px 30px -10px rgba(0,0,0,0.18)';
      } else {
        nav.style.background = 'color-mix(in srgb, var(--color-paper) 72%, transparent)';
        nav.style.boxShadow = 'none';
      }
    }
  };

  window.addEventListener('scroll', update, { passive: true, signal });
  update();
}

function initTocActiveState(): void {
  const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.content-toc-link'));
  const targets = tocLinks
    .map((link) => {
      const targetId = link.dataset.target;
      return targetId ? document.getElementById(targetId) : null;
    })
    .filter((target): target is HTMLElement => Boolean(target));

  if (tocLinks.length === 0 || targets.length === 0) return;

  const setActive = (id: string) => {
    tocLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.target === id);
    });
  };

  if (!('IntersectionObserver' in window)) {
    setActive(targets[0].id);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
  );

  targets.forEach((target) => observer.observe(target));
  setActive(targets[0].id);
}

function initTocSmoothScroll(signal: AbortSignal): void {
  document.querySelectorAll<HTMLAnchorElement>('.content-toc-link[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href.length <= 1) return;

      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;

      event.preventDefault();
      window.history.pushState(null, '', href);
      window.scrollTo({
        top: target.offsetTop - 92,
        behavior: 'smooth',
      });
    }, { signal });
  });
}
