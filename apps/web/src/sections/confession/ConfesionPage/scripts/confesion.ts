// Confesión de fe: accordion, expand/collapse all, index scroll-spy.
let controller: AbortController | undefined;

function init(): void {
  controller?.abort();
  const cards = [
    ...document.querySelectorAll<HTMLElement>('[data-doctrine-card]'),
  ];
  if (!cards.length) return;
  controller = new AbortController();
  const { signal } = controller;

  const expandBtn = document.getElementById('expandAll');
  const expandLabel = document.getElementById('expandAllLabel');
  const idxLinks = document.querySelectorAll<HTMLElement>(
    '[data-doctrine-index]'
  );

  const updateExpandLabel = () => {
    if (!expandLabel) return;
    const allOpen = cards.every((c) => c.classList.contains('is-open'));
    expandLabel.textContent = allOpen
      ? (expandLabel.dataset.expandedLabel ?? 'Cerrar todas')
      : (expandLabel.dataset.collapsedLabel ?? 'Expandir todas');
  };

  const setOpen = (card: HTMLElement, open: boolean) => {
    card.classList.toggle('is-open', open);
    card
      .querySelector('[data-doctrine-toggle]')
      ?.setAttribute('aria-expanded', String(open));
  };

  for (const card of cards) {
    card.querySelector('[data-doctrine-toggle]')?.addEventListener(
      'click',
      () => {
        setOpen(card, !card.classList.contains('is-open'));
        updateExpandLabel();
      },
      { signal }
    );
  }

  expandBtn?.addEventListener(
    'click',
    () => {
      const shouldOpen = !cards.every((c) => c.classList.contains('is-open'));
      for (const card of cards) setOpen(card, shouldOpen);
      updateExpandLabel();
    },
    { signal }
  );

  // Links to a doctrine (the Christus block) open it before scrolling.
  document
    .querySelectorAll<HTMLElement>('[data-open-doctrine]')
    .forEach((el) => {
      el.addEventListener(
        'click',
        () => {
          const card = document.getElementById(
            `doctrine-${el.dataset.openDoctrine}`
          );
          if (card) setOpen(card, true);
          updateExpandLabel();
        },
        { signal }
      );
    });

  // In-page links scroll smoothly (the cards carry scroll-margin for the fixed nav).
  document
    .querySelectorAll<HTMLAnchorElement>('[data-confession] a[href^="#"]')
    .forEach((a) => {
      a.addEventListener(
        'click',
        (e) => {
          const href = a.getAttribute('href') ?? '';
          const target = href.length > 1 ? document.querySelector(href) : null;
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        { signal }
      );
    });

  // Highlight in the index the doctrine crossing a band near the top of the viewport.
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = (entry.target as HTMLElement).dataset.id;
        idxLinks.forEach((link) => {
          link.classList.toggle('is-active', link.dataset.id === id);
        });
      }
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );
  cards.forEach((card) => {
    spy.observe(card);
  });
  signal.addEventListener('abort', () => spy.disconnect());

  // Reading progress bar (shared #readprog from the layout).
  const progress = document.getElementById('readprog');
  const onScroll = () => {
    if (!progress) return;
    const max = document.body.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
  };
  window.addEventListener('scroll', onScroll, { passive: true, signal });
  onScroll();
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => controller?.abort());
