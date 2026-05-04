import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

interface LeviconProps {
  cms?: {
    text: string;
    enabled: boolean;
  };
}

export default function Levicon({ cms }: LeviconProps) {
  const isEnabled = cms?.enabled ?? true;
  const text = cms?.text || 'CRISPO-ZHOYOTO';

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const dx = useSpring(mouseX, springConfig);
  const dy = useSpring(mouseY, springConfig);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, isVisible]);

  if (!isEnabled) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: dx,
        top: dy,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0 }}
      className="hidden lg:flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
    >
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border border-cyan-500/30 flex items-center justify-center"
        >
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                id="textPath"
                d="M 50, 50 m -35, 0 a 35, 35 0 1, 1 70, 0 a 35, 35 0 1, 1 -70, 0"
                fill="none"
              />
              <text className="text-[10px] font-black uppercase tracking-[0.2em] fill-cyan-400 opacity-50">
                <textPath href="#textPath" startOffset="0%">
                  {text} • {text} •
                </textPath>
              </text>
            </svg>
          </div>
        </motion.div>

        {/* Center Point */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(6,182,212,0.8)] border border-cyan-400" />
        </div>
      </div>
    </motion.div>
  );
}
