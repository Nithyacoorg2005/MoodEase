import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Challenge } from '../lib/supabase';
import { FloatingBubbles } from '../components/FloatingBubbles';

const challengeTypes = [
  {
    id: 'daily_mood',
    title: 'Daily Mood Log',
    description: 'Track your mood every day',
    icon: '📊',
    color: 'from-purple-400 to-pink-400',
  },
  {
    id: 'gratitude',
    title: 'Gratitude Practice',
    description: 'Write 3 things you are grateful for',
    icon: '🙏',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    id: 'breathing',
    title: 'Breathing Exercise',
    description: 'Complete a breathing session',
    icon: '🌬️',
    color: 'from-green-400 to-emerald-400',
  },
  {
    id: 'meditation',
    title: 'Meditation',
    description: 'Meditate for 5 minutes',
    icon: '🧘',
    color: 'from-amber-400 to-orange-400',
  },
];

const badges = [
  { name: 'First Step', icon: '🌱', requirement: 1 },
  { name: 'Getting Started', icon: '🌿', requirement: 3 },
  { name: 'Building Momentum', icon: '🌳', requirement: 7 },
  { name: 'Consistent', icon: '⭐', requirement: 14 },
  { name: 'Dedicated', icon: '💫', requirement: 30 },
  { name: 'Champion', icon: '🏆', requirement: 60 },
];

export function Challenges() {
  const { profile } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', profile.id);

    if (data) {
      setChallenges(data);
    } else {
      await initializeChallenges();
    }
  };

  const initializeChallenges = async () => {
    if (!profile) return;

    const newChallenges = challengeTypes.map((type) => ({
      user_id: profile.id,
      challenge_type: type.id,
      streak_count: 0,
      badges: [],
    }));

    await supabase.from('challenges').insert(newChallenges);
    loadChallenges();
  };

  const completeChallenge = async (challengeId: string) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    const now = new Date();
    const lastCompleted = challenge.last_completed
      ? new Date(challenge.last_completed)
      : null;

    let newStreak = challenge.streak_count;
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (!lastCompleted || lastCompleted < oneDayAgo) {
      newStreak += 1;
    }

    const earnedBadges = badges
      .filter((b) => newStreak >= b.requirement)
      .map((b) => b.name);

    await supabase
      .from('challenges')
      .update({
        streak_count: newStreak,
        last_completed: now.toISOString(),
        badges: earnedBadges,
      })
      .eq('id', challengeId);

    loadChallenges();
  };

  const canCompleteToday = (challenge: Challenge) => {
    if (!challenge.last_completed) return true;

    const lastCompleted = new Date(challenge.last_completed);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastCompleted.setHours(0, 0, 0, 0);

    return lastCompleted < today;
  };

  const totalStreak = challenges.reduce((sum, c) => sum + c.streak_count, 0);
  const allBadges = Array.from(
    new Set(challenges.flatMap((c) => (Array.isArray(c.badges) ? c.badges : [])))
  );

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
            Daily Challenges
          </h1>
          <p className="text-gray-600 text-lg font-light">
            Build healthy habits and earn badges
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <Flame size={32} />
              <span className="text-4xl font-bold">{totalStreak}</span>
            </div>
            <h3 className="text-lg font-semibold">Total Streak</h3>
            <p className="text-white/80 text-sm font-light">
              Keep going! You are doing great
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="text-amber-500" size={32} />
              <span className="text-4xl font-bold text-gray-800">{allBadges.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Badges Earned</h3>
            <p className="text-gray-600 text-sm font-light">
              Unlock more by completing challenges
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Your Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challengeTypes.map((type, index) => {
              const challenge = challenges.find((c) => c.challenge_type === type.id);
              const canComplete = challenge ? canCompleteToday(challenge) : true;

              return (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white/70 rounded-2xl p-5 shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl`}
                    >
                      {type.icon}
                    </div>
                    <div className="flex items-center space-x-1 text-orange-500">
                      <Flame size={20} />
                      <span className="font-bold">{challenge?.streak_count || 0}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {type.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 font-light">
                    {type.description}
                  </p>
                  <button
                    onClick={() => challenge && completeChallenge(challenge.id)}
                    disabled={!canComplete}
                    className={`w-full py-2 rounded-xl flex items-center justify-center space-x-2 transition-all ${
                      canComplete
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canComplete ? (
                      <>
                        <CheckCircle2 size={18} />
                        <span>Complete</span>
                      </>
                    ) : (
                      <span>Completed Today</span>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Badge Collection
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {badges.map((badge) => {
              const earned = allBadges.includes(badge.name);
              return (
                <div
                  key={badge.name}
                  className={`rounded-2xl p-4 text-center transition-all ${
                    earned
                      ? 'bg-gradient-to-br from-amber-100 to-orange-100 shadow-md'
                      : 'bg-gray-100 opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <p className="text-xs font-medium text-gray-700">{badge.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {badge.requirement} days
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
