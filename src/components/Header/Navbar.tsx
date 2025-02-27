import React, { useState } from 'react';
import cn from 'src/utils/cn';

const Navbar: React.FC = () => {
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

  return (
    <nav id="menu" className={classes.nav}>
      <ul className={classes.ul}>
        <li className="text-white md:text-black">
          <a href="#inicio">INICIO</a>
        </li>
        <li className="text-white md:text-black">
          <a href="#elancla">EL ANCLA</a>
        </li>
        <li className="text-white md:text-black">
          <a href="#actividades">ACTIVIDADES</a>
        </li>
        <li className="text-white md:text-black">
          <a href="#sermones">SERMONES</a>
        </li>
        <li className="text-white md:text-black">
          <a href="#ministerios">MINISTERIOS</a>
        </li>
        <li className="bg-primary-500 px-6 py-2 text-white rounded-md">
          <a href="#visitanos">Visítanos</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
