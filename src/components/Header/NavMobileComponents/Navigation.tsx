import React from 'react';
import { motion } from 'framer-motion';
import MenuItem from './MenuItem';
import cn from 'src/utils/cn';
import items from 'src/utils/navbar.json';

const navVariants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};
interface IItem {
  id: number;
  name: string;
  url: string;
  button: boolean;
}

const Navigation = () => {
  const classes = {
    list: cn(
      'list-none py-[4rem] px-[3rem] m-0',
      'h-full w-full',
      'flex flex-col justify-between items-center',
      'top-10'
    ),
  };

  return (
    <motion.ul className={classes.list} variants={navVariants}>
      {items.map((item: IItem) => (
        <MenuItem i={item} key={item.id} />
      ))}
    </motion.ul>
  );
};

export default Navigation;
