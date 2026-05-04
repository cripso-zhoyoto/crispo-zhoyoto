import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Sun, Moon, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ cms }: { cms?: any }) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isHome = location.pathname === '/';

  const navLinks = [
    { name: cms?.home || 'Home', href: isHome ? '#home' : '/' },
    { name: cms?.services || 'Services', href: isHome ? '#services' : '/#services' },
    { name: cms?.demos || 'Demos', href: isHome ? '#demos' : '/demos' },
    { name: cms?.aiLab || 'AI Lab', href: isHome ? '#ai-lab' : '/#ai-lab' },
    { name: cms?.play || 'Play', href: isHome ? '#fun-zone' : '/#fun-zone' },
  ];

  const contactBtnText = cms?.contactBtn || "Let's Talk";

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-black text-white py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
          : 'bg-white text-black py-6 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <AnimatePresence>
              {!isHome && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => navigate(-1)}
                  className={`p-2.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center border ${
                    isScrolled 
                      ? 'bg-zinc-800/80 border-zinc-700 text-white hover:bg-zinc-700' 
                      : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50 shadow-sm'
                  }`}
                  aria-label="Go Back"
                >
                  <ArrowLeft size={18} strokeWidth={3} />
                </motion.button>
              )}
            </AnimatePresence>
            <Link to="/" className="flex-shrink-0 cursor-pointer">
              <span className={`font-sans font-black text-2xl tracking-tighter transition-colors duration-500 ${isScrolled ? 'text-white' : 'text-black'}`}>
                CRISPO<span className="text-cyan-500">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            <div className="flex items-center space-x-10">
              {navLinks.map((link) => (
                link.href.startsWith('#') || (isHome && link.href === '/') ? (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    className={`text-xs font-black tracking-widest uppercase transition-all duration-500 hover:text-cyan-500 ${isScrolled ? 'text-white' : 'text-black'}`}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link 
                    key={link.name} 
                    to={link.href}
                    className={`text-xs font-black tracking-widest uppercase transition-all duration-500 hover:text-cyan-500 ${isScrolled ? 'text-white' : 'text-black'}`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>

            <div className={`flex items-center space-x-6 pl-6 border-l transition-colors duration-500 ${isScrolled ? 'border-zinc-800' : 'border-zinc-200'}`}>
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode}
                className={`relative w-14 h-7 rounded-full transition-colors ${isScrolled ? 'bg-zinc-800' : 'bg-zinc-200'} p-1`}
                aria-label="Toggle Dark Mode"
              >
                <motion.div 
                  animate={{ x: isDarkMode ? 28 : 0 }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md transition-colors ${isScrolled ? 'bg-white' : 'bg-zinc-950'}`}
                >
                  {isDarkMode ? <Moon size={10} className={isScrolled ? 'text-black' : 'text-zinc-950'} /> : <Sun size={10} className={isScrolled ? 'text-black' : 'text-white'} />}
                </motion.div>
              </button>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-2.5 rounded-full text-xs font-black tracking-[0.2em] shadow-2xl uppercase transition-all duration-500 ${isScrolled ? 'bg-white hover:bg-zinc-100' : 'bg-black hover:bg-zinc-900'}`}
                onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = '/#contact';
                  }
                }}
              >
                <span className="bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-transparent bg-clip-text">
                  {contactBtnText}
                </span>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 transition-colors duration-500 ${isScrolled ? 'text-white' : 'text-zinc-900'}`}
            >
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`transition-colors duration-500 ${isScrolled ? 'text-white' : 'text-black'}`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-full left-0 w-full border-b py-8 px-6 md:hidden shadow-2xl transition-colors duration-500 ${isScrolled ? 'bg-black border-zinc-800' : 'bg-white border-zinc-100'}`}
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-black tracking-widest uppercase transition-colors duration-500 ${isScrolled ? 'text-white hover:text-cyan-400' : 'text-zinc-950 hover:text-cyan-600'}`}
                >
                  {link.name}
                </Link>
              ))}
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  const element = document.getElementById('contact');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                  else window.location.href = '/#contact';
                }}
                className={`px-8 py-4 rounded-2xl font-black text-sm tracking-widest uppercase w-full shadow-xl transition-all duration-500 ${isScrolled ? 'bg-white text-black hover:bg-zinc-100' : 'bg-black text-white hover:bg-zinc-900'}`}
              >
                <span className="bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-transparent bg-clip-text">
                  {contactBtnText}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
