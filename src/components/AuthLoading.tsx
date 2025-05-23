import React from 'react';
import { motion } from 'framer-motion';

interface AuthLoadingProps {
    darkMode?: boolean;
}

const AuthLoading: React.FC<AuthLoadingProps> = ({ darkMode = false }) => {
    return (
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-dark-background' : 'bg-light-background'
            }`}>
            <div className="text-center">
                {/* Animated Logo */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-t-transparent"
                    style={{
                        borderColor: darkMode ? '#184C74' : '#1A5885',
                        borderTopColor: 'transparent'
                    }}
                />

                {/* Loading Text */}
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`text-2xl font-bold mb-4 ${darkMode ? 'text-dark-primary' : 'text-light-tertiary'
                        }`}
                >
                    Viralytics
                </motion.h2>

                {/* Loading Message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`text-lg ${darkMode ? 'text-dark-primary/80' : 'text-light-tertiary/80'
                        }`}
                >
                    Authenticating...
                </motion.p>

                {/* Animated Dots */}
                <motion.div
                    className="flex justify-center items-center space-x-1 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                delay: i * 0.3
                            }}
                            className={`w-2 h-2 rounded-full ${darkMode ? 'bg-dark-primary' : 'bg-light-tertiary'
                                }`}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLoading; 