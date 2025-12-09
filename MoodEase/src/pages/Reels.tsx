import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Volume2, VolumeX, Play } from 'lucide-react';
import { motion } from 'framer-motion';

// Sample Video Data (Using reliable public nature clips)
const REELS_DATA = [
  {
    id: 1,
    url: "https://www.pexels.com/download/video/6455107/",
    username: "nature_lover",
    description: "Spring vibes 🌸 #nature #peace",
    likes: "12.4K",
    comments: "105",
  },
  {
    id: 2,
    url: "https://www.pexels.com/download/video/5752365/",
    username: "ocean_life",
    description: "The sound of waves is my therapy 🌊",
    likes: "8.2K",
    comments: "45",
  },
  {
    id: 3,
    url: "https://www.pexels.com/download/video/7551526/",
    username: "rainy_days",
    description: "Rainy mood 🌧️ #cozy",
    likes: "25K",
    comments: "302",
  },
  {
    id: 4,
    url: "https://www.pexels.com/download/video/9034459/",
    username: "space_explorer",
    description: "Look at the stars ✨",
    likes: "5.1K",
    comments: "22",
  },
];

export function Reels() {
  return (
    <div className="bg-black h-screen w-full pt-16 md:pt-0 overflow-y-scroll snap-y snap-mandatory no-scrollbar">
      {REELS_DATA.map((reel) => (
        <ReelItem key={reel.id} data={reel} />
      ))}
    </div>
  );
}

function ReelItem({ data }: { data: typeof REELS_DATA[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  // Auto-play when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 } // Play when 60% visible
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent pausing when clicking mute button
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-screen snap-center bg-gray-900 flex items-center justify-center">
      {/* Video Player */}
      <div className="relative w-full h-full max-w-md mx-auto overflow-hidden md:rounded-xl shadow-2xl">
        <video
          ref={videoRef}
          src={data.url}
          className="w-full h-full object-cover cursor-pointer"
          loop
          muted={isMuted}
          playsInline
          onClick={togglePlay}
        />

        {/* Play/Pause Icon Overlay (Fades out) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
            <Play fill="white" size={64} className="text-white opacity-80" />
          </div>
        )}

        {/* Mute Button (Top Right) */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* Side Action Buttons */}
        <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6 z-20">
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 rounded-full hover:bg-black/20 transition active:scale-90"
            >
              <Heart 
                size={32} 
                className={isLiked ? "fill-red-500 text-red-500" : "text-white"} 
                strokeWidth={2}
              />
            </button>
            <span className="text-white text-xs font-medium drop-shadow-md">{data.likes}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button className="p-2 rounded-full hover:bg-black/20 transition active:scale-90">
              <MessageCircle size={30} className="text-white" strokeWidth={2} />
            </button>
            <span className="text-white text-xs font-medium drop-shadow-md">{data.comments}</span>
          </div>

          <button className="p-2 rounded-full hover:bg-black/20 transition active:scale-90">
            <Share2 size={28} className="text-white" strokeWidth={2} />
          </button>

          <button className="p-2 rounded-full hover:bg-black/20 transition">
            <MoreHorizontal size={28} className="text-white" />
          </button>
        </div>

        {/* Bottom Info Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-red-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-gray-800 border-2 border-black" />
            </div>
            <span className="text-white font-semibold text-sm drop-shadow-md cursor-pointer hover:underline">
              {data.username}
            </span>
            <button className="text-white text-xs border border-white/50 px-3 py-1 rounded-lg backdrop-blur-sm hover:bg-white/20 transition">
              Follow
            </button>
          </div>
          <p className="text-white/90 text-sm leading-relaxed line-clamp-2 drop-shadow-sm">
            {data.description}
          </p>
          
          {/* Scrolling Audio Track */}
          <div className="flex items-center gap-2 mt-3 opacity-80">
            <MusicIcon />
            <div className="text-xs text-white overflow-hidden w-32">
              <div className="animate-marquee whitespace-nowrap">
                Original Audio • {data.username} • Trending Sound
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Music Note Icon
const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
);