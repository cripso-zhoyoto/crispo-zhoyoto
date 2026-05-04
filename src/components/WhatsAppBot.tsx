import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X } from 'lucide-react';

interface WhatsAppBotProps {
  cms?: {
    number: string;
    message: string;
    enabled: boolean;
  };
}

export default function WhatsAppBot({ cms }: WhatsAppBotProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(false);
  
  const isEnabled = cms?.enabled ?? true;
  const number = cms?.number || '1234567890';
  const message = cms?.message || "Hello! I'm interested in your services.";

  if (!isEnabled || isDismissed) return null;

  const handleOpen = () => {
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9000] flex flex-col items-end space-y-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-4 max-w-[280px] sm:max-w-[320px]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">Support Sync</p>
                  <p className="text-[10px] text-zinc-500">Response: Synchronous</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-6 font-medium">Greetings. How may we assist in your digital architecture today?</p>
            <button 
              onClick={handleOpen}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-green-500 transition-colors shadow-lg shadow-green-900/20"
            >
              Start Secure Chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 md:w-16 md:h-16 bg-green-600 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(22,163,44,0.3)] border border-green-500/50 relative z-10"
        >
          {isOpen ? (
            <X className="w-6 h-6 md:w-8 md:h-8 text-white" />
          ) : (
            <>
              <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-zinc-950 animate-pulse" />
            </>
          )}
        </motion.button>

        {/* Global Dismiss Button */}
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            onClick={() => setIsDismissed(true)}
            className="absolute -top-4 -right-4 w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all z-20 md:opacity-0 group-hover:opacity-100"
            title="Dismiss for this session"
          >
            <X size={14} />
          </motion.button>
        )}

        {/* Desktop Tooltip */}
        {!isOpen && (
          <div className="hidden md:block absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Direct Comms</p>
          </div>
        )}
      </div>
    </div>
  );
}
