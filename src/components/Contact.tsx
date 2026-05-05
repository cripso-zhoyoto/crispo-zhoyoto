import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Mail, MessageSquare, Info, CheckCircle2, Phone, Loader2, Copy, Check, ExternalLink, HelpCircle, Palette, FileText } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Contact({ cms }: { cms?: any }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Web/App Demo Showcase',
    otherService: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEmail(true);
      if (navigator.vibrate) navigator.vibrate(50);
      setTimeout(() => setCopiedEmail(false), 2000);
    });
  };

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formattedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'enquiries'), {
        ...formData,
        service: formData.service === 'Other' ? `Other: ${formData.otherService}` : formData.service,
        createdAt: serverTimestamp()
      });
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', service: 'Web/App Demo Showcase', otherService: '', message: '' });
      
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      setIsSubmitting(false);
      alert('Transmission failed. Please check your signal and try again.');
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      service: val,
      otherService: val === 'Other' ? prev.otherService : ''
    }));
  };

  const servicesList = [
    'Web/App Demo Showcase',
    'SEO & AEO Services',
    'Web Development',
    'App Development',
    'Email marketing',
    'UI/UX Design',
    'Web Re-Design',
    'Full Overhaul',
    'Other'
  ];

  return (
    <section id="contact" className="py-24 px-4 overflow-hidden relative z-10 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-500">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cyan-50 dark:bg-cyan-900/10 blur-[160px] rounded-full pointer-events-none opacity-50" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div className="sticky top-24">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-cyan-600 dark:text-cyan-400 font-black tracking-[0.4em] uppercase text-xs mb-4"
            >
              {cms?.badge || 'Get In Touch'}
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-6xl md:text-8xl font-sans font-black text-zinc-900 dark:text-white mb-8 leading-none"
            >
              {cms?.titleFirstLine || "Let's Build"} <br />
              <span className="text-zinc-500">{cms?.titleSecondLine || 'Something Epic.'}</span>
            </motion.h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-xl mb-12 max-w-md font-medium leading-relaxed">
              {cms?.description || 'Ready to redefine your digital presence? We combine behavioral engineering with stunning aesthetics to build things that convert.'}
            </p>

            <div className="space-y-10">
              <div 
                className="flex items-center space-x-6 group text-left relative"
              >
                <div 
                  onClick={() => copyToClipboard('zhoyotokoff@gmail.com')}
                  className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-cyan-400 dark:text-cyan-600 shadow-xl group-hover:scale-110 transition-transform cursor-pointer"
                  title="Click to copy email"
                >
                  <AnimatePresence mode="wait">
                    {copiedEmail ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <Check className="w-6 h-6 text-emerald-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="mail"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <Mail className="w-6 h-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black text-left">Direct Line</p>
                    <AnimatePresence>
                      {copiedEmail && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <a 
                    href="mailto:zhoyotokoff@gmail.com" 
                    className="text-zinc-900 dark:text-white text-xl font-black text-left flex items-center gap-2 hover:text-cyan-500 transition-colors"
                  >
                    zhoyotokoff@gmail.com
                    <ExternalLink className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
              <a href="tel:+919947410627" className="flex items-center space-x-6 group text-left">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-rose-400 dark:text-rose-600 shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black mb-1 text-left">Call Us</p>
                  <p className="text-zinc-900 dark:text-white text-xl font-black text-left">9947410627</p>
                </div>
              </a>
              <a href="https://wa.me/919947410627" target="_blank" className="flex items-center space-x-6 group text-left">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
                  <Send className="w-6 h-6 rotate-45" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black mb-1 text-left">WhatsApp</p>
                  <p className="text-zinc-900 dark:text-white text-xl font-black text-left leading-tight">Live Support Protocol</p>
                </div>
              </a>
              <div className="flex items-center space-x-6 group text-left">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-md group-hover:scale-110 transition-transform cursor-pointer">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black mb-1 text-left">Ecosystem</p>
                  <p className="text-zinc-900 dark:text-white text-xl font-black text-left leading-tight">Valanchery, Malappuram<br/>Kerala 676552</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 1.02 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-10 md:p-14 rounded-[3.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-[0_50px_100px_rgba(0,0,0,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500" />
            
            {/* Inquiry Guide */}
            <div className="mb-12 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                <HelpCircle size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-tight">Inquiry Guide & Protocols</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed italic">
                  To ensure a high-fidelity response, please follow the mission parameters below. Specialized requirements are encrypted for precision.
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black ml-2">{cms?.inputName || 'Identity'}</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-zinc-900 dark:text-zinc-100 font-black focus:outline-none focus:ring-4 focus:ring-cyan-500/5 focus:bg-white dark:focus:bg-zinc-800 focus:border-cyan-200 dark:focus:border-cyan-900 transition-all shadow-inner"
                      placeholder="John Wick"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black ml-2">{cms?.inputEmail || 'Digital Address'}</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-zinc-900 dark:text-zinc-100 font-black focus:outline-none focus:ring-4 focus:ring-cyan-500/5 focus:bg-white dark:focus:bg-zinc-800 focus:border-cyan-200 dark:focus:border-cyan-900 transition-all shadow-inner"
                      placeholder="john@assassin.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black ml-2">{cms?.inputPhone || 'WhatsApp / Phone'}</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-5 pl-14 pr-6 text-zinc-900 dark:text-zinc-100 font-black focus:outline-none focus:ring-4 focus:ring-cyan-500/5 focus:bg-white dark:focus:bg-zinc-800 focus:border-cyan-200 dark:focus:border-cyan-900 transition-all shadow-inner"
                      placeholder="(555) 000-0000"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black ml-2">Inquiry Type</label>
                  <div className="relative">
                    <select 
                      value={formData.service}
                      onChange={handleServiceChange}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl py-5 px-6 text-zinc-900 dark:text-zinc-100 font-black focus:outline-none focus:ring-4 focus:ring-cyan-500/5 focus:bg-white dark:focus:bg-zinc-800 focus:border-cyan-200 dark:focus:border-cyan-900 transition-all appearance-none shadow-inner"
                    >
                      {servicesList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {formData.service === 'Other' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <label className="text-[10px] uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400 font-black ml-2 animate-pulse">Specify Custom Service Requirements</label>
                    <div className="relative">
                      <HelpCircle className="absolute left-5 top-5 w-5 h-5 text-cyan-500" />
                      <textarea 
                        required
                        value={formData.otherService}
                        onChange={(e) => setFormData({...formData, otherService: e.target.value})}
                        className="w-full bg-cyan-50/50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-900/30 rounded-2xl py-5 pl-14 pr-6 text-zinc-900 dark:text-zinc-100 font-black focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:bg-white dark:focus:bg-zinc-800 focus:border-cyan-400 transition-all shadow-inner min-h-[100px] resize-none"
                        placeholder="Please detail your specific requirements for this custom engagement..."
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black ml-2">{cms?.inputMessage || 'The Mission'}</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                      <Palette size={10} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">Include Palette</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/30">
                      <FileText size={10} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">Full Requirement List</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-5 top-6 w-5 h-5 text-zinc-300" />
                  <textarea 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl pt-6 pl-14 pr-6 pb-6 text-zinc-900 dark:text-zinc-100 font-black focus:outline-none focus:ring-4 focus:ring-cyan-500/5 focus:bg-white dark:focus:bg-zinc-800 focus:border-cyan-200 dark:focus:border-cyan-900 transition-all resize-none shadow-inner"
                    placeholder="Briefly describe the vision. Please fully explain the entire what you need, ensure you provide your color palette or brand icon details (via WhatsApp link below if needed), and specify your core requirements."
                  />
                </div>
                <div className="mt-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 flex items-start gap-3">
                  <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest">Architect's Note</p>
                    <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-medium leading-relaxed">
                      For branding precision: Please ensure you fully explain the entire scope of what you need. You must provide a color palette or brand icon (send via WhatsApp for instant sync). Include all technical requirements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Premium Button Card */}
              <div className="pt-4">
                <div className="p-2 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-inner group">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-zinc-900 text-white font-black py-7 rounded-[2rem] transition-all flex items-center justify-center space-x-4 shadow-[0_20px_40px_rgba(0,0,0,0.1)] tracking-[0.3em] text-sm hover:scale-[1.02] active:scale-[0.98] border border-zinc-800"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-7 h-7 animate-spin text-cyan-500" />
                    ) : (
                      <>
                        <span className="bg-gradient-to-r from-purple-500 via-rose-500 to-yellow-500 bg-clip-text text-transparent">{cms?.submitBtn || 'INITIATE TRANSMISSION'}</span>
                        <Send className="w-6 h-6 text-rose-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>

            <AnimatePresence>
              {isSubmitted && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/90 dark:bg-zinc-900/90 rounded-[3.5rem] flex flex-col items-center justify-center p-12 text-center z-20"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ 
                      scale: [0.5, 1.1, 1],
                      opacity: 1 
                    }}
                    transition={{ duration: 0.4 }}
                    className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center mb-6 shadow-inner relative"
                  >
                    <CheckCircle2 className="w-12 h-12 relative z-10" />
                    {/* Ghost scale-up and fade-out effect */}
                    <motion.div 
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-emerald-400/30"
                    />
                  </motion.div>
                  <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">Transmission Received</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xl font-medium leading-relaxed">We've received your mission parameters. Our specialized team will decrypt and respond within 24 standard solar hours.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
