import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

let lenis: Lenis | null = null;
export const getLenis = (): Lenis | null => lenis;

const LOCK_CLASS = 'site-loader-lock';
const isLocked = (): boolean =>
  document.documentElement.classList.contains(LOCK_CLASS);

/** Run `cb` once the first-visit loader overlay has released the page. */
export function whenUnlocked(cb: () => void): () => void {
  if (!isLocked()) {
    cb();
    return () => {};
  }
  const observer = new MutationObserver(() => {
    if (!isLocked()) {
      observer.disconnect();
      cb();
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

/** Smooth scroll driven by GSAP's ticker so ScrollTrigger stays in sync. Returns a cleanup. */
export function startLenis(): () => void {
  const instance = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis = instance;
  instance.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  if (isLocked()) instance.stop();
  const stopWatching = whenUnlocked(() => instance.start());

  return () => {
    stopWatching();
    gsap.ticker.remove(tick);
    instance.destroy();
    if (lenis === instance) lenis = null;
  };
}

export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
export const smooth = (t: number): number => t * t * (3 - 2 * t);
