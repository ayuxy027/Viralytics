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
  isStreaming?: boolean;
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
          <li className={`list-item ${darkMode ? 'marker:text-dark-primary' : 'marker:text-light-tertiary'}`} {...props} />
        ),
        a: ({ ...props }) => (
          <a
            target="_blank"
            rel="noopener noreferrer"
            className={`${darkMode ? 'text-dark-primary' : 'text-light-tertiary'} hover:underline`}
            {...props}
          />
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: ({ className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          return !match ? (
            <code
              className={`px-2 py-1 rounded-md text-sm font-mono ${darkMode
                ? 'bg-dark-secondary/30 text-dark-primary'
                : 'bg-light-secondary/30 text-light-tertiary border border-light-secondary/50'
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${darkMode
          ? 'bg-dark-background border-dark-secondary text-dark-primary hover:bg-dark-secondary/20'
          : 'bg-nav-light border-light-secondary text-light-tertiary hover:bg-light-secondary/20 shadow-sm'
          }`}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLanguage?.nativeName || "English"}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 z-50 mt-2 w-56 max-h-64 overflow-y-auto rounded-lg border shadow-lg ${darkMode
              ? 'bg-dark-background border-dark-secondary'
              : 'bg-nav-light border-light-secondary shadow-xl'
              }`}
          >
            {SUPPORTED_LANGUAGES.map((language: Language) => (
              <button
                key={language.code}
                onClick={() => {
                  onSelectLanguage(language.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 first:rounded-t-lg last:rounded-b-lg hover:${darkMode ? 'bg-dark-secondary/20' : 'bg-light-secondary/20'} ${selectedLanguage === language.code
                  ? (darkMode ? 'bg-dark-secondary/30' : 'bg-light-secondary/30 text-light-tertiary font-medium')
                  : ''
                  }`}
              >
                <span className={`block ${darkMode ? 'text-dark-primary' : 'text-light-tertiary'}`}>
                  {language.nativeName}
                </span>
                <span className={`block text-xs ${darkMode ? 'text-text-dark' : 'text-text-dim'}`}>
                  {language.name}
                </span>
              </button>
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
    const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-lg";

    const variants = {
      primary: darkMode
        ? "bg-dark-primary hover:bg-dark-secondary text-dark-background shadow-sm hover:shadow-md"
        : "bg-light-tertiary hover:bg-light-primary text-nav-light shadow-md hover:shadow-lg",
      secondary: darkMode
        ? "bg-dark-secondary hover:bg-dark-tertiary text-dark-primary border border-dark-secondary"
        : "bg-nav-light hover:bg-light-secondary/30 text-light-tertiary border border-light-secondary shadow-sm",
      ghost: darkMode
        ? "bg-transparent hover:bg-dark-secondary/20 text-dark-primary"
        : "bg-transparent hover:bg-light-secondary/20 text-nav-light"
    };

    const sizes = {
      sm: "text-xs px-3 py-2",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3"
    };

    return (
      <button
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        onClick={onClick}
        disabled={disabled}
        type={type}
      >
        {children}
      </button>
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
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={`flex px-4 py-3 w-full text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${darkMode
        ? 'bg-dark-background border-dark-secondary focus:border-dark-primary focus:ring-dark-primary text-dark-primary placeholder:text-text-dark'
        : 'bg-nav-light border-light-secondary focus:border-light-tertiary focus:ring-light-primary/30 text-light-tertiary placeholder:text-text-dim shadow-sm'
        } ${className}`}
    />
  );
});

Input.displayName = 'Input';

// Clean thinking indicator
const ThinkingIndicator: React.FC<{ darkMode: boolean }> = ({ darkMode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="flex justify-start"
  >
    <div className={`px-4 py-3 rounded-lg border max-w-[80%] ${darkMode
      ? 'bg-dark-background border-dark-secondary text-dark-primary'
      : 'bg-nav-light border-light-secondary text-light-tertiary shadow-sm'
      }`}>
      <div className="text-sm">
        Thinking...
      </div>
    </div>
  </motion.div>
);

// Fast streaming text component without cursor
const StreamingText: React.FC<{
  text: string;
  darkMode: boolean;
  onComplete?: () => void;
}> = ({ text, darkMode, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 10); // 3x faster - was 30ms, now 10ms

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <div className="relative">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          li: ({ ...props }) => (
            <li className={`list-item ${darkMode ? 'marker:text-dark-primary' : 'marker:text-light-tertiary'}`} {...props} />
          ),
          a: ({ ...props }) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className={`${darkMode ? 'text-dark-primary' : 'text-light-tertiary'} hover:underline`}
              {...props}
            />
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !match ? (
              <code
                className={`px-2 py-1 rounded-md text-sm font-mono ${darkMode
                  ? 'bg-dark-secondary/30 text-dark-primary'
                  : 'bg-light-secondary/30 text-light-tertiary border border-light-secondary/50'
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
        {displayedText}
      </ReactMarkdown>
    </div>
  );
};

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
  const [_streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  // Check screen size and handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-collapse on small screens
  useEffect(() => {
    if (isSmallScreen && isExpanded) {
      setIsExpanded(false);
    }
  }, [isSmallScreen, isExpanded]);

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
    if (ratio < 1) return 'text-yellow-600';
    return 'text-red-600';
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
      // Show thinking indicator for 2.5 seconds before generating response
      await new Promise(resolve => setTimeout(resolve, 2500));

      const aiResponse = await groqService.getAIResponse(userInput);
      const aiMessageId = Date.now();

      const aiMessage: Message = {
        text: aiResponse,
        sender: 'ai',
        timestamp: aiMessageId,
        isStreaming: true
      };

      setStreamingMessageId(aiMessageId);
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

  const handleStreamingComplete = useCallback((messageId: number) => {
    setStreamingMessageId(null);
    setMessages(prev =>
      prev.map(msg =>
        msg.timestamp === messageId
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setStreamingMessageId(null);
  }, []);

  const handleQuestionClick = useCallback((question: string) => {
    setInput(question);
    setTimeout(() => handleSendMessage(question), 100);
  }, [handleSendMessage]);

  const containerVariants: Variants = {
    open: (isExpanded) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      width: isExpanded ? 'min(90vw, 800px)' : 'min(85vw, 420px)',
      height: isExpanded ? 'min(90vh, 750px)' : 'min(85vh, 600px)',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }),
    closed: {
      opacity: 0,
      y: 30,
      scale: 0.95,
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
            className={`flex flex-col overflow-hidden shadow-2xl rounded-2xl border transition-all duration-300 ${darkMode
              ? 'bg-dark-background border-dark-secondary'
              : 'bg-light-background border-light-secondary shadow-2xl'
              }`}
          >
            {/* Responsive Header */}
            <div
              className={`flex justify-between items-center border-b rounded-t-2xl transition-all duration-200 ${isExpanded ? 'p-5' : 'p-4'
                } ${darkMode
                  ? 'bg-dark-tertiary border-dark-secondary text-dark-primary'
                  : 'bg-light-tertiary border-light-secondary text-nav-light'
                }`}
            >
              {/* Left Side - Logo and Title */}
              <div className={`flex items-center transition-all duration-200 ${isExpanded ? 'space-x-4' : 'space-x-3'}`}>
                <div className={`flex justify-center items-center rounded-xl transition-all duration-200 ${isExpanded ? 'w-12 h-12' : 'w-10 h-10'
                  } ${darkMode
                    ? 'bg-dark-primary text-dark-background'
                    : 'bg-nav-light text-light-tertiary shadow-sm'
                  }`}>
                  <FaRocketchat className={`transition-all duration-200 ${isExpanded ? 'w-6 h-6' : 'w-5 h-5'}`} />
                </div>
                <div>
                  <h3 className={`font-bold transition-all duration-200 ${isExpanded ? 'text-lg' : 'text-base'}`}>
                    Viralytics AI
                  </h3>
                  <motion.p
                    initial={false}
                    animate={{
                      opacity: isExpanded ? 1 : 0,
                      height: isExpanded ? 'auto' : 0,
                      marginTop: isExpanded ? '0.125rem' : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-sm opacity-80 overflow-hidden"
                  >
                    Your social media optimizer
                  </motion.p>
                </div>
              </div>

              {/* Right Side - Controls */}
              <div className={`flex items-center transition-all duration-200 ${isExpanded ? 'space-x-3' : 'space-x-2'}`}>
                {/* Language Selector - Only show when expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LanguageSelector
                        selectedLanguage={selectedLanguage}
                        onSelectLanguage={setSelectedLanguage}
                        darkMode={darkMode}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className={`flex items-center transition-all duration-200 ${isExpanded ? 'space-x-2 ml-3 pl-3 border-l border-opacity-30 border-current' : 'space-x-1'
                  }`}>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button darkMode={darkMode} variant="ghost" size="sm" onClick={handleClearChat}>
                          <Trash2Icon className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hide expand button on small screens */}
                  {!isSmallScreen && (
                    <Button darkMode={darkMode} variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                      {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                  )}
                  <Button darkMode={darkMode} variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Messages Area */}
            <div className={`overflow-hidden relative flex-1 transition-colors duration-200 ${darkMode ? '' : 'bg-light-background'}`}>
              <div className="overflow-y-auto relative p-4 space-y-4 h-full">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-3 text-sm rounded-lg border border-red-300 bg-red-50 text-red-700"
                  >
                    {error}
                  </motion.div>
                )}

                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <motion.div
                      key={`${message.timestamp}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-xl transition-all duration-200 ${message.sender === 'user'
                          ? darkMode
                            ? 'bg-dark-primary text-dark-background border border-dark-primary shadow-sm'
                            : 'bg-light-tertiary text-nav-light border border-light-tertiary shadow-md'
                          : darkMode
                            ? 'bg-dark-secondary/30 text-dark-primary border border-dark-secondary'
                            : 'bg-nav-light text-light-tertiary border border-light-secondary shadow-sm'
                          }`}
                      >
                        {message.sender === 'ai' && message.isStreaming ? (
                          <StreamingText
                            text={message.text}
                            darkMode={darkMode}
                            onComplete={() => handleStreamingComplete(message.timestamp)}
                          />
                        ) : (
                          <MarkdownRenderer content={message.text} darkMode={darkMode} />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {isLoading && <ThinkingIndicator darkMode={darkMode} />}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Enhanced Input Area */}
            <div className={`p-4 border-t rounded-b-2xl transition-colors duration-200 ${darkMode
              ? 'border-dark-secondary bg-dark-background'
              : 'border-light-secondary bg-light-background'
              }`}>
              {showCharacterCount && (
                <motion.div
                  className={`mb-2 text-xs font-medium transition-colors duration-200 ${getInputColor()}`}
                  animate={{ opacity: input.length > characterLimit * 0.8 ? 1 : 0.7 }}
                >
                  {characterLimit - input.length} {t.remainingChars}
                </motion.div>
              )}

              <div className="flex mb-3 space-x-2">
                <Input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={t.placeholder}
                  className="flex-grow"
                  darkMode={darkMode}
                  disabled={cooldown > 0 || isLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || cooldown > 0 || input.length > characterLimit || input.trim() === ''}
                  darkMode={darkMode}
                  size="lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {showTimer && cooldown > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`text-xs text-center mb-3 transition-colors duration-200 ${darkMode ? 'text-text-dark' : 'text-text-dim'}`}
                  >
                    {t.cooldownMessage} {cooldown} {t.seconds}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Responsive Sample Questions */}
              <div className={`flex flex-wrap transition-all duration-200 ${isExpanded ? 'gap-2' : 'gap-1'}`}>
                {t.sampleQuestions.slice(0, isExpanded ? 6 : 4).map((question, index) => (
                  <motion.button
                    key={question}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleQuestionClick(question)}
                    className={`${isExpanded ? 'px-3 py-1.5' : 'px-2 py-1'} text-xs rounded-lg border transition-all duration-200 ${darkMode
                      ? 'border-dark-secondary text-dark-primary hover:bg-dark-secondary/20'
                      : 'border-light-secondary text-light-tertiary hover:bg-light-secondary/20 bg-nav-light shadow-sm hover:shadow-md'
                      }`}
                    disabled={cooldown > 0 || isLoading}
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={`p-4 rounded-xl shadow-lg transition-all duration-300 ${darkMode
              ? 'bg-dark-primary text-dark-background hover:bg-dark-secondary shadow-dark-primary/20 hover:shadow-dark-primary/30'
              : 'bg-light-tertiary text-nav-light hover:bg-light-primary shadow-lg hover:shadow-xl'
              }`}
          >
            <FaRocketchat className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TwitterAnalyticsChatbot;