export function initBlog(): void {
  const routeState = window as typeof window & {
    __elanclaRouteController?: AbortController;
  };
  routeState.__elanclaRouteController?.abort();
  const controller = new AbortController();
  routeState.__elanclaRouteController = controller;

  initScrollReveal();
  initReadProgress(controller.signal);
  initFilters(controller.signal);
  initNewsletterForms(controller.signal);
  initTocActiveState();
  initTocSmoothScroll(controller.signal);
  initReactions(controller.signal);
}

function initScrollReveal(): void {
  const elements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('in'));
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

  elements.forEach((element) => observer.observe(element));
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

const PAGE_SIZE = 9;

function initFilters(signal: AbortSignal): void {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-blog-filter-button]')
  );
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>('#blogArticleGrid [data-blog-article-card]')
  );
  const more = document.querySelector<HTMLElement>('[data-blog-more]');
  const moreButton = document.querySelector<HTMLButtonElement>('[data-blog-more-button]');

  if (cards.length === 0) return;

  let visible = PAGE_SIZE;

  const apply = () => {
    const active = buttons.find((button) => button.dataset.on === 'true')?.dataset.filter ?? 'todos';
    const matching = cards.filter((card) => active === 'todos' || card.dataset.blogFilter === active);

    cards.forEach((card) => {
      card.hidden = matching.indexOf(card) < 0 || matching.indexOf(card) >= visible;
    });
    if (more) more.hidden = matching.length <= visible;
  };

  buttons.forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        buttons.forEach((candidate) => {
          candidate.dataset.on = candidate === button ? 'true' : 'false';
        });
        visible = PAGE_SIZE;
        apply();
      },
      { signal }
    );
  });

  moreButton?.addEventListener(
    'click',
    () => {
      visible += PAGE_SIZE;
      apply();
    },
    { signal }
  );

  apply();
}

function initNewsletterForms(signal: AbortSignal): void {
  document
    .querySelectorAll<HTMLFormElement>('.blog-newsletter-form')
    .forEach((form) => {
      form.addEventListener(
        'submit',
        (event) => {
          event.preventDefault();
          const label = form.querySelector<HTMLElement>(
            '[data-newsletter-label]'
          );
          if (!label) return;

          const original = label.textContent ?? 'Suscribirme';
          label.textContent = form.dataset.thanks ?? 'OK';
          window.setTimeout(() => {
            label.textContent = original;
          }, 2400);
        },
        { signal }
      );
    });
}

function initTocActiveState(): void {
  const tocLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('.bl-toc-link')
  );
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
  document
    .querySelectorAll<HTMLAnchorElement>('.bl-toc-link[href^="#"]')
    .forEach((link) => {
      link.addEventListener(
        'click',
        (event) => {
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
        },
        { signal }
      );
    });
}

function initReactions(signal: AbortSignal): void {
  document.querySelectorAll<HTMLButtonElement>('[data-blog-reaction]').forEach(
    (button) => {
      button.addEventListener(
        'click',
        () => {
          const isActive = button.dataset.active === 'true';
          const count = button.querySelector<HTMLElement>('.bl-react-count');
          const current = Number.parseInt(count?.textContent ?? '0', 10);

          button.dataset.active = isActive ? 'false' : 'true';
          if (count) count.textContent = String(current + (isActive ? -1 : 1));
        },
        { signal }
      );
    }
  );
}
