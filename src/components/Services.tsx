import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Laptop, Search, Palette, Zap, ArrowRight } from 'lucide-react';

const services = [
  {
    id: 'web-app-demos',
    icon: Laptop,
    title: 'Web & App Demos',
    description: 'Immersive, interactive product demonstrations that let your users experience your software before they buy.',
    color: 'cyan'
  },
  {
    id: 'seo-aeo',
    icon: Search,
    title: 'SEO & AEO',
    description: 'Next-gen optimization for Google and AI Answer Engines like ChatGPT. We make sure you are the source of truth.',
    color: 'purple'
  },
  {
    id: 'ui-ux-design',
    icon: Palette,
    title: 'UI/UX Design',
    description: 'Pixel-perfect, user-centric interfaces designed for modern conversion psychology and aesthetic pleasure.',
    color: 'rose'
  }
];

export default function Services({ cms }: { cms?: any }) {
  const badge = cms?.badge || "CAPABILITIES";
  const title = cms?.title || "Full-Spectrum Digital Mastery";
  const btn = cms?.btn || "GET A QUOTE";

  return (
    <section id="services" className="py-24 px-4 relative z-10 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-2xl border-t border-white/20 dark:border-zinc-800/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-cyan-600 font-bold tracking-[0.4em] uppercase text-xs mb-4"
          >
            {badge}
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-sans font-black text-zinc-900 dark:text-white tracking-tight leading-none"
          >
            {title.includes(' ') ? (
              <>
                {title.split(' ').slice(0, -1).join(' ')} <br />
                {title.split(' ').pop()}
              </>
            ) : title}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 px-2 sm:px-0">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-10 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 dark:bg-zinc-800 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-150 group-hover:bg-cyan-50 dark:group-hover:bg-zinc-800" />
              
              <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl group-hover:bg-cyan-600 dark:group-hover:bg-cyan-400 transition-colors`}>
                <motion.div
                  whileHover={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <service.icon className="w-8 h-8" />
                </motion.div>
              </div>
              <h3 className="relative text-3xl font-black text-zinc-900 dark:text-white mb-6 leading-tight">{service.title}</h3>
              <p className="relative text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 text-lg font-medium">
                {service.description}
              </p>
              <Link 
                to={`/services/${service.id}`}
                className="relative flex items-center space-x-3 text-zinc-900 dark:text-zinc-100 font-black tracking-widest text-xs uppercase group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors"
              >
                <span>Explore Tech</span>
                <div className="w-8 h-px bg-zinc-900 dark:bg-zinc-100 group-hover:bg-cyan-600 group-hover:w-12 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-24 p-12 rounded-[3rem] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 dark:opacity-5" />
          <div className="relative z-10 flex-1 text-center md:text-left">
            <h3 className="text-4xl font-black mb-4 tracking-tight">{cms?.suiteTitle || 'The "Crispo" Suite'}</h3>
            <p className="text-zinc-400 dark:text-zinc-500 text-xl max-w-xl font-medium">{cms?.suiteDescription || 'Get a complete digital overhaul. Identity, strategy, and engineering in one master package.'}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 px-12 py-5 bg-white dark:bg-white text-black font-extrabold rounded-2xl shadow-2xl hover:bg-zinc-50 dark:hover:bg-zinc-100 transition-colors tracking-widest text-sm border border-zinc-100"
            onClick={() => {
              const element = document.getElementById('contact');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {btn}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
