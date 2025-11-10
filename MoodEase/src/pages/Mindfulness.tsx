import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, BookOpen, Music, Gamepad2, X, Play, Pause } from 'lucide-react';
import { FloatingBubbles } from '../components/FloatingBubbles';

const breathingPatterns = [
  { name: 'Calm', inhale: 4, hold: 4, exhale: 4, cycles: 5 },
  { name: 'Energize', inhale: 4, hold: 2, exhale: 4, cycles: 5 },
  { name: 'Deep Relax', inhale: 4, hold: 7, exhale: 8, cycles: 4 },
];

const journalPrompts = [
  'What made you smile today?',
  'What are you grateful for right now?',
  'Describe a moment when you felt peaceful',
  'What kindness can you show yourself today?',
  'Write about something you are proud of',
  'What would make tomorrow even better?',
];

export function Mindfulness() {
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  
  // --- Breathing State ---
  const [pattern, setPattern] = useState(breathingPatterns[0]);
  const [breathingPhase, setBreathingPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathingCycles, setBreathingCycles] = useState(0);

  // --- Journal State ---
  const [journalText, setJournalText] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  
  // --- Meditation State ---
  const [activeSound, setActiveSound] = useState<string | null>(null);

  // Effect to handle modal opening
  useEffect(() => {
    // When modal opens
    if (activeActivity) {
      // Reset breathing
      setBreathingPhase('idle');
      setBreathingCycles(0);
      setPattern(breathingPatterns[0]);
      
      // Set new journal prompt
      setCurrentPrompt(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
      setJournalText('');
      
      // Stop sounds
      setActiveSound(null);
    }
  }, [activeActivity]);

  const handleStartBreathing = (selectedPattern: typeof breathingPatterns[0]) => {
    setPattern(selectedPattern);
    setBreathingCycles(selectedPattern.cycles); // Set number of cycles
    setBreathingPhase('inhale'); // Start the cycle
  };

  const activities = [
    {
      id: 'breathing',
      icon: Wind,
      title: 'Breathing Exercise',
      description: 'Guided breathing to calm your mind',
      color: 'from-blue-400 to-cyan-400',
    },
    {
      id: 'journal',
      icon: BookOpen,
      title: 'Journaling',
      description: 'Express your thoughts and feelings',
      color: 'from-purple-400 to-pink-400',
    },
    {
      id: 'meditation',
      icon: Music,
      title: 'Meditation',
      description: 'Peaceful sounds for relaxation',
      color: 'from-green-400 to-emerald-400',
    },
    {
      id: 'mindgame',
      icon: Gamepad2,
      title: 'Mini Games',
      description: 'Fun activities to stay present',
      color: 'from-amber-400 to-orange-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-20 pb-8 px-4">
      <FloatingBubbles />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-2">
            Mindfulness Center
          </h1>
          <p className="text-gray-600 text-lg font-light">
            Take a moment to reconnect with yourself
          </p>
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
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activity.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {activity.title}
                </h3>
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
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {activities.find((a) => a.id === activeActivity)?.title}
                  </h2>
                  <button
                    onClick={() => setActiveActivity(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {activeActivity === 'breathing' && (
                  <div className="text-center py-12">
                    <motion.div
                      key={breathingPhase} // Re-run animation when phase changes
                      animate={{
                        // Animate scale based on phase
                        scale: breathingPhase === 'inhale' || breathingPhase === 'hold' ? 1.5 : 1,
                      }}
                      transition={{
                        // Use the correct duration for the current phase
                        duration:
                          breathingPhase === 'inhale' ? pattern.inhale :
                          breathingPhase === 'hold' ? pattern.hold :
                          breathingPhase === 'exhale' ? pattern.exhale : 0,
                        ease: 'easeInOut',
                      }}
                      onAnimationComplete={() => {
                        // Logic to cycle through phases
                        if (breathingPhase === 'inhale') {
                          setBreathingPhase('hold');
                        } else if (breathingPhase === 'hold') {
                          setBreathingPhase('exhale');
                        } else if (breathingPhase === 'exhale') {
                          if (breathingCycles > 1) {
                            setBreathingCycles(breathingCycles - 1);
                            setBreathingPhase('inhale');
                          } else {
                            setBreathingPhase('idle'); // Finished
                          }
                        }
                      }}
                      className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 mb-8"
                    />
                    <h3 className="text-3xl font-semibold text-gray-800 mb-4 capitalize">
                      {breathingPhase === 'idle' ? 'Select a pattern' : breathingPhase}
                      {breathingPhase !== 'idle' && ` (${pattern[breathingPhase]}s)`}
                    </h3>
                    <p className="text-gray-600 h-6">
                      {breathingPhase === 'idle' ? ' ' : `Cycles left: ${breathingCycles}`}
                    </p>
                    <div className="mt-8 space-y-2">
                      {breathingPatterns.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => handleStartBreathing(p)}
                          disabled={breathingPhase !== 'idle'}
                          className="w-full text-left bg-gray-50 rounded-xl p-3 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <span className="font-medium">{p.name}:</span> Inhale {p.inhale}s, Hold {p.hold}s, Exhale {p.exhale}s
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeActivity === 'journal' && (
                  <div>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-6">
                      <p className="text-gray-700 italic">{currentPrompt}</p>
                    </div>
                    <textarea
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                      placeholder="Start writing your thoughts..."
                      className="w-full h-64 p-4 rounded-2xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
                    />
                    <button 
                      // --- ADDED ONCLICK ---
                      onClick={() => {
                        // Here you would save to your backend
                        alert('Entry saved! (Feature in progress)');
                        setJournalText('');
                        setActiveActivity(null);
                      }}
                      className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      Save Entry
                    </button>
                  </div>
                )}

                {activeActivity === 'meditation' && (
                  <div className="text-center py-12">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center mb-8">
                      <Music className="text-white" size={48} />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                      {activeSound ? `Playing: ${activeSound}` : 'Peaceful Sounds'}
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Close your eyes and listen to calming nature sounds
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {['Rain', 'Ocean', 'Forest', 'Night'].map((sound) => (
                        <button
                          key={sound}
                          // --- ADDED ONCLICK ---
                          onClick={() => {
                            // Here you would add logic to play audio
                            setActiveSound(sound);
                            alert(`Playing ${sound} sounds... (Feature in progress)`);
                          }}
                          className={`py-4 rounded-2xl transition-colors text-gray-700 font-medium ${
                            activeSound === sound
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          {sound}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeActivity === 'mindgame' && (
                  <div className="text-center py-12">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mb-8">
                      <Gamepad2 className="text-white" size={48} />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                      Mini Games
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Simple games to help you stay present
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {['Memory Match', 'Color Sort', 'Word Find', 'Puzzle'].map((game) => (
                        <button
                          key={game}
                          // --- ADDED ONCLICK ---
                          onClick={() => alert(`${game} is not implemented yet.`)}
                          className="py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                        >
                          {game}
                        </button>
                      ))}
                    </div>
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