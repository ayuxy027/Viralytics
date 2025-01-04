import React, { useState, useEffect, useRef } from 'react';
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
  } = useAuth0();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const notifications = [
    { id: 1, text: "Welcome back! 👋", time: "just now" },
    { id: 2, text: "Your last login was from a new device", time: "2h ago" },
    { id: 3, text: "Check out new AI features!", time: "1d ago" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showUserMenu) {
      setShowNotifications(false);
    }
  }, [showUserMenu]);

  useEffect(() => {
    if (showNotifications) {
      setShowUserMenu(false);
    }
  }, [showNotifications]);

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

  const UserProfile = () => {
    if (!user) {
      return null;
    }

    const userImage = user.picture || 'https://via.placeholder.com/150';

    return (
      <div className="flex items-center space-x-2">
        <img src={userImage} alt={user.name} className="w-8 h-8 rounded-full" />
        <span className={darkMode ? "text-dark-primary" : "text-light-tertiary"}>{user.name}</span>
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-20" />

      <nav className={`
        fixed top-0 left-0 right-0 w-full z-40
        ${darkMode
          ? 'bg-dark-background border-dark-primary/20'
          : 'bg-light-background border-light-primary/20'}
        border-b backdrop-blur-sm
        transition-colors duration-300
      `}>
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 opacity-85 bg-noise`}></div>
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
                  ? 'from-dark-primary via-dark-secondary to-dark-tertiary'
                  : 'from-light-primary via-light-secondary to-light-tertiary'}`}>
                Viralytics
              </span>
            </motion.a>

            <div className="flex items-center space-x-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  darkMode 
                    ? 'hover:bg-dark-primary/20' 
                    : 'hover:bg-light-primary/20'
                }`}
              >
                {darkMode ? (
                  <Sun className="w-6 h-6 text-dark-primary" />
                ) : (
                  <Moon className="w-6 h-6 text-light-tertiary" />
                )}
              </motion.button>

              {isAuthenticated ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-md transition-colors duration-300 ${
                      darkMode 
                        ? 'hover:bg-dark-primary/20' 
                        : 'hover:bg-light-primary/20'
                    }`}
                  >
                    <Bell className={`w-6 h-6 ${darkMode ? "text-dark-primary" : "text-light-tertiary"}`} />
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div
                          ref={notificationRef}
                          variants={menuVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`absolute right-0 z-50 mt-2 w-72 rounded-xl shadow-lg border ${
                            darkMode 
                              ? "bg-dark-background border-dark-primary/20" 
                              : "bg-light-background border-light-primary/20"
                          }`}
                        >
                          <div className="p-2">
                            {notifications.map(notification => (
                              <div 
                                key={notification.id} 
                                className={`flex flex-col p-3 rounded-lg transition-colors duration-300 ${
                                  darkMode 
                                    ? "hover:bg-dark-primary/10" 
                                    : "hover:bg-light-primary/10"
                                }`}
                              >
                                <span className={`text-sm font-medium ${
                                  darkMode ? "text-dark-primary" : "text-light-tertiary"
                                }`}>
                                  {notification.text}
                                </span>
                                <span className={`text-xs mt-1 ${
                                  darkMode ? "text-dark-secondary" : "text-light-secondary"
                                }`}>
                                  {notification.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  <div className="relative" ref={userMenuRef}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`flex items-center p-2 rounded-md transition-colors duration-300 ${
                        darkMode 
                          ? 'hover:bg-dark-primary/20' 
                          : 'hover:bg-light-primary/20'
                      }`}
                    >
                      <User className={`w-6 h-6 ${darkMode ? "text-dark-primary" : "text-light-tertiary"}`} />
                      <UserProfile />
                    </motion.button>
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          variants={menuVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className={`absolute right-0 z-50 mt-2 w-48 rounded-xl shadow-lg border ${
                            darkMode 
                              ? "bg-dark-background border-dark-primary/20" 
                              : "bg-light-background border-light-primary/20"
                          }`}
                        >
                          <div className="p-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              onClick={() => logout()}
                              className={`p-3 w-full text-left rounded-lg transition-colors duration-300 ${
                                darkMode 
                                  ? "hover:bg-dark-primary/10 text-dark-primary" 
                                  : "hover:bg-light-primary/10 text-light-tertiary"
                              }`}
                            >
                              <LogOut className="inline mr-2 w-4 h-4" />
                              Logout
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => loginWithRedirect()}
                  className={`px-4 py-2 font-medium rounded-xl transition-colors duration-300 ${
                    darkMode
                      ? "bg-dark-primary text-dark-background hover:bg-dark-secondary"
                      : "bg-light-tertiary text-light-background hover:bg-light-primary"
                  }`}
                >
                  Log In
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;