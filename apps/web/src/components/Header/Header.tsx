import React, { useState, useEffect } from "react";
import {
  useMotionValueEvent,
  useScroll,
  motion,
  AnimatePresence,
} from "framer-motion";
import { useMediaQuery } from "src/utils/hooks";
import Navbar from "./Navbar";
import cn from "../../utils/cn";

interface HeaderProps {
  isBlog?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isBlog = false }) => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isDesktopXl = useMediaQuery("(min-width: 1280px)");
  const isDesktop2Xl = useMediaQuery("(min-width: 1536px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 100);
  });

  const headerVariants = isDesktop2Xl
    ? {
        initial: { width: "100%", marginTop: "0" },
        scrolled: { width: "25%", marginTop: "1rem" },
      }
    : isDesktopXl
      ? {
          initial: { width: "100%", marginTop: "0" },
          scrolled: { width: "28%", marginTop: "1rem" },
        }
      : isDesktop
        ? {
            initial: { width: "100%", marginTop: "0" },
            scrolled: { width: "30%", marginTop: "1rem" },
          }
        : {
            initial: { width: "100%", marginTop: "0" },
            scrolled: { width: "100%", marginTop: "1rem" },
          };

  const usedHeaderVariants = isBlog
    ? {
        initial: { width: "100%", marginTop: "0" },
        scrolled: { width: "100%", marginTop: "0" },
      }
    : headerVariants;

  const paddingVariants = isDesktop2Xl
    ? {
        initial: { paddingLeft: "20rem", paddingRight: "20rem" },
        scrolled: { paddingLeft: "0.5rem", paddingRight: "0.5rem" },
      }
    : isDesktopXl
      ? {
          initial: { paddingLeft: "20rem", paddingRight: "20rem" },
          scrolled: { paddingLeft: "0.75rem", paddingRight: "0.75rem" },
        }
      : isDesktop
        ? {
            initial: { paddingLeft: "20rem", paddingRight: "20rem" },
            scrolled: { paddingLeft: "1rem", paddingRight: "1rem" },
          }
        : {
            initial: { width: "100%", marginTop: "0" },
            scrolled: { paddingLeft: "1rem", paddingRight: "1rem" },
          };

  const backgroundVariants = {
    initial: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const classes = {
    header: cn(
      "fixed top-0 right-0 left-0",
      "flex",
      "transition duration-200",
      "md:justify-center md:items-center",
      "mx-auto",
      scrolled
        ? isBlog
          ? "h-[4rem]"
          : "h-[4rem]"
        : isBlog
          ? "h-[5rem]"
          : "h-[8rem]",
      "bg-transparent",
      "z-50",
    ),
    animateHeader: cn(
      "absolute top-0 left-0 right-0 z-10",
      "bg-white/40 backdrop-blur-lg",
      "border border-white/20",
      "mx-auto",
      "h-full rounded-2xl",
      "shadow-xl shadow-black/10",
    ),
  };

  return (
    <motion.header
      className={classes.header}
      variants={usedHeaderVariants}
      animate={scrolled ? "scrolled" : "initial"}
      transition={{ duration: 0.8, ease: "circInOut" }}
      suppressHydrationWarning
      style={{ opacity: mounted ? 1 : 1 }}
    >
      <AnimatePresence>
        {scrolled ? (
          <motion.div
            key="background"
            variants={backgroundVariants}
            initial="initial"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.8, ease: "circInOut" }}
            className={cn(classes.animateHeader, "flex items-center")}
          >
            {/* Contenedor animado con padding - dentro del glass */}
            <motion.div
              layout
              variants={paddingVariants}
              initial="initial"
              animate="scrolled"
              transition={{ duration: 0.8, ease: "circInOut" }}
              className="w-full z-20 h-full flex items-center"
            >
              <Navbar showSearch={isBlog} isCompacted={true} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="initial"
            layout
            variants={paddingVariants}
            initial="initial"
            animate="initial"
            transition={{ duration: 0.8, ease: "circInOut" }}
            className={cn(
              "w-full z-20",
              "h-2/3",
            )}
          >
            <img
              src="/images/anclarojo.png"
              alt="logo"
              className="w-[3rem] h-[3rem] mt-[1rem] mb-[1rem] hidden"
            />
            <Navbar showSearch={isBlog} isCompacted={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
