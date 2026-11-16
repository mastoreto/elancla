// ── Scroll reveal ──
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ── Accordion ──
function openDoctrine(id: string) {
  const row = document.getElementById(`doctrine-${id}`);
  if (!row) return;
  row.classList.add('open');
  updateExpandLabel();
  setTimeout(() => {
    window.scrollTo({ top: (row as HTMLElement).offsetTop - 90, behavior: 'smooth' });
  }, 60);
}

document.querySelectorAll('.doctrine-row').forEach((row) => {
  row.querySelector('.row-summary')?.addEventListener('click', () => {
    row.classList.toggle('open');
    updateExpandLabel();
  });
});

// ── Expand / Collapse all ──
const expandBtn = document.getElementById('expandAll');
const expandLabel = document.getElementById('expandAllLabel');

function updateExpandLabel() {
  if (!expandLabel) return;
  const all = document.querySelectorAll('.doctrine-row');
  const open = document.querySelectorAll('.doctrine-row.open');
  const collapsedLabel = expandLabel.dataset.collapsedLabel ?? 'Expandir todas';
  const expandedLabel = expandLabel.dataset.expandedLabel ?? 'Cerrar todas';
  expandLabel.textContent = open.length === all.length ? expandedLabel : collapsedLabel;
}

expandBtn?.addEventListener('click', () => {
  const all = document.querySelectorAll('.doctrine-row');
  const open = document.querySelectorAll('.doctrine-row.open');
  const shouldOpen = open.length < all.length;
  all.forEach((r) => r.classList.toggle('open', shouldOpen));
  updateExpandLabel();
});

// ── Open doctrine from external link ──
document.querySelectorAll('[data-open-doctrine]').forEach((el) => {
  el.addEventListener('click', () => {
    const id = (el as HTMLElement).dataset.openDoctrine;
    if (id) openDoctrine(id);
  });
});

// ── Scroll: progress bar + nav style + active index ──
const progressBar = document.getElementById('readprog');
const nav = document.getElementById('nav');
const idxItems = document.querySelectorAll<HTMLElement>('.idx-item');
const doctrineRows = document.querySelectorAll<HTMLElement>('.doctrine-row[data-id]');

function onScroll() {
  const max = document.body.scrollHeight - window.innerHeight;
  if (progressBar) progressBar.style.width = `${(window.scrollY / max) * 100}%`;

  if (nav) {
    if (window.scrollY > 40) {
      nav.style.background = 'color-mix(in srgb, var(--color-paper) 92%, transparent)';
      nav.style.boxShadow = '0 8px 30px -10px rgba(0,0,0,0.18)';
    } else {
      nav.style.background = 'color-mix(in srgb, var(--color-paper) 72%, transparent)';
      nav.style.boxShadow = 'none';
    }
  }

  const y = window.scrollY + window.innerHeight * 0.35;
  let activeId: string | null = null;
  doctrineRows.forEach((row) => {
    if (row.offsetTop <= y) activeId = row.dataset.id ?? null;
  });
  idxItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.id === activeId);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Smooth scroll (offset for fixed nav) ──
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href.length <= 1) return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: (target as HTMLElement).offsetTop - 90, behavior: 'smooth' });
    }
  });
});
