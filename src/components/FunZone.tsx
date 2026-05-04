import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Zap } from 'lucide-react';

export default function FunZone({ cms }: { cms?: any }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isWon, setIsWon] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const title = cms?.title || "Bored of Standard Agency Sites?";
  const subtitle = cms?.subtitle || "We build interaction first. Try to catch the button below to unlock an exclusive partner discount.";
  const offerBtn = cms?.offerBtn || "CATCH ME (15% OFF)";

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const moveButton = useCallback(() => {
    const randomX = Math.random() * 80 + 10; // 10% to 90%
    const randomY = Math.random() * 60 + 20; // 20% to 80%
    setPosition({ x: randomX, y: randomY });
  }, []);

  // Automatic movement for mobile
  useEffect(() => {
    if (isMobile && !isWon) {
      const interval = setInterval(moveButton, Math.max(800, 1500 - (tapCount * 250))); // Gets faster with each tap
      return () => clearInterval(interval);
    }
  }, [isMobile, isWon, tapCount, moveButton]);

  const handleWin = () => {
    if (isMobile) {
      const nextCount = tapCount + 1;
      if (nextCount >= 3) {
        setIsWon(true);
      } else {
        setTapCount(nextCount);
        moveButton();
      }
    } else {
      setIsWon(true);
    }
  };

  const reset = () => {
    setIsWon(false);
    setTapCount(0);
    setPosition({ x: 50, y: 50 });
  };

  return (
    <section id="fun-zone" className="py-24 px-4 overflow-hidden relative z-10 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-2xl">
      <div className="max-w-4xl mx-auto text-center">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-emerald-600 font-black tracking-[0.4em] uppercase text-xs mb-4"
        >
          INTERACTION EXPERIMENT
        </motion.p>
        <h2 className="text-5xl md:text-7xl font-sans font-black text-zinc-900 dark:text-white mb-6 leading-none text-balance">
          {title.includes('?') ? (
            <>
              {title.split('?')[0]}? <br />
              <span className="text-zinc-500">{title.split('?')[1]}</span>
            </>
          ) : title}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-16 max-w-2xl mx-auto text-xl font-medium">
          {isMobile ? `Precision Challenge: Tap the button 3 times to win. (${tapCount}/3)` : subtitle}
        </p>

        <div className="relative h-[500px] w-full border border-zinc-200 dark:border-zinc-800 rounded-[3rem] bg-white dark:bg-zinc-900 shadow-[0_40px_100px_rgba(0,0,0,0.05)] flex items-center justify-center overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.01]" />
          
          <p className="absolute text-zinc-100 dark:text-zinc-800 font-sans font-black text-[10vw] uppercase tracking-[0.1em] select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            {isMobile ? "REFLEX" : "PLAYGROUND"}
          </p>

          {!isWon && (
            <motion.button
              onMouseEnter={!isMobile ? moveButton : undefined}
              onClick={handleWin}
              animate={{ 
                left: `${position.x}%`, 
                top: `${position.y}%`,
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                left: { type: 'spring', stiffness: 400, damping: 25 },
                top: { type: 'spring', stiffness: 400, damping: 25 },
                scale: { duration: 0.5, ease: "easeInOut" }
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-white px-10 py-5 rounded-2xl font-black whitespace-nowrap shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-10 tracking-[0.1em] border border-zinc-200 flex items-center space-x-3 active:scale-95 transition-transform"
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="bg-gradient-to-r from-[#405de6] via-[#fd1f1f] to-[#e1306c] text-transparent bg-clip-text uppercase">
                {isMobile ? `TAP ${tapCount + 1}` : offerBtn}
              </span>
            </motion.button>
          )}

          <AnimatePresence>
            {isWon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Trophy className="w-24 h-24 text-yellow-500 mb-8 drop-shadow-2xl" />
                </motion.div>
                <h3 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">Reflexes of a Pro!</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xl mb-8 font-medium">Mention this code in our strategy call for 15% off:</p>
                <div className="bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 px-10 py-6 rounded-3xl font-mono text-3xl text-zinc-900 dark:text-white font-black mb-10 shadow-inner">
                  CRISPO_LEGACY_15
                </div>
                <button 
                  onClick={reset}
                  className="flex items-center space-x-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all text-sm font-black tracking-widest uppercase"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Restart Session</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
