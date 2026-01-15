import React, { useState } from 'react';
import {
  useMotionValueEvent,
  useScroll,
  motion,
  AnimatePresence,
} from 'framer-motion';
import { useMediaQuery } from 'src/utils/hooks';
import Navbar from './Navbar';
import cn from '../../utils/cn';

interface HeaderProps {
  isBlog?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isBlog = false }) => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isDesktopXl = useMediaQuery('(min-width: 1280px)');
  const isDesktop2Xl = useMediaQuery('(min-width: 1536px)');

  useMotionValueEvent(scrollY, 'change', (value) => {
    setScrolled(value > 100);
  });

  const headerVariants = isDesktop2Xl
    ? {
        initial: { width: '100%', marginTop: '0' },
        scrolled: { width: '40%', marginTop: '1rem' },
      }
    : isDesktopXl
      ? {
          initial: { width: '100%', marginTop: '0' },
          scrolled: { width: '55%', marginTop: '1rem' },
        }
      : isDesktop
        ? {
            initial: { width: '100%', marginTop: '0' },
            scrolled: { width: '60%', marginTop: '1rem' },
          }
        : {
            initial: { width: '100%', marginTop: '0' },
            scrolled: { width: '60%', marginTop: '1rem' },
          };

  const usedHeaderVariants = isBlog
    ? {
        initial: { width: '100%', marginTop: '0' },
        scrolled: { width: '100%', marginTop: '0' },
      }
    : headerVariants;

  const paddingVariants = isDesktop2Xl
    ? {
        initial: { paddingLeft: '20rem', paddingRight: '20rem' },
        scrolled: { paddingLeft: '1rem', paddingRight: '1rem' },
      }
    : isDesktopXl
      ? {
          initial: { paddingLeft: '20rem', paddingRight: '20rem' },
          scrolled: { paddingLeft: '1rem', paddingRight: '1rem' },
        }
      : isDesktop
        ? {
            initial: { paddingLeft: '20rem', paddingRight: '20rem' },
            scrolled: { paddingLeft: '1rem', paddingRight: '1rem' },
          }
        : {
            initial: { width: '100%', marginTop: '0' },
            scrolled: { width: '60%', marginTop: '1rem' },
          };

  const backgroundVariants = {
    initial: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const classes = {
    header: cn(
      'fixed top-0 right-0 left-0',
      'flex',
      'transition duration-200',
      'md:justify-center md:items-center',
      'mx-auto',
      isBlog ? 'h-[5rem]' : 'h-[8rem]',
      'bg-transparent',
      'z-50'
    ),
    animateHeader: cn(
      ' absolute top-0 left-0 right-0 z-10',
      'bg-white/30 backdrop-blur-md',
      'mx-auto',
      'h-full rounded-xl'
    ),
  };

  return (
    <motion.header
      className={classes.header}
      variants={usedHeaderVariants}
      animate={scrolled ? 'scrolled' : 'initial'}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {/* Fondo animado */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            key="background"
            variants={backgroundVariants}
            initial="initial"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className={classes.animateHeader}
          />
        )}
      </AnimatePresence>

      {/* Contenedor animado con padding */}
      <motion.div
        layout
        variants={paddingVariants}
        initial="initial"
        animate={scrolled ? 'scrolled' : 'initial'}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="w-full h-2/3 z-20"
      >
        <img
          src="/images/anclarojo.png"
          alt="logo"
          className="w-[3rem] h-[3rem] mt-[1rem] mb-[1rem] hidden"
        />
        <Navbar showSearch={isBlog} />
      </motion.div>
    </motion.header>
  );
};

export default Header;
