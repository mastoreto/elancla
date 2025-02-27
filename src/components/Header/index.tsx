import React, { useState, useEffect } from 'react';
import DesktopHeader from './Header';
import MobileHeader from './MobileNav';
const Header = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  return windowWidth > 768 ? <DesktopHeader /> : <MobileHeader />;
};

export default Header;
