import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Star, ArrowRight, Grid3X3, Play } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import VideoLightbox from './VideoLightbox';

interface VideoAsset {
  url: string;
  title: string;
}

interface Demo {
  id: string;
  title: string;
  category: string;
  image: string;
  number: string;
  description?: string;
  projectUrl?: string;
  caseStudyUrl?: string;
  videoUrl?: string;
  videoUrls?: VideoAsset[];
  previewUrl?: string;
}

interface DemosProps {
  cms?: {
    badge: string;
    titleFirstLine: string;
    titleSecondLine: string;
    catalogBtnText: string;
    viewProjectBtnText: string;
    caseStudyBtnText: string;
  };
}

const STATIC_DEMOS: Demo[] = [
  {
    id: '1',
    title: 'E-Comm 3D Visualizer',
    category: 'Retail Technology',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    number: '01',
    description: 'Next-gen 3D product rendering for high-conversion e-commerce.',
    projectUrl: '#'
  },
  {
    id: '2',
    title: 'SaaS Analytics Dashboard',
    category: 'Fintech / Data',
    image: 'https://images.unsplash.com/photo-1584931423312-5d53d862446a?q=80&w=2070&auto=format&fit=crop',
    number: '02',
    description: 'Real-time financial data visualization with advanced filtering.',
    projectUrl: '#'
  },
  {
    id: '3',
    title: 'AI Assistant Interface',
    category: 'Generative AI',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop',
    number: '03',
    description: 'Human-centric AI chat interface with seamless LLM integration.',
    projectUrl: '#'
  },
  {
    id: '4',
    title: 'Web Re-designing',
    category: 'Web Development',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2070&auto=format&fit=crop',
    number: '04',
    description: 'Modernizing digital identity with high-performance web solutions.',
    projectUrl: '#'
  },
  {
    id: '5',
    title: 'App Development',
    category: 'Mobile Apps',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop',
    number: '05',
    description: 'Cross-platform mobile applications built for speed and scale.',
    projectUrl: '#'
  },
  {
    id: '6',
    title: 'UI/UX Design',
    category: 'Product Design',
    image: 'https://images.unsplash.com/photo-1690228254548-31ef53e40cd1?q=80&w=2070&auto=format&fit=crop',
    number: '06',
    description: 'Intuitive user journeys crafted through data-driven design.',
    projectUrl: '#'
  }
];

export default function Demos({ cms }: DemosProps) {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [activeVideoDemo, setActiveVideoDemo] = useState<Demo | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>('');
  const [expandedDemos, setExpandedDemos] = useState<Record<string, boolean>>({});

  const toggleExpandDemo = (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    setExpandedDemos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const fetchDemos = async () => {
      try {
        const q = query(collection(db, 'demos'), orderBy('number', 'asc'), limit(3));
        const querySnapshot = await getDocs(q);
        const fetchedDemos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Demo[];
        
        if (fetchedDemos.length > 0) {
          setDemos(fetchedDemos);
        } else {
          setDemos(STATIC_DEMOS);
        }
      } catch (error) {
        console.error('Error fetching demos:', error);
        setDemos(STATIC_DEMOS);
      }
    };

    fetchDemos();
  }, []);

  const optimizeImageUrl = (url: string) => {
    if (url.includes('images.unsplash.com')) {
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?q=75&w=1200&auto=format&fit=crop`;
    }
    return url;
  };

  return (
    <section id="demos" className="py-32 px-4 overflow-hidden relative z-10 bg-white/10 dark:bg-zinc-950/10 backdrop-blur-3xl border-y border-white/10 dark:border-zinc-800/10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-xl">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-cyan-600 dark:text-cyan-400 font-black tracking-[0.4em] uppercase text-xs mb-4"
            >
              {cms?.badge || 'The Repository'}
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-sans font-black text-zinc-900 dark:text-white tracking-tight leading-none"
            >
              {cms?.titleFirstLine || 'Interactive'} <br />
              <span className="text-zinc-600 dark:text-zinc-400">{cms?.titleSecondLine || 'Demo Pathway.'}</span>
            </motion.h2>
          </div>
          <div className="flex flex-col items-end gap-6 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
              {['SaaS', 'AI', 'Web3', 'Creative'].map((cat) => (
                <Link
                  key={cat}
                  to="/demos"
                  className="px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-[10px] font-black tracking-widest uppercase hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 transition-all"
                >
                  {cat}
                </Link>
              ))}
              <Link
                to="/demos"
                className="px-4 py-1.5 rounded-full bg-cyan-500 text-black text-[10px] font-black tracking-widest uppercase hover:bg-cyan-400 transition-all"
              >
                All
              </Link>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="flex items-center space-x-3 text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800 px-6 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm"
            >
              <Star className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              <span className="text-xs font-black tracking-widest uppercase">Verified Ecosystem v4.1</span>
            </motion.div>
            <Link 
              to="/demos"
              className="group flex items-center space-x-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-10 py-5 rounded-[2rem] font-black tracking-widest text-xs uppercase shadow-2xl hover:scale-105 transition-all"
            >
              <Grid3X3 className="w-5 h-5 text-cyan-400 dark:text-cyan-600" />
              <span>{cms?.catalogBtnText || 'Full Project Catalog'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

          <div className="relative">
          {/* Pathway Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-900/10 dark:bg-white/10 hidden lg:block" />

          <div className="space-y-48">
            {demos.map((demo, index) => (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-24`}
              >
                {/* Visual Number Indicator */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  whileHover={{ scale: 1.2, rotate: 10, backgroundColor: '#06b6d4', color: '#ffffff', boxShadow: '0 20px 50px rgba(6, 182, 212, 0.3)' }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 6,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                  className="absolute left-1/2 -translate-x-1/2 w-20 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-100 hidden lg:flex items-center justify-center z-20 text-zinc-900 dark:text-white font-black text-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all cursor-default"
                >
                  {demo.number}
                </motion.div>

                <div className="flex-1 w-full relative group">
                  {/* Decorative card behind */}
                  <div className={`absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-[3rem] translate-x-4 translate-y-4 -z-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform opacity-50`} />
                  
                  <div className="relative rounded-[3rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl aspect-[16/10] z-10">
                    <img 
                      src={optimizeImageUrl(demo.image)} 
                      alt={demo.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
                    />
                    <Link to="/demos" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-zinc-900/30 backdrop-blur-[4px]">
                      <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-100 text-zinc-900 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                        <ExternalLink className="w-8 h-8" />
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="flex-1 space-y-8 text-center lg:text-left">
                  <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-black tracking-widest text-[10px] uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>{demo.category}</span>
                  </div>
                  <h3 className="text-5xl md:text-6xl lg:text-7xl font-sans font-black text-zinc-900 dark:text-white tracking-tight leading-[0.9] hover:text-cyan-600 transition-colors cursor-default">
                    {demo.title}
                  </h3>
                  <p className="text-[#3B000A] dark:text-[#3B000A] text-xl leading-relaxed max-w-md mx-auto lg:mx-0 font-medium opacity-80">
                    {(() => {
                      const desc = demo.description || 'Proprietary interactive system built to increase user engagement by up to 240% during pitch sessions.';
                      const isExpanded = expandedDemos[demo.id];
                      if (desc.length > 85) {
                        return (
                          <>
                            {isExpanded ? desc : `${desc.slice(0, 85)}...`}
                            <button
                              onClick={(e) => toggleExpandDemo(demo.id, e)}
                              className="ml-2 font-black text-xs uppercase tracking-wider text-rose-600 dark:text-[#EAB308] hover:underline inline-block whitespace-nowrap cursor-pointer"
                            >
                              {isExpanded ? 'show less..' : 'explore more..'}
                            </button>
                          </>
                        );
                      }
                      return desc;
                    })()}
                  </p>
                  <div className="pt-6 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                    {demo.projectUrl && (
                      <Link 
                        to="/demos"
                        className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-black dark:hover:bg-zinc-100 transition-all text-sm font-black tracking-[0.2em] shadow-2xl shadow-zinc-900/20 text-center uppercase"
                      >
                       {cms?.viewProjectBtnText || 'VIEW PROJECT'}
                      </Link>
                    )}

                    {demo.previewUrl && (
                      demo.previewUrl.startsWith('http') ? (
                        <a 
                          href={demo.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-10 py-5 rounded-2xl border-2 border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-sm font-black tracking-[0.2em] text-center uppercase"
                        >
                          PREVIEW
                        </a>
                      ) : (
                        <Link 
                          to={demo.previewUrl}
                          className="w-full sm:w-auto px-10 py-5 rounded-2xl border-2 border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-sm font-black tracking-[0.2em] text-center uppercase"
                        >
                          PREVIEW
                        </Link>
                      )
                    )}

                    {(demo.videoUrl || (demo.videoUrls && demo.videoUrls.length > 0)) && (
                      <button 
                        onClick={() => {
                          setActiveVideoDemo(demo);
                          const initialUrl = demo.videoUrls && demo.videoUrls.length > 0 
                            ? demo.videoUrls[0].url 
                            : (demo.videoUrl || '');
                          setActiveVideoUrl(initialUrl);
                        }}
                        className="w-full sm:w-auto px-10 py-5 rounded-2xl border-2 border-[#3B000A] dark:border-[#EAB308] text-[#3B000A] dark:text-[#EAB308] hover:bg-rose-50 dark:hover:bg-rose-900/15 transition-all text-sm font-black tracking-[0.2em] text-center uppercase flex items-center justify-center space-x-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>WATCH DEMO ({demo.videoUrls && demo.videoUrls.length > 0 ? demo.videoUrls.length : 1})</span>
                      </button>
                    )}

                    <a 
                      href={demo.caseStudyUrl || '#'}
                      className="w-full sm:w-auto px-10 py-5 rounded-2xl border-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-sm font-black tracking-[0.2em] text-center uppercase"
                    >
                      {cms?.caseStudyBtnText || 'CASE STUDY'}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <VideoLightbox
        demo={activeVideoDemo}
        activeVideoUrl={activeVideoUrl}
        setActiveVideoUrl={setActiveVideoUrl}
        onClose={() => {
          setActiveVideoDemo(null);
          setActiveVideoUrl('');
        }}
      />
    </section>
  );
}
