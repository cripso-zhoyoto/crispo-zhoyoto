import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export default function CustomCursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.style.cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          body, button, a, * {
            cursor: none !important;
          }
        }
      `}</style>
      <motion.div
        style={{
          position: 'fixed',
          left: cursorX,
          top: cursorY,
          pointerEvents: 'none',
          zIndex: 10001,
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          scale: isHovering ? 2.5 : 1,
          backgroundColor: isHovering ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 1)',
        }}
        className="w-4 h-4 rounded-full mix-blend-difference hidden lg:block"
      >
        <motion.div 
          animate={{
            opacity: isHovering ? 1 : 0
          }}
          className="w-full h-full rounded-full border border-cyan-400"
        />
      </motion.div>
      
      {/* Outer Glow Ring */}
      <motion.div
        style={{
          position: 'fixed',
          left: mouseX,
          top: mouseY,
          pointerEvents: 'none',
          zIndex: 10000,
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.5 : 0.2,
        }}
        className="w-12 h-12 rounded-full border border-cyan-500/30 blur-[2px] hidden lg:block"
      />
    </>
  );
}
