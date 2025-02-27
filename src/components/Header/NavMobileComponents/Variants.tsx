import React, { useState, useRef, useEffect } from 'react';
import * as motion from 'motion/react-client';
import Navigation from './Navigation';
import MenuToggle from './MenuToggle';
import cn from 'src/utils/cn';

/**
 * ==============   Utils   ================
 */

// Naive implementation - in reality would want to attach
// a window or resize listener. Also use state/layoutEffect instead of ref/effect
// if this is important to know on initial client render.
// It would be safer to  return null for unmeasured states.
const useDimensions = (ref: React.RefObject<HTMLDivElement | null>) => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      dimensions.current.width = ref.current.offsetWidth;
      dimensions.current.height = ref.current.offsetHeight;
    }
  }, [ref]);

  return dimensions.current;
};

const Variants: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { height } = useDimensions(containerRef);

  const sidebarVariants = {
    open: (height = 1000) => ({
      clipPath: `circle(${height * 2 + 200}px at 40px 40px)`,
      transition: {
        type: 'spring',
        stiffness: 20,
        restDelta: 2,
      },
    }),
    closed: {
      clipPath: 'circle(30px at 40px 40px)',
      transition: {
        delay: 0.2,
        type: 'spring',
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const classes = {
    container: cn(
      'fixed flex justify-start align-stretch',
      'flex-1 w-screen h-screen',
      'overflow-hidden z-20'
    ),
    nav: cn('w-full'),
    background: cn(
      'bg-white/10 backdrop-blur-md',
      'absolute top-0 left-0 right-0 bottom-0',
      'flex flex-col justify-center items-center',
      'w-screen h-screen z-50'
    ),
  };

  return (
    <div>
      <div className={classes.container}>
        <motion.nav
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          custom={height}
          ref={containerRef}
          className={classes.nav}
        >
          <motion.div
            className={classes.background}
            variants={sidebarVariants}
          />
          <Navigation />
          <MenuToggle toggle={() => setIsOpen(!isOpen)} isOpen={isOpen} />
        </motion.nav>
      </div>
    </div>
  );
};

export default Variants;
