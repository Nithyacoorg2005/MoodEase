import { useState } from 'react';
import { X, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Curated high-quality ambience videos (YouTube IDs)
const SOUNDSCAPES = {
  Rain: {
    id: 'mPZkdNFkNps', // Heavy rain on window
    title: 'Rainy Window',
    quote: 'Let the rain wash away the worry.',
  },
  Ocean: {
    id: 'bn9F19Hi1Lk', // Ocean waves at sunset
    title: 'Sunset Waves',
    quote: 'You are as vast as the ocean.',
  },
  Forest: {
    id: 'xNN7iTA57jM', // Green forest nature
    title: 'Deep Woods',
    quote: 'Nature does not hurry, yet everything is accomplished.',
  },
  Study: {
    id: 'WPni755', // Night crickets & campfire
    title: 'Intense Study',
    quote: 'Increase productivity with focused calm.',
  },
  Divine: {
    id: '5jca-sWgemI', // Clear river stream
    title: 'Mountain Stream',
    quote: 'Flow like water, effortless and free.',
  },
  Wind: {
    id: 'S5g02w8h5cE', // Windy grass field
    title: 'Gentle Breeze',
    quote: 'Breathe in the calm, breathe out the chaos.',
  },
};

type SoundType = keyof typeof SOUNDSCAPES;

export function MeditationPlayer({ 
  sound, 
  onExit 
}: { 
  sound: string; 
  onExit: () => void 
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const currentScene = SOUNDSCAPES[sound as SoundType] || SOUNDSCAPES.Rain;

  return (
    <div className={`fixed inset-0 z-[60] bg-black flex items-center justify-center transition-all duration-500 ${isFullscreen ? 'p-0' : 'p-4 md:p-8'}`}>
      
      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative w-full h-full overflow-hidden shadow-2xl ${isFullscreen ? 'rounded-none' : 'rounded-3xl'}`}
      >
        
        {/* --- VIDEO BACKGROUND (YouTube Embed) --- */}
        <div className="absolute inset-0 pointer-events-none scale-[1.35]"> 
           <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${currentScene.id}?autoplay=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${currentScene.id}&mute=${isMuted ? '1' : '0'}&start=10`}
            title="Ambience"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            className="w-full h-full object-cover"
          />
        </div>

        {/* --- OVERLAY GRADIENT --- */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

        {/* --- TOP CONTROLS --- */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
          <div className="bg-black/20 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium tracking-wide uppercase">Live Ambience</span>
          </div>

          <button 
            onClick={onExit}
            className="bg-black/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all border border-white/10 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* --- CENTER CONTENT --- */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10 pointer-events-none px-4">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-4 text-shadow-lg tracking-tight"
          >
            {currentScene.title}
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 0.9 }}
            transition={{ delay: 0.8 }}
            className="text-lg md:text-xl font-light italic text-white/90 max-w-lg leading-relaxed"
          >
            "{currentScene.quote}"
          </motion.p>
        </div>

        {/* --- BOTTOM CONTROLS --- */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex justify-between items-end z-10">
          
          {/* Sound Controls */}
          <div className="flex gap-4">
             <button 
              onClick={() => setIsMuted(!isMuted)}
              className="bg-black/40 backdrop-blur-xl text-white p-4 rounded-2xl hover:bg-black/60 transition-all border border-white/10"
             >
               {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
             </button>
          </div>

          {/* Fullscreen Toggle */}
          <button 
             onClick={() => setIsFullscreen(!isFullscreen)}
             className="bg-black/40 backdrop-blur-xl text-white p-4 rounded-2xl hover:bg-black/60 transition-all border border-white/10 hidden md:block"
          >
             {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>

        </div>
      </motion.div>
    </div>
  );
}