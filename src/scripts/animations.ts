import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
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
    // Pin de la descripción
    ScrollTrigger.create({
      trigger: '.act-desc',
      start: 'top 0rem',
      end: '+=200%',
      pin: true,
      pinSpacing: false, // Asegura que GSAP no agregue espacio raro
      scrub: true,
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
  }, 100);
}
