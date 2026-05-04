import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, HelpCircle, Zap, Code2, Coffee, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FAQPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      q: "What defines a 'Crispo' project?",
      a: "It's a marriage of high-performance engineering and behavioral psychology. We don't just build sites; we build interaction protocols that drive actual business outcomes.",
      icon: Zap
    },
    {
      q: "How fast is the engineering cycle?",
      a: "Typically 4-8 standard solar weeks for a full-scale digital overhaul. We work in rapid sprints with live demonstration checkpoints.",
      icon: Code2
    },
    {
      q: "Do you handle global clients?",
      a: "Yes. We are a remote-first, worldwide ecosystem based in Kerala, India. We synchronize with any timezone using our async-first workflow.",
      icon: Coffee
    },
    {
      q: "Can I manage my own content?",
      a: "Absolutely. Our 'Crispo Command Center' provides a bespoke admin panel tailored to your specific database needs.",
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-12 font-black tracking-widest text-xs uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </Link>
        
        <div className="mb-20">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-rose-500 font-black tracking-[0.4em] uppercase text-[10px] mb-4"
          >
            Knowledge Base
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-zinc-900 tracking-tighter leading-none"
          >
            Neural <br />
            <span className="text-zinc-400">Sync (FAQ).</span>
          </motion.h1>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`overflow-hidden border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] transition-all duration-500 ${activeIndex === index ? 'bg-zinc-50 shadow-xl' : 'bg-white hover:bg-zinc-50/50'}`}
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full p-10 flex items-center gap-6 text-left"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-lg ${activeIndex === index ? 'bg-zinc-900 text-cyan-400 scale-110' : 'bg-zinc-100 text-zinc-400'}`}>
                  <faq.icon size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{faq.q}</h3>
                </div>
                <div className={`w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center transition-transform duration-500 ${activeIndex === index ? 'rotate-180 bg-white' : ''}`}>
                   <HelpCircle className={`w-5 h-5 ${activeIndex === index ? 'text-rose-500' : 'text-zinc-300'}`} />
                </div>
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <div className="px-10 pb-10 ml-20">
                      <div className="w-full h-px bg-zinc-200 mb-8" />
                      <p className="text-zinc-600 text-xl font-medium leading-relaxed max-w-2xl">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
