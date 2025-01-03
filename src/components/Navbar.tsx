"use client"
import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, Moon, LogOut, User } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    isLoading,
    error
  } = useAuth0();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  const notifications = [
    { id: 1, text: "Welcome back! 👋", time: "just now" },
    { id: 2, text: "Your last login was from a new device", time: "2h ago" },
    { id: 3, text: "Check out new AI features!", time: "1d ago" },
  ];

  useEffect(() => {
    function handleClickOutside(_event: MouseEvent): void {
      if (userMenuRef.current && !userMenuRef.current) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showUserMenu) setShowNotifications(false);
  }, [showUserMenu]);

  useEffect(() => {
    if (showNotifications) setShowUserMenu(false);
  }, [showNotifications]);

  useEffect(() => {
    if (error) {
      console.error('Auth0 Error:', error.message);
    }
  }, [error]);

  const menuVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const shimmerVariants = {
    initial: { x: '-100%', opacity: 0.5 },
    animate: {
      x: '100%',
      opacity: 0.8,
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: 'linear'
      }
    }
  };

  const UserProfile = () => {
    if (!user) return null;

    const userImage = user.picture || '/api/placeholder/40/40';
    const userName = user.name || 'User';
    const userEmail = user.email || '';

    return (
      <div className="flex relative gap-4 items-center">
        <div className="relative" ref={notificationRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className={`
              p-2.5 rounded-xl
              ${darkMode
                ? 'bg-surface-dark/90 border-secondary-800/50'
                : 'bg-surface-light/90 border-primary-200/50'}
              border backdrop-blur-sm
              transition-all duration-300
              hover:shadow-ambient-lg
            `}
          >
            <Bell className={`w-6 h-6 ${darkMode ? 'text-skyblue-300' : 'text-skyblue-600'}`} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-skyblue-500" />
            )}
          </motion.button>

          <AnimatePresence mode="wait">
            {showNotifications && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={menuVariants}
                className={`
                  absolute right-0 mt-2 w-80 rounded-xl
                  ${darkMode
                    ? 'bg-surface-dark/90 border-secondary-800/50'
                    : 'bg-surface-light/90 border-primary-200/50'}
                  border backdrop-blur-sm
                  shadow-ambient-lg
                  z-50
                `}
              >
                <div className="p-4">
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-text-dark-primary' : 'text-text-light-primary'
                    }`}>
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    {notifications.map(notification => (
                      <motion.div
                        key={notification.id}
                        whileHover={{ scale: 1.02 }}
                        className={`
                          p-3 rounded-lg cursor-pointer
                          ${darkMode
                            ? 'hover:bg-secondary-800/30'
                            : 'hover:bg-primary-50'}
                          transition-all duration-300
                        `}
                      >
                        <p className={`text-sm ${darkMode ? 'text-text-dark-primary' : 'text-text-light-primary'
                          }`}>
                          {notification.text}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-text-dark-secondary' : 'text-text-light-secondary'
                          }`}>
                          {notification.time}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={userMenuRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`
              p-2 rounded-xl
              ${darkMode
                ? 'bg-surface-dark/90 border-secondary-800/50'
                : 'bg-surface-light/90 border-primary-200/50'}
              border backdrop-blur-sm
              transition-all duration-300
              hover:shadow-ambient-lg
              flex items-center gap-3
            `}
          >
            <div className="relative">
              <div className="overflow-hidden w-10 h-10 rounded-full border-2 border-skyblue-500">
                {userImage ? (
                  <img
                    src={userImage}
                    alt={userName}
                    className="object-cover w-full h-full"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const img = e.currentTarget;
                      img.src = '/api/placeholder/40/40';
                      img.onerror = null;
                    }}
                  />
                ) : (
                  <div className="flex justify-center items-center w-full h-full bg-skyblue-100">
                    <User className="w-6 h-6 text-skyblue-500" />
                  </div>
                )}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 ${darkMode ? 'border-surface-dark' : 'border-surface-light'
                }`} />
            </div>
            <span className={`text-lg font-medium hidden md:block ${darkMode ? 'text-text-dark-primary' : 'text-text-light-primary'
              }`}>
              {userName}
            </span>
          </motion.button>

          <AnimatePresence mode="wait">
            {showUserMenu && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={menuVariants}
                className={`
                  absolute right-0 mt-2 w-64 rounded-xl
                  ${darkMode
                    ? 'bg-surface-dark/90 border-secondary-800/50'
                    : 'bg-surface-light/90 border-primary-200/50'}
                  border backdrop-blur-sm
                  shadow-ambient-lg
                  z-50
                `}
              >
                <div className="p-4">
                  <div className="flex gap-3 items-center mb-4">
                    <div className="overflow-hidden w-12 h-12 rounded-full border-2 border-skyblue-500">
                      {userImage ? (
                        <img
                          src={userImage}
                          alt={userName}
                          className="object-cover w-full h-full"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            const img = e.currentTarget;
                            img.src = '/api/placeholder/48/48';
                            img.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="flex justify-center items-center w-full h-full bg-skyblue-100">
                          <User className="w-8 h-8 text-skyblue-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-text-dark-primary' : 'text-text-light-primary'
                        }`}>
                        {userName}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-text-dark-secondary' : 'text-text-light-secondary'
                        }`}>
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      try {
                        logout();
                      } catch (error) {
                        console.error('Logout error:', error);
                      }
                    }}
                    className={`
                      w-full p-2 rounded-lg
                      flex items-center gap-2
                      ${darkMode
                        ? 'text-red-400 hover:bg-secondary-800/30'
                        : 'text-red-500 hover:bg-primary-50'}
                      transition-all duration-300
                    `}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-20" />

      <nav className={`
        fixed top-0 left-0 right-0 w-full z-40
        ${darkMode
          ? 'bg-gradient-to-br from-secondary-500 via-secondary-400/30 to-secondary-300/20 border-secondary-400/20'
          : 'bg-gradient-to-br from-primary-50 via-primary-100/60 to-skyblue-200/40 border-primary-200/30'}
        border-b backdrop-blur-sm
        transition-colors duration-300 bg-grain
      `}>
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 to-transparent bg-gradient-radial from-skyblue-500/10"></div>
          <div className={`absolute inset-0 opacity-35 
            ${darkMode ? 'bg-noise-dark' : 'bg-noise-light'}`}
          ></div>
        </div>

        <div className="relative z-10 px-4 mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              className="relative text-3xl font-bold"
            >
              <span className={`bg-clip-text text-transparent bg-gradient-to-r 
                ${darkMode
                  ? 'from-skyblue-300 to-skyblue-400'
                  : 'from-skyblue-600 to-skyblue-500'}`}>
                Viralytics
              </span>
            </motion.a>

            <div className="flex gap-4 items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className={`
                  p-2.5 rounded-xl
                  ${darkMode
                    ? 'bg-surface-dark/90 border-secondary-800/50'
                    : 'bg-surface-light/90 border-primary-200/50'}
                  border backdrop-blur-sm
                  transition-all duration-300
                  hover:shadow-ambient-lg
                `}
              >
                {darkMode ? (
                  <Sun className={`w-6 h-6 ${darkMode ? 'text-skyblue-300' : 'text-skyblue-600'}`} />
                ) : (
                  <Moon className={`w-6 h-6 ${darkMode ? 'text-skyblue-300' : 'text-skyblue-600'}`} />
                )}
              </motion.button>

              {isLoading ? (
                <div className="w-6 h-6 rounded-full border-2 animate-spin border-skyblue-500 border-t-transparent" />
              ) : error ? (
                <div className="text-red-500">Authentication Error</div>
              ) : !isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => loginWithRedirect()}
                  className="flex overflow-hidden relative justify-center items-center px-8 py-3 font-semibold text-white bg-gradient-to-r rounded-xl transition-all duration-300 from-skyblue-500 to-skyblue-600 hover:from-skyblue-600 hover:to-skyblue-700 shadow-ambient hover:shadow-ambient-lg"
                >
                  <motion.div
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent to-transparent via-white/20"
                  />
                  Sign In
                </motion.button>
              ) : (
                <UserProfile />
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
