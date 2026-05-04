import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, MessageSquare, ArrowRight } from 'lucide-react';

export default function SalesAlert() {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-24 left-0 right-0 z-[40] px-4 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-200/10 dark:border-zinc-800/50 rounded-3xl p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-rose-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0 border border-cyan-500/20">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-white font-black text-sm md:text-base tracking-tight uppercase leading-tight">
                    Scale Your Revenue? <span className="text-cyan-500">Sales Agent Protocol Active.</span>
                  </p>
                  <p className="text-zinc-400 text-xs font-medium">
                    We engineer high-conversion sales agents. <span className="text-emerald-500 font-bold">50% Growth Potential</span> at low rates.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
                <button
                  onClick={scrollToContact}
                       className="flex-1 md:flex-none px-6 py-3 bg-white !text-[#063D2E] text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl"
          >
                     <MessageSquare size={14} className="!text-[#063D2E]" />
              <span className="!text-[#063D2E]">Contact Architect</span>
                </button>

                <button
                  onClick={() => setIsVisible(false)}
                  className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
