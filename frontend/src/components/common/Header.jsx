import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '../ui';
import { ANIMATIONS, ROUTES } from '../../utils';

const Header = ({ title, backTo, actions = null, showLogo = true }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate(backTo || ROUTES.HOME);
  };

  return (
    <motion.header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 px-6 py-4" {...ANIMATIONS.slideInFromLeft}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {showLogo && (
            <motion.button onClick={handleLogoClick} className="flex items-center space-x-2" {...ANIMATIONS.scaleOnHover}>
              <BookOpen className="h-8 w-8" />
              {!title && <span className="text-xl font-bold">Appointed</span>}
            </motion.button>
          )}
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
        </div>
        {actions && <div className="flex items-center space-x-3">{actions}</div>}
      </div>
    </motion.header>
  );
};

export default Header;
