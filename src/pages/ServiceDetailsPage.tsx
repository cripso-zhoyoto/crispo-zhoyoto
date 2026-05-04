import React, { useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Laptop, Search, Palette, ArrowLeft, ArrowRight, CheckCircle2, Zap, Sparkles, Globe, ShieldCheck } from 'lucide-react';
import { CMSContext } from '../App';

const servicesData = [
  {
    id: 'web-app-demos',
    icon: Laptop,
    title: 'Web & App Demos',
    subtitle: 'High-Fidelity Interactive Experiences',
    description: 'Immersive, interactive product demonstrations that let your users experience your software before they buy. We build custom sandbox environments that mirror your production app but allow users to safely experiment with every feature.',
    fullDescription: 'Our Web & App Demos aren\'t just static screenshots or videos. They are fully functional, sandboxed versions of your product. We specialize in creating "Magic Moments" where users can input real data, trigger workflows, and see results instantly. This reduces sales friction and eliminates the "I need to see it to believe it" hurdle.',
    benefits: [
      'Zero-Risk Environments',
      'Real-Time Interaction',
      'Conversion Optimization',
      'Mobile-Responsive Sandboxes',
      'Instant Feedback Loops'
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426',
    color: 'from-cyan-500 to-blue-600',
    stats: [
      { label: 'Avg. Engagement', value: '+300%' },
      { label: 'Sales Velocity', value: '2x faster' }
    ]
  },
  {
    id: 'seo-aeo',
    icon: Search,
    title: 'SEO & AEO',
    subtitle: 'Answer Engine Optimization',
    description: 'Next-gen optimization for Google and AI Answer Engines like ChatGPT. We make sure you are the source of truth for conversational search.',
    fullDescription: 'Traditional SEO is dead. Modern search is about being the primary reference for AI models. We optimize your structured data, knowledge graph presence, and long-tail content to ensure that when a user asks ChatGPT, Perplexity, or Claude about your industry, your brand is the recommendation.',
    benefits: [
      'AI Recommendation Optimization',
      'LLM Knowledge Graph Integration',
      'Structured Data Orchestration',
      'High-Intent Traffic Capture',
      'Semantic Search Dominance'
    ],
    image: 'https://images.unsplash.com/photo-1551288049-bbda48658a7d?auto=format&fit=crop&q=80&w=2070',
    color: 'from-purple-500 to-indigo-600',
    stats: [
      { label: 'AI Mentions', value: 'Top 3' },
      { label: 'Organic Growth', value: '450%' }
    ]
  },
  {
    id: 'ui-ux-design',
    icon: Palette,
    title: 'UI/UX Design',
    subtitle: 'Psychology-Driven Interaction',
    description: 'Pixel-perfect, user-centric interfaces designed for modern conversion psychology and aesthetic pleasure.',
    fullDescription: 'We design for the subconscious. By blending neuromarketing principles with cutting-edge visual aesthetics, we create interfaces that guide users effortlessly toward conversion. Every shadow, animation, and spacing choice is deliberate, designed to build trust and eliminate cognitive load.',
    benefits: [
      'Neuro-Design Principles',
      'Micro-Interaction Mastery',
      'Aesthetic-Usability Effect',
      'Rapid Prototyping',
      'Multi-Platform Consistency'
    ],
    image: 'https://images.unsplash.com/photo-1690228254548-31ef53e40cd1?auto=format&fit=crop&q=80&w=2070',
    color: 'from-rose-500 to-pink-600',
    stats: [
      { label: 'Design Fidelity', value: '100%' },
      { label: 'User Satisfaction', value: '98%' }
    ]
  }
];

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cms = useContext(CMSContext);
  
  // Use CMS data if available, fallback to defaults
  const cmsservice = cms?.servicePages?.[id || ''];
  const defaultService = servicesData.find(s => s.id === id);
  const service = cmsservice || defaultService;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <h1 className="text-white text-4xl">Service Protocol Not Found.</h1>
        <Link to="/" className="ml-4 text-cyan-500 underline">Abort Mission</Link>
      </div>
    );
  }

  // Get images from CMS or defaults
  const images = service.images || (defaultService?.image ? [defaultService.image] : []);
  const extraImages = images.slice(1);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white dark:bg-black transition-colors duration-700"
    >
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={images[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426'} 
            alt={service.title} 
            className="w-full h-full object-cover opacity-30 dark:opacity-40"
          />
          <div className={`absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white dark:from-black dark:via-black/80 dark:to-black`} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <Link to="/" className="inline-flex items-center space-x-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black tracking-widest uppercase">Recall Home</span>
          </Link>
          
          <div className="flex items-center gap-6 mb-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${defaultService?.color || 'from-cyan-500 to-blue-600'} text-white flex items-center justify-center shadow-2xl`}>
              {defaultService?.icon && <defaultService.icon className="w-8 h-8" />}
              {!defaultService?.icon && <Zap className="w-8 h-8" />}
            </div>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-black tracking-[0.4em] uppercase text-zinc-400"
            >
              Protocol: {service.id.replace(/-/g, ' ')}
            </motion.span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none mb-6"
          >
            {service.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-medium text-zinc-500 dark:text-zinc-400 max-w-3xl leading-tight"
          >
            {service.subtitle}
          </motion.p>
        </div>

        <div className="absolute bottom-0 right-0 w-1/3 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
      </section>

      {/* Main Content */}
      <section className="py-24 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase text-cyan-600 mb-6 font-mono">Mission Summary</h2>
              <p className="text-xl md:text-2xl text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                {service.fullDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {(service.stats || defaultService?.stats || []).map((stat: any, i: number) => (
                <div key={i} className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">{stat.value}</p>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {extraImages[0] && (
            <div className="relative">
              <div className="rounded-[4rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
                <img src={extraImages[0]} alt="Process" className="w-full h-auto" />
              </div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-1 flex items-center justify-center animate-spin-slow">
                 <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center font-black text-xs text-center p-4">
                    INSTAGRAM THEMED ENGAGEMENT
                 </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Detailed Explanation Section with More Images */}
      <section className="py-32 bg-zinc-50 dark:bg-zinc-950 border-y border-zinc-100 dark:border-zinc-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-20 items-center mb-32">
            {extraImages[1] && (
              <div className="w-full md:w-1/2">
                 <img src={extraImages[1]} alt="Detailed View" className="w-full rounded-[3rem] shadow-2xl" />
              </div>
            )}
            <div className="w-full md:w-1/2 space-y-8">
               <span className="text-rose-500 font-black text-xs tracking-[0.5em] uppercase">Phase 01: The Core Strategy</span>
               <h3 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Maximum Impact.</span></h3>
               <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
                 We go beyond surface-level aesthetics. Every pixel is placed with intent, backed by conversions data and user psychology. Our process involves deep auditing, rapid prototyping, and iterative feedback loops that ensure your project doesn't just look good—it performs at elite levels.
               </p>
               <div className="flex flex-wrap gap-4">
                  {['Psychology-First', 'Data-Driven', 'High-Fidelity'].map(tag => (
                    <span key={tag} className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{tag}</span>
                  ))}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mt-24">
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase text-purple-600 mb-6 font-mono tracking-[0.3em]">Strategic Benefits</h2>
              <div className="space-y-4">
                {service.benefits.map((benefit: string, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center space-x-4 p-6 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 hover:border-rose-500/30 transition-all shadow-sm hover:shadow-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-12 rounded-[3.5rem] bg-zinc-950 text-white relative overflow-hidden group shadow-[0_30px_100px_-15px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-rose-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-400 via-rose-500 to-purple-600 mb-8 flex items-center justify-center">
                   <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-black mb-4 tracking-tighter">Initialize Protocol?</h3>
                <p className="text-zinc-400 mb-10 font-medium text-lg leading-relaxed">Ready to deploy these high-performance capabilities into your digital ecosystem? Our architects are on standby to transform your vision into reality.</p>
                
                <button 
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('contact');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full py-6 bg-gradient-to-r from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888] text-white rounded-2xl font-black tracking-[0.2em] uppercase text-sm hover:scale-[1.03] transition-all shadow-[0_10px_40px_-5px_rgba(220,39,67,0.5)] active:scale-95"
                >
                  Acquire Capability
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Showcase */}
      <section className="py-24 bg-white dark:bg-black transition-colors">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4">Architecture <span className="text-zinc-400">Vault.</span></h2>
            <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">High-Resolution Execution Strategy</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f", label: "PHASE 01: NEURAL ANALYSIS" },
              { img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa", label: "PHASE 02: SYNC OPTIMIZATION" },
              { img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1", label: "PHASE 03: ELITE DEPLOYMENT" }
            ].map((item, idx) => (
              <div key={idx} className="space-y-6 group">
                <div className="aspect-square rounded-[3rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <img src={`${item.img}?auto=format&fit=crop&q=80&w=2070`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" alt={item.label} />
                </div>
                <p className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] group-hover:text-rose-500 transition-colors">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-32 container mx-auto px-6 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <Link 
            to={`/services/${servicesData[(servicesData.findIndex(s => s.id === id) - 1 + servicesData.length) % servicesData.length].id}`}
            className="group block text-left"
          >
            <span className="inline-block text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-4 ml-16">Previous Protocol</span>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-all group-hover:-translate-x-2">
                <ArrowLeft size={20} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
              </div>
              <h4 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white group-hover:text-rose-500 transition-colors tracking-tighter">
                {servicesData[(servicesData.findIndex(s => s.id === id) - 1 + servicesData.length) % servicesData.length].title}
              </h4>
            </div>
          </Link>

          <Link 
            to={`/services/${servicesData[(servicesData.findIndex(s => s.id === id) + 1) % servicesData.length].id}`}
            className="group block text-right"
          >
            <span className="inline-block text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-4 mr-16">Next Protocol</span>
            <div className="flex items-center gap-6 justify-end">
              <h4 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white group-hover:text-cyan-500 transition-colors tracking-tighter">
                {servicesData[(servicesData.findIndex(s => s.id === id) + 1) % servicesData.length].title}
              </h4>
              <div className="w-16 h-16 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-all group-hover:translate-x-2">
                <ArrowRight size={20} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
