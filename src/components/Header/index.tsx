import React, { useState, useEffect } from "react";
import DesktopHeader from "./Header";
import MobileHeader from "./MobileNav";

interface HeaderProps {
  isBlog?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isBlog }) => {
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mostrar versión desktop por defecto si aún no se ha determinado el ancho
  const isDesktop = windowWidth === null || (windowWidth ?? 0) > 768;

  // Evitar hydration mismatch retornando null hasta que esté mounted
  if (!mounted) {
    return <div style={{ height: "8rem" }} />;
  }

  return isDesktop ? <DesktopHeader isBlog={isBlog} /> : <MobileHeader />;
};

export default Header;
