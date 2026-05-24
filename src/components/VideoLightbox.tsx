import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Video } from 'lucide-react';

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
  videoUrl?: string;
  videoUrls?: VideoAsset[];
}

interface VideoLightboxProps {
  demo: Demo | null;
  activeVideoUrl: string;
  setActiveVideoUrl: (url: string) => void;
  onClose: () => void;
}

export default function VideoLightbox({
  demo,
  activeVideoUrl,
  setActiveVideoUrl,
  onClose
}: VideoLightboxProps) {
  if (!demo) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-8"
      >
        <div className="absolute inset-x-0 top-0 p-6 flex items-center justify-between pointer-events-auto z-10">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h4 className="text-sm md:text-xl font-black text-white tracking-widest uppercase">
              {demo.title} <span className="text-zinc-600">/ VIDEO TRANSMISSION</span>
            </h4>
          </div>
          <button 
            id="close-lightbox-btn"
            onClick={onClose}
            className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-black rounded-full text-zinc-400 hover:text-white transition-all shadow-2xl cursor-pointer"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="w-full max-w-6xl mt-16 lg:mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8 h-[75vh] items-stretch">
          {/* Primary Player Display Panel */}
          <div className="lg:col-span-3 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-4 flex flex-col justify-between overflow-hidden shadow-2xl relative group">
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              {activeVideoUrl ? (
                <video 
                  key={activeVideoUrl}
                  src={activeVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full max-h-[55vh] lg:max-h-[60vh] object-contain rounded-xl"
                />
              ) : (
                <div className="text-zinc-600 font-extrabold text-sm uppercase tracking-widest flex flex-col items-center gap-3">
                  <Video className="w-12 h-12 text-zinc-800 animate-pulse" />
                  <span>No active media stream found</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between px-2">
              <div>
                <span className="text-[9px] md:text-[10px] font-black tracking-widest text-[#EAB308] uppercase block">ACTIVE ROTATION</span>
                <span className="text-xs md:text-sm font-black text-zinc-300">
                  {demo.videoUrls?.find(v => v.url === activeVideoUrl)?.title || 'Core Stream Overview'}
                </span>
              </div>
              <div className="text-[8px] md:text-[9px] font-bold text-zinc-600 tracking-widest uppercase">
                RESOLUTION: 1080P // STREAM FEED
              </div>
            </div>
          </div>

          {/* Sidebar Playlist */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-[2.5rem] p-6 flex flex-col h-full overflow-hidden">
            <div className="mb-6 flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Video className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black uppercase text-zinc-300 tracking-wider">Asset Matrix Channel</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {/* Option 1: Backport core videoUrl if present */}
              {demo.videoUrl && (
                <button
                  onClick={() => setActiveVideoUrl(demo.videoUrl!)}
                  className={`w-full p-4 rounded-2xl flex items-start gap-4 transition-all text-left border cursor-pointer ${
                    activeVideoUrl === demo.videoUrl
                      ? 'bg-rose-950/20 border-rose-500/50 text-[#EAB308]'
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-[10px] font-black">
                    00
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[8px] font-black tracking-widest uppercase text-zinc-600">Core Feature</span>
                    <p className="font-extrabold text-xs truncate">Main Stream Walkthrough</p>
                  </div>
                </button>
              )}

              {/* Playlist of updated multi-video objects */}
              {demo.videoUrls && demo.videoUrls.length > 0 ? (
                demo.videoUrls.map((video, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveVideoUrl(video.url)}
                    className={`w-full p-4 rounded-2xl flex items-start gap-4 transition-all text-left border cursor-pointer ${
                      activeVideoUrl === video.url
                        ? 'bg-cyan-950/20 border-cyan-500/50 text-[#EAB308]'
                        : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-[10px] font-black">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[8px] font-black tracking-widest uppercase text-zinc-600">Aux Broadcast</span>
                      <p className="font-extrabold text-xs truncate">{video.title || `Video Feed ${idx + 1}`}</p>
                    </div>
                  </button>
                ))
              ) : (
                !demo.videoUrl && (
                  <div className="text-center py-12 text-[10px] uppercase font-black tracking-widest text-[#3B000A] dark:text-zinc-600 italic">
                    No video feeds indexed.
                  </div>
                )
              )}
            </div>

            <div className="pt-6 border-t border-zinc-900">
              <span className="block text-[8px] font-black tracking-[0.2em] uppercase text-zinc-600 text-center">
                Crispo Cinema Dynamic Playlist v2.6
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
