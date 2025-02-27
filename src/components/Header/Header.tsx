import React, { useState } from 'react';
import {
  useMotionValueEvent,
  useScroll,
  motion,
  AnimatePresence,
} from 'framer-motion';
import Navbar from './Navbar';
import cn from '../../utils/cn';

const Header = () => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  // Actualizamos el estado cuando se supera el scroll deseado.
  useMotionValueEvent(scrollY, 'change', (value) => {
    setScrolled(value > 100);
  });

  // Variants para el header principal
  const headerVariants = {
    initial: { width: '100%', marginTop: '0' },
    scrolled: { width: '40%', marginTop: '2rem' },
  };

  // Variants para el contenedor que ajusta el padding
  const paddingVariants = {
    initial: { paddingLeft: '20rem', paddingRight: '20rem' },
    scrolled: { paddingLeft: '1rem', paddingRight: '1rem' },
  };

  // Variants para el fondo animado
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
      'h-[8rem]',
      'bg-transparent',
      'w-screen',
      'z-50'
    ),
    animateHeader: cn(
      'mx-auto absolute top-0 left-0 right-0 z-10',
      'bg-white/30 backdrop-blur-md',
      'w-full',
      'h-full rounded-xl'
    ),
  };

  return (
    <motion.header
      className={classes.header}
      variants={headerVariants}
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
        <Navbar />
      </motion.div>
    </motion.header>
  );
};

export default Header;
