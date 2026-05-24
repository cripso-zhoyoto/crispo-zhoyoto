import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ExternalLink, ArrowLeft, Star, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import VideoLightbox from '../components/VideoLightbox';

interface VideoAsset {
  url: string;
  title: string;
}

interface Demo {
  id: string;
  number: string;
  title: string;
  category: string;
  image: string;
  description: string;
  projectUrl?: string;
  caseStudyUrl?: string;
  videoUrl?: string;
  videoUrls?: VideoAsset[];
  previewUrl?: string;
}

const GITHUB_ASSETS_BASE = 'https://raw.githubusercontent.com/cripso-zhoyoto/image-hosting/main/crispo-main/';

const STATIC_DEMOS: Demo[] = [
  {
    id: '1',
    title: 'E-Comm 3D Visualizer',
    category: 'Retail Technology',
    image: `${GITHUB_ASSETS_BASE}1.jpg`,
    number: '01',
    description: 'Next-gen 3D product rendering for high-conversion e-commerce.',
    projectUrl: '#',
    videoUrl: `${GITHUB_ASSETS_BASE}v1.mp4`
  },
  {
    id: '2',
    title: 'SaaS Analytics Dashboard',
    category: 'Fintech / Data',
    image: `${GITHUB_ASSETS_BASE}2.jpg`,
    number: '02',
    description: 'Real-time financial data visualization with advanced filtering.',
    projectUrl: '#',
    videoUrl: `${GITHUB_ASSETS_BASE}v2.mp4`
  },
  {
    id: '3',
    title: 'AI Assistant Interface',
    category: 'Generative AI',
    image: `${GITHUB_ASSETS_BASE}3.jpg`,
    number: '03',
    description: 'Human-centric AI chat interface with seamless LLM integration.',
    projectUrl: '#',
    videoUrl: `${GITHUB_ASSETS_BASE}v3.mp4`
  },
  {
    id: '4',
    title: 'Web Re-designing',
    category: 'Web Development',
    image: `${GITHUB_ASSETS_BASE}4.jpg`,
    number: '04',
    description: 'Modernizing digital identity with high-performance web solutions.',
    projectUrl: '#',
    videoUrl: `${GITHUB_ASSETS_BASE}v4.mp4`
  },
  {
    id: '5',
    title: 'App Development',
    category: 'Mobile Apps',
    image: `${GITHUB_ASSETS_BASE}5.jpg`,
    number: '05',
    description: 'Cross-platform mobile applications built for speed and scale.',
    projectUrl: '#',
    videoUrl: `${GITHUB_ASSETS_BASE}v5.mp4`
  },
  {
    id: '6',
    title: 'UI/UX Design',
    category: 'Product Design',
    image: `${GITHUB_ASSETS_BASE}6.jpg`,
    number: '06',
    description: 'Intuitive user journeys crafted through data-driven design.',
    projectUrl: '#',
    videoUrl: `${GITHUB_ASSETS_BASE}v6.mp4`
  }
];

export default function DemosPage() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [filteredDemos, setFilteredDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeVideoDemo, setActiveVideoDemo] = useState<Demo | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>('');
  const [expandedDemos, setExpandedDemos] = useState<Record<string, boolean>>({});

  const toggleExpandDemo = (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    setExpandedDemos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = ['All', ...new Set(demos.map(d => d.category))];

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredDemos(demos);
    } else {
      setFilteredDemos(demos.filter(d => d.category === activeCategory));
    }
  }, [activeCategory, demos]);

  useEffect(() => {
    window.scrollTo(0, 0);

    // SEO Optimization
    document.title = "Engineering Showcase | Crispo Digital Agency Demos";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Explore Crispo Digital Agency's full catalog of high-performance engineering demos. From AI-driven SaaS platforms to immersive Web3 experiences.");
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = "Explore Crispo Digital Agency's full catalog of high-performance engineering demos. From AI-driven SaaS platforms to immersive Web3 experiences.";
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", "engineering demos, UI/UX showcase, SaaS interface, Web3 development, React portfolio, Crispo agency");
    } else {
      const meta = document.createElement('meta');
      meta.name = "keywords";
      meta.content = "engineering demos, UI/UX showcase, SaaS interface, Web3 development, React portfolio, Crispo agency";
      document.head.appendChild(meta);
    }

    const fetchDemos = async () => {
      try {
        const q = query(collection(db, 'demos'), orderBy('number', 'asc'));
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
      } finally {
        setLoading(false);
      }
    };

    fetchDemos();
  }, []);

  const optimizeImageUrl = (url: string) => {
    if (url.includes('images.unsplash.com')) {
      // Remove existing quality/width params and add optimized ones
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?q=75&w=1200&auto=format&fit=crop`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-32 pb-24 px-4 overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-12 font-black tracking-widest text-xs uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </Link>
        
        <div className="mb-24">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-cyan-600 font-black tracking-[0.4em] uppercase text-xs mb-4"
          >
            Full Catalog
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-9xl font-sans font-black text-zinc-900 dark:text-white tracking-tight leading-none"
          >
            Engineering <br />
            <span className="text-zinc-500">Showcase.</span>
          </motion.h1>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${
                activeCategory === cat 
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl' 
                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-100 dark:border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
          {filteredDemos.map((demo, index) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative rounded-[3rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-2xl aspect-[16/10] mb-10 group relative">
                <img 
                  src={optimizeImageUrl(demo.image)} 
                  alt={demo.title}
                  loading="lazy"
                  draggable="false"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
                />
                <a 
                  href={demo.projectUrl || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-zinc-900/30 backdrop-blur-[4px]"
                >
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-100 text-zinc-900 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                    <ExternalLink className="w-8 h-8" />
                  </div>
                </a>
                <div className="absolute top-8 left-8 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-6 py-2 rounded-full shadow-xl">
                  <span className="text-zinc-900 dark:text-white font-black tracking-widest text-xs">#{demo.number}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.4em] font-black text-zinc-400">
                    {demo.category}
                  </span>
                  <div className="flex items-center space-x-1 text-emerald-500">
                    <Star className="w-3 h-3 fill-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Premium Demo</span>
                  </div>
                </div>
                <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight group-hover:text-cyan-600 transition-colors">
                  {demo.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed font-medium max-w-md">
                  {(() => {
                    const desc = demo.description || 'Custom engineered interactive experience designed for high-conversion stakeholder engagement.';
                    const isExpanded = expandedDemos[demo.id];
                    if (desc.length > 85) {
                      return (
                        <>
                          {isExpanded ? desc : `${desc.slice(0, 85)}...`}
                          <button
                            onClick={(e) => toggleExpandDemo(demo.id, e)}
                            className="ml-2 font-black text-xs uppercase tracking-wider text-rose-600 dark:text-cyan-400 hover:underline inline-block whitespace-nowrap cursor-pointer"
                          >
                            {isExpanded ? 'show less..' : 'explore more..'}
                          </button>
                        </>
                      );
                    }
                    return desc;
                  })()}
                </p>
                <div className="pt-6 flex flex-wrap items-center gap-6">
                  {demo.projectUrl && (
                    <a 
                      href={demo.projectUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-zinc-900 dark:text-zinc-100 font-black tracking-widest text-xs uppercase hover:text-cyan-600 transition-colors"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {demo.previewUrl && (
                    demo.previewUrl.startsWith('http') ? (
                      <a 
                        href={demo.previewUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-zinc-900 dark:text-zinc-100 font-black tracking-widest text-xs uppercase hover:text-purple-600 transition-colors"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <Link 
                        to={demo.previewUrl} 
                        className="flex items-center space-x-3 text-zinc-900 dark:text-zinc-100 font-black tracking-widest text-xs uppercase hover:text-purple-600 transition-colors"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-4 h-4" />
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
                      className="flex items-center space-x-3 text-[#3B000A] dark:text-[#EAB308] hover:text-rose-600 dark:hover:text-cyan-400 font-black tracking-widest text-xs uppercase transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch ({demo.videoUrls && demo.videoUrls.length > 0 ? demo.videoUrls.length : 1})</span>
                    </button>
                  )}
                  <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800" />
                  <a 
                    href={demo.caseStudyUrl || '#'} 
                    className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-black tracking-widest uppercase transition-colors"
                  >
                    Case Study
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
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
    </div>
  );
}
