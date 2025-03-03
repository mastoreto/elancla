import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { motion } from 'framer-motion';
import cn from 'src/utils/cn';
import menuSlice from 'src/stores/menuSlice';
import { sections } from 'src/utils/constants';
gsap.registerPlugin(ScrollToPlugin);

const colors = ['#FF008C', '#D309E1', '#9C1AFF', '#7700FF', '#4400FF'];

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};
interface IItem {
  id: number;
  name: string;
  url: string;
  button: boolean;
}
const MenuItem = ({ i }: { i: IItem }) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const isOpen = menuSlice((state) => state.isOpen);

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
    listItem: cn(
      'flex items-center justify-center font-futura',
      'w-full p-0 cursor-pointer',
      'rounded-md list-none z-50 text-center'
    ),
    listButton: cn(
      'bg-primary-500 px-6 py-2 text-white rounded-md z-50 font-futura text-center'
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
    <motion.li
      className={i.button ? classes.listButton : classes.listItem}
      variants={itemVariants}
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <a
        href={i.url}
        onClick={(e) => handleSmoothScroll(e, i.url)}
        className={linkClass(i.url)}
      >
        {i.name}
      </a>
    </motion.li>
  );
};

export default MenuItem;
