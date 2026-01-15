import React, { useState, useEffect } from 'react';
import DesktopHeader from './Header';
import MobileHeader from './MobileNav';

interface HeaderProps {
  isBlog?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isBlog }) => {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (windowWidth === 0) return null;

  return windowWidth > 768 ? (
    <DesktopHeader isBlog={isBlog} />
  ) : (
    <MobileHeader />
  );
};

export default Header;
