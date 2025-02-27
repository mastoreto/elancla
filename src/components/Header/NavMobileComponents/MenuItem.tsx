import React from 'react';
import { motion } from 'framer-motion';
import cn from 'src/utils/cn';
import menuSlice from 'src/stores/menuSlice';

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
  const isOpen = menuSlice((state) => state.isOpen);
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
  return (
    <motion.li
      className={i.button ? classes.listButton : classes.listItem}
      variants={itemVariants}
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <a href={i.url}>{i.name}</a>
    </motion.li>
  );
};

export default MenuItem;
