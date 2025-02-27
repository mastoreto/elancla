import React from 'react';
import { motion } from 'framer-motion';
import MenuItem from './MenuItem';
import cn from 'src/utils/cn';

const navVariants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const Navigation = () => {
  const classes = {
    list: cn(
      'list-none py-[4rem] px-[3rem] m-0',
      'h-[calc(100% - 80px)] w-full',
      'flex flex-col justify-between',
      'top-10'
    ),
  };

  return (
    <motion.ul className={classes.list} variants={navVariants}>
      {[0, 1, 2, 3, 4].map((i) => (
        <MenuItem i={i} key={i} />
      ))}
    </motion.ul>
  );
};

export default Navigation;
