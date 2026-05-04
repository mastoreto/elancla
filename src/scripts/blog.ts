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
  initCategoryJumps(controller.signal);
  initNewsletterForms(controller.signal);
  initTocActiveState();
  initTocSmoothScroll(controller.signal);
  initCopyButtons(controller.signal);
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

function initFilters(signal: AbortSignal): void {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-blog-filter-button]')
  );
  const input = document.getElementById(
    'blogSearchInput'
  ) as HTMLInputElement | null;
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>('[data-blog-article-card]')
  );

  if (buttons.length === 0 || cards.length === 0) return;

  const getActiveFilter = () =>
    buttons.find((button) => button.dataset.on === 'true')?.dataset.filter ??
    'todos';

  const apply = () => {
    const activeFilter = getActiveFilter();
    const query = input?.value.toLowerCase().trim() ?? '';

    cards.forEach((card) => {
      const matchesFilter =
        activeFilter === 'todos' || card.dataset.blogFilter === activeFilter;
      const matchesSearch =
        query.length === 0 || card.textContent?.toLowerCase().includes(query);

      card.style.display = matchesFilter && matchesSearch ? '' : 'none';
    });
  };

  buttons.forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        buttons.forEach((candidate) => {
          candidate.dataset.on = candidate === button ? 'true' : 'false';
        });
        apply();
      },
      { signal }
    );
  });

  input?.addEventListener('input', apply, { signal });
  apply();
}

function initCategoryJumps(signal: AbortSignal): void {
  const buttons = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-category-jump]')
  );
  const filterButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-blog-filter-button]')
  );

  buttons.forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const filter = button.dataset.categoryJump;
        const target = filterButtons.find(
          (candidate) => candidate.dataset.filter === filter
        );
        target?.click();
      },
      { signal }
    );
  });
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
          label.textContent = 'Gracias';
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
    document.querySelectorAll<HTMLAnchorElement>('.content-toc-link')
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
    .querySelectorAll<HTMLAnchorElement>('.content-toc-link[href^="#"]')
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

function initCopyButtons(signal: AbortSignal): void {
  document.querySelectorAll<HTMLButtonElement>('[data-copy-link]').forEach(
    (button) => {
      button.addEventListener(
        'click',
        async () => {
          const label = button.querySelector<HTMLElement>('[data-copy-label]');
          const original = label?.textContent ?? button.textContent ?? 'Copiar';
          const copied = await copyText(window.location.href);

          if (copied) {
            if (label) label.textContent = 'Copiado';
            else button.textContent = 'Copiado';
          } else {
            if (label) label.textContent = 'Copiar enlace';
          }

          window.setTimeout(() => {
            if (label) label.textContent = original;
          }, 1800);
        },
        { signal }
      );
    }
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Some browsers expose Clipboard API but reject it without an explicit permission grant.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.left = '-9999px';
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const onCopy = (event: ClipboardEvent) => {
    event.clipboardData?.setData('text/plain', text);
    event.preventDefault();
  };

  try {
    const legacyDocument = document as unknown as {
      execCommand(commandId: string): boolean;
    };
    document.addEventListener('copy', onCopy, { once: true });
    return legacyDocument.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.removeEventListener('copy', onCopy);
    textarea.remove();
  }
}

function initReactions(signal: AbortSignal): void {
  document.querySelectorAll<HTMLButtonElement>('[data-blog-reaction]').forEach(
    (button) => {
      button.addEventListener(
        'click',
        () => {
          const isActive = button.dataset.active === 'true';
          const count = button.querySelector<HTMLElement>('.blog-react-count');
          const current = Number.parseInt(count?.textContent ?? '0', 10);

          button.dataset.active = isActive ? 'false' : 'true';
          if (count) count.textContent = String(current + (isActive ? -1 : 1));
        },
        { signal }
      );
    }
  );
}
