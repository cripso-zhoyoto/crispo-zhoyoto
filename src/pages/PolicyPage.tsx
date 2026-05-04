import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck, Eye, Lock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-4">
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
            className="text-cyan-600 font-black tracking-[0.4em] uppercase text-xs mb-4"
          >
            Compliance & Privacy
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-sans font-black text-zinc-900 tracking-tight leading-none"
          >
            Data <br />
            <span className="text-zinc-500">Ethics Protocol.</span>
          </motion.h1>
          <p className="text-zinc-600 text-xl mt-8 font-medium max-w-2xl leading-relaxed">
            We treat your data with the same engineering precision we apply to our code. No leaks, no fluff, total transparency.
          </p>
        </div>

        <div className="space-y-24">
          <section className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-cyan-400 shadow-xl">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-3xl font-black text-zinc-900">Privacy Policy</h2>
            </div>
            <div className="p-10 bg-zinc-50 border border-zinc-100 rounded-[3rem] space-y-6 text-zinc-600 leading-relaxed font-medium">
              <p>At Crispo Digital Agency, we respect your privacy. This policy outlines how we collect, use, and protect your information when you interact with our studio.</p>
              
              <h3 className="text-zinc-900 font-black uppercase text-xs tracking-widest pt-4">Data Collection</h3>
              <p>We collect information you transmit via our contact forms (Name, Email, Message). This data is stored securely in our private Firebase vault and is never sold to third-party entities.</p>
              
              <h3 className="text-zinc-900 font-black uppercase text-xs tracking-widest pt-4">Internal Usage</h3>
              <p>Your data is strictly used for communication and project architecting. We don't perform shadow tracking or invasive analytics.</p>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-md">
                <Lock size={24} />
              </div>
              <h2 className="text-3xl font-black text-zinc-900">Terms of Service</h2>
            </div>
            <div className="p-10 bg-zinc-50 border border-zinc-100 rounded-[3rem] space-y-6 text-zinc-600 leading-relaxed font-medium">
              <p>By engaging with Crispo Digital Agency, you agree to our operational framework.</p>
              <ul className="list-disc pl-6 space-y-4">
                <li><span className="text-zinc-900 font-black uppercase text-[10px] tracking-widest">Intellectual Property:</span> All demonstration code remains the property of Crispo unless otherwise specified in formal contracts.</li>
                <li><span className="text-zinc-900 font-black uppercase text-[10px] tracking-widest">AI Lab:</span> Blueprints generated in our AI Lab are starting points; they are not financial or legal advice.</li>
                <li><span className="text-zinc-900 font-black uppercase text-[10px] tracking-widest">Communication:</span> We use WhatsApp and Email as our primary transmission protocols.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
