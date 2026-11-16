import { clamp01, getLenis, ScrollTrigger, smooth } from './lenis';

const N = 9; // doctrines
const STEP_DEG = 40; // orbit angle per doctrine
const INTRO = 0.12; // share of the pin used by the anchor intro
const HOLD = 0.4; // where inside a step the snap point rests

/** Scroll position (0..1 of the pin) at which doctrine `i` rests. */
const centerOf = (i: number): number => INTRO + ((i + HOLD) / N) * (1 - INTRO);

export function initDoctrines(root: HTMLElement, isDesktop: boolean): void {
  const sec = root.querySelector<HTMLElement>('[data-ln="doctrines"]');
  const spin = sec?.querySelector<HTMLElement>('[data-doc-spin]');
  if (!sec || !spin) return;
  const ctrs = sec.querySelectorAll<HTMLElement>('[data-doc-ctr]');
  const dots = sec.querySelectorAll<HTMLButtonElement>('[data-doc-dot]');
  const caps = sec.querySelectorAll<HTMLElement>('[data-doc-cap]');
  const groups = sec.querySelectorAll<SVGGElement>('[data-ic]');
  const anchorBox = sec.querySelector<HTMLElement>('[data-doc-anchor]');
  const aOutline = sec.querySelector<SVGPathElement>(
    '[data-doc-anchor] [data-anchor-outline]'
  );
  const aClip = sec.querySelector<SVGRectElement>(
    '[data-doc-anchor] [data-anchor-clip]'
  );
  if (!anchorBox || !aOutline || !aClip) return;

  const draws = [...groups].map((g) =>
    g.querySelectorAll<SVGElement>('[data-doc-draw]')
  );
  const forges = [...groups].map((g) =>
    g.querySelector<SVGRectElement>('[data-doc-forge]')
  );
  let active = -1;

  const render = (p: number): void => {
    // Intro: the anchor draws, fills, then gives way to the first doctrine.
    const a = clamp01(p / INTRO);
    aOutline.style.strokeDashoffset = String(1 - clamp01(a / 0.55));
    aClip.setAttribute('y', String(254 * (1 - clamp01((a - 0.35) / 0.45))));
    const out = clamp01((a - 0.85) / 0.15);
    anchorBox.style.opacity = String(1 - out);
    anchorBox.style.transform = `translateY(${-14 * out}px) scale(${1 - 0.04 * out})`;

    // Doctrines: f in [0, N]; step i = floor(f), frac = progress inside the step.
    const f = clamp01((p - INTRO) / (1 - INTRO)) * N;
    const i = Math.min(N - 1, Math.floor(f));
    const frac = f - i;
    const turn = i < N - 1 ? smooth(clamp01((frac - 0.75) / 0.25)) : 0;
    const deg = (i + turn) * STEP_DEG;
    spin.style.transform = `rotate(${-deg}deg)`;
    for (const c of ctrs) c.style.transform = `rotate(${deg}deg)`;

    const started = p >= INTRO;
    const fadeIn = clamp01(frac / 0.08);
    const fadeOut = i < N - 1 ? clamp01((1 - frac) / 0.08) : 1;
    const vis = started ? Math.min(fadeIn, fadeOut) : 0;
    groups.forEach((g, k) => {
      const on = k === i;
      g.style.opacity = on ? String(vis) : '0';
      for (const d of draws[k])
        d.style.strokeDashoffset = on ? String(1 - clamp01(frac / 0.45)) : '1';
      forges[k]?.setAttribute(
        'y',
        on
          ? String(-4 + 128 * (1 - smooth(clamp01((frac - 0.12) / 0.45))))
          : '124'
      );
    });
    caps.forEach((c, k) => {
      const on = k === i && started;
      c.style.opacity = on ? String(vis) : '0';
      c.style.transform = on
        ? `translateY(${(1 - fadeIn) * 8 - (1 - fadeOut) * 6}px)`
        : 'translateY(8px)';
    });

    const now = started ? i : -1;
    if (now !== active) {
      active = now;
      dots.forEach((d, k) => {
        d.classList.toggle('is-active', k === now);
      });
    }
  };

  const st = ScrollTrigger.create({
    trigger: sec,
    start: 'top top',
    end: isDesktop ? '+=900%' : '+=700%',
    pin: true,
    scrub: 0.5,
    anticipatePin: 1,
    onUpdate: (self) => render(self.progress),
    onRefresh: (self) => render(self.progress),
    snap: {
      snapTo: [0, ...Array.from({ length: N }, (_, i) => centerOf(i))],
      duration: { min: 0.25, max: 0.7 },
      delay: 0.12,
      ease: 'power2.inOut',
    },
  });
  render(0);

  // Keyboard / pointer access: jump to a doctrine.
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const y = st.start + centerOf(i) * (st.end - st.start);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { duration: 1.4 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}
