import React from 'react';
import { motion } from 'framer-motion';
import cn from 'src/utils/cn';
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

const MenuItem = ({ i }: { i: number }) => {
  const border = `2px solid ${colors[i]}`;
  const classes = {
    listItem: cn(
      'flex items-center justify-start',
      'w-full p-0 mb-20 mt-0 ml-0 mr-0 cursor-pointer',
      'rounded-md list-none'
    ),
    iconPlaceholder: cn('w-12 h-12 mr-4', 'rounded-md flex', `${border}`),
    textPlaceholder: cn('w-32 h-6', 'rounded-md', `${border}`),
  };
  return (
    <motion.li
      className={classes.listItem}
      variants={itemVariants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={classes.iconPlaceholder} />
      <div className={classes.textPlaceholder} />
    </motion.li>
  );
};

export default MenuItem;
