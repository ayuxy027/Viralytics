import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, Moon, LogOut, Menu, X, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Define proper types
interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface Notification {
  id: number;
  text: string;
  time: string;
  link: string;
}

// Animation variants
const menuVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 }
  },
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }
};

const mobileMenuVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } }
};

// Define proper User type
interface Auth0User {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
  [key: string]: unknown;
}

// UserProfile Component
const UserProfile: React.FC<{ user: Auth0User | undefined; darkMode: boolean }> = ({ user, darkMode }) => {
  if (!user) return null;
  const userImage = user.picture || '/api/placeholder/150/150';

  return (
    <motion.div className="flex items-center space-x-2" initial={false} animate={{ opacity: 1 }}>
      <img
        src={userImage}
        alt={user.name}
        className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full ring-2 ring-opacity-50 ring-offset-2 transition-all duration-300 ${darkMode
            ? "ring-dark-primary ring-offset-dark-background"
            : "ring-light-primary ring-offset-light-background"
          }`}
      />
      <span className={`font-medium hidden sm:block text-sm sm:text-base md:text-lg transition-colors duration-300 ${darkMode ? "text-dark-primary" : "text-light-tertiary"
        }`}>
        {user.name}
      </span>
    </motion.div>
  );
};

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refs for click outside detection
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Sample notifications - in real app, this would come from an API
  const notifications: Notification[] = [
    { id: 1, text: "Welcome to Viralytics!", time: "Just Now", link: "/" },
    { id: 2, text: "Your Login Was Successful!", time: "Just Now", link: "/" },
    { id: 3, text: "Check out our new Tools!", time: "1d ago", link: "/analytics" },
  ];
  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside effect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation handlers
  const handleRouteChange = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
    setShowNotifications(false);
  };

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  const navItems = ['Analytics', 'Leaderboard', 'Health', 'Content'];

  return (
    <motion.nav
      initial={false}
      animate={{
        backgroundColor: isScrolled
          ? darkMode ? 'rgba(24, 76, 116, 0.85)' : 'rgba(220, 229, 237, 0.85)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
      }}
      className="fixed top-0 right-0 left-0 z-40 w-full transition-all duration-300"
    >
      <div className="px-3 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            className="relative z-10 text-lg font-extrabold tracking-tight sm:text-xl md:text-2xl lg:text-3xl"
          >
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${darkMode ? 'from-dark-primary to-dark-secondary' : 'from-light-primary to-light-secondary'
              }`}>
              Viralytics
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden items-center space-x-2 md:flex lg:space-x-4 xl:space-x-6">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => handleRouteChange(`/${item.toLowerCase()}`)}
                  className={`
                    text-sm lg:text-base font-medium px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-all duration-300
                    ${darkMode ? "text-dark-primary hover:bg-dark-primary/10" : "text-light-tertiary hover:bg-light-primary/10"}
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${darkMode ? "focus:ring-dark-primary focus:ring-offset-dark-background" : "focus:ring-light-primary focus:ring-offset-light-background"}
                  `}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {/* Right Side Menu Items */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4">
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${darkMode ? 'hover:bg-dark-primary/20 text-dark-primary' : 'hover:bg-light-primary/20 text-light-tertiary'
                }`}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              )}
            </motion.button>

            {/* GitHub Link */}
            <motion.a
              href="https://github.com/ayuxy027/Viralytics"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className={`flex items-center space-x-1 p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300
                ${darkMode ? "text-dark-primary hover:bg-dark-primary/10" : "text-light-tertiary hover:bg-light-primary/10"}`}
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              {!isAuthenticated && (
                <span className="hidden text-xs sm:inline-block">Proudly Open Source</span>
              )}
            </motion.a>

            {/* Authenticated Menu Items */}
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${darkMode ? 'hover:bg-dark-primary/20 text-dark-primary' : 'hover:bg-light-primary/20 text-light-tertiary'
                      }`}
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </motion.button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`absolute right-0 mt-2 w-60 sm:w-64 md:w-72 rounded-xl shadow-lg border backdrop-blur-md ${darkMode ? "bg-dark-background/95 border-dark-primary/20" : "bg-light-background/95 border-light-primary/20"
                          }`}
                      >
                        <div className="p-2">
                          {notifications.map(notification => (
                            <motion.button
                              onClick={() => handleRouteChange(notification.link)}
                              key={notification.id}
                              whileHover={{ scale: 1.02 }}
                              className={`flex flex-col w-full p-2 sm:p-3 rounded-lg transition-all duration-300 ${darkMode ? "hover:bg-dark-primary/10" : "hover:bg-light-primary/10"
                                }`}
                            >
                              <span className={`text-xs sm:text-sm md:text-base font-medium ${darkMode ? "text-dark-primary" : "text-light-tertiary"
                                }`}>
                                {notification.text}
                              </span>
                              <span className={`text-xs mt-1 ${darkMode ? "text-dark-secondary" : "text-light-secondary"
                                }`}>
                                {notification.time}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${darkMode ? 'hover:bg-dark-primary/20' : 'hover:bg-light-primary/20'
                      }`}
                  >
                    <UserProfile user={user} darkMode={darkMode} />
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`absolute right-0 mt-2 w-40 sm:w-44 md:w-48 rounded-xl shadow-lg border backdrop-blur-md ${darkMode ? "bg-dark-background/95 border-dark-primary/20" : "bg-light-background/95 border-light-primary/20"
                          }`}
                      >
                        <div className="p-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={handleLogout}
                            className={`flex items-center w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg transition-all duration-300 ${darkMode ? "hover:bg-dark-primary/10 text-dark-primary" : "hover:bg-light-primary/10 text-light-tertiary"
                              }`}
                          >
                            <LogOut className="mr-2 w-4 h-4" />
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
                onClick={handleLogin}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${darkMode ? "bg-dark-primary text-dark-background hover:bg-dark-secondary" : "bg-light-tertiary text-light-background hover:bg-light-primary"
                  }`}
              >
                Log In
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-1 sm:p-2 rounded-lg sm:rounded-xl md:hidden transition-all duration-300 ${darkMode ? 'hover:bg-dark-primary/20 text-dark-primary' : 'hover:bg-light-primary/20 text-light-tertiary'
                }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed inset-y-0 right-0 w-48 sm:w-56 md:w-64 shadow-xl md:hidden ${darkMode ? "backdrop-blur-lg bg-dark-background/95" : "backdrop-blur-lg bg-light-background/95"
              }`}
          >
            <div className="flex flex-col p-4 mt-16 space-y-1 sm:p-6 sm:mt-20 sm:space-y-2">
              {isAuthenticated && navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => handleRouteChange(`/${item.toLowerCase()}`)}
                  className={`
                    w-full text-sm sm:text-base font-medium px-3 sm:px-4 py-2 sm:py-3 
                    rounded-lg transition-all duration-300
                    ${darkMode ? "text-dark-primary hover:bg-dark-primary/10" : "text-light-tertiary hover:bg-light-primary/10"}
                    focus:outline-none focus:ring-2
                    ${darkMode ? "focus:ring-dark-primary" : "focus:ring-light-primary"}
                  `}
                >
                  {item}
                </button>
              ))}

              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handleLogout}
                  className={`
                    w-full text-sm sm:text-base font-medium px-3 sm:px-4 py-2 sm:py-3 
                    rounded-lg transition-all duration-300 mt-4 flex items-center
                    ${darkMode ? "text-dark-primary hover:bg-dark-primary/10" : "text-light-tertiary hover:bg-light-primary/10"}
                  `}
                >
                  <LogOut className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Logout
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;