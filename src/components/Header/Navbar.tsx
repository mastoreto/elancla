import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import cn from 'src/utils/cn';
import { sections } from 'src/utils/constants';
import navbarData from 'src/utils/navbar.json';
import SearchBar from './SearchBar';

gsap.registerPlugin(ScrollToPlugin);

interface NavbarProps {
  showSearch?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showSearch = false }) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [activeSubMenu, setActiveSubMenu] = useState<number | null>(null);
  const [subMenuTimeout, setSubMenuTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

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
    nav: cn(
      'h-full w-full px-5 z-40',
      showSearch && 'flex items-center justify-between'
    ),
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
      showSearch ? 'justify-start gap-8' : 'justify-between',
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

  const isHashLink = (target: string) => target.startsWith('#');
  const isHomePage = () => {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.location.pathname === '/' || window.location.pathname === '';
  };
  const getResolvedHref = (target: string) => {
    if (!isHashLink(target)) {
      return target;
    }
    return isHomePage() ? target : `/${target}`;
  };
  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    target: string
  ) => {
    if (!isHashLink(target) || !isHomePage()) {
      return;
    }

    const targetElement = document.querySelector(target);
    if (!targetElement) {
      return;
    }

    e.preventDefault();

    gsap.to(window, {
      duration: 1.2,
      scrollTo: {
        y: targetElement,
        autoKill: false,
      },
      ease: 'power2.out',
    });
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

  const navItems = navbarData.map((item, index) => (
    <li
      key={index}
      className={item.subMenu ? 'relative' : ''}
      onMouseEnter={() => handleMouseEnter(index)}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={getResolvedHref(item.url)}
        onClick={(e) => handleSmoothScroll(e, item.url)}
        className={linkClass(item.url, item.button)}
      >
        {item.name}
      </a>
      {item.subMenu && activeSubMenu === index && (
        <div className={classes.subMenu}>
          <ul>
            {item.items?.map((subItem, subIndex) => (
              <li key={subIndex}>
                <a
                  key={subIndex}
                  href={getResolvedHref(subItem.url)}
                  onClick={(e) => handleSmoothScroll(e, subItem.url)}
                  className={'text-white'}
                  {...(subItem?.external
                    ? { target: '_blank', rel: 'noreferrer noopener' }
                    : {})}
                >
                  {subItem.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  ));

  return (
    <nav id="menu" className={classes.nav}>
      {showSearch ? (
        <div className="flex items-center gap-10 h-full">
          <a className="flex items-center gap-3 group" href="/">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 text-white transition-colors duration-300 shadow-md shadow-primary-500/30">
              <span className="material-symbols-outlined text-[24px]">
                church
              </span>
            </div>
            <span className="text-2xl font-display font-black tracking-tight text-neutral-900 dark:text-white group-hover:text-primary-500 transition-colors">
              EL ANCLA
            </span>
          </a>
          <ul className={classes.ul}>{navItems}</ul>
        </div>
      ) : (
        <ul className={classes.ul}>{navItems}</ul>
      )}
      {showSearch && <SearchBar />}
    </nav>
  );
};

export default Navbar;
