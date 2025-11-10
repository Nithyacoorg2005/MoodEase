import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FloatingBubbles } from '../components/FloatingBubbles';

// Define the Mood type
export interface Mood {
  id: string;
  user_id: string;
  mood_value: number;
  mood_emoji: string;
  notes: string | null;
  created_at: string;
}

type DashboardProps = {
  onNavigate: (page: string) => void;
};

const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Struggling' },
  { value: 2, emoji: '😕', label: 'Down' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Amazing' },
];

const affirmations = [
  'You are stronger than you think',
  'Every day is a new beginning',
  'You deserve happiness and peace',
  'Your feelings are valid',
  'Progress, not perfection',
];

const API_URL = 'http://localhost:4000/api';

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, token } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [recentMoods, setRecentMoods] = useState<Mood[]>([]);
  const [affirmation] = useState(
    affirmations[Math.floor(Math.random() * affirmations.length)]
  );
  const [showMoodInput, setShowMoodInput] = useState(false);
  const [loggedToday, setLoggedToday] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (token) {
      loadRecentMoods();
    }
  }, [profile, token]);

  const loadRecentMoods = async () => {
    if (!profile || !token) return;

    try {
      const res = await fetch(`${API_URL}/moods`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch moods');
      const data: Mood[] = await res.json(); // Data is newest-to-oldest
      
      const today = new Date().toDateString();
      const uniqueDateMoods: Mood[] = [];
      const seenDates = new Set<string>();
      let hasLoggedToday = false;

      // --- FIX: Filter for unique dates ---
      for (const mood of data) {
        const dateString = new Date(mood.created_at).toDateString();

        // Check for today's log
        if (dateString === today) {
          hasLoggedToday = true;
        }
        
        // Add to recent moods list if date is new
        if (!seenDates.has(dateString)) {
          uniqueDateMoods.push(mood);
          seenDates.add(dateString);
        }
      }
      
      // Set the state with the first 7 unique daily moods (newest first)
      setRecentMoods(uniqueDateMoods.slice(0, 7));
      
      // Update logged today state
      setLoggedToday(hasLoggedToday);
      if (hasLoggedToday) {
        setShowMoodInput(false); 
      }
      // --- END FIX ---

    } catch (error) {
      console.error('Error loading moods:', error);
    }
  };

  const saveMood = async () => {
    if (!profile || !token || !selectedMood) return;

    const moodData = moodEmojis.find((m) => m.value === selectedMood);
    if (!moodData) return;
    
    setSaveError(''); 

    try {
      const res = await fetch(`${API_URL}/moods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood_value: selectedMood,
          mood_emoji: moodData.emoji,
          notes: moodNote,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setSaveError(data.error || "You've already logged today.");
        setLoggedToday(true);
        setShowMoodInput(false);
        return;
      }

      if (!res.ok) throw new Error('Failed to save mood');

      setSelectedMood(null);
      setMoodNote('');
      setLoggedToday(true);
      setShowMoodInput(false);
      loadRecentMoods(); // Refresh the list
    } catch (error: any) {
      console.error('Error saving mood:', error);
      setSaveError(error.message || 'Failed to save mood.');
    }
  };

  const averageMood =
    recentMoods.length > 0
      ? (
          recentMoods.reduce((sum, m) => sum + m.mood_value, 0) /
          recentMoods.length
        ).toFixed(1)
      : '0';

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
            Hey {profile?.username} 👋
          </h1>
          <p className="text-gray-600 text-lg font-light">
            How are you feeling today?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Track Your Mood
            </h2>

            {loggedToday ? (
              <div className="text-center p-6 bg-purple-50 rounded-2xl">
                <CheckCircle className="text-purple-500 w-12 h-12 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-700">
                  Mood logged for today!
                </h3>
                <p className="text-gray-500 text-sm">
                  Great job. Come back tomorrow to log again.
                </p>
              </div>
            ) : !showMoodInput ? (
              <button
                onClick={() => setShowMoodInput(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
              >
                Log Today's Mood
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between gap-2">
                  {moodEmojis.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex-1 p-4 rounded-2xl transition-all ${
                        selectedMood === mood.value
                          ? 'bg-gradient-to-br from-purple-100 to-pink-100 ring-2 ring-purple-400 scale-105'
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    >
                      <div className="text-3xl mb-1">{mood.emoji}</div>
                      <div className="text-xs text-gray-600">{mood.label}</div>
                    </button>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <textarea
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    placeholder="How are you feeling? (optional)"
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white/50 resize-none"
                    rows={3}
                  />
                  {saveError && (
                    <p className="text-sm text-red-500 mt-2">{saveError}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={saveMood}
                      disabled={!selectedMood}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowMoodInput(false);
                        setSelectedMood(null);
                        setMoodNote('');
                      }}
                      className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </div>
            )}


            {recentMoods.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Recent Overview
                  </h3>
                  <button
                    onClick={() => onNavigate('tracker')}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    View all
                  </button>
                </div>
                <div className="flex gap-2">
                  {/* --- FIX: Reverse the array to show oldest first --- */}
                  {recentMoods.slice(0, 7).reverse().map((mood) => (
                    <div
                      key={mood.id} // Use mood.id as key
                      className="flex-1 bg-white/50 rounded-xl p-3 text-center"
                    >
                      <div className="text-2xl mb-1">{mood.mood_emoji}</div>
                      
                      {/* --- FIX: Use 'weekday' to show Mon, Tue, etc. --- */}
                      <div className="text-xs text-gray-500">
                        {new Date(mood.created_at).toLocaleDateString('en-US', {
                          weekday: 'short',
                        })}
                      </div>
                      
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl p-6 shadow-lg text-white"
            >
              <Sparkles className="mb-3" size={28} />
              <h3 className="text-lg font-semibold mb-2">Daily Affirmation</h3>
              <p className="font-light text-white/90">{affirmation}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="text-purple-600" size={24} />
                <span className="text-3xl font-bold text-gray-800">
                  {averageMood}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Average mood this week
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
        >
          <button
            onClick={() => onNavigate('mindfulness')}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mb-3">
              <Sparkles className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Mindfulness
            </h3>
            <p className="text-sm text-gray-600 font-light">
              Breathing, meditation & more
            </p>
          </button>

          <button
            onClick={() => onNavigate('challenges')}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mb-3">
              <Trophy className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Challenges
            </h3>
            <p className="text-sm text-gray-600 font-light">
              Build streaks & earn badges
            </p>
          </button>

          <button
            onClick={() => onNavigate('community')}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-105 text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center mb-3">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Community
            </h3>
            <p className="text-sm text-gray-600 font-light">
              Connect with others
            </p>
          </button>
        </motion.div>
      </div>
    </div>
  );
}