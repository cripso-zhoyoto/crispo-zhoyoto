import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, deleteDoc, updateDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { Plus, Trash2, Edit2, Save, X, Settings as SettingsIcon, LogOut, ExternalLink, Mail, Phone, MapPin, Instagram, Linkedin, Globe, MessageSquare, Youtube, Upload, Image as ImageIcon, Loader2, Menu, Github, Star, Sparkles, Send, Zap, AlertCircle } from 'lucide-react';
import { ImageCropper } from '../components/ImageCropper';

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
  previewUrl?: string;
  order?: number;
}

interface SocialLinks {
  linkedin: string;
  instagram: string;
  youtube: string;
  github: string;
}

interface GlobalSettings {
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  socialMedia: SocialLinks;
}

interface CMSContent {
  navbar: {
    home: string;
    services: string;
    demos: string;
    aiLab: string;
    play: string;
    contactBtn: string;
  };
  hero: {
    title: string;
    subtitle: string;
    primaryBtn: string;
    primaryLink: string;
    secondaryBtn: string;
    secondaryLink: string;
    heroImage?: string;
    mobileHeroImage?: string;
  };
  services: {
    badge: string;
    title: string;
    description: string;
    suiteTitle: string;
    suiteDescription: string;
    btn: string;
  };
  aiLab: {
    badge: string;
    titleFirstLine: string;
    titleSecondLine: string;
    description: string;
    inputPlaceholder: string;
    buttonText: string;
    processingText: string;
  };
  contact: {
    badge: string;
    titleFirstLine: string;
    titleSecondLine: string;
    description: string;
    emailLabel: string;
    phoneLabel: string;
    whatsappLabel: string;
    locationLabel: string;
    inputName: string;
    inputEmail: string;
    inputPhone: string;
    inputMessage: string;
    submitBtn: string;
  };
  funZone: {
    title: string;
    subtitle: string;
    offerBtn: string;
  };
  splash: {
    text: string;
    duration: number;
    enabled: boolean;
  };
  whatsappBot: {
    number: string;
    message: string;
    enabled: boolean;
  };
  levicon: {
    text: string;
    enabled: boolean;
  };
  demos: {
    badge: string;
    titleFirstLine: string;
    titleSecondLine: string;
    catalogBtnText: string;
    viewProjectBtnText: string;
    caseStudyBtnText: string;
  };
  footer: {
    copyrightLine: string;
    policyText: string;
    faqText: string;
    socialLinks: {
      linkedin: string;
      instagram: string;
      youtube: string;
      github: string;
    };
    faviconUrl?: string;
  };
  servicePages: {
    [key: string]: {
      id: string;
      title: string;
      subtitle: string;
      fullDescription: string;
      benefits: string[];
      images: string[];
      stats: { label: string; value: string }[];
    };
  };
}

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [cms, setCms] = useState<CMSContent | null>(null);
  const [activeTab, setActiveTab] = useState<'demos' | 'settings' | 'enquiries' | 'text-editor'>('demos');
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Refs for tracking initial load and debouncing
  const isInitialCMS = useRef(true);
  const isInitialSettings = useRef(true);
  const cmsTimeout = useRef<NodeJS.Timeout | null>(null);
  const settingsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Loading & Validation states
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingSaveAction, setPendingSaveAction] = useState<{ type: string; data?: any } | null>(null);

  // Form states
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<Partial<Demo>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [croppingType, setCroppingType] = useState<'demo' | 'hero' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      // Security Check: Strict Admin Email Validation
      if (u && u.email === 'hyiamare55@gmail.com') {
        setUser(u);
      } else {
        if (u) {
          // Log unauthorized access attempts to a security collection
          addDoc(collection(db, 'security_logs'), {
            event: 'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT',
            email: u.email,
            uid: u.uid,
            timestamp: serverTimestamp()
          }).catch(() => {});
          auth.signOut();
        }
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch Demos - Master Sync
    const qDemos = query(collection(db, 'demos'), orderBy('number', 'asc'));
    const unsubDemos = onSnapshot(qDemos, (snapshot) => {
      setDemos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Demo[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'demos');
    });

    // Fetch Settings - System Core
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as GlobalSettings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
    });

    // Fetch CMS - Content Engine
    const unsubCMS = onSnapshot(doc(db, 'settings', 'cms'), (docSnap) => {
      if (docSnap.exists()) {
        setCms(docSnap.data() as CMSContent);
      } else {
        // Initialize default CMS - Fallback Protocol
        const defaults: CMSContent = {
          navbar: {
            home: "Home",
            services: "Services",
            demos: "Demos",
            aiLab: "AI Lab",
            play: "Play",
            contactBtn: "Let's Talk"
          },
          hero: {
            title: "Engineering Digital Magic",
            subtitle: "Elevate your brand with high-performance Web Re-Design, Website, Next-Gen UI/UX, and AI-driven growth strategies.",
            primaryBtn: "Explore Work",
            primaryLink: "#demos",
            secondaryBtn: "Chat Strategy",
            secondaryLink: "https://wa.me/919947410627"
          },
          services: {
            badge: "CAPABILITIES",
            title: "Next-Gen Solutions.",
            description: "We don't just build websites; we engineer experiences that dominate markets.",
            suiteTitle: "The \"Crispo\" Suite",
            suiteDescription: "Get a complete digital overhaul. Identity, strategy, and engineering in one master package.",
            btn: "INITIATE TRANSMISSION"
          },
          aiLab: {
            badge: "CRISPO INTELLIGENCE ENGINE v2.0",
            titleFirstLine: "Project",
            titleSecondLine: "Brainstormer.",
            description: "Unleash the full potential of your next venture. Our neural network distills complex visions into actionable 10x roadmaps.",
            inputPlaceholder: "Describe your radical idea in plain English...",
            buttonText: "Engage AI Architect",
            processingText: "Processing Neural Pathways..."
          },
          contact: {
            badge: "Get In Touch",
            titleFirstLine: "Let's Build",
            titleSecondLine: "Something Epic.",
            description: "Ready to redefine your digital presence? We combine behavioral engineering with stunning aesthetics to build things that convert.",
            emailLabel: "Direct Line",
            phoneLabel: "Call Us",
            whatsappLabel: "WhatsApp",
            locationLabel: "Ecosystem",
            inputName: "Identity",
            inputEmail: "Digital Address",
            inputPhone: "WhatsApp / Phone",
            inputMessage: "The Mission",
            submitBtn: "INITIATE TRANSMISSION"
          },
          funZone: {
            title: "The Fun Zone.",
            subtitle: "Need a break? Try to catch our discount code. It moves fast, just like your competitors should.",
            offerBtn: "CATCH ME (15% OFF)"
          },
          splash: {
            text: "CRISPO DIGITAL",
            duration: 2500,
            enabled: true
          },
          whatsappBot: {
            number: "1234567890",
            message: "Hello Crispo! I'm interested in your services.",
            enabled: true
          },
          levicon: {
            text: "CRISPO-ZHOYOTO",
            enabled: true
          },
          demos: {
            badge: "The Repository",
            titleFirstLine: "Interactive",
            titleSecondLine: "Demo Pathway.",
            catalogBtnText: "Full Project Catalog",
            viewProjectBtnText: "View Project",
            caseStudyBtnText: "Case Study"
          },
          footer: {
  copyrightLine: "Crispo Digital Agency. Engineered with Magic.",
  policyText: "Policy",
  faqText: "Neural Sync (FAQ)",
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/lubab-aymen-p-5a5009360",
    instagram: "https://www.instagram.com/Lubuuii",
    youtube: "https://www.youtube.com/channel/UCAjKk0aZGhmVCKb84KTo_JA",
    github: "#"
  }
},
          servicePages: {
            'web-app-demos': {
              id: 'web-app-demos',
              title: 'Web & App Demos',
              subtitle: 'High-Fidelity Interactive Experiences',
              fullDescription: 'Our Web & App Demos aren\'t just static screenshots or videos. They are fully functional, sandboxed versions of your product. We specialize in creating "Magic Moments" where users can input real data, trigger workflows, and see results instantly. This reduces sales friction and eliminates the "I need to see it to believe it" hurdle.',
              benefits: [
                'Zero-Risk Environments',
                'Real-Time Interaction',
                'Conversion Optimization',
                'Mobile-Responsive Sandboxes',
                'Instant Feedback Loops'
              ],
              images: [
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426',
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070'
              ],
              stats: [
                { label: 'Avg. Engagement', value: '+300%' },
                { label: 'Sales Velocity', value: '2x faster' }
              ]
            },
            'seo-aeo': {
              id: 'seo-aeo',
              title: 'SEO & AEO',
              subtitle: 'Answer Engine Optimization',
              fullDescription: 'Traditional SEO is dead. Modern search is about being the primary reference for AI models. We optimize your structured data, knowledge graph presence, and long-tail content to ensure that when a user asks ChatGPT, Perplexity, or Claude about your industry, your brand is the recommendation.',
              benefits: [
                'AI Recommendation Optimization',
                'LLM Knowledge Graph Integration',
                'Structured Data Orchestration',
                'High-Intent Traffic Capture',
                'Semantic Search Dominance'
              ],
              images: [
                'https://images.unsplash.com/photo-1551288049-bbda48658a7d?auto=format&fit=crop&q=80&w=2070',
                'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072'
              ],
              stats: [
                { label: 'AI Mentions', value: 'Top 3' },
                { label: 'Organic Growth', value: '450%' }
              ]
            },
            'ui-ux-design': {
              id: 'ui-ux-design',
              title: 'UI/UX Design',
              subtitle: 'Psychology-Driven Interaction',
              fullDescription: 'We design for the subconscious. By blending neuromarketing principles with cutting-edge visual aesthetics, we create interfaces that guide users effortlessly toward conversion. Every shadow, animation, and spacing choice is deliberate, designed to build trust and eliminate cognitive load.',
              benefits: [
                'Neuro-Design Principles',
                'Micro-Interaction Mastery',
                'Aesthetic-Usability Effect',
                'Rapid Prototyping',
                'Multi-Platform Consistency'
              ],
              images: [
                'https://images.unsplash.com/photo-1690228254548-31ef53e40cd1?auto=format&fit=crop&q=80&w=2070',
                'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=2020'
              ],
              stats: [
                { label: 'Design Fidelity', value: '100%' },
                { label: 'User Satisfaction', value: '98%' }
              ]
            }
          }
        };
        setCms(defaults);
      }
    });

    // Fetch Enquiries
    const qEnquiries = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'));
    const unsubEnquiries = onSnapshot(qEnquiries, (snapshot) => {
      setEnquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubDemos();
      unsubSettings();
      unsubCMS();
      unsubEnquiries();
    };
  }, [user]);

  // Auto-Sync CMS
  useEffect(() => {
    if (isInitialCMS.current) {
      if (cms) isInitialCMS.current = false;
      return;
    }
    if (!cms) return;

    if (cmsTimeout.current) clearTimeout(cmsTimeout.current);
    setSyncStatus('saving');
    
    cmsTimeout.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'settings', 'cms'), cms);
        setSyncStatus('saved');
      } catch (err) {
        console.error('CMS Auto-sync failed:', err);
        setSyncStatus('error');
      }
    }, 1000);

    return () => {
      if (cmsTimeout.current) clearTimeout(cmsTimeout.current);
    };
  }, [cms]);

  // Auto-Sync Settings
  useEffect(() => {
    if (isInitialSettings.current) {
      if (settings) isInitialSettings.current = false;
      return;
    }
    if (!settings) return;

    if (settingsTimeout.current) clearTimeout(settingsTimeout.current);
    setSyncStatus('saving');

    settingsTimeout.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'settings', 'global'), settings);
        setSyncStatus('saved');
      } catch (err) {
        console.error('Settings Auto-sync failed:', err);
        setSyncStatus('error');
      }
    }, 1000);

    return () => {
      if (settingsTimeout.current) clearTimeout(settingsTimeout.current);
    };
  }, [settings]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    // Force select account to help with some browser issues
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login failed', error);
      if (error.code === 'auth/popup-closed-by-user') {
        alert('Authentication cancelled. Please try again and complete the login in the popup window.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('CRITICAL: Domain not authorized. Please add this domain (' + window.location.hostname + ') to your Firebase Console -> Auth -> Settings -> Authorized Domains.');
      } else {
        alert('Login failed: ' + error.message);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'demo' | 'hero' | 'mobile-hero' = 'demo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const base64String = await fileToBase64(file);
      setCroppingImage(base64String);
      setCroppingType(type);
    } catch (error) {
      console.error('Conversion failed', error);
      alert('Failed to process image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('Video file is too large. Max 50MB.');
      return;
    }

    setUploadingVideo(true);
    try {
      const storageRef = ref(storage, `demos/videos/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setCurrentDemo({ ...currentDemo, videoUrl: url });
    } catch (error) {
      console.error('Video upload failed', error);
      alert('Video upload failed. Check firewall or storage rules.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    if (croppingType === 'demo') {
      setCurrentDemo({ ...currentDemo, image: croppedImage });
    } else if (croppingType === 'hero' && cms) {
      setCms({ ...cms, hero: { ...cms.hero, heroImage: croppedImage } });
    } else if (croppingType === 'mobile-hero' && cms) {
      setCms({ ...cms, hero: { ...cms.hero, mobileHeroImage: croppedImage } });
    }
    setCroppingImage(null);
    setCroppingType(null);
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateUrl = (url: string) => {
    if (!url || url === '#' || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('https://wa.me/') || url.startsWith('data:')) return true;
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateForm = (type: 'demo' | 'settings' | 'cms', data: any) => {
    const newErrors: Record<string, string> = {};
    if (type === 'demo') {
      if (!data.title || data.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
      if (!data.category) newErrors.category = 'Category is required';
      if (!data.number || !/^\d+$/.test(data.number)) newErrors.number = 'Number index must be numeric';
      if (data.projectUrl && !validateUrl(data.projectUrl)) newErrors.projectUrl = 'Invalid URL';
      if (data.caseStudyUrl && !validateUrl(data.caseStudyUrl)) newErrors.caseStudyUrl = 'Invalid URL';
      if (data.videoUrl && !validateUrl(data.videoUrl)) newErrors.videoUrl = 'Invalid Video URL';
      if (data.previewUrl && !validateUrl(data.previewUrl)) newErrors.previewUrl = 'Invalid Preview URL';
    } else if (type === 'settings') {
      if (!validateEmail(data.email)) newErrors.email = 'Invalid email format';
      if (data.whatsapp && !validateUrl(data.whatsapp)) newErrors.whatsapp = 'Invalid WhatsApp URL';
      if (!data.phone) newErrors.phone = 'Phone number is required';
    } else if (type === 'cms') {
      // Validate critical CMS fields
      if (!data.hero.title) newErrors['hero.title'] = 'Hero title cannot be empty';
      if (data.hero.primaryLink && !validateUrl(data.hero.primaryLink)) newErrors['hero.primaryLink'] = 'Invalid Hero primary URL';
      if (data.hero.secondaryLink && !validateUrl(data.hero.secondaryLink)) newErrors['hero.secondaryLink'] = 'Invalid Hero secondary URL';
      if (data.whatsappBot.number && !/^\d+$/.test(data.whatsappBot.number)) newErrors['whatsappBot.number'] = 'WhatsApp number must be digits only';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      alert(`Validation Error: ${firstError}`);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDemo = async () => {
    if (!validateForm('demo', currentDemo)) return;
    executeSaveDemo();
  };

  const executeSaveDemo = async () => {
    setIsSaving(true);
    try {
      const demoToSave = {
        title: currentDemo.title || '',
        category: currentDemo.category || '',
        number: currentDemo.number || '0',
        image: currentDemo.image || '',
        description: currentDemo.description || '',
        projectUrl: currentDemo.projectUrl || '',
        caseStudyUrl: currentDemo.caseStudyUrl || '',
        videoUrl: currentDemo.videoUrl || '',
        previewUrl: currentDemo.previewUrl || '',
        order: currentDemo.order || demos.length + 1
      };

      if (currentDemo.id) {
        await updateDoc(doc(db, 'demos', currentDemo.id), demoToSave);
      } else {
        await addDoc(collection(db, 'demos'), demoToSave);
      }
      setIsDemoModalOpen(false);
      setCurrentDemo({});
    } catch (err) {
      console.error(err);
      alert('Failed to save project.');
    } finally {
      setIsSaving(false);
      setIsConfirmModalOpen(false);
    }
  };

  const handleDeleteDemo = async (id: string) => {
    setPendingSaveAction({ type: 'delete', data: id });
    setIsConfirmModalOpen(true);
  };

  const executeDeleteDemo = async (id: string) => {
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'demos', id));
      setIsConfirmModalOpen(false);
      setPendingSaveAction(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProjectPreset = async () => {
    if (!confirm('Load the 6 official Crispo engineering presets into the repository?')) return;
    setIsSaving(true);
    try {
      const presets: Partial<Demo>[] = [
        {
          title: 'E-Comm 3D Visualizer',
          category: 'Retail Technology',
          image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
          number: '01',
          description: 'Next-gen 3D product rendering for high-conversion e-commerce.',
          projectUrl: '#',
          order: 1
        },
        {
          title: 'SaaS Analytics Dashboard',
          category: 'Fintech / Data',
          image: 'https://images.unsplash.com/photo-1584931423312-5d53d862446a?q=80&w=2070&auto=format&fit=crop',
          number: '02',
          description: 'Real-time financial data visualization with advanced filtering.',
          projectUrl: '#',
          order: 2
        },
        {
          title: 'AI Assistant Interface',
          category: 'Generative AI',
          image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop',
          number: '03',
          description: 'Human-centric AI chat interface with seamless LLM integration.',
          projectUrl: '#',
          order: 3
        },
        {
          title: 'Web Re-designing',
          category: 'Web Development',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2070&auto=format&fit=crop',
          number: '04',
          description: 'Modernizing digital identity with high-performance web solutions.',
          projectUrl: '#',
          order: 4
        },
        {
          title: 'App Development',
          category: 'Mobile Apps',
          image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop',
          number: '05',
          description: 'Cross-platform mobile applications built for speed and scale.',
          projectUrl: '#',
          order: 5
        },
        {
          title: 'UI/UX Design',
          category: 'Product Design',
          image: 'https://images.unsplash.com/photo-1690228254548-31ef53e40cd1?q=80&w=2070&auto=format&fit=crop',
          number: '06',
          description: 'Intuitive user journeys crafted through data-driven design.',
          projectUrl: '#',
          order: 6
        }
      ];

      for (const preset of presets) {
        await addDoc(collection(db, 'demos'), preset);
      }
      alert('Neural repository seeded with official presets.');
    } catch (err) {
      console.error(err);
      alert('Failed to seed repository.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'enquiries', id), { isRead: !currentStatus });
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings || !validateForm('settings', settings)) return;
    setPendingSaveAction({ type: 'settings' });
    setIsConfirmModalOpen(true);
  };

  const executeSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      alert('Settings synchronized across the ecosystem.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    } finally {
      setIsSaving(false);
      setIsConfirmModalOpen(false);
    }
  };

  const handleSaveCMS = async () => {
    if (!cms || !validateForm('cms', cms)) return;
    setPendingSaveAction({ type: 'cms' });
    setIsConfirmModalOpen(true);
  };

  const executeSaveCMS = async () => {
    if (!cms) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'cms'), cms);
      alert('Site content updated successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/cms');
    } finally {
      setIsSaving(false);
      setIsConfirmModalOpen(false);
    }
  };

  const handleConfirmSave = () => {
    if (!pendingSaveAction) return;
    if (pendingSaveAction.type === 'demo') executeSaveDemo();
    else if (pendingSaveAction.type === 'settings') executeSaveSettings();
    else if (pendingSaveAction.type === 'cms') executeSaveCMS();
    else if (pendingSaveAction.type === 'delete') executeDeleteDemo(pendingSaveAction.data);
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black">SYNCING CRYPTOGRAPHIC IDENTITY...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[3rem] p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center text-cyan-400 mx-auto mb-8 shadow-xl">
            <SettingsIcon className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-4">Master Access.</h1>
          <p className="text-zinc-400 font-medium mb-12 italic">Restricted to authorized Crispo engineers only.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-white text-zinc-900 font-black py-5 rounded-2xl tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform"
          >
            VERIFY IDENTITY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-4 overflow-hidden text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter">Command <span className="text-zinc-500">Center.</span></h1>
            <p className="text-zinc-400 font-bold tracking-widest text-[10px] uppercase mt-2">Active Engineer: {user.email}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
              <div className={`w-2 h-2 rounded-full ${
                syncStatus === 'saving' ? 'bg-amber-500 animate-pulse' :
                syncStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
              }`} />
              <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">
                {syncStatus === 'saving' ? 'Syncing...' : 
                 syncStatus === 'error' ? 'Connection Error' : 'Live Synced'}
              </span>
            </div>
            <div className="flex bg-zinc-900 p-2 rounded-2xl border border-zinc-800 shadow-sm">
              {(['demos', 'text-editor', 'settings', 'enquiries'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === tab ? 'bg-white text-zinc-900 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-rose-500 shadow-sm hover:bg-rose-950/30 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {activeTab === 'text-editor' && cms && (
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Navbar CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-xl font-black text-white mb-8 flex items-center">
                <Menu className="w-5 h-5 mr-3 text-cyan-400" /> NAVIGATION CMS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.keys(cms.navbar).map((key) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">{key}</label>
                    <input 
                      type="text"
                      value={(cms.navbar as any)[key]}
                      onChange={(e) => setCms({...cms, navbar: {...cms.navbar, [key]: e.target.value}})}
                      className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-black text-xs focus:outline-none focus:border-cyan-900"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Hero CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-xl font-black text-white mb-8 flex items-center">
                <Globe className="w-5 h-5 mr-3 text-cyan-400" /> HERO SECTION CMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Headline</label>
                  <textarea 
                    value={cms.hero.title}
                    onChange={(e) => setCms({...cms, hero: {...cms.hero, title: e.target.value}})}
                    className={`w-full bg-black border ${errors['hero.title'] ? 'border-rose-500' : 'border-zinc-800'} rounded-2xl p-5 text-white font-black text-2xl focus:outline-none focus:border-cyan-900`}
                    rows={2}
                  />
                  {errors['hero.title'] && <div className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-2">{errors['hero.title']}</div>}
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Description</label>
                  <textarea 
                    value={cms.hero.subtitle}
                    onChange={(e) => setCms({...cms, hero: {...cms.hero, subtitle: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-zinc-300 font-medium focus:outline-none focus:border-cyan-900"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Primary Button Text</label>
                  <input 
                    type="text"
                    value={cms.hero.primaryBtn}
                    onChange={(e) => setCms({...cms, hero: {...cms.hero, primaryBtn: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Primary Pathway (Link)</label>
                  <input 
                    type="text"
                    value={cms.hero.primaryLink}
                    onChange={(e) => setCms({...cms, hero: {...cms.hero, primaryLink: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-cyan-500 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Secondary Button Text</label>
                  <input 
                    type="text"
                    value={cms.hero.secondaryBtn}
                    onChange={(e) => setCms({...cms, hero: {...cms.hero, secondaryBtn: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Secondary Pathway (Link)</label>
                  <input 
                    type="text"
                    value={cms.hero.secondaryLink}
                    onChange={(e) => setCms({...cms, hero: {...cms.hero, secondaryLink: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-cyan-500 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-4 col-span-full border-t border-zinc-900 pt-8">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Hero Visual Element - Desktop (Image/Base64)</label>
                  <div className="flex items-center gap-6">
                    <div className="w-40 h-24 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                      {cms.hero.heroImage ? (
                        <img src={cms.hero.heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon size={24} /></div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                       <input 
                        type="file" 
                        accept="image/*"
                        id="cms-hero-upload"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'hero')}
                      />
                      <label 
                        htmlFor="cms-hero-upload"
                        className="inline-flex items-center space-x-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-black text-[10px] cursor-pointer hover:bg-zinc-800 transition-colors"
                      >
                        {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} <span>UPLOAD DESKTOP ASSET</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 col-span-full border-t border-zinc-900 pt-8">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Hero Visual Element - Mobile (Image/Base64)</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-40 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                      {cms.hero.mobileHeroImage ? (
                        <img src={cms.hero.mobileHeroImage} alt="Mobile Hero Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon size={24} /></div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                       <input 
                        type="file" 
                        accept="image/*"
                        id="cms-mobile-hero-upload"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'mobile-hero' as any)}
                      />
                      <label 
                        htmlFor="cms-mobile-hero-upload"
                        className="inline-flex items-center space-x-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-black text-[10px] cursor-pointer hover:bg-zinc-800 transition-colors"
                      >
                        {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} <span>UPLOAD MOBILE ASSET</span>
                      </label>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Specific visual for mobile viewports.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-xl font-black text-white mb-8 flex items-center">
                <SettingsIcon className="w-5 h-5 mr-3 text-cyan-400" /> CAPABILITIES SECTION CMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Badge Text</label>
                  <input 
                    type="text"
                    value={cms.services.badge}
                    onChange={(e) => setCms({...cms, services: {...cms.services, badge: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-cyan-400 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Main Heading</label>
                  <input 
                    type="text"
                    value={cms.services.title}
                    onChange={(e) => setCms({...cms, services: {...cms.services, title: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black text-xl focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Section Description</label>
                  <textarea 
                    value={cms.services.description}
                    onChange={(e) => setCms({...cms, services: {...cms.services, description: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-zinc-300 font-medium focus:outline-none focus:border-cyan-900"
                    rows={2}
                  />
                </div>
                <div className="col-span-full pt-6 border-t border-zinc-900">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">"CRISPO" Suite (CTA Banner)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Banner Title</label>
                      <input 
                        type="text"
                        value={cms.services.suiteTitle}
                        onChange={(e) => setCms({...cms, services: {...cms.services, suiteTitle: e.target.value}})}
                        className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Banner Description</label>
                      <input 
                        type="text"
                        value={cms.services.suiteDescription}
                        onChange={(e) => setCms({...cms, services: {...cms.services, suiteDescription: e.target.value}})}
                        className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-zinc-400 font-medium focus:outline-none focus:border-cyan-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Lab CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
               <h3 className="text-xl font-black text-white mb-8 flex items-center">
                <Sparkles className="w-5 h-5 mr-3 text-cyan-400" /> AI LAB CMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Badge Text</label>
                  <input 
                    type="text"
                    value={cms.aiLab.badge}
                    onChange={(e) => setCms({...cms, aiLab: {...cms.aiLab, badge: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-cyan-400 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Heading Line 1</label>
                  <input 
                    type="text"
                    value={cms.aiLab.titleFirstLine}
                    onChange={(e) => setCms({...cms, aiLab: {...cms.aiLab, titleFirstLine: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Heading Line 2 (Contrast)</label>
                  <input 
                    type="text"
                    value={cms.aiLab.titleSecondLine}
                    onChange={(e) => setCms({...cms, aiLab: {...cms.aiLab, titleSecondLine: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-zinc-500 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Description</label>
                  <textarea 
                    value={cms.aiLab.description}
                    onChange={(e) => setCms({...cms, aiLab: {...cms.aiLab, description: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-zinc-400 font-medium focus:outline-none focus:border-cyan-900"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Button Text</label>
                  <input 
                    type="text"
                    value={cms.aiLab.buttonText}
                    onChange={(e) => setCms({...cms, aiLab: {...cms.aiLab, buttonText: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Processing Text</label>
                  <input 
                    type="text"
                    value={cms.aiLab.processingText}
                    onChange={(e) => setCms({...cms, aiLab: {...cms.aiLab, processingText: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-cyan-400 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
              </div>
            </div>

            {/* Contact Section CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
               <h3 className="text-xl font-black text-white mb-8 flex items-center">
                <Send className="w-5 h-5 mr-3 text-cyan-400" /> CONTACT SECTION CMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Badge Text</label>
                  <input 
                    type="text"
                    value={cms.contact.badge}
                    onChange={(e) => setCms({...cms, contact: {...cms.contact, badge: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-cyan-400 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="col-span-full grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Heading Line 1</label>
                    <input 
                      type="text"
                      value={cms.contact.titleFirstLine}
                      onChange={(e) => setCms({...cms, contact: {...cms.contact, titleFirstLine: e.target.value}})}
                      className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Heading Line 2 (Contrast)</label>
                    <input 
                      type="text"
                      value={cms.contact.titleSecondLine}
                      onChange={(e) => setCms({...cms, contact: {...cms.contact, titleSecondLine: e.target.value}})}
                      className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-zinc-500 font-black focus:outline-none focus:border-cyan-900"
                    />
                  </div>
                </div>
                 <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Description</label>
                  <textarea 
                    value={cms.contact.description}
                    onChange={(e) => setCms({...cms, contact: {...cms.contact, description: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-zinc-400 font-medium focus:outline-none focus:border-cyan-900"
                    rows={2}
                  />
                </div>
                <div className="col-span-full pt-6 border-t border-zinc-900">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Form Labels</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['inputName', 'inputEmail', 'inputPhone', 'inputMessage'].map((field) => (
                      <div key={field} className="space-y-2">
                        <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-2">{field.replace('input', '')}</label>
                        <input 
                          type="text"
                          value={(cms.contact as any)[field]}
                          onChange={(e) => setCms({...cms, contact: {...cms.contact, [field]: e.target.value}})}
                          className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-black text-[10px] focus:outline-none focus:border-cyan-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Levicon CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
               <h3 className="text-xl font-black text-white mb-8 flex items-center">
                <Zap className="w-5 h-5 mr-3 text-yellow-400" /> LEVICON CMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Levicon Text</label>
                  <input 
                    type="text"
                    value={cms.levicon.text}
                    onChange={(e) => setCms({...cms, levicon: {...cms.levicon, text: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-cyan-400 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Status</label>
                  <div className="flex items-center space-x-4 pt-4">
                    <button 
                      onClick={() => setCms({...cms, levicon: {...cms.levicon, enabled: !cms.levicon.enabled}})}
                      className={`px-6 py-3 rounded-full font-black text-[10px] tracking-widest uppercase transition-all ${cms.levicon.enabled ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}
                    >
                      {cms.levicon.enabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Splash Screen CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
               <h3 className="text-xl font-black text-white mb-8 flex items-center">
                <Loader2 className="w-5 h-5 mr-3 text-purple-400" /> SPLASH SCREEN CMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Splash Text</label>
                  <input 
                    type="text"
                    value={cms.splash.text}
                    onChange={(e) => setCms({...cms, splash: {...cms.splash, text: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <button 
                    onClick={() => setCms({...cms, splash: {...cms.splash, enabled: !cms.splash.enabled}})}
                    className={`px-6 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${cms.splash.enabled ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 'bg-zinc-800 text-zinc-500'}`}
                  >
                    Splash: {cms.splash.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            </div>

            {/* WhatsApp Bot CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
               <h3 className="text-xl font-black text-white mb-8 flex items-center">
                <MessageSquare className="w-5 h-5 mr-3 text-green-400" /> WHATSAPP BOT CMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">WhatsApp Number (e.g. 1234567890)</label>
                  <input 
                    type="text"
                    value={cms.whatsappBot.number}
                    onChange={(e) => setCms({...cms, whatsappBot: {...cms.whatsappBot, number: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-green-400 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <button 
                    onClick={() => setCms({...cms, whatsappBot: {...cms.whatsappBot, enabled: !cms.whatsappBot.enabled}})}
                    className={`px-6 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${cms.whatsappBot.enabled ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)]' : 'bg-zinc-800 text-zinc-500'}`}
                  >
                    WhatsApp Bot: {cms.whatsappBot.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Default Message</label>
                  <input 
                    type="text"
                    value={cms.whatsappBot.message}
                    onChange={(e) => setCms({...cms, whatsappBot: {...cms.whatsappBot, message: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-medium focus:outline-none focus:border-cyan-900"
                  />
                </div>
              </div>
            </div>

            {/* Fun Zone CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
               <h3 className="text-xl font-black text-white mb-8 flex items-center">
                <MessageSquare className="w-5 h-5 mr-3 text-cyan-400" /> FUN ZONE CMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Heading</label>
                  <input 
                    type="text"
                    value={cms.funZone.title}
                    onChange={(e) => setCms({...cms, funZone: {...cms.funZone, title: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black text-xl focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Description</label>
                  <textarea 
                    value={cms.funZone.subtitle}
                    onChange={(e) => setCms({...cms, funZone: {...cms.funZone, subtitle: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-zinc-300 font-medium focus:outline-none focus:border-cyan-900"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Button Text</label>
                  <input 
                    type="text"
                    value={cms.funZone.offerBtn}
                    onChange={(e) => setCms({...cms, funZone: {...cms.funZone, offerBtn: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
              </div>
            </div>

            {/* Demos Section CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
               <h3 className="text-xl font-black text-white mb-8 flex items-center">
                <Star className="w-5 h-5 mr-3 text-cyan-400" /> DEMO PATHWAY CMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Badge Text</label>
                  <input 
                    type="text"
                    value={cms.demos.badge}
                    onChange={(e) => setCms({...cms, demos: {...cms.demos, badge: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-cyan-400 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Catalog Button Text</label>
                  <input 
                    type="text"
                    value={cms.demos.catalogBtnText}
                    onChange={(e) => setCms({...cms, demos: {...cms.demos, catalogBtnText: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Heading Line 1</label>
                  <input 
                    type="text"
                    value={cms.demos.titleFirstLine}
                    onChange={(e) => setCms({...cms, demos: {...cms.demos, titleFirstLine: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Heading Line 2 (Contrast)</label>
                  <input 
                    type="text"
                    value={cms.demos.titleSecondLine}
                    onChange={(e) => setCms({...cms, demos: {...cms.demos, titleSecondLine: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-zinc-400 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">View Project Button</label>
                  <input 
                    type="text"
                    value={cms.demos.viewProjectBtnText}
                    onChange={(e) => setCms({...cms, demos: {...cms.demos, viewProjectBtnText: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-cyan-400 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Case Study Button</label>
                  <input 
                    type="text"
                    value={cms.demos.caseStudyBtnText}
                    onChange={(e) => setCms({...cms, demos: {...cms.demos, caseStudyBtnText: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
              </div>
            </div>

            {/* Footer CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
               <h3 className="text-xl font-black text-white mb-8 flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-cyan-400" /> FOOTER CMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Copyright Line</label>
                  <input 
                    type="text"
                    value={cms.footer.copyrightLine}
                    onChange={(e) => setCms({...cms, footer: {...cms.footer, copyrightLine: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-zinc-400 font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Policy Link Text</label>
                  <input 
                    type="text"
                    value={cms.footer.policyText}
                    onChange={(e) => setCms({...cms, footer: {...cms.footer, policyText: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">FAQ Link Text</label>
                  <input 
                    type="text"
                    value={cms.footer.faqText}
                    onChange={(e) => setCms({...cms, footer: {...cms.footer, faqText: e.target.value}})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white font-black focus:outline-none focus:border-cyan-900"
                  />
                </div>
                <div className="col-span-full pt-6 border-t border-zinc-900">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Footer Social Connectivity</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(['linkedin', 'instagram', 'youtube', 'github'] as const).map((platform) => (
                      <div key={platform} className="space-y-2">
                        <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-2">{platform}</label>
                        <input 
                          type="text" 
                          value={(cms.footer.socialLinks as any)[platform] || ''}
                          onChange={(e) => setCms({
                            ...cms, 
                            footer: {
                              ...cms.footer,
                              socialLinks: { ...cms.footer.socialLinks, [platform]: e.target.value }
                            }
                          })}
                          className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-black text-xs focus:outline-none focus:border-cyan-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-full pt-6 border-t border-zinc-900">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Global Branding</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-2">Favicon URL (SVG or PNG)</label>
                      <input 
                        type="text" 
                        value={cms.footer.faviconUrl || ''}
                        onChange={(e) => setCms({
                          ...cms, 
                          footer: { ...cms.footer, faviconUrl: e.target.value }
                        })}
                        className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-black text-xs focus:outline-none focus:border-cyan-900"
                        placeholder="e.g. data:image/svg+xml,..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Pages CMS */}
            <div className="bg-black border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-xl font-black text-white mb-8 flex items-center justify-between">
                <div className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-3 text-cyan-400" /> SERVICE DETAILS CMS
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      if (!confirm('Load the 3 official Crispo capability presets?')) return;
                      if (!cms) return;
                      const presets: any = {
                        'web-app-demos': {
                          id: 'web-app-demos',
                          title: 'Web & App Demos',
                          subtitle: 'High-Fidelity Interactive Experiences',
                          fullDescription: 'Our Web & App Demos aren\'t just static screenshots or videos. They are fully functional, sandboxed versions of your product. We specialize in creating "Magic Moments" where users can input real data, trigger workflows, and see results instantly.',
                          benefits: [
                            'Zero-Risk Environments',
                            'Real-Time Interaction',
                            'Conversion Optimization',
                            'Mobile-Responsive Sandboxes',
                            'Instant Feedback Loops'
                          ],
                          images: [
                            'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
                            'https://images.unsplash.com/photo-1550745165-9bc0b252726f'
                          ],
                          stats: [
                            { label: 'Avg. Engagement', value: '+300%' },
                            { label: 'Sales Velocity', value: '2x faster' }
                          ]
                        },
                        'seo-aeo': {
                          id: 'seo-aeo',
                          title: 'SEO & AEO',
                          subtitle: 'Answer Engine Optimization',
                          fullDescription: 'Traditional SEO is dead. Modern search is about being the primary reference for AI models. We optimize your structured data, knowledge graph presence, and long-tail content.',
                          benefits: [
                            'AI Recommendation Optimization',
                            'LLM Knowledge Graph Integration',
                            'Structured Data Orchestration',
                            'High-Intent Traffic Capture',
                            'Semantic Search Dominance'
                          ],
                          images: [
                            'https://images.unsplash.com/photo-1551288049-bbda48658a7d',
                            'https://images.unsplash.com/photo-1451187580459-43490279c0fa'
                          ],
                          stats: [
                            { label: 'AI Mentions', value: 'Top 3' },
                            { label: 'Organic Growth', value: '450%' }
                          ]
                        },
                        'ui-ux-design': {
                          id: 'ui-ux-design',
                          title: 'UI/UX Design',
                          subtitle: 'Psychology-Driven Interaction',
                          fullDescription: 'We design for the subconscious. By blending neuromarketing principles with cutting-edge visual aesthetics, we create interfaces that guide users effortlessly toward conversion.',
                          benefits: [
                            'Neuro-Design Principles',
                            'Micro-Interaction Mastery',
                            'Aesthetic-Usability Effect',
                            'Rapid Prototyping',
                            'Multi-Platform Consistency'
                          ],
                          images: [
                            'https://images.unsplash.com/photo-1690228254548-31ef53e40cd1',
                            'https://images.unsplash.com/photo-1531297484001-80022131f5a1'
                          ],
                          stats: [
                            { label: 'Design Fidelity', value: '100%' },
                            { label: 'User Satisfaction', value: '98%' }
                          ]
                        }
                      };
                      setCms({ ...cms, servicePages: { ...cms.servicePages, ...presets } });
                      alert('Service protocols synchronized. Live preview updating...');
                    }}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-400 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-zinc-700 transition-colors uppercase"
                  >
                    LOAD DEFAULTS
                  </button>
                  <button 
                    onClick={() => {
                      const id = prompt('Enter Service ID (e.g., custom-service):');
                      if (id && cms) {
                        const newPage = {
                          id,
                          title: 'New Service',
                          subtitle: 'Service Subtitle',
                          fullDescription: 'Detailed description for the new service.',
                          benefits: ['Benefit 1', 'Benefit 2'],
                          images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f'],
                          stats: [{ label: 'Performance', value: '100%' }]
                        };
                        setCms({
                          ...cms,
                          servicePages: { ...cms.servicePages, [id]: newPage }
                        });
                      }
                    }}
                    className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-zinc-800 transition-colors"
                  >
                    + ADD PRESET
                  </button>
                </div>
              </h3>
              <div className="space-y-12">
                {cms.servicePages && Object.keys(cms.servicePages).map((serviceId) => (
                  <div key={serviceId} className="p-8 border border-zinc-900 rounded-[2.5rem] bg-zinc-950/30">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-zinc-900 pb-4 flex justify-between items-center">
                      <span>{serviceId.replace(/-/g, ' ')} PROTOCOL</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-zinc-500">ID: {serviceId}</span>
                        <button 
                          onClick={() => {
                            if (confirm(`Remove ${serviceId} protocol?`)) {
                              const newServicePages = { ...cms.servicePages };
                              delete newServicePages[serviceId];
                              setCms({ ...cms, servicePages: newServicePages });
                            }
                          }}
                          className="text-rose-500 hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Display Title</label>
                        <input 
                          type="text"
                          value={cms.servicePages[serviceId].title}
                          onChange={(e) => setCms({
                            ...cms, 
                            servicePages: {
                              ...cms.servicePages, 
                              [serviceId]: { ...cms.servicePages[serviceId], title: e.target.value }
                            }
                          })}
                          className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-black text-xs focus:outline-none focus:border-cyan-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Subtitle</label>
                        <input 
                          type="text"
                          value={cms.servicePages[serviceId].subtitle}
                          onChange={(e) => setCms({
                            ...cms, 
                            servicePages: {
                              ...cms.servicePages, 
                              [serviceId]: { ...cms.servicePages[serviceId], subtitle: e.target.value }
                            }
                          })}
                          className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-black text-xs focus:outline-none focus:border-cyan-900"
                        />
                      </div>
                      <div className="col-span-full space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Full Description</label>
                        <textarea 
                          value={cms.servicePages[serviceId].fullDescription}
                          onChange={(e) => setCms({
                            ...cms, 
                            servicePages: {
                              ...cms.servicePages, 
                              [serviceId]: { ...cms.servicePages[serviceId], fullDescription: e.target.value }
                            }
                          })}
                          className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-zinc-300 font-medium text-sm focus:outline-none focus:border-cyan-900"
                          rows={3}
                        />
                      </div>
                      <div className="col-span-full space-y-4">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Strategic Benefits (One per line)</label>
                        <textarea 
                          value={cms.servicePages[serviceId].benefits.join('\n')}
                          onChange={(e) => setCms({
                            ...cms, 
                            servicePages: {
                              ...cms.servicePages, 
                              [serviceId]: { ...cms.servicePages[serviceId], benefits: e.target.value.split('\n').filter(b => b.trim() !== '') }
                            }
                          })}
                          className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-zinc-300 font-medium text-sm focus:outline-none focus:border-cyan-900"
                          rows={4}
                        />
                      </div>
                      <div className="col-span-full space-y-4">
                         <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Visual Assets (Image URLs, one per line)</label>
                         <textarea 
                          value={cms.servicePages[serviceId].images.join('\n')}
                          onChange={(e) => setCms({
                            ...cms, 
                            servicePages: {
                              ...cms.servicePages, 
                              [serviceId]: { ...cms.servicePages[serviceId], images: e.target.value.split('\n').filter(img => img.trim() !== '') }
                            }
                          })}
                          className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-zinc-500 font-medium text-xs focus:outline-none focus:border-cyan-900"
                          rows={3}
                        />
                        <div className="flex gap-4 overflow-x-auto pb-4">
                          {cms.servicePages[serviceId].images.map((img, idx) => (
                            <img key={idx} src={img} alt="Preview" className="h-20 w-32 object-cover rounded-xl border border-zinc-800 flex-shrink-0" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demos' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 gap-6">
              <h2 className="text-2xl font-black text-white">Project Catalog</h2>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleAddProjectPreset}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-zinc-800 text-zinc-400 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-zinc-700 transition-colors uppercase"
                >
                  <Star size={14} className="text-emerald-500" />
                  <span>LOAD OFFICIAL PRESETS</span>
                </button>
                <button 
                  onClick={() => { setCurrentDemo({}); setIsDemoModalOpen(true); }}
                  className="flex items-center space-x-2 bg-white text-zinc-900 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest shadow-xl uppercase group hover:scale-105 transition-transform"
                >
                  <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                  <span>NEW PROJECT</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {demos.map((demo) => (
                <div key={demo.id} className="bg-black border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl group transition-all hover:border-cyan-500/30">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={demo.image} alt={demo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-black text-white text-[10px] font-black px-4 py-1.5 rounded-full">#{demo.number}</div>
                  </div>
                  <div className="p-8">
                    <div className="text-xs font-black text-cyan-400 tracking-widest uppercase mb-2">{demo.category}</div>
                    <h3 className="text-2xl font-black text-white mb-6">{demo.title}</h3>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => { setCurrentDemo(demo); setIsDemoModalOpen(true); }}
                        className="flex-1 bg-white text-zinc-900 py-3 rounded-xl flex items-center justify-center text-[10px] font-black"
                      >
                        <Edit2 size={14} className="mr-2" /> EDIT
                      </button>
                      <button 
                        onClick={() => handleDeleteDemo(demo.id)}
                        className="p-3 border border-zinc-800 rounded-xl text-rose-500 hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && settings && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-black border border-zinc-900 rounded-[3rem] p-12 shadow-2xl space-y-10">
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-white flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-cyan-400" /> Infrastructure Info
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Public Email</label>
                    <input 
                      type="text" 
                      value={settings.email}
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                      className={`w-full bg-black border ${errors.email ? 'border-rose-500' : 'border-zinc-800'} rounded-2xl p-5 text-white font-black focus:outline-none focus:border-cyan-900`}
                    />
                    {errors.email && <div className="flex items-center text-rose-500 text-[10px] font-black uppercase mt-2 ml-2"><AlertCircle size={12} className="mr-1" /> {errors.email}</div>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Contact Signal (Phone)</label>
                    <input 
                      type="text" 
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-white font-black focus:outline-none focus:border-cyan-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">WhatsApp Protocol URL</label>
                    <input 
                      type="text" 
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                      className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-white font-black focus:outline-none focus:border-cyan-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Physical HQ</label>
                    <textarea 
                      value={settings.location}
                      onChange={(e) => setSettings({...settings, location: e.target.value})}
                      className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-white font-black focus:outline-none focus:border-cyan-900"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-zinc-800">
                <h2 className="text-2xl font-black text-white flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    <Linkedin className="w-6 h-6 text-blue-600" />
                    <Instagram className="w-6 h-6 text-rose-500" />
                    <Youtube className="w-6 h-6 text-red-600" />
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  Footer Social Connections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(['linkedin', 'instagram', 'youtube', 'github'] as const).map((platform) => (
                    <div key={platform} className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 flex items-center">
                        {platform === 'linkedin' && <Linkedin size={10} className="mr-1" />}
                        {platform === 'instagram' && <Instagram size={10} className="mr-1" />}
                        {platform === 'youtube' && <Youtube size={10} className="mr-1" />}
                        {platform === 'github' && <Github size={10} className="mr-1" />}
                        {platform}
                      </label>
                      <input 
                        type="text" 
                        value={(settings.socialMedia as any)[platform] || ''}
                        onChange={(e) => setSettings({
                          ...settings, 
                          socialMedia: { ...settings.socialMedia, [platform]: e.target.value }
                        })}
                        className="w-full bg-black border border-zinc-800 rounded-2xl p-5 text-white font-black focus:outline-none focus:border-cyan-900"
                        placeholder={`https://${platform}.com/crispo`}
                      />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    if (confirm('Load official Crispo social connectivity protocols?')) {
                      setSettings({
                        ...settings,
                        socialMedia: {
                          linkedin: 'https://www.linkedin.com/in/lubab-aymen-p-5a5009360',
                          instagram: 'https://www.instagram.com/Lubuuii',
                          youtube: 'https://www.youtube.com/channel/UCAjKk0aZGhmVCKb84KTo_JA',
                          github: '#'
                        }
                      });
                    }
                  }}
                  className="mt-4 w-full bg-zinc-900 border border-zinc-800 text-zinc-500 py-3 rounded-xl text-[10px] font-black tracking-[0.3em] uppercase hover:bg-zinc-800 transition-colors"
                >
                  LOAD OFFICIAL SOCIALS
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'enquiries' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-black text-white">Inbox Vault</h2>
                <span className="bg-zinc-900 border border-zinc-800 px-4 py-1 rounded-full text-[10px] font-black text-cyan-400 tracking-widest uppercase">
                  Total: {enquiries.length}
                </span>
                <span className="bg-zinc-900 border border-zinc-800 px-4 py-1 rounded-full text-[10px] font-black text-rose-400 tracking-widest uppercase">
                  Unread: {enquiries.filter(e => !e.isRead).length}
                </span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <input 
                    type="text"
                    placeholder="SEARCH BY NAME OR EMAIL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-[10px] font-black text-white focus:outline-none focus:border-cyan-900 tracking-widest uppercase"
                  />
                </div>
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-[10px] font-black text-white focus:outline-none focus:border-cyan-900 tracking-widest uppercase cursor-pointer"
                >
                  <option value="desc">NEWEST FIRST</option>
                  <option value="asc">OLDEST FIRST</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {enquiries
                .filter(enq => 
                  enq.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  enq.email?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .sort((a, b) => {
                  const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                  const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                  return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
                })
                .map((enq) => (
                <div key={enq.id} className={`bg-black border ${enq.isRead ? 'border-zinc-900' : 'border-cyan-900/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]'} rounded-[2.5rem] p-10 shadow-xl flex flex-col md:flex-row gap-8 items-start relative transition-all hover:border-cyan-500/30`}>
                  <div className="absolute top-8 right-10 flex items-center space-x-4">
                    <button 
                      onClick={() => handleToggleRead(enq.id, enq.isRead)}
                      className={`text-[8px] font-black px-3 py-1 rounded-full border transition-all ${enq.isRead ? 'border-zinc-800 text-zinc-500 hover:text-white' : 'border-cyan-800 text-cyan-400 bg-cyan-950/20'}`}
                    >
                      {enq.isRead ? 'MARK UNREAD' : 'MARK READ'}
                    </button>
                    <div className="text-[10px] font-black text-zinc-600">
                      {enq.createdAt?.toDate ? new Date(enq.createdAt.toDate()).toLocaleString() : 'REALTIME'}
                    </div>
                  </div>
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner border transition-colors ${enq.isRead ? 'bg-black text-zinc-600 border-zinc-800' : 'bg-cyan-950/20 text-cyan-400 border-cyan-900/30'}`}>
                    <Mail className="w-8 h-8" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase">Sender</p>
                        <p className={`text-xl font-black ${enq.isRead ? 'text-zinc-300' : 'text-white'}`}>{enq.name}</p>
                      </div>
                      <div className="h-10 w-px bg-zinc-800 hidden md:block" />
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase">Protocol</p>
                        <p className={`text-xl font-black ${enq.isRead ? 'text-zinc-300' : 'text-white'}`}>{enq.service}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Metadata</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center space-x-2 bg-black px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 border border-zinc-800">
                          <Mail size={14} /> <span>{enq.email}</span>
                        </span>
                        <span className="flex items-center space-x-2 bg-black px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 border border-zinc-800">
                          <Phone size={14} /> <span>{enq.phone || 'NO_PHONE'}</span>
                        </span>
                      </div>
                    </div>
                    <div className="p-6 bg-black rounded-2xl border border-zinc-800 italic text-zinc-300 font-medium leading-relaxed">
                      "{enq.message}"
                    </div>
                    <div className="pt-4 flex space-x-4">
                       <a href={`mailto:${enq.email}`} className="bg-white text-zinc-900 px-8 py-3 rounded-xl text-[10px] font-black tracking-widest">REPLY VIA MAIL</a>
                       {enq.phone && (
                         <a href={`https://wa.me/${enq.phone.replace(/[^\d]/g, '')}`} target="_blank" className="bg-emerald-950/30 text-emerald-500 px-8 py-3 rounded-xl text-[10px] font-black tracking-widest border border-emerald-900/30">WHATSAPP</a>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isDemoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-black rounded-[3.5rem] shadow-2xl p-12 relative max-h-[90vh] overflow-y-auto border border-zinc-800"
          >
            <button onClick={() => setIsDemoModalOpen(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={32} /></button>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-10">{currentDemo.id ? 'Refine' : 'Engineer'} <span className="text-zinc-500">Project.</span></h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Title</label>
                  <input 
                    type="text" 
                    value={currentDemo.title || ''}
                    onChange={(e) => setCurrentDemo({...currentDemo, title: e.target.value})}
                    className={`w-full bg-black border ${errors.title ? 'border-rose-500' : 'border-zinc-800'} rounded-2xl p-5 font-black text-white`}
                    placeholder="Project Alpha"
                  />
                  {errors.title && <div className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-2">{errors.title}</div>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Category</label>
                  <input 
                    type="text" 
                    value={currentDemo.category || ''}
                    onChange={(e) => setCurrentDemo({...currentDemo, category: e.target.value})}
                    className={`w-full bg-black border ${errors.category ? 'border-rose-500' : 'border-zinc-800'} rounded-2xl p-5 font-black text-white`}
                    placeholder="SaaS / Web3"
                  />
                  {errors.category && <div className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-2">{errors.category}</div>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Project Image</label>
                  <div className="relative group/upload">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full aspect-video bg-black border-2 border-dashed border-zinc-800 rounded-2xl cursor-pointer hover:border-cyan-500/50 transition-all overflow-hidden"
                    >
                      {currentDemo.image ? (
                        <div className="relative w-full h-full">
                          <img src={currentDemo.image} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-4">
                          {uploadingImage ? (
                            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                          ) : (
                            <>
                              <ImageIcon className="w-10 h-10 text-zinc-700" />
                              <span className="text-[10px] font-black text-zinc-500 tracking-widest">UPLOAD ARTWORK</span>
                            </>
                          )}
                        </div>
                      )}
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={currentDemo.image || ''}
                    onChange={(e) => setCurrentDemo({...currentDemo, image: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-3 text-[10px] font-black text-zinc-500 mt-2"
                    placeholder="Or paste URL here..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Number Index</label>
                  <input 
                    type="text" 
                    value={currentDemo.number || ''}
                    onChange={(e) => setCurrentDemo({...currentDemo, number: e.target.value})}
                    className={`w-full bg-black border ${errors.number ? 'border-rose-500' : 'border-zinc-800'} rounded-2xl p-5 font-black text-white`}
                    placeholder="01"
                  />
                  {errors.number && <div className="text-rose-500 text-[10px] font-black uppercase mt-1 ml-2">{errors.number}</div>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Live URL (Pathway)</label>
                  <input 
                    type="text" 
                    value={currentDemo.projectUrl || ''}
                    onChange={(e) => setCurrentDemo({...currentDemo, projectUrl: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-5 font-black text-white"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Case Study URL (Pathway)</label>
                  <input 
                    type="text" 
                    value={currentDemo.caseStudyUrl || ''}
                    onChange={(e) => setCurrentDemo({...currentDemo, caseStudyUrl: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-5 font-black text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Website Preview Path</label>
                  <input 
                    type="text" 
                    value={currentDemo.previewUrl || ''}
                    onChange={(e) => setCurrentDemo({...currentDemo, previewUrl: e.target.value})}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-5 font-black text-white"
                    placeholder="/demo/project-alpha"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Video Asset URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={currentDemo.videoUrl || ''}
                      onChange={(e) => setCurrentDemo({...currentDemo, videoUrl: e.target.value})}
                      className="flex-1 bg-black border border-zinc-800 rounded-2xl p-5 font-black text-white"
                      placeholder="https://video..."
                    />
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <label 
                        htmlFor="video-upload"
                        className="h-full px-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors"
                      >
                        {uploadingVideo ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Abstract Description</label>
                <textarea 
                  value={currentDemo.description || ''}
                  onChange={(e) => setCurrentDemo({...currentDemo, description: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-5 font-black text-white"
                  rows={3}
                  placeholder="The narrative of the project..."
                />
              </div>
              <button 
                onClick={handleSaveDemo}
                disabled={isSaving}
                className="w-full bg-white text-zinc-900 py-6 rounded-3xl font-black tracking-widest shadow-2xl mt-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 size={24} className="animate-spin" />}
                <span>{isSaving ? 'SYNCHRONIZING...' : 'SYNC TO DATABASE'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 rounded-[3rem] p-12 text-center border border-zinc-800"
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 ${pendingSaveAction?.type === 'delete' ? 'bg-rose-950/30 text-rose-500' : 'bg-cyan-950/30 text-cyan-500'}`}>
                {pendingSaveAction?.type === 'delete' ? <Trash2 size={40} /> : <AlertCircle size={40} />}
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">
                {pendingSaveAction?.type === 'delete' ? 'Confirm Deletion' : 'Are you sure?'}
              </h2>
              <p className="text-zinc-400 font-medium mb-12">
                {pendingSaveAction?.type === 'delete' 
                  ? 'This action is permanent and cannot be reversed. The project will be purged from the neural repository.' 
                  : 'Unsaved changes will be written to the database. This action is synchronized across the entire ecosystem.'}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setPendingSaveAction(null);
                  }}
                  className="flex-1 bg-zinc-800 px-6 py-4 rounded-xl text-white font-black text-xs tracking-widest uppercase hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  className={`flex-1 px-6 py-4 rounded-xl text-black font-black text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${pendingSaveAction?.type === 'delete' ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20' : 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20'}`}
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>{pendingSaveAction?.type === 'delete' ? 'PROCEED DELETE' : 'SAVE CHANGES'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Cropper Modal */}
      {croppingImage && (
        <ImageCropper 
          image={croppingImage}
          aspect={croppingType === 'demo' ? 16 / 9 : 21 / 9}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCroppingImage(null);
            setCroppingType(null);
          }}
        />
      )}
    </div>
  );
}
