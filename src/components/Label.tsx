import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface LabelProps {
  darkMode: boolean;
}

const Label: React.FC<LabelProps> = ({ darkMode }) => {
  // Log component mount and theme changes
  useEffect(() => {
    console.log('[Label] Component mounted with dark mode:', darkMode);
    return () => console.log('[Label] Component unmounting');
  }, []);

  useEffect(() => {
    console.log('[Label] Theme changed to:', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const theme = {
    background: darkMode 
      ? 'bg-dark-background/80'
      : 'bg-light-background/80',
    text: darkMode
      ? 'text-dark-primary'
      : 'text-light-tertiary',
    border: darkMode
      ? 'border-dark-primary/20'
      : 'border-light-primary/20',
    glow: darkMode
      ? 'from-dark-primary/20 via-dark-secondary/20 to-dark-tertiary/20'
      : 'from-light-primary/20 via-light-secondary/20 to-light-tertiary/20',
    hover: darkMode
      ? 'hover:bg-dark-primary/10'
      : 'hover:bg-light-primary/10'
  };

  const labelVariants = {
    initial: { 
      opacity: 0,
      y: -20,
      scale: 0.95
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 1
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Log animation states
  const handleAnimationStart = () => {
    console.log('[Label] Animation started');
  };

  const handleAnimationComplete = () => {
    console.log('[Label] Animation completed');
  };

  const handleHoverStart = () => {
    console.log('[Label] Hover started');
  };

  const handleHoverEnd = () => {
    console.log('[Label] Hover ended');
  };
  
  return (
    <motion.div
      className="flex justify-center mb-8"
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={labelVariants}
      onAnimationStart={handleAnimationStart}
      onAnimationComplete={handleAnimationComplete}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
    >
      <div className="inline-flex relative justify-center items-center">
        {/* Glowing background effect */}
        <motion.div 
          className={`
            absolute -inset-3 
            bg-gradient-to-r ${theme.glow}
            opacity-50 blur-xl
            transition-opacity duration-300
          `}
        />
        
        {/* Pulse effect */}
        <motion.div
          className={`
            absolute inset-0 
            rounded-xl
            bg-gradient-to-r ${theme.glow}
            transition-opacity duration-300
          `}
          variants={pulseVariants}
          animate="animate"
        />
        
        {/* Main label */}
        <motion.div
          className={`
            relative 
            px-6 py-2 
            rounded-xl
            border ${theme.border}
            ${theme.background}
            backdrop-blur-sm
            flex items-center gap-2
            font-medium
            ${theme.text}
            ${theme.hover}
            transition-all duration-300
            shadow-lg shadow-black/5
          `}
        >
          <motion.span 
            role="img" 
            aria-label="Twitter bird"
            whileHover={{ 
              rotate: [0, -10, 10, -10, 0],
              transition: { duration: 0.5 }
            }}
            onHoverStart={() => console.log('[Label] Emoji hover started')}
          >
            🐦
          </motion.span>
          <span className="font-semibold">Twitter Analytics Tool</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Label;