import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import cn from 'src/utils/cn';
import { sections } from 'src/utils/constants';
import navbarData from 'src/utils/navbar.json';
gsap.registerPlugin(ScrollToPlugin);

const Navbar: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [activeSubMenu, setActiveSubMenu] = useState<number | null>(null);
  const [subMenuTimeout, setSubMenuTimeout] = useState<NodeJS.Timeout | null>(null);

  const linkClass = (section: string, isButton: boolean = false) =>
    cn(
      `cursor-pointer transition-colors duration-300 ${
        activeSection === section
          ? 'text-primary-500'
          : isButton
            ? 'text-white bg-primary-500 px-6 py-2 rounded-md'
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
    subMenu: cn(
      'absolute top-24 left-0 rounded-xl', 
      'w-[15rem] h-auto py-4 px-6', 
      'bg-primary-800/30 backdrop-blur-md'
    ),
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
 
    if (target.startsWith('https')) {
      return;
    }

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

  const handleMouseEnter = (index: number) => {
    if (subMenuTimeout) {
      clearTimeout(subMenuTimeout);
    }
    setActiveSubMenu(index);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveSubMenu(null);
    }, 300); // Ajusta el tiempo según sea necesario
    setSubMenuTimeout(timeout);
  };

  return (
    <nav id="menu" className={classes.nav}>
      <ul className={classes.ul}>
        {
          navbarData.map((item, index) => (
            <li
              key={index}
              className={item.subMenu ? 'relative' : ''}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <a
                href={item.url}
                onClick={(e) => handleSmoothScroll(e, item.url)}
                className={linkClass(item.url, item.button)}
              >
                {item.name}
              </a>
              {
                item.subMenu && activeSubMenu === index && (
                  <div className={classes.subMenu}>
                    <ul>
                      {
                        item.items?.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <a
                              key={subIndex}
                              href={subItem.url}
                              onClick={(e) => handleSmoothScroll(e, subItem.url)}
                              className={"text-white"}
                              {...(subItem?.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                            >
                              {subItem.name}
                            </a>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                )
              }
            </li>
          ))
        }
      </ul>
    </nav>
  );
};

export default Navbar;
