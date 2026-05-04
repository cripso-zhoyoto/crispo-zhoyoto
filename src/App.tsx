import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
import SalesAlert from './components/SalesAlert';
import DemosPage from './pages/DemosPage';
import AdminPage from './pages/AdminPage';
import PolicyPage from './pages/PolicyPage';
import FAQPage from './pages/FAQPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Linkedin, Github, Instagram, Youtube } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const CMSContext = React.createContext<any>(null);

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
    document.title = "Crispo Digital | Next-Gen Agency";

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
    });

    const unsubCMS = onSnapshot(doc(db, 'settings', 'cms'), (docSnap) => {
      if (docSnap.exists()) {
        setCms(docSnap.data());
      }
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
        <CustomCursor />
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
                      CRISPO<span className="text-cyan-500">.</span>
                    </span>
                  </div>
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm font-black tracking-widest uppercase">&copy; {new Date().getFullYear()} {cms?.footer?.copyrightLine || 'Crispo Digital Agency. Engineered with Magic.'}</p>
                  
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
