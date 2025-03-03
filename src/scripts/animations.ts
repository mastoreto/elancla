import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});

export function initAnimations() {
  const mm = gsap.matchMedia();

  setTimeout(() => {
    gsap.from('.fade-in', {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: '.fade-in',
        start: 'top 20%',
        toggleActions: 'play none none reverse',
      },
    });
  }, 100);

  setTimeout(() => {
    gsap.from('.fade-sermons', {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: '.fade-sermons',
        start: 'top 200%',
        toggleActions: 'play none none reverse',
      },
    });

    gsap.from('.swiper-slide', {
      opacity: 0,
      y: 100,
      rotate: -5, // Pequeña inclinación inicial
      duration: 0.6,
      stagger: 0.2, // Aparecen en cascada
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.swiper', // El contenedor principal
        start: 'top 80%', // Ajustá según el scroll
        toggleActions: 'play none none reverse', // Reaparece si vuelve a scrollear
      },
    });
  }, 100);
}

export function animateMinistries() {
  const cards = document.querySelectorAll<HTMLDivElement>('.mcard');

  if (cards.length === 0) {
    console.warn('No se encontraron cards de ministerios.');
    return;
  }

  cards.forEach((card) => {
    const img = card.querySelector<HTMLImageElement>('.mcard-img');
    const text = card.querySelector<HTMLElement>('.mcard-text');

    if (!img || !text) {
      console.warn('Falta img o text en una card de ministerio.');
      return;
    }

    // Ocultamos el texto para el efecto typewriter

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 85%', // Ajustá según la visibilidad deseada
        toggleActions: 'play none none reverse',
      },
    });

    // Animación de la imagen (fade + subida suave)
    tl.from(img, {
      opacity: 0,
      y: 50,
      duration: 0.6,
      ease: 'power2.out',
    });

    tl.from(
      text,
      {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out',
      },
      '-=0.3'
    );
  });
}

export function animateActivitiesDesktop() {
  console.log('Desktop');
  setTimeout(() => {
    // Pin de la descripción
    ScrollTrigger.create({
      trigger: '.act-desc',
      start: 'top 0rem',
      end: '+=200%',
      pin: true,
      pinSpacing: false, // Asegura que GSAP no agregue espacio raro
      scrub: true,
      markers: true,
    });

    // Timeline para centrar cada card
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.timeline-section',
        start: 'top+=-100px 10rem',
        end: '+=200%',
        scrub: true,
        pin: true,
        pinSpacing: false,
        markers: true,
        snap: {
          snapTo: 'labels',
          duration: { min: 0.2, max: 0.8 },
          ease: 'power1.inOut',
        },
      },
    });

    // Aparecen centradas una a una
    timeline
      .addLabel('card1')
      .from('.card-1', {
        x: -200,
        opacity: 0,
        duration: 1,
        onStart: () => setActiveCard(1),
      })
      .addLabel('card2')
      .from('.card-2', {
        x: 200,
        opacity: 0,
        duration: 1,
        onStart: () => setActiveCard(2),
      })
      .addLabel('card3')
      .from('.card-3', {
        y: 200,
        opacity: 0,
        duration: 1,
        onStart: () => setActiveCard(3),
      });

    function setActiveCard(index) {
      document
        .querySelectorAll('.timeline-section .card')
        .forEach((el, idx) => {
          el.classList.toggle('scale-105', idx + 1 === index);
          el.classList.toggle('shadow-xl', idx + 1 === index);
        });
    }
  }, 100);
}

export function animateActivitiesMobile() {
  console.log('Mobile');
  setTimeout(() => {
    ScrollTrigger.create({
      trigger: '.act-desc',
      start: 'top -5rem',
      end: '+=50%',
      pin: true,
      pinSpacing: false,
      scrub: true,
      markers: true,
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.timeline-section',
        start: 'top-=50px 10%',
        end: '+=30%',
        scrub: true,
        pin: true,
        pinSpacing: false,
        snap: {
          snapTo: 'labels',
          duration: { min: 0.2, max: 0.8 },
          ease: 'power1.inOut',
        },
        markers: true,
      },
    });

    timeline
      .addLabel('card1')
      .from('.card-1', {
        x: -200,
        opacity: 0,
        duration: 1,
        onStart: () => setActiveCard(1),
      })
      .addLabel('card2')
      .from('.card-2', {
        x: 200,
        opacity: 0,
        duration: 1,
        onStart: () => setActiveCard(2),
      })
      .addLabel('card3')
      .from('.card-3', {
        y: 200,
        opacity: 0,
        duration: 1,
        onStart: () => setActiveCard(3),
      });

    function setActiveCard(index: number) {
      document
        .querySelectorAll('.timeline-section .card')
        .forEach((el, idx) => {
          el.classList.toggle('scale-105', idx + 1 === index);
          el.classList.toggle('shadow-xl', idx + 1 === index);
        });
    }
  }, 100);
}
