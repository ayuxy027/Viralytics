import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Trash2Icon, X, Minimize2, Maximize2, Send, Globe } from 'lucide-react';
import { FaRocketchat } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import groqService from '../ai/groqService';
import { SUPPORTED_LANGUAGES } from '../ai/aiPrompt';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

interface TwitterAnalyticsChatbotProps {
  darkMode: boolean;
  characterLimit?: number;
  cooldownDuration?: number;
  language?: string;
  showTimer?: boolean;
  showCharacterCount?: boolean;
}

// Language type definition
interface Language {
  code: string;
  name: string;
  nativeName: string;
}

// Markdown renderer component
const MarkdownRenderer: React.FC<{ content: string; darkMode: boolean }> = ({ content, darkMode }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        li: ({ ...props }) => (
          <li className={`list-item ${darkMode ? 'marker:text-dark-primary' : 'marker:text-light-primary'}`} {...props} />
        ),
        a: ({ ...props }) => (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className={`${darkMode ? 'text-dark-primary' : 'text-light-primary'} hover:underline`}
            {...props}
          />
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: ({ className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          return !match ? (
            <code
              className={`px-1 py-0.5 rounded text-sm font-mono ${darkMode ? 'bg-dark-secondary/20' : 'bg-light-secondary/20'
                }`}
              {...props}
            >
              {children}
            </code>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// Language selector component
const LanguageSelector: React.FC<{
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
  darkMode: boolean;
}> = ({ selectedLanguage, onSelectLanguage, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm transition-all ${darkMode
          ? 'bg-dark-background/50 hover:bg-dark-secondary/30 text-dark-background border border-dark-background/20'
          : 'bg-light-background/50 hover:bg-light-secondary/30 text-light-background border border-light-background/20'
          }`}
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage?.nativeName || "English"}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 z-50 mt-2 w-56 max-h-64 overflow-y-auto rounded-xl shadow-2xl backdrop-blur-sm ${darkMode
              ? 'border bg-dark-background/95 border-dark-secondary/20'
              : 'border bg-light-background/95 border-light-secondary/20'
              }`}
          >
            {SUPPORTED_LANGUAGES.map((language: Language) => (
              <motion.button
                key={language.code}
                whileHover={{ backgroundColor: darkMode ? 'rgba(24,76,116,0.1)' : 'rgba(26,88,133,0.1)' }}
                onClick={() => {
                  onSelectLanguage(language.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${selectedLanguage === language.code
                  ? (darkMode ? 'bg-dark-primary/10 font-medium' : 'bg-light-primary/10 font-medium')
                  : ''
                  }`}
              >
                <span className={`block ${darkMode ? 'text-dark-primary' : 'text-light-tertiary'}`}>
                  {language.nativeName}
                </span>
                <span className={`block text-xs ${darkMode ? 'text-dark-primary/70' : 'text-light-tertiary/70'}`}>
                  {language.name}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Button component
const Button: React.FC<{
  darkMode: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}> = ({
  className = '',
  darkMode,
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
  type = 'button',
}) => {
    const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-full";

    const variants = {
      primary: darkMode
        ? "bg-dark-primary hover:bg-dark-secondary text-dark-background shadow-lg hover:shadow-xl"
        : "bg-light-tertiary hover:bg-light-primary text-light-background shadow-lg hover:shadow-xl",
      secondary: darkMode
        ? "bg-dark-background/50 hover:bg-dark-secondary/20 text-dark-primary border border-dark-primary/20"
        : "bg-light-background/50 hover:bg-light-secondary/20 text-light-tertiary border border-light-tertiary/20",
      ghost: darkMode
        ? "bg-transparent hover:bg-dark-secondary/20 text-dark-primary"
        : "bg-transparent hover:bg-light-secondary/20 text-light-tertiary"
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3"
    };

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        onClick={onClick}
        disabled={disabled}
        type={type}
      >
        {children}
      </motion.button>
    );
  };

// Enhanced Input component
const Input = React.forwardRef<HTMLInputElement, {
  darkMode: boolean;
  className?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}>(({
  className = '',
  darkMode,
  type,
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
}, ref) => {
  return (
    <motion.input
      ref={ref}
      whileFocus={{ scale: 1.01 }}
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={`flex px-4 py-3 w-full text-sm rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm placeholder:text-opacity-70 focus:outline-none focus:ring-0 focus:border-opacity-100 ${darkMode
        ? 'bg-dark-background/80 border-dark-primary/30 focus:border-dark-primary text-dark-primary placeholder:text-dark-primary'
        : 'bg-light-background/80 border-light-tertiary/30 focus:border-light-tertiary text-light-tertiary placeholder:text-light-tertiary'
        } ${className}`}
    />
  );
});

Input.displayName = 'Input';

// Enhanced thinking indicator
const ThinkingIndicator: React.FC<{ darkMode: boolean }> = ({ darkMode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.3 }}
    className="flex justify-start"
  >
    <div className={`p-4 rounded-2xl max-w-[80%] backdrop-blur-sm ${darkMode
      ? 'bg-dark-background/90 text-dark-primary border border-dark-secondary/20'
      : 'bg-light-background/90 text-light-tertiary border border-light-secondary/20'
      }`}>
      <motion.div className="flex items-center text-sm font-medium">
        <span className="mr-3">AI is thinking</span>
        <div className="flex space-x-1">
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
                delay: i * 0.2
              }}
              className={`w-2 h-2 rounded-full ${darkMode ? 'bg-dark-primary' : 'bg-light-tertiary'
                }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  </motion.div>
);

const translations = {
  en: {
    placeholder: 'Ask about your Twitter analytics...',
    remainingChars: 'characters remaining',
    cooldownMessage: 'You can send another message in',
    seconds: 'seconds',
    errorEmpty: 'Message cannot be empty',
    errorLimit: 'Character limit exceeded',
    errorCooldown: 'Please wait before sending another message',
    sampleQuestions: [
      "Best posting time",
      "Engagement metrics",
      "Content strategy",
      "Audience insights",
      "Trend analysis",
      "Performance stats"
    ]
  },
  es: {
    placeholder: 'Pregunta sobre tus análisis de Twitter...',
    remainingChars: 'caracteres restantes',
    cooldownMessage: 'Puedes enviar otro mensaje en',
    seconds: 'segundos',
    errorEmpty: 'El mensaje no puede estar vacío',
    errorLimit: 'Límite de caracteres excedido',
    errorCooldown: 'Por favor espera antes de enviar otro mensaje',
    sampleQuestions: [
      "Mejor hora para publicar",
      "Métricas de engagement",
      "Estrategia de contenido",
      "Insights de audiencia",
      "Análisis de tendencias",
      "Estadísticas de rendimiento"
    ]
  },
  fr: {
    placeholder: 'Posez des questions sur vos analyses Twitter...',
    remainingChars: 'caractères restants',
    cooldownMessage: 'Vous pouvez envoyer un autre message dans',
    seconds: 'secondes',
    errorEmpty: 'Le message ne peut pas être vide',
    errorLimit: 'Limite de caractères dépassée',
    errorCooldown: 'Veuillez patienter avant d\'envoyer un autre message',
    sampleQuestions: [
      "Meilleur moment pour publier",
      "Métriques d'engagement",
      "Stratégie de contenu",
      "Insights d'audience",
      "Analyse des tendances",
      "Statistiques de performance"
    ]
  },
};

const TwitterAnalyticsChatbot: React.FC<TwitterAnalyticsChatbotProps> = ({
  darkMode,
  characterLimit = 500,
  cooldownDuration = 30,
  language = 'en',
  showTimer = true,
  showCharacterCount = true,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  // Detect browser language on mount
  useEffect(() => {
    const detectLanguage = () => {
      const browserLang = navigator.language.split('-')[0].toLowerCase();
      const isSupported = SUPPORTED_LANGUAGES.some((lang: Language) => lang.code === browserLang);
      if (isSupported) {
        setSelectedLanguage(browserLang);
      }
    };
    detectLanguage();
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    if (newInput.length <= characterLimit) {
      setInput(newInput);
      setError(null);
    } else {
      setError(t.errorLimit);
    }
  };

  const getInputColor = () => {
    const ratio = input.length / characterLimit;
    if (ratio < 0.8) return darkMode ? 'text-dark-primary' : 'text-light-tertiary';
    if (ratio < 1) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleSendMessage = useCallback(async (messageText?: string) => {
    const userInput = messageText || input.trim();

    if (userInput === '') {
      setError(t.errorEmpty);
      return;
    }

    if (userInput.length > characterLimit) {
      setError(t.errorLimit);
      return;
    }

    const currentTime = Date.now();
    if (currentTime - lastMessageTime < cooldownDuration * 1000) {
      setError(t.errorCooldown);
      return;
    }

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      text: userInput,
      sender: 'user',
      timestamp: currentTime
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLastMessageTime(currentTime);
    setCooldown(cooldownDuration);

    try {
      const aiResponse = await groqService.getAIResponse(userInput);
      const aiMessage: Message = {
        text: aiResponse,
        sender: 'ai',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      const errorMessage: Message = {
        text: "I apologize, but I'm having trouble responding right now. Please try again.",
        sender: 'ai',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, characterLimit, cooldownDuration, lastMessageTime, t]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const handleQuestionClick = (question: string) => {
    setInput(question);
    setTimeout(() => handleSendMessage(question), 100);
  };

  const containerVariants: Variants = {
    open: (isExpanded) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      width: isExpanded ? 'min(95vw, 900px)' : 'min(90vw, 450px)',
      height: isExpanded ? 'min(95vh, 850px)' : 'min(90vh, 650px)',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }),
    closed: {
      opacity: 0,
      y: 30,
      scale: 0.9,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6 md:right-8 md:bottom-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={containerVariants}
            custom={isExpanded}
            className={`flex flex-col overflow-hidden shadow-2xl rounded-3xl backdrop-blur-md ${darkMode
              ? 'border bg-dark-background/95 border-dark-secondary/20'
              : 'border bg-light-background/95 border-light-secondary/20'
              }`}
            style={{
              boxShadow: darkMode
                ? '0 25px 50px -12px rgba(24,76,116,0.4), 0 0 0 1px rgba(24,76,116,0.1)'
                : '0 25px 50px -12px rgba(26,88,133,0.4), 0 0 0 1px rgba(26,88,133,0.1)',
            }}
          >
            {/* Enhanced Header */}
            <motion.div
              drag
              dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
              dragElastic={0.1}
              className={`flex justify-between items-center p-6 text-white rounded-t-3xl cursor-move bg-gradient-to-r ${darkMode
                ? 'from-dark-primary via-dark-secondary to-dark-tertiary'
                : 'from-light-primary via-light-secondary to-light-tertiary'
                }`}
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  className={`flex justify-center items-center w-12 h-12 text-lg font-bold rounded-2xl shadow-inner backdrop-blur-sm ${darkMode
                    ? 'bg-dark-background/80 text-dark-primary'
                    : 'bg-light-background/80 text-light-tertiary'
                    }`}
                >
                  <FaRocketchat className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold">Viralytics AI</h3>
                  <p className="text-sm opacity-90">Your social media optimizer</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={setSelectedLanguage}
                  darkMode={darkMode}
                />
                <Button darkMode={darkMode} variant="ghost" size="sm" onClick={handleClearChat}>
                  <Trash2Icon className="w-5 h-5" />
                </Button>
                <Button darkMode={darkMode} variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </Button>
                <Button darkMode={darkMode} variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            {/* Enhanced Messages Area */}
            <div className="overflow-hidden relative flex-1">
              <div className={`absolute inset-0 ${darkMode
                ? 'bg-gradient-to-br from-dark-tertiary/95 via-dark-background to-dark-secondary/95'
                : 'bg-gradient-to-br from-light-tertiary/95 via-light-background to-light-secondary/95'
                }`} />
              <div className="overflow-y-auto relative p-6 space-y-4 h-full">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 text-sm rounded-2xl backdrop-blur-sm ${darkMode
                      ? 'text-red-300 border bg-red-900/30 border-red-500/20'
                      : 'text-red-600 border bg-red-100/30 border-red-300/20'
                      }`}
                  >
                    {error}
                  </motion.div>
                )}

                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`max-w-[85%] p-4 rounded-2xl backdrop-blur-sm shadow-lg border ${message.sender === 'user'
                          ? darkMode
                            ? 'bg-gradient-to-br from-dark-primary to-dark-secondary text-dark-background border-dark-primary/20'
                            : 'bg-gradient-to-br from-light-primary to-light-secondary text-light-background border-light-primary/20'
                          : darkMode
                            ? 'bg-dark-background/90 text-dark-primary border-dark-secondary/20'
                            : 'bg-light-background/90 text-light-tertiary border-light-secondary/20'
                          }`}
                      >
                        <MarkdownRenderer content={message.text} darkMode={darkMode} />
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && <ThinkingIndicator darkMode={darkMode} />}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Enhanced Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`relative p-6 ${darkMode
                ? 'bg-gradient-to-t to-transparent from-dark-background/95'
                : 'bg-gradient-to-t to-transparent from-light-background/95'
                }`}
            >
              {showCharacterCount && (
                <div className={`mb-3 text-xs font-medium ${getInputColor()}`}>
                  {characterLimit - input.length} {t.remainingChars}
                </div>
              )}

              <div className="flex mb-4 space-x-3">
                <Input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={t.placeholder}
                  className="flex-grow shadow-lg"
                  darkMode={darkMode}
                  disabled={cooldown > 0}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || cooldown > 0 || input.length > characterLimit}
                  className="px-6 shadow-lg"
                  darkMode={darkMode}
                  size="lg"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {showTimer && cooldown > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs text-center mb-4 ${darkMode ? 'text-dark-primary/70' : 'text-light-tertiary/70'
                    }`}
                >
                  {t.cooldownMessage} {cooldown} {t.seconds}
                </motion.div>
              )}

              <div className="flex flex-wrap gap-2">
                {t.sampleQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuestionClick(question)}
                    className={`px-4 py-2 text-xs rounded-full border transition-all duration-300 backdrop-blur-sm ${darkMode
                      ? 'border-dark-primary/30 hover:bg-dark-background/50 hover:border-dark-primary text-dark-primary'
                      : 'border-light-primary/30 hover:bg-light-background/50 hover:border-light-primary text-light-tertiary'
                      }`}
                    disabled={cooldown > 0}
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Toggle Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className={`relative p-4 text-white rounded-full shadow-2xl transition-all duration-500 group ${darkMode
            ? 'bg-gradient-to-r from-dark-primary to-dark-tertiary hover:from-dark-tertiary hover:to-dark-primary'
            : 'bg-gradient-to-r from-light-primary to-light-tertiary hover:from-light-tertiary hover:to-light-primary'
            }`}
          style={{
            boxShadow: darkMode
              ? '0 20px 40px -12px rgba(24,76,116,0.5)'
              : '0 20px 40px -12px rgba(26,88,133,0.5)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <FaRocketchat className="w-7 h-7" />
          </motion.div>

          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      )}
    </div>
  );
};

export default TwitterAnalyticsChatbot;