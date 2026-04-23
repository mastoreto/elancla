export function initLanding(): void {
  initScrollReveal();
  initNumberTicker();
  initActiveNav();
  initSmoothScroll();
}

function initScrollReveal(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function initNumberTicker(): void {
  const duration = 1400;
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const final = parseInt(el.dataset.count ?? '0', 10);
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * final).toString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) run(); }),
      { threshold: 0.6 }
    ).observe(el);
  });
}

function initActiveNav(): void {
  const navLinks = document.querySelectorAll<HTMLElement>('.nav-item');
  const sectionIds = ['inicio', 'nosotros', 'actividades', 'sermones', 'ministerios'];
  const nav = document.getElementById('nav');
  const progress = document.getElementById('readprog');

  const onScroll = () => {
    const y = window.scrollY + window.innerHeight * 0.35;

    // active section dot
    let active = 'inicio';
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= y) active = id;
    });
    navLinks.forEach((l) => {
      l.dataset.active = l.dataset.section === active ? 'true' : 'false';
    });

    // read progress bar
    if (progress) {
      const max = document.body.scrollHeight - window.innerHeight;
      progress.style.width = `${(window.scrollY / max) * 100}%`;
    }

    // nav background opacity on scroll
    if (nav) {
      if (window.scrollY > 40) {
        nav.style.background = 'rgba(250,248,245,0.92)';
        nav.style.boxShadow = '0 8px 30px -10px rgba(20,20,20,0.08)';
      } else {
        nav.style.background = 'rgba(250,248,245,0.72)';
        nav.style.boxShadow = 'none';
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initSmoothScroll(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.length <= 1) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: (target as HTMLElement).offsetTop - 70, behavior: 'smooth' });
      }
    });
  });
}
