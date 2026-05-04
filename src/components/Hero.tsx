import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, MessageSquare } from 'lucide-react';

function Typewriter({ texts }: { texts: string[] }) {
  const [index, setIndex] = React.useState(0);
  const [displayText, setDisplayText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentText = texts[index % texts.length];
    
    if (isDeleting) {
      timeout = setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length - 1));
      }, 50);
    } else {
      timeout = setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length + 1));
      }, 100);
    }

    if (!isDeleting && displayText === currentText) {
      timeout = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setIndex(prev => prev + 1);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, index, texts]);

  return (
    <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 bg-clip-text text-transparent min-h-[1.5em] inline-block">
      {displayText}
      <span className="animate-pulse ml-1 text-cyan-400">|</span>
    </span>
  );
}

export default function Hero({ cms }: { cms?: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const title = cms?.title || "Engineering Digital Magic";
  const subtitle = cms?.subtitle || "Elevate your brand with high-performance Web Re-Design, Website, Next-Gen UI/UX, and AI-driven growth strategies.";
  const primaryBtn = cms?.primaryBtn || "Explore Work";
  const primaryLink = cms?.primaryLink || "#demos";
  const secondaryBtn = cms?.secondaryBtn || "Chat Strategy";
  const secondaryLink = cms?.secondaryLink || "https://wa.me/919947410627";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width) this.x = 0;
        else if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        else if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        ctx!.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const init = () => {
      particles = [];
      const particleCount = Math.min(150, (window.innerWidth * window.innerHeight) / 10000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center py-20 lg:py-32 transition-colors duration-500 bg-transparent">
      {/* Canvas background that adapts */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />
      
      {cms?.heroImage && (
        <div className="absolute inset-0 z-[-1] opacity-20 pointer-events-none hidden md:block">
          <img src={cms.heroImage} alt="Desktop Background" className="w-full h-full object-cover" />
        </div>
      )}

      {cms?.mobileHeroImage ? (
        <div className="absolute inset-0 z-[-1] opacity-30 pointer-events-none block md:hidden">
          <img src={cms.mobileHeroImage} alt="Mobile Background" className="w-full h-full object-cover" />
        </div>
      ) : cms?.heroImage && (
        <div className="absolute inset-0 z-[-1] opacity-20 pointer-events-none block md:hidden">
          <img src={cms.heroImage} alt="Fallback Mobile Background" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-zinc-500/10 dark:border-white/10 bg-zinc-900/5 dark:bg-black/20 backdrop-blur-md text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span>Next-Gen Digital Solutions</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-sans font-black text-[#3B000A] dark:text-[#3B000A] tracking-tighter leading-[0.9] mb-8"
        >
          {title.includes(' ') ? (
            <>
              {title.split(' ').slice(0, -1).join(' ')} <br />
              <Typewriter texts={[title.split(' ').pop() || '', 'Websites', 'AI Apps', 'Growth', 'Digital leads', 'Web Re-Design']} />
            </>
          ) : (
            <Typewriter texts={[title, 'Websites', 'AI Apps', 'Growth', 'Digital leads', 'Web Re-Design']} />
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl sm:text-xl md:text-2xl text-[#3B000A] dark:text-[#3B000A] max-w-3xl mx-auto mb-12 leading-relaxed font-semibold opacity-90"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 relative z-20"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (primaryLink.startsWith('#')) {
                const element = document.getElementById(primaryLink.substring(1));
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = primaryLink;
              }
            }}
            className="px-8 py-4 bg-[#3B000A] text-white rounded-full font-black text-xs sm:text-sm tracking-[0.2em] uppercase transition-all shadow-[0_20px_50px_rgba(59,0,10,0.3)] border border-white/10"
          >
            {primaryBtn}
          </motion.button>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={secondaryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white text-zinc-950 rounded-full font-black text-xs sm:text-sm tracking-[0.2em] uppercase border border-zinc-200 dark:border-zinc-800 flex items-center space-x-3 transition-all shadow-xl"
          >
            <MessageSquare className="w-5 h-5 text-[#E1306C]" />
            <span className="bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-transparent bg-clip-text">
              {secondaryBtn}
            </span>
          </motion.a>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
}
