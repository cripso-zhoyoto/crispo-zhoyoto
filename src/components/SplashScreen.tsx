import React from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  key?: string;
  cms?: any;
  onComplete: () => void;
}

export default function SplashScreen({ cms, onComplete }: SplashScreenProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, cms?.duration || 2500);

    return () => clearTimeout(timer);
  }, [onComplete, cms?.duration]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Neural Grid (Subtle) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="mb-8"
        >
          <span className="font-sans font-black text-5xl md:text-7xl tracking-tighter text-black">
            {cms?.title || 'CRISPO'}<span className="text-cyan-500">.</span>
          </span>
        </motion.div>

        {/* Neural Sync Bar */}
        <div className="w-48 h-[2px] bg-zinc-100 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-[10px] font-black tracking-[0.5em] text-zinc-400 uppercase"
        >
          {cms?.subtitle || 'Neural Sync in Progress'}
        </motion.p>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-12 left-12 w-12 h-12 border-t-2 border-l-2 border-zinc-900/10" />
      <div className="absolute top-12 right-12 w-12 h-12 border-t-2 border-r-2 border-zinc-900/10" />
      <div className="absolute bottom-12 left-12 w-12 h-12 border-b-2 border-l-2 border-zinc-900/10" />
      <div className="absolute bottom-12 right-12 w-12 h-12 border-b-2 border-r-2 border-zinc-900/10" />
    </motion.div>
  );
}
