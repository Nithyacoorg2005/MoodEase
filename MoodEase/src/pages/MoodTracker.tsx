import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Mood } from '../lib/supabase';
import { FloatingBubbles } from '../components/FloatingBubbles';

export function MoodTracker() {
  const { profile } = useAuth();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('week');

  useEffect(() => {
    loadMoods();
  }, [filter]);

  const loadMoods = async () => {
    if (!profile) return;

    const now = new Date();
    let startDate = new Date();

    if (filter === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (filter === 'month') {
      startDate.setDate(now.getDate() - 30);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const { data } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', profile.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (data) {
      setMoods(data);
    }
  };

  const deleteMood = async (id: string) => {
    await supabase.from('moods').delete().eq('id', id);
    loadMoods();
  };

  const averageMood = moods.length > 0
    ? (moods.reduce((sum, m) => sum + m.mood_value, 0) / moods.length).toFixed(1)
    : '0';

  const moodCounts = moods.reduce((acc, mood) => {
    acc[mood.mood_emoji] = (acc[mood.mood_emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostFrequentMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

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
            Mood History
          </h1>
          <p className="text-gray-600 text-lg font-light">
            Track your emotional journey over time
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-purple-600" size={24} />
              <span className="text-3xl font-bold text-gray-800">{averageMood}</span>
            </div>
            <p className="text-sm text-gray-600">Average Mood</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-pink-600" size={24} />
              <span className="text-3xl font-bold text-gray-800">{moods.length}</span>
            </div>
            <p className="text-sm text-gray-600">Total Entries</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{mostFrequentMood?.[0] || '😊'}</span>
              <span className="text-3xl font-bold text-gray-800">
                {mostFrequentMood?.[1] || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600">Most Frequent</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Your Moods</h2>
            <div className="flex gap-2">
              {(['week', 'month', 'all'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    filter === f
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'week' ? 'Week' : f === 'month' ? 'Month' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {moods.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📊</span>
              <p className="text-gray-600">No mood entries yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Start tracking your moods to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {moods.map((mood) => (
                <motion.div
                  key={mood.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/50 rounded-2xl p-4 flex items-center justify-between hover:bg-white/80 transition-all group"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-3xl">{mood.mood_emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(mood.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(mood.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {mood.notes && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {mood.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMood(mood.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
