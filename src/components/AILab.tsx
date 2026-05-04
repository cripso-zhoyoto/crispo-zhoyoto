import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Loader2, Lightbulb, Target, Settings, TrendingUp, History, ClipboardCheck } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AILab({ cms }: { cms?: any }) {
  const [idea, setIdea] = useState('');
  const [submittedIdea, setSubmittedIdea] = useState('');
  const [blueprint, setBlueprint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const generateBlueprint = async () => {
    if (!idea.trim()) return;
    
    setIsLoading(true);
    setBlueprint(null);
    setError('');
    setSubmittedIdea(idea);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `A potential client has submitted this rough project idea: "${idea}"
        
        Provide a concise technical blueprint. You MUST return JSON.
        
        Sections:
        - coreFeatures (list of 3 strings)
        - targetAudience (1 sentence)
        - techStack (list of 3 strings)
        - seoStrategy (1 actionable tip)`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coreFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
              targetAudience: { type: Type.STRING },
              techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
              seoStrategy: { type: Type.STRING }
            },
            required: ["coreFeatures", "targetAudience", "techStack", "seoStrategy"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setBlueprint(result);
      
      // Auto-save to Firebase
      setSaveStatus('saving');
      await addDoc(collection(db, 'blueprints'), {
        idea: idea,
        ...result,
        createdAt: serverTimestamp()
      });
      setSaveStatus('saved');
      
    } catch (err) {
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
      </div>
    </section>
  );
}
