import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Loader2, Lightbulb, Target, Settings, TrendingUp, History, ClipboardCheck, Trash2, Eye, ChevronDown, ChevronUp, AlertCircle, HelpCircle, FileText, Copy, LayoutGrid, Globe, Smartphone, ShoppingBag, Cpu } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth } from '../lib/firebase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function AILab({ cms }: { cms?: any }) {
  const [idea, setIdea] = useState('');
  const [category, setCategory] = useState('saas');
  const [submittedIdea, setSubmittedIdea] = useState('');
  const [blueprint, setBlueprint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const categories = [
    { id: 'saas', label: 'SaaS', icon: LayoutGrid },
    { id: 'webapp', label: 'Web App', icon: Globe },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
    { id: 'ecom', label: 'E-Comm', icon: ShoppingBag },
    { id: 'ai', label: 'AI Agent', icon: Cpu }
  ];

  useEffect(() => {
    const path = 'blueprints';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(data);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteBlueprint = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const path = `blueprints/${id}`;
    try {
      await deleteDoc(doc(db, 'blueprints', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const selectBlueprint = (b: any) => {
    setBlueprint(b);
    setSubmittedIdea(b.idea);
    setIsHistoryOpen(false);
    window.scrollTo({ top: (document.getElementById('ai-lab')?.offsetTop || 0) - 100, behavior: 'smooth' });
  };

  const copyToClipboard = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const content = `CRISPO TERMINAL MANIFESTO
PROJECT TYPE: ${item.category?.toUpperCase() || 'GENERAL'}
IDEA: ${item.idea}

STRUCTURED ARCHITECTURE:
- CORE PILLARS:
${item.coreFeatures.map((f: string, i: number) => `  [${i + 1}] ${f}`).join('\n')}

- TARGET AUDIENCE: ${item.targetAudience}

- TECH STACK: ${item.techStack.join(', ')}

- GROWTH & DISCOVERY (AEO/SEO):
${item.seoStrategy}`;

    navigator.clipboard.writeText(content).then(() => {
      alert('Manifesto copied to sector neural link (clipboard)');
    });
  };

  const generateBlueprint = async () => {
    if (!idea.trim()) return;
    
    setIsLoading(true);
    setBlueprint(null);
    setError('');
    setSubmittedIdea(idea);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a world-class digital product strategist and technical architect. 
        Generate a comprehensive, fully structured blueprint for a ${category} project based on the following idea: "${idea}"

        Category Context: ${category}
        
        Requirements:
        1. Be specific, not generic. 
        2. Features must include monetization logic or core user flow steps.
        3. Tech stack must be production-ready.
        4. SEO strategy must mention how to rank in AI answer engines like Perplexity or Gemini.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coreFeatures: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 specific, high-level features that make this a fully structured product" },
              targetAudience: { type: Type.STRING, description: "A precise description of the ideal user persona for this category" },
              techStack: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Modern, specific technical ecosystem" },
              seoStrategy: { type: Type.STRING, description: "Detailed strategy for AEO and semantic visibility" },
              category: { type: Type.STRING }
            },
            required: ["coreFeatures", "targetAudience", "techStack", "seoStrategy", "category"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setBlueprint(result);
      
      // Auto-save to Firebase
      setSaveStatus('saving');
      const path = 'blueprints';
      try {
        await addDoc(collection(db, path), {
          idea: idea,
          ...result,
          createdAt: serverTimestamp()
        });
        setSaveStatus('saved');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
      
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate blueprint. Our servers are processing too much magic right now.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-lab" className="py-32 px-4 relative z-10 bg-zinc-50 dark:bg-zinc-950 border-y border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors duration-500">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-500 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-500 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-3 px-6 py-2 rounded-full bg-white border border-zinc-200 shadow-sm text-purple-600 font-black tracking-widest uppercase text-[10px] mb-8"
          >
            <Sparkles className="w-3 h-3" />
            <span>{cms?.badge || 'CRISPO INTELLIGENCE ENGINE v2.0'}</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-sans font-black text-zinc-900 tracking-tight leading-none mb-8"
          >
            {cms?.titleFirstLine || 'Project'} <br />
            <span className="text-zinc-500">{cms?.titleSecondLine || 'Brainstormer.'}</span>
          </motion.h2>
          <p className="text-zinc-500 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed mb-10">
            {cms?.description || 'Unleash the full potential of your next venture. Our neural network distills complex visions into actionable 10x roadmaps.'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const el = document.getElementById('vision-input');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
              }
            }}
            className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase shadow-2xl shadow-purple-500/20 hover:bg-purple-700 transition-all"
          >
            Generate My Blueprint
          </motion.button>
        </div>

        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-[3.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-10 md:p-14 shadow-2xl">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>The Vision Protocol</span>
                </label>
                <div className="flex items-center space-x-4">
                  <div className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 text-[8px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-tighter">
                    Precision Mode
                  </div>
                  <div className="text-zinc-300 text-[10px] font-black">AI SESSION ACTIVE</div>
                </div>
              </div>
              
              {/* Submission Guide */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm shrink-0">
                  <Lightbulb size={16} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest">Architect's Guide</p>
                  <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-medium leading-relaxed italic">
                    To generate a perfect blueprint: Fully explain everything you need. Include details about your color palette, brand icon/vision, and specific technical requirements. High-resolution details yield high-fidelity roadmaps.
                  </p>
                </div>
              </div>

              {/* Category Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${
                      category === cat.id 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600' 
                      : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <cat.icon size={20} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{cat.label}</span>
                  </button>
                ))}
              </div>

              <textarea
                id="vision-input"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder={cms?.inputPlaceholder || "Describe your radical idea in plain English. Fully explain the entire scope of what you need, including your brand color palette, icon visions, and core requirements..."}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-8 text-zinc-900 dark:text-zinc-100 font-black placeholder:text-zinc-200 dark:placeholder:text-zinc-700 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:bg-white dark:focus:bg-zinc-800 focus:border-purple-200 dark:focus:border-purple-900 transition-all min-h-[220px] resize-none shadow-inner"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateBlueprint}
                disabled={isLoading || !idea.trim()}
                className="w-full bg-zinc-900 text-white font-black py-7 rounded-3xl transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed group tracking-[0.3em] text-sm uppercase"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    <span>{cms?.processingText || 'Processing Neural Pathways...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform" />
                    <span>{cms?.buttonText || 'Engage AI Architect'}</span>
                  </>
                )}
              </motion.button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-center font-bold flex items-center justify-center space-x-3"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>{error}</span>
                </motion.div>
              )}

              {blueprint && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 100 }}
                  className="mt-20 pt-20 border-t border-zinc-100 dark:border-zinc-800 relative"
                >
                  {/* Result Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                      <div className="flex items-center space-x-2 text-emerald-600 font-black tracking-widest text-[10px] uppercase mb-4">
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Analysis Complete — {saveStatus === 'saved' ? 'ARCHIVED TO CLOUD' : 'ARCHIVING...'}</span>
                      </div>
                      <h3 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-none">
                        Strategy <br />
                        <span className="text-zinc-500">Manifesto.</span>
                      </h3>
                    </div>
                      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 max-w-sm">
                        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 mb-2 uppercase tracking-widest">Input Seed:</p>
                        <p className="text-zinc-600 dark:text-zinc-300 font-medium italic line-clamp-2">"{submittedIdea}"</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                    <div className="space-y-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-purple-900 text-white flex items-center justify-center shadow-xl">
                          <Lightbulb className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Core Pillars</h4>
                          <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">Architectural DNA</p>
                        </div>
                      </div>
                      <ul className="space-y-4">
                        {blueprint.coreFeatures.map((f: string, i: number) => (
                          <motion.li 
                            key={i} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-zinc-700 dark:text-zinc-100 text-lg font-bold flex items-start space-x-4 bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 hover:border-purple-200 dark:hover:border-purple-800 transition-colors group"
                          >
                            <span className="text-purple-600 font-black font-mono text-sm mt-1">0{i+1}</span>
                            <span>{f}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-cyan-900 text-white flex items-center justify-center shadow-xl">
                          <Target className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Prime Market</h4>
                          <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">Network Focus</p>
                        </div>
                      </div>
                      <div className="p-8 bg-zinc-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[10rem]" />
                        <p className="relative z-10 text-xl leading-relaxed italic font-medium opacity-90">
                          {blueprint.targetAudience}
                        </p>
                      </div>

                      <div className="pt-4">
                        <div className="flex items-center space-x-3 mb-6">
                          <Settings className="w-5 h-5 text-rose-500" />
                          <h4 className="text-lg font-black text-zinc-900 dark:text-white">Tech Ecosystem</h4>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {blueprint.techStack.map((t: string, i: number) => (
                            <span key={i} className="px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-zinc-900 dark:text-zinc-100 text-xs font-black tracking-[0.2em] shadow-sm hover:scale-105 transition-transform cursor-default uppercase">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEO Strategy Banner */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-16 p-10 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/10 dark:to-yellow-800/5 border border-yellow-200 dark:border-yellow-900/30 rounded-[3rem] group"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 dark:bg-yellow-500 flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                        <TrendingUp className="w-10 h-10 text-yellow-500 dark:text-zinc-900" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xs font-black text-yellow-700 dark:text-yellow-500 uppercase tracking-[0.3em] mb-2">Growth Vector Locked</h4>
                        <p className="text-zinc-900 dark:text-white text-2xl font-black italic">
                          "{blueprint.seoStrategy}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* History Section */}
        <div className="mt-12">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="w-full py-4 px-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between group transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Blueprint Vault ({history.length})</span>
            </div>
            {isHistoryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <AnimatePresence>
            {isHistoryOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-zinc-500 font-bold italic border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                      The archive is currently empty. Initiate your first vision.
                    </div>
                  ) : (
                    history.map((item) => (
                      <motion.div
                        layoutId={item.id}
                        key={item.id}
                        className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer group"
                        onClick={() => selectBlueprint(item)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            <FileText size={16} />
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => copyToClipboard(item, e)}
                              className="p-2 text-zinc-300 hover:text-cyan-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Copy Manifesto"
                            >
                              <Copy size={16} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteBlueprint(item.id, e)}
                              className="p-2 text-zinc-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Permanent"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-black text-zinc-900 dark:text-white line-clamp-2 mb-2">"{item.idea}"</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                            {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Syncing...'}
                          </span>
                          <span className="flex items-center gap-1 text-cyan-600 text-[10px] font-black uppercase">
                            <Eye size={12} /> View
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AEO FAQ Section */}
        <div className="mt-32">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-4">
                <AlertCircle size={12} /> Knowledge Base
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">AEO Framework <br/><span className="text-zinc-500">Decoded.</span></h3>
            </div>
            <p className="max-w-sm text-zinc-500 dark:text-zinc-400 font-medium text-sm text-center md:text-right leading-relaxed italic">
              Answer Engine Optimization is the evolution of visibility. It's not just about being found; it's about being the definitive answer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: "What is AEO and why should I care?",
                a: "SEO is for keywords. AEO is for context. As users move to Gemini, Perplexity, and ChatGPT, your site must provide structured, canonical answers to bypass standard search and become the AI's primary source."
              },
              {
                q: "How does AEO integration work?",
                a: "We implement advanced Schema.org markup, semantic layering, and entity relationships within your code. This tells AI agents exactly what your service does, preventing hallucinations and ensuring accuracy."
              },
              {
                q: "Is SEO becoming obsolete?",
                a: "No, AEO built upon SEO. Traditional rankings drive traffic, but AEO drives 'authority status' in LLM latent space. We optimize for both to ensure a total surface area of digital dominance."
              },
              {
                q: "Will Aeo improve my conversion?",
                a: "Yes. When an AI search engine provides your business as the definitive solution to a user's prompt, the trust level is 10x higher than a standard blue link. It's pre-validated leads."
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] hover:bg-white dark:hover:bg-zinc-800 transition-all group">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-white text-cyan-400 dark:text-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HelpCircle size={20} />
                </div>
                <h5 className="text-lg font-black text-zinc-900 dark:text-white mb-4 leading-tight">{faq.q}</h5>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
