export {};

// /nosotros: highlight in the index the section crossing a band near the top of the viewport.
let spy: IntersectionObserver | undefined;

function init(): void {
  spy?.disconnect();
  const links = [...document.querySelectorAll<HTMLElement>('[data-toc-link]')];
  const sections = links
    .map((link) => document.getElementById(link.dataset.target ?? ''))
    .filter((el): el is HTMLElement => Boolean(el));
  if (!sections.length) return;

  const setActive = (id: string) =>
    links.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.target === id);
    });

  spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) setActive(entry.target.id);
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );
  sections.forEach((s) => {
    spy?.observe(s);
  });
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => spy?.disconnect());
