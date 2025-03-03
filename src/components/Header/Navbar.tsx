import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import cn from 'src/utils/cn';
import { sections } from 'src/utils/constants';
gsap.registerPlugin(ScrollToPlugin);

const Navbar: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('');

  const linkClass = (section: string, isButton: boolean = false) =>
    cn(
      `cursor-pointer transition-colors duration-300 ${
        activeSection === section
          ? 'text-primary-500'
          : isButton
            ? 'text-white'
            : 'text-gray-600'
      }`
    );

  const classes = {
    nav: cn('h-full w-full px-5 z-40'),
    icon: cn(
      'md:hidden',
      'absolute',
      'top-4',
      'right-4',
      'text-white',
      'text-4xl'
    ),
    ul: cn(
      'flex',
      'flex-row',
      'justify-between',
      'h-full',
      'items-center',
      'py-[5rem]',
      'md:py-0',
      'font-futura'
    ),
    li: cn('text-white', 'md:text-black'),

    bg: cn('bg-primary-500', 'px-6', 'py-2', 'text-white', 'rounded-md'),
  };

  useEffect(() => {
    const handleScroll = () => {
      let foundSection = '';

      sections.forEach((section) => {
        const element = document.querySelector(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            foundSection = section;
          }
        }
      });

      setActiveSection(foundSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Ejecutar al cargar

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    target: string
  ) => {
    e.preventDefault();

    const targetElement = document.querySelector(target);
    if (targetElement) {
      gsap.to(window, {
        duration: 1.2,
        scrollTo: {
          y: targetElement,
          autoKill: false,
        },
        ease: 'power2.out',
      });
    }
  };

  return (
    <nav id="menu" className={classes.nav}>
      <ul className={classes.ul}>
        <li>
          <a
            href="#inicio"
            onClick={(e) => handleSmoothScroll(e, '#inicio')}
            className={linkClass('#inicio')}
          >
            INICIO
          </a>
        </li>
        <li>
          <a
            href="#elancla"
            onClick={(e) => handleSmoothScroll(e, '#elancla')}
            className={linkClass('#elancla')}
          >
            EL ANCLA
          </a>
        </li>
        <li>
          <a
            href="#actividades"
            onClick={(e) => handleSmoothScroll(e, '#actividades')}
            className={linkClass('#actividades')}
          >
            ACTIVIDADES
          </a>
        </li>
        <li>
          <a
            href="#sermones"
            onClick={(e) => handleSmoothScroll(e, '#sermones')}
            className={linkClass('#sermones')}
          >
            SERMONES
          </a>
        </li>
        <li>
          <a
            href="#ministerios"
            onClick={(e) => handleSmoothScroll(e, '#ministerios')}
            className={linkClass('#ministerios')}
          >
            MINISTERIOS
          </a>
        </li>
        <li>
          <a
            href="#visitanos"
            onClick={(e) => handleSmoothScroll(e, '#visitanos')}
            className={`bg-primary-500 px-6 py-2 text-white rounded-md ${linkClass('#visitanos', true)}`}
          >
            Visítanos
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
