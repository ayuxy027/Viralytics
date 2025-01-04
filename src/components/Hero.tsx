import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';
import { Brain, ArrowRight, Download, TrendingUp, Heart, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import Label from './Label';

interface HeroProps {
  darkMode: boolean;
}

const Hero: React.FC<HeroProps> = ({ darkMode }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [_containerWidth, setContainerWidth] = useState<number>(0);

  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const stats = [
    { id: 1, label: "AI-Powered Analytics", value: "Smart Insights", icon: Brain },
    { id: 2, label: "Real-time Engagement", value: "Live Tracking", icon: TrendingUp },
    { id: 3, label: "Sentiment Analysis", value: "Deep Understanding", icon: Heart },
    { id: 4, label: "Optimal Post Timing", value: "Maximize Reach", icon: Clock },
  ];

  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#738fa7', '#c3ceda', '#0c4160'],
    });
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <section className={`relative pt-24 pb-32 overflow-hidden ${
      darkMode ? 'bg-dark-background' : 'bg-light-background'
    } bg-noise`}>
      {/* Gradient overlay */}
      <div className={`absolute inset-0 opacity-85 ${
        darkMode 
          ? 'bg-gradient-to-br from-dark-tertiary via-dark-secondary to-dark-primary'
          : 'bg-gradient-to-br from-light-tertiary via-light-secondary to-light-primary'
      }`} />

      <motion.div
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <Label darkMode={darkMode} />

        <motion.h1
          variants={heroVariants}
          className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight ${
            darkMode ? 'text-dark-primary' : 'text-light-background'
          }`}
        >
          Supercharge Your Twitter Growth with{' '}
          <motion.span
            initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
            animate={{
              backgroundColor: darkMode
                ? 'rgba(195, 206, 218, 0.1)'
                : 'rgba(248, 250, 252, 0.1)',
            }}
            transition={{ duration: 0.5 }}
            className="inline-block relative px-2 rounded-md"
          >
            Viralytics
          </motion.span>
        </motion.h1>

        <motion.p
          variants={heroVariants}
          className={`mt-6 text-xl max-w-3xl mx-auto ${
            darkMode ? 'text-dark-secondary' : 'text-light-background'
          }`}
        >
          Transform your Twitter strategy with AI-powered analytics. Track engagement, analyze sentiment, and post at the perfect time.
        </motion.p>

        <motion.div
          variants={heroVariants}
          className="flex flex-col gap-4 justify-center mt-10 sm:flex-row"
        >
          {!isAuthenticated ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => loginWithRedirect()}
              className={`flex justify-center items-center px-8 py-3 font-semibold rounded-xl transition-all duration-300 ${
                darkMode
                  ? 'bg-dark-primary text-dark-background hover:bg-dark-secondary'
                  : 'bg-light-tertiary text-light-background hover:bg-light-primary'
              } shadow-lg hover:shadow-xl`}
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex justify-center items-center px-8 py-3 font-semibold rounded-xl transition-all duration-300 ${
                  darkMode
                    ? 'bg-dark-primary text-dark-background hover:bg-dark-secondary'
                    : 'bg-light-tertiary text-light-background hover:bg-light-primary'
                } shadow-lg hover:shadow-xl`}
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={launchConfetti}
                className={`flex justify-center items-center px-8 py-3 font-semibold rounded-xl transition-all duration-300 ${
                  darkMode
                    ? 'bg-dark-secondary text-dark-background hover:bg-dark-primary'
                    : 'bg-light-primary text-light-background hover:bg-light-tertiary'
                } shadow-lg hover:shadow-xl`}
              >
                <Download className="mr-2 w-5 h-5" />
                Download Extension
              </motion.button>
            </div>
          )}
        </motion.div>

        <div ref={containerRef} className="relative mx-auto mt-20 max-w-6xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{
                    y: -5,
                    boxShadow: darkMode
                      ? '0 8px 32px -4px rgba(12, 65, 96, 0.3)'
                      : '0 8px 32px -4px rgba(115, 143, 167, 0.3)'
                  }}
                  transition={{ duration: 0.3 }}
                  className={`
                    p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300
                    ${darkMode
                      ? 'bg-dark-background/40 border-dark-primary/20'
                      : 'bg-light-background/40 border-light-primary/20'}
                    hover:shadow-lg
                    group
                  `}
                >
                  <div className="flex flex-col gap-4 items-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${darkMode 
                          ? 'bg-dark-primary/20' 
                          : 'bg-light-primary/20'}
                      `}
                    >
                      <Icon className={`w-6 h-6 ${
                        darkMode ? 'text-dark-primary' : 'text-light-tertiary'
                      }`} />
                    </motion.div>

                    <div>
                      <h3 className={`text-xl font-bold mb-1 ${
                        darkMode ? 'text-dark-primary' : 'text-light-tertiary'
                      }`}>
                        {stat.value}
                      </h3>
                      <p className={`text-sm ${
                        darkMode ? 'text-dark-secondary' : 'text-light-primary'
                      }`}>
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;