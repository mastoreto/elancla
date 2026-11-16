import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

window.addEventListener("resize", () => {
  ScrollTrigger.refresh();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function setActiveCard(index: number) {
  const cards = document.querySelectorAll<HTMLElement>(
    ".card-1, .card-2, .card-3",
  );
  cards.forEach((el, idx) => {
    const isActive = idx + 1 === index;
    el.classList.toggle("scale-105", isActive);
    el.classList.toggle("shadow-xl", isActive);
  });
}

interface ActivitiesConfig {
  pinDescStart: string;
  pinDescEnd: string;
  timelineStart: string;
  timelineEnd: string;
}

function buildActivitiesTimeline(config: ActivitiesConfig) {
  ScrollTrigger.create({
    trigger: ".act-desc",
    start: config.pinDescStart,
    end: config.pinDescEnd,
    pin: true,
    pinSpacing: false,
    scrub: true,
  });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".timeline-section",
      start: config.timelineStart,
      end: config.timelineEnd,
      scrub: true,
      pin: true,
      pinSpacing: false,
      snap: {
        snapTo: "labels",
        duration: { min: 0.2, max: 0.8 },
        ease: "power1.inOut",
      },
    },
  });

  timeline
    .addLabel("card1")
    .from(".card-1", {
      x: -200,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      onStart: () => setActiveCard(1),
    })
    .addLabel("card2")
    .from(".card-2", {
      x: 200,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      onStart: () => setActiveCard(2),
    })
    .addLabel("card3")
    .from(".card-3", {
      y: 200,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      onStart: () => setActiveCard(3),
    });
}

// ─── Main init ─────────────────────────────────────────────────────────────

export function initAnimations() {
  const mm = gsap.matchMedia();

  // Esperar a que el DOM esté completamente cargado (Astro 6.0)
  const initWhenReady = (callback: () => void, delay: number = 300) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        setTimeout(callback, delay),
      );
    } else {
      setTimeout(callback, delay);
    }
  };

  // Fade-in for AboutUs section
  initWhenReady(() => {
    gsap.from(".fade-in", {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: ".fade-in",
        start: "top 20%",
        toggleActions: "play none none reverse",
      },
    });
  });

  // Sermons fade-in + swiper slides
  initWhenReady(() => {
    gsap.from(".fade-sermons", {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: ".fade-sermons",
        start: "top 200%",
        toggleActions: "play none none reverse",
      },
    });

    gsap.from(".swiper-slide", {
      opacity: 0,
      y: 100,
      rotate: -5,
      duration: 0.6,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".swiper",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  });

  // ── Mobile: ≤ 767px ──────────────────────────────────────────────────────
  mm.add("(max-width: 767px)", () => {
    initWhenReady(() => {
      buildActivitiesTimeline({
        pinDescStart: "top -5rem",
        pinDescEnd: "+=50%",
        timelineStart: "top-=50px 10%",
        timelineEnd: "+=30%",
      });
    });
  });

  // ── Tablet: 768px – 1023px ──────────────────────────────────────────────
  mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
    initWhenReady(() => {
      buildActivitiesTimeline({
        pinDescStart: "top -5rem",
        pinDescEnd: "+=50%",
        timelineStart: "top-=50px 10%",
        timelineEnd: "+=30%",
      });
    });
  });

  // ── Desktop: 1024px – 1279px ─────────────────────────────────────────────
  mm.add("(min-width: 1024px) and (max-width: 1279px)", () => {
    initWhenReady(() => {
      buildActivitiesTimeline({
        pinDescStart: "top 30rem",
        pinDescEnd: "+=200%",
        timelineStart: "top+=-100px 10rem",
        timelineEnd: "+=75%",
      });
    });
  });

  // ── Desktop XL: 1280px – 1535px ─────────────────────────────────────────
  mm.add("(min-width: 1280px) and (max-width: 1535px)", () => {
    initWhenReady(() => {
      buildActivitiesTimeline({
        pinDescStart: "top 0rem",
        pinDescEnd: "+=350%",
        timelineStart: "top+=-100px 10rem",
        timelineEnd: "+=170%",
      });
    });
  });

  // ── 2XL+: ≥ 1536px ───────────────────────────────────────────────────────
  mm.add("(min-width: 1536px)", () => {
    initWhenReady(() => {
      buildActivitiesTimeline({
        pinDescStart: "top 0rem",
        pinDescEnd: "+=200%",
        timelineStart: "top+=-100px 10rem",
        timelineEnd: "+=100%",
      });
    });
  });
}

// ─── Ministries animation ────────────────────────────────────────────────────

export function animateMinistries() {
  // Esperar a que los elementos estén listos (Astro 6.0)
  const waitForElements = () => {
    const cards = document.querySelectorAll<HTMLDivElement>(".mcard");

    if (cards.length === 0) {
      // Reintentar después de un tiempo si aún no están disponibles
      setTimeout(waitForElements, 100);
      return;
    }

    cards.forEach((card) => {
      const img = card.querySelector<HTMLImageElement>(".mcard-img");
      const text = card.querySelector<HTMLElement>(".mcard-text");

      if (!img || !text) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(img, {
        opacity: 0,
        y: 50,
        duration: 0.6,
        ease: "power2.out",
      });

      tl.from(
        text,
        {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.3",
      );
    });
  };

  // Iniciar búsqueda cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      setTimeout(waitForElements, 300),
    );
  } else {
    setTimeout(waitForElements, 300);
  }
}
