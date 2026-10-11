import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Demos from './components/Demos';
import AILab from './components/AILab';
import FunZone from './components/FunZone';
import Contact from './components/Contact';
import CrispoBackground from './components/CrispoBackground';
import Levicon from './components/Levicon';
import SplashScreen from './components/SplashScreen';
import WhatsAppBot from './components/WhatsAppBot';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';
import SalesAlert from './components/SalesAlert';
import DemosPage from './pages/DemosPage';
import AdminPage from './pages/AdminPage';
import PolicyPage from './pages/PolicyPage';
import FAQPage from './pages/FAQPage';
import ServiceDetailsPage, { servicesData } from './pages/ServiceDetailsPage';
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Linkedin, Github, Instagram, Youtube } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const CMSContext = React.createContext<any>(null);

export interface MetaTagConfig {
  title: string;
  description: string;
  ogImage?: string;
  url?: string;
  type?: string;
}

/**
 * Dynamically updates document title and search engine / social meta tags
 * (description, og:title, og:description, og:image, twitter cards, canonical URL, and JSON-LD structured data).
 */
export function updateMetaTags({
  title,
  description,
  ogImage,
  url,
  type = 'website'
}: MetaTagConfig) {
  if (typeof document === 'undefined') return;

  // 1. Update Document Title
  document.title = title;

  // 2. Helper to set or create <meta> elements
  const setMetaTag = (attribute: 'name' | 'property', key: string, content: string) => {
    if (!content) return;
    let el = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attribute, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const fallbackImage = 'https://raw.githubusercontent.com/cripso-zhoyoto/image-hosting/main/images/background.jpg';
  const finalImage = ogImage || fallbackImage;

  // Standard SEO Description
  setMetaTag('name', 'description', description);

  // Open Graph Social Tags
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', finalImage);
  if (currentUrl) setMetaTag('property', 'og:url', currentUrl);
  setMetaTag('property', 'og:type', type);
  setMetaTag('property', 'og:site_name', 'GENCEEY Digital');

  // Twitter / X Social Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', finalImage);
  if (currentUrl) setMetaTag('name', 'twitter:url', currentUrl);

  // Canonical Link
  if (currentUrl) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);
  }

  // Schema.org Structured Data (JSON-LD)
  let scriptLd = document.getElementById('dynamic-seo-ldjson') as HTMLScriptElement | null;
  if (!scriptLd) {
    scriptLd = document.createElement('script');
    scriptLd.id = 'dynamic-seo-ldjson';
    scriptLd.type = 'application/ld+json';
    document.head.appendChild(scriptLd);
  }
  scriptLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': type === 'article' || type === 'service' ? 'Service' : 'WebApplication',
    'name': title,
    'description': description,
    'url': currentUrl,
    'image': finalImage,
    'provider': {
      '@type': 'Organization',
      'name': 'GENCEEY Digital',
      'url': typeof window !== 'undefined' ? window.location.origin : 'https://genceey.digital'
    }
  });
}

/**
 * Resolves tailored metadata configurations based on current active route, parameters, or service viewed.
 */
export function getRouteMeta(pathname: string, cms?: any): MetaTagConfig {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Service details route: /services/:id
  if (pathname.startsWith('/services/')) {
    const serviceId = pathname.replace('/services/', '').split('/')[0].trim();
    const cmsService = cms?.servicePages?.[serviceId];
    const defaultService = servicesData.find(s => s.id === serviceId);
    const service = cmsService || defaultService;

    if (service) {
      const primaryImage = (service.images && service.images[0]) || service.image || defaultService?.image;
      return {
        title: `${service.title} | ${service.subtitle || 'Service Protocol'} – GENCEEY Digital`,
        description: service.description || service.fullDescription || `Explore ${service.title} engineered by GENCEEY Digital. Next-Gen interactive web architecture & AI optimization.`,
        ogImage: primaryImage,
        url: currentUrl,
        type: 'service'
      };
    }
  }

  // Interactive Demos showcase route
  if (pathname === '/demos') {
    return {
      title: 'Interactive Demos & Live Sandbox | GENCEEY Digital',
      description: 'Explore interactive product sandboxes, high-fidelity web prototypes, and live digital experiences engineered by GENCEEY Digital.',
      ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426',
      url: currentUrl
    };
  }

  // Admin Command Center route
  if (pathname === '/admin') {
    return {
      title: 'Admin Command Center | GENCEEY Digital',
      description: 'Secure agency management suite, real-time CMS, and catalog configuration for GENCEEY Digital.',
      url: currentUrl
    };
  }

  // Policy route
  if (pathname === '/policy') {
    return {
      title: 'Privacy Policy & Protocol Terms | GENCEEY Digital',
      description: 'Official privacy policy, protocol terms of service, and neural data protection guidelines for GENCEEY Digital.',
      url: currentUrl
    };
  }

  // FAQ route
  if (pathname === '/faq') {
    return {
      title: 'Neural Sync & FAQ | GENCEEY Digital',
      description: 'Frequently asked questions regarding our engineering velocity, interactive product sandboxes, AEO strategies, and engagement models.',
      url: currentUrl
    };
  }

  // Default Home Page route
  return {
    title: 'GENCEEY Digital | Next-Gen Agency & AI Architecture',
    description: cms?.hero?.subheadline || 'GENCEEY Digital - Next-Gen Agency specializing in high-performance digital architecture, web apps, and AI growth strategies.',
    ogImage: 'https://raw.githubusercontent.com/cripso-zhoyoto/image-hosting/main/images/background.jpg',
    url: currentUrl
  };
}

/**
 * Route-aware component that triggers metadata synchronization whenever active route or CMS state updates.
 */
function DynamicMetaManager({ cms }: { cms: any }) {
  const location = useLocation();

  React.useEffect(() => {
    const meta = getRouteMeta(location.pathname, cms);
    updateMetaTags(meta);
  }, [location.pathname, cms]);

  return null;
}

function HomePage() {
  const cms = React.useContext(CMSContext);
  return (
    <>
      <WhatsAppBot cms={cms?.whatsappBot} />
      <Levicon cms={cms?.levicon} />
      <Hero cms={cms?.hero} />
      <Services cms={cms?.services} />
      <Demos cms={cms?.demos} />
      <AILab cms={cms?.aiLab} />
      <FunZone cms={cms?.funZone} />
      <Contact cms={cms?.contact} />
    </>
  );
}

export default function App() {
  const [settings, setSettings] = React.useState<any>(null);
  const [cms, setCms] = React.useState<any>(null);
  const [showSplash, setShowSplash] = React.useState(() => {
    // Check if we are on the admin path or if splash is already seen in session
    return !window.location.pathname.startsWith('/admin');
  });

  React.useEffect(() => {
    // Initial meta tag update
    updateMetaTags(getRouteMeta(window.location.pathname, cms));

    // --- SECURITY PROTOCOLS ---
    // Prevent common inspection vectors to minimize code leakage risk
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12 (Inspect)
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Prevent Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
      }
      // Prevent Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
      }
      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
      }
      // Prevent Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // Handle Dynamic Favicon
    if (cms?.footer?.faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = cms.footer.faviconUrl;
      }
    }

    // If we land on admin, we should never show it
    if (window.location.pathname.startsWith('/admin')) {
      setShowSplash(false);
    }

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    }, (error) => {
      console.warn("Global settings snapshot listener notice:", error.message);
    });

    const unsubCMS = onSnapshot(doc(db, 'settings', 'cms'), (docSnap) => {
      if (docSnap.exists()) {
        setCms(docSnap.data());
      }
    }, (error) => {
      console.warn("CMS settings snapshot listener notice:", error.message);
    });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      unsubSettings();
      unsubCMS();
    };
  }, []);

  const socialLinks = cms?.footer?.socialLinks || settings?.socialMedia || {
  linkedin: 'https://www.linkedin.com/in/lubab-aymen-p-5a5009360',
  instagram: 'https://www.instagram.com/Lubuuii',
  youtube: 'https://www.youtube.com/channel/UCAjKk0aZGhmVCKb84KTo_JA',
  github: '#'
};

  return (
    <CMSContext.Provider value={cms}>
      <Router>
        <DynamicMetaManager cms={cms} />
        <CustomCursor />
        <ScrollProgress />
        <AnimatePresence mode="wait">
          {showSplash ? (
            <SplashScreen 
              key="splash" 
              cms={cms?.splash} 
              onComplete={() => setShowSplash(false)} 
            />
          ) : (
            <motion.div 
              key="main-app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen text-white font-sans selection:bg-cyan-500/30"
            >
              <CrispoBackground />
              <SalesAlert />
              <Navbar cms={cms?.navbar} />
              <main className="relative z-10">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/demos" element={<DemosPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/services/:id" element={<ServiceDetailsPage />} />
                  <Route path="/policy" element={<PolicyPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                </Routes>
              </main>
              <footer className="py-24 border-t border-zinc-200 dark:border-zinc-800 text-center relative z-10 bg-white dark:bg-zinc-950 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="mb-12">
                    <span className="font-sans font-black text-4xl tracking-tighter text-zinc-900 dark:text-white">
                      GENCEEY<span className="text-cyan-500">.</span>
                    </span>
                  </div>
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm font-black tracking-widest uppercase">&copy; {new Date().getFullYear()} {(cms?.footer?.copyrightLine ? cms.footer.copyrightLine.replace(/crispo/gi, 'GENCEEY') : 'GENCEEY Digital Agency. Engineered with Magic.')}</p>
                  
                  <div className="mt-12 flex justify-center">
                    <ul className="social-icons-wrapper">
                      <li className="icon-content">
                        <a href={socialLinks.linkedin} target="_blank" aria-label="LinkedIn" data-social="linkedin">
                          <div className="filled"></div>
                          <Linkedin size={20} />
                        </a>
                        <div className="tooltip">LinkedIn</div>
                      </li>
                      <li className="icon-content">
                        <a href={socialLinks.github} target="_blank" aria-label="GitHub" data-social="github">
                          <div className="filled"></div>
                          <Github size={20} />
                        </a>
                        <div className="tooltip">GitHub</div>
                      </li>
                      <li className="icon-content">
                        <a href={socialLinks.instagram} target="_blank" aria-label="Instagram" data-social="instagram">
                          <div className="filled"></div>
                          <Instagram size={20} />
                        </a>
                        <div className="tooltip">Instagram</div>
                      </li>
                      <li className="icon-content">
                        <a href={socialLinks.youtube} target="_blank" aria-label="YouTube" data-social="youtube">
                          <div className="filled"></div>
                          <Youtube size={20} />
                        </a>
                        <div className="tooltip">YouTube</div>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-12 flex justify-center space-x-12 opacity-50">
                    <Link to="/policy" className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[10px] font-black tracking-[0.2em] uppercase">{cms?.footer?.policyText || 'Policy'}</Link>
                    <Link to="/faq" className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[10px] font-black tracking-[0.2em] uppercase">{cms?.footer?.faqText || 'Neural Sync (FAQ)'}</Link>
                    <Link to="/admin" className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-[10px] font-black tracking-[0.2em] uppercase">Admin</Link>
                  </div>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </Router>
    </CMSContext.Provider>
  );
}
