import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  key?: string;
  cms?: {
    text: string;
    enabled: boolean;
  };
  onComplete: () => void;
}

export default function SplashScreen({ cms, onComplete }: SplashScreenProps) {
  const isEnabled = cms?.enabled ?? true;
  const text = cms?.text || 'CRISPO DIGITAL';

  React.useEffect(() => {
    if (!isEnabled) {
      onComplete();
      return;
    }
    // Fast exit after 2 seconds
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [isEnabled, onComplete]);

  if (!isEnabled) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="relative">
        {/* Ambient Glow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-cyan-500/20 blur-[120px] rounded-full"
        />
        
        <div className="flex flex-col items-center px-6">
          <div className="relative overflow-hidden mb-6 text-center">
            <motion.h1 
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-white font-black text-4xl sm:text-6xl md:text-8xl tracking-tighter leading-none text-balance"
            >
              {text.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 + 0.3 }}
                >
                  {char}
                </motion.span>
              ))}
              <span className="text-cyan-500">.</span>
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            className="w-32 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
}
