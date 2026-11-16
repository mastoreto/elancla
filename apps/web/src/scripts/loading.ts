type LoaderMode = 'initial' | 'route';

interface LoaderElements {
  loader: HTMLElement;
  pct: HTMLElement;
  stateText: HTMLElement;
  stateSub: HTMLElement;
  barFill: HTMLElement;
  ringProg: SVGCircleElement;
  session: HTMLElement;
  logoPath: SVGPathElement;
  ticks: SVGGElement;
}

interface LoaderPhase {
  from: number;
  to: number;
  label: string;
  sub: string;
}

interface LoaderController {
  mount(): void;
}

type WindowWithLoader = typeof window & {
  __elanclaLoader?: LoaderController;
};

const STORAGE_KEY = 'elancla:loader-seen';
const BASE_DURATION_MS = 6000;
const ROUTE_DURATION_MS = 1400;
const DISMISS_DELAY_MS = 900;

const phases: LoaderPhase[] = [
  { from: 0, to: 35, label: 'Trazando la cruz', sub: 'Cargando estilos · 1 / 4' },
  { from: 35, to: 70, label: 'Forjando el ancla', sub: 'Cargando ministerios · 2 / 4' },
  { from: 70, to: 90, label: 'Anclando el alma', sub: 'Cargando sermones · 3 / 4' },
  { from: 90, to: 100, label: 'Listo para zarpar', sub: 'Listo · 4 / 4' },
];

export function initLoadingOverlay(): void {
  const loaderWindow = window as WindowWithLoader;
  loaderWindow.__elanclaLoader ??= createLoaderController();
  loaderWindow.__elanclaLoader.mount();
}

function createLoaderController(): LoaderController {
  let elements: LoaderElements | null = null;
  let globalEventsBound = false;
  let rafId = 0;
  let progress = 0;
  let running = false;
  let completed = false;
  let mode: LoaderMode = 'initial';
  let mountedOnce = false;
  let lastFrame = performance.now();
  let sessionStart = performance.now();
  let logoLen = 0;
  let ringLen = 0;
  let cleanupTimer: number | undefined;

  const mount = () => {
    elements = queryElements();
    if (!elements) return;

    buildTicks(elements.ticks);
    const geometry = prepareGeometry(elements);
    logoLen = geometry.logoLen;
    ringLen = geometry.ringLen;

    if (!globalEventsBound) {
      bindGlobalEvents();
      globalEventsBound = true;
    }

    if (mountedOnce) return;
    mountedOnce = true;

    if (hasSeenInitialLoader()) {
      hideWithoutAnimation();
    } else {
      start('initial');
    }
  };

  const bindGlobalEvents = () => {
    document.addEventListener('astro:before-preparation', () => {
      start('route');
    });

    document.addEventListener('astro:page-load', () => {
      if (mode === 'route' && running) complete();
    });
  };

  const start = (nextMode: LoaderMode) => {
    if (!elements) return;

    if (cleanupTimer !== undefined) {
      window.clearTimeout(cleanupTimer);
      cleanupTimer = undefined;
    }

    mode = nextMode;
    progress = 0;
    completed = false;
    running = true;
    lastFrame = performance.now();
    sessionStart = performance.now();

    elements.loader.classList.remove('dismissed');
    elements.loader.classList.remove('instant');
    elements.loader.classList.add('is-active');
    elements.loader.removeAttribute('aria-hidden');
    elements.logoPath.classList.remove('fill-mode');
    lockScroll();
    render(0);

    if (rafId === 0) rafId = requestAnimationFrame(frame);
  };

  const frame = (now: number) => {
    rafId = requestAnimationFrame(frame);
    if (!elements || !running) return;

    const dt = now - lastFrame;
    lastFrame = now;
    const duration = mode === 'route' ? ROUTE_DURATION_MS : BASE_DURATION_MS;
    const perMs = 100 / duration;

    if (progress < 100) {
      progress = clamp(progress + perMs * dt, 0, 100);
      render(progress);
      if (progress >= 100) complete();
    }

    updateSession(now);
  };

  const render = (value: number) => {
    if (!elements) return;

    const display = Math.floor(value);
    elements.pct.textContent = display.toString().padStart(2, '0');
    elements.barFill.style.width = `${value}%`;
    setGlyph(value);
    updatePhase(value);
  };

  const setGlyph = (value: number) => {
    if (!elements) return;

    const drawP = clamp(value / 92, 0, 1);
    elements.logoPath.style.strokeDashoffset = String(logoLen * (1 - drawP));
    elements.logoPath.classList.toggle('fill-mode', value >= 92);
    elements.ringProg.style.strokeDashoffset = String(ringLen * (1 - value / 100));
  };

  const updatePhase = (value: number) => {
    if (!elements) return;

    const phase =
      phases.find((candidate) => value >= candidate.from && value < candidate.to) ??
      phases[phases.length - 1];
    elements.stateText.textContent = phase.label;
    elements.stateSub.textContent = phase.sub;
  };

  const updateSession = (now: number) => {
    if (!elements) return;

    const elapsed = (now - sessionStart) / 1000;
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = Math.floor(elapsed % 60).toString().padStart(2, '0');
    elements.session.textContent = `SESS · ${minutes}:${seconds}`;
  };

  const complete = () => {
    if (!elements || completed) return;

    completed = true;
    progress = 100;
    render(100);
    elements.stateText.textContent = 'Bienvenido';
    elements.stateSub.textContent = 'Lista la travesía · 4 / 4';
    rememberInitialLoader();

    window.setTimeout(() => {
      dismiss({ remember: false });
    }, DISMISS_DELAY_MS);
  };

  const dismiss = ({
    instant = false,
    remember = false,
  }: {
    instant?: boolean;
    remember?: boolean;
  } = {}) => {
    if (!elements) return;

    running = false;
    if (remember) rememberInitialLoader();
    elements.loader.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('site-loader-pending');
    unlockScroll();

    if (cleanupTimer !== undefined) {
      window.clearTimeout(cleanupTimer);
      cleanupTimer = undefined;
    }

    if (instant) {
      elements.loader.classList.add('instant', 'dismissed');
      elements.loader.classList.remove('is-active');
      return;
    }

    elements.loader.classList.remove('instant');
    elements.loader.classList.add('dismissed');
    cleanupTimer = window.setTimeout(() => {
      elements?.loader.classList.remove('is-active');
      cleanupTimer = undefined;
    }, DISMISS_DELAY_MS);
  };

  const hideWithoutAnimation = () => {
    if (!elements) return;

    running = false;
    completed = false;
    elements.loader.classList.add('instant');
    elements.loader.classList.remove('is-active', 'dismissed');
    elements.loader.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('site-loader-pending');
    unlockScroll();
  };

  return { mount };
}

function queryElements(): LoaderElements | null {
  const loader = document.querySelector<HTMLElement>('[data-site-loader]');
  const pct = document.getElementById('ldrPct');
  const stateText = document.getElementById('ldrStateText');
  const stateSub = document.getElementById('ldrStateSub');
  const barFill = document.getElementById('ldrBarFill');
  const ringProg = document.getElementById('ringProg') as SVGCircleElement | null;
  const session = document.getElementById('ldrSession');
  const logoPath = document.getElementById('logoPath') as SVGPathElement | null;
  const ticks = document.getElementById('ldrTicks') as SVGGElement | null;

  if (
    !loader ||
    !pct ||
    !stateText ||
    !stateSub ||
    !barFill ||
    !ringProg ||
    !session ||
    !logoPath ||
    !ticks
  ) {
    return null;
  }

  return {
    loader,
    pct,
    stateText,
    stateSub,
    barFill,
    ringProg,
    session,
    logoPath,
    ticks,
  };
}

function buildTicks(ticks: SVGGElement): void {
  if (ticks.childElementCount > 0) return;

  const cx = 100;
  const cy = 130;
  const rOut = 165;
  const rIn = 158;

  for (let i = 0; i < 60; i += 1) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(angle) * rIn;
    const y1 = cy + Math.sin(angle) * rIn;
    const x2 = cx + Math.cos(angle) * rOut;
    const y2 = cy + Math.sin(angle) * rOut;
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', String(x1));
    tick.setAttribute('y1', String(y1));
    tick.setAttribute('x2', String(x2));
    tick.setAttribute('y2', String(y2));
    tick.setAttribute('class', 'tick');
    if (i % 5 === 0) tick.setAttribute('stroke-width', '1.6');
    ticks.appendChild(tick);
  }
}

function prepareGeometry(elements: LoaderElements): { logoLen: number; ringLen: number } {
  const nextRingLen = 2 * Math.PI * 155;
  const nextLogoLen = elements.logoPath.getTotalLength();

  elements.ringProg.style.setProperty('--ring-len', String(nextRingLen));
  elements.ringProg.setAttribute('stroke-dasharray', String(nextRingLen));
  elements.ringProg.setAttribute('stroke-dashoffset', String(nextRingLen));

  elements.logoPath.style.strokeDasharray = String(nextLogoLen);
  elements.logoPath.style.strokeDashoffset = String(nextLogoLen);

  return {
    logoLen: nextLogoLen,
    ringLen: nextRingLen,
  };
}

function hasSeenInitialLoader(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function rememberInitialLoader(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Storage can be disabled in private contexts; the loader still works.
  }
}

function lockScroll(): void {
  document.documentElement.classList.add('site-loader-lock', 'site-loader-pending');
}

function unlockScroll(): void {
  document.documentElement.classList.remove('site-loader-lock');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
