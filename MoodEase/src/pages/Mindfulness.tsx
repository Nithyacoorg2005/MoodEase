import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, BookOpen, Music, Gamepad2, X, Play } from "lucide-react";
import { FloatingBubbles } from "../components/FloatingBubbles";
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// --- IMPORTS ---
import { MemoryGame } from "../components/MemoryGame";
import { ColorFocusGame } from "../components/ColorFocusGame";
import { WordScramble } from "../components/WordScramble";
import { ZenPuzzle } from "../components/ZenPuzzle";
import { MeditationPlayer } from "../components/MeditationPlayer"; // NEW IMPORT

const breathingPatterns = [
  { name: "Calm", inhale: 4, hold: 4, exhale: 4, cycles: 5 },
  { name: "Energize", inhale: 4, hold: 2, exhale: 4, cycles: 5 },
  { name: "Deep Relax", inhale: 4, hold: 7, exhale: 8, cycles: 4 },
];

const journalPrompts = [
  "What made you smile today?",
  "What are you grateful for right now?",
  "Describe a moment when you felt peaceful",
  "What kindness can you show yourself today?",
  "Write about something you are proud of",
  "What would make tomorrow even better?",
];

export function Mindfulness() {
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  
  // Sub-activity states
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeMeditation, setActiveMeditation] = useState<string | null>(null); // NEW

  // Breathing State
  const [pattern, setPattern] = useState(breathingPatterns[0]);
  const [breathingPhase, setBreathingPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [breathingCycles, setBreathingCycles] = useState(0);

  // Journal State
  const [journalText, setJournalText] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const { token } = useAuth();
  const API_URL = 'http://localhost:4000/api';
  const [isSaving, setIsSaving] = useState(false);

  // Reset states when opening modal
  useEffect(() => {
    if (activeActivity) {
      setBreathingPhase("idle");
      setBreathingCycles(0);
      setPattern(breathingPatterns[0]);
      setCurrentPrompt(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
      setJournalText("");
      setActiveMeditation(null);
      setActiveGame(null);
    }
  }, [activeActivity]);

  const saveJournalEntry = async () => {
    if (!journalText.trim()) return;
    if (!token) {
      alert("Please log in to save.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { mood_value: 4, mood_emoji: '🙂', notes: `[JOURNAL] ${currentPrompt}\n\n${journalText}` };
      const res = await fetch(`${API_URL}/moods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) throw new Error("Server error");
      if (!res.ok) throw new Error('Server rejected entry');

      setJournalText('');
      setActiveActivity(null);
      alert("Journal saved!"); 
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartBreathing = (selectedPattern: (typeof breathingPatterns)[0]) => {
    setPattern(selectedPattern);
    setBreathingCycles(selectedPattern.cycles);
    setBreathingPhase("inhale");
  };

  const getPhaseDuration = () => {
    if (breathingPhase === "inhale") return pattern.inhale;
    if (breathingPhase === "hold") return pattern.hold;
    if (breathingPhase === "exhale") return pattern.exhale;
    return 0;
  };

  function BreathingLogic({ phase, setPhase, cycles, setCycles, duration }: any) {
    useEffect(() => {
      if (phase === "idle") return;
      const timer = setTimeout(() => {
        if (phase === "inhale") setPhase("hold");
        else if (phase === "hold") setPhase("exhale");
        else if (phase === "exhale") {
          if (cycles > 1) { setCycles((c: number) => c - 1); setPhase("inhale"); }
          else setPhase("idle");
        }
      }, duration * 1000);
      return () => clearTimeout(timer);
    }, [phase, cycles, duration, setPhase, setCycles]);
    return null;
  }

  const activities = [
    { id: "breathing", icon: Wind, title: "Breathing Exercise", description: "Guided breathing to calm your mind", color: "from-blue-400 to-cyan-400" },
    { id: "journal", icon: BookOpen, title: "Journaling", description: "Express your thoughts and feelings", color: "from-purple-400 to-pink-400" },
    { id: "meditation", icon: Music, title: "Meditation", description: "Immersive soundscapes for relaxation", color: "from-green-400 to-emerald-400" },
    { id: "mindgame", icon: Gamepad2, title: "Mini Games", description: "Fun activities to stay present", color: "from-amber-400 to-orange-400" },
  ];

  const SOUND_OPTIONS = [
     { name: "Rain", color: "bg-blue-500", emoji: "🌧️" },
     { name: "Ocean", color: "bg-cyan-500", emoji: "🌊" },
     { name: "Forest", color: "bg-green-600", emoji: "🌲" },
     { name: "Night", color: "bg-indigo-900", emoji: "🌙" },
     { name: "Stream", color: "bg-teal-500", emoji: "💧" },
     { name: "Wind", color: "bg-gray-400", emoji: "🍃" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-20 pb-8 px-4">
      <FloatingBubbles />
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-2">Mindfulness Center</h1>
          <p className="text-gray-600 text-lg font-light">Take a moment to reconnect with yourself</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.button
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveActivity(activity.id)}
                className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activity.color} flex items-center justify-center mb-4`}>
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{activity.title}</h3>
                <p className="text-gray-600 font-light">{activity.description}</p>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {activeActivity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveActivity(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              >
                {!activeMeditation && (
                    <button onClick={() => setActiveActivity(null)} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 transition-colors z-10">
                    <X size={24} />
                    </button>
                )}

                {/* --- Breathing View --- */}
                {activeActivity === "breathing" && (
                  <div className="text-center py-8">
                    <BreathingLogic phase={breathingPhase} setPhase={setBreathingPhase} cycles={breathingCycles} setCycles={setBreathingCycles} duration={getPhaseDuration()} />
                    <motion.div animate={{ scale: breathingPhase === "inhale" || breathingPhase === "hold" ? 1.5 : 1 }} transition={{ duration: getPhaseDuration(), ease: "easeInOut" }} className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 mb-8 shadow-2xl shadow-blue-200" />
                    <h3 className="text-3xl font-semibold text-gray-800 mb-4 capitalize">{breathingPhase === "idle" ? "Select a pattern" : breathingPhase} {breathingPhase !== "idle" && ` (${getPhaseDuration()}s)`}</h3>
                    <p className="text-gray-600 h-6 mb-8">{breathingPhase !== "idle" && `Cycles left: ${breathingCycles}`}</p>
                    <div className="space-y-2 max-w-sm mx-auto">
                      {breathingPatterns.map((p) => (
                        <button key={p.name} onClick={() => handleStartBreathing(p)} disabled={breathingPhase !== "idle"} className="w-full text-left bg-gray-50 rounded-xl p-3 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors">
                          <span className="font-bold text-gray-800">{p.name}:</span> Inhale {p.inhale}s, Hold {p.hold}s, Exhale {p.exhale}s
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- Journal View --- */}
                {activeActivity === 'journal' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily Journal</h2>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-6"><p className="text-purple-900 font-medium italic">"{currentPrompt}"</p></div>
                    <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="Start writing your thoughts..." disabled={isSaving} className="w-full h-64 p-4 rounded-2xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none bg-gray-50 disabled:opacity-50" />
                    <button onClick={saveJournalEntry} disabled={isSaving || !journalText.trim()} className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isSaving ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : 'Save Entry'}
                    </button>
                  </div>
                )}

                {/* --- Meditation View --- */}
                {activeActivity === "meditation" && (
                  <div className="min-h-[400px]">
                      {!activeMeditation ? (
                        <div className="text-center py-6">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center mb-6 shadow-lg shadow-green-200">
                            <Music className="text-white" size={40} />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Soundscapes</h3>
                            <p className="text-gray-600 mb-8">Select an environment to focus your mind</p>
                            <div className="grid grid-cols-2 gap-4">
                            {SOUND_OPTIONS.map((sound) => (
                                <button
                                key={sound.name}
                                onClick={() => setActiveMeditation(sound.name)}
                                className="group relative overflow-hidden rounded-2xl aspect-video shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
                                >
                                <div className={`absolute inset-0 ${sound.color} opacity-80 group-hover:opacity-90 transition-opacity`} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                                    <span className="text-4xl mb-2">{sound.emoji}</span>
                                    <span className="font-bold text-lg">{sound.name}</span>
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                            <Play size={16} fill="white" />
                                        </div>
                                    </div>
                                </div>
                                </button>
                            ))}
                            </div>
                        </div>
                      ) : (
                          // Render the Player Component
                          <MeditationPlayer sound={activeMeditation} onExit={() => setActiveMeditation(null)} />
                      )}
                  </div>
                )}

                {/* --- Mini Games View --- */}
                {activeActivity === "mindgame" && (
                  <div className="min-h-[400px]">
                    {!activeGame ? (
                      <div className="text-center py-6">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mb-6 shadow-lg shadow-orange-200">
                          <Gamepad2 className="text-white" size={40} />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Mindful Games</h3>
                        <p className="text-gray-600 mb-8">Choose an activity to sharpen your focus</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button onClick={() => setActiveGame("memory")} className="p-6 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors text-left group">
                            <span className="block text-2xl mb-2">🌸</span><span className="font-bold text-gray-800">Memory Match</span>
                          </button>
                          <button onClick={() => setActiveGame("color")} className="p-6 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors text-left group">
                            <span className="block text-2xl mb-2">🎨</span><span className="font-bold text-gray-800">Color Focus</span>
                          </button>
                          <button onClick={() => setActiveGame("word")} className="p-6 rounded-2xl bg-orange-50 hover:bg-orange-100 transition-colors text-left group">
                            <span className="block text-2xl mb-2">📝</span><span className="font-bold text-gray-800">Word Scramble</span>
                          </button>
                          <button onClick={() => setActiveGame("puzzle")} className="p-6 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors text-left group">
                            <span className="block text-2xl mb-2">🧩</span><span className="font-bold text-gray-800">Zen Puzzle</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4">
                        {activeGame === "memory" && <MemoryGame onExit={() => setActiveGame(null)} />}
                        {activeGame === "color" && <ColorFocusGame onExit={() => setActiveGame(null)} />}
                        {activeGame === "word" && <WordScramble onExit={() => setActiveGame(null)} />}
                        {activeGame === "puzzle" && <ZenPuzzle onExit={() => setActiveGame(null)} />}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}