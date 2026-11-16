import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import cn from 'src/utils/cn';
import menuSlice from 'src/stores/menuSlice';

interface PathProps {
  d?: string;
  variants: Variants;
  transition?: { duration: number };
  className?: string;
}

// Componente Path para cada línea
const Path: React.FC<PathProps> = (props) => (
  <motion.path
    fill="transparent"
    strokeWidth="3"
    stroke="#000" // Asegúrate de que el color sea visible en tu fondo
    strokeLinecap="round"
    {...props}
  />
);

// Componente principal de Toggle
const MenuToggle: React.FC = () => {
  const isOpen = menuSlice((state) => state.isOpen);
  const toggle = menuSlice((state) => state.toggleMenu);

  const classes = {
    background: cn(
      'outline-none border-0 select-none cursor-pointer',
      'absolute top-4 left-7 w-[50px] h-[50px]',
      'rounded-full bg-transparent z-[100]'
    ),
  };
  return (
    <button onClick={() => toggle()} className={classes.background}>
      <motion.svg
        width="23"
        height="23"
        viewBox="0 0 23 23"
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
      >
        <Path
          variants={{
            closed: { d: 'M 2 2.5 L 20 2.5' },
            open: { d: 'M 3 16.5 L 17 2.5' },
          }}
        />
        <Path
          d="M 2 9.423 L 20 9.423"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
          transition={{ duration: 0.1 }}
        />
        <Path
          variants={{
            closed: { d: 'M 2 16.346 L 20 16.346' },
            open: { d: 'M 3 2.5 L 17 16.346' },
          }}
        />
      </motion.svg>
    </button>
  );
};

export default MenuToggle;
