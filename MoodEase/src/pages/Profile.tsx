import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FloatingBubbles } from '../components/FloatingBubbles';

type ProfileProps = {
  onNavigate: (page: string) => void;
};

const API_URL = 'http://localhost:4000/api';

export function Profile({ onNavigate }: ProfileProps) {
  const { token, logout } = useAuth(); // Get token and logout function
  const [username, setUsername] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [theme, setTheme] = useState('light');
  const [stats, setStats] = useState({
    totalMoods: 0,
    totalChallenges: 0,
    totalPosts: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfileAndStats();
  }, [token]);

  const loadProfileAndStats = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/profile/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to load profile data');
      }

      const data = await res.json();

      setUsername(data.username || '');
      setMemberSince(new Date(data.created_at || '').toLocaleDateString());
      setStats({
        totalMoods: data.totalMoods,
        totalChallenges: data.totalChallenges,
        totalPosts: data.totalPosts,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save profile');
      }

      const data = await res.json();
      setUsername(data.username); // Update state with saved username
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  const avatarColors = [
    'from-purple-400 to-pink-400',
    'from-blue-400 to-cyan-400',
    'from-green-400 to-emerald-400',
    'from-amber-400 to-orange-400',
    'from-pink-400 to-rose-400',
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-20 pb-8 px-4">
      <FloatingBubbles />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-2">
            Profile
          </h1>
          <p className="text-gray-600 text-lg font-light">
            Manage your account and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarColors[selectedAvatar]} flex items-center justify-center text-white text-3xl font-bold`}
              >
                {username[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {username}
                </h2>
                <p className="text-gray-600 text-sm">
                  Member since {memberSince}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Avatar Color
                </label>
                <div className="flex gap-3">
                  {avatarColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(index)}
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} transition-all ${
                        selectedAvatar === index
                          ? 'ring-4 ring-purple-300 scale-110'
                          : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Theme
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-3 rounded-2xl border transition-all flex items-center justify-center space-x-2 ${
                      theme === 'light'
                        ? 'border-purple-400 bg-purple-50 text-purple-600'
                        : 'border-gray-200 bg-white/50 text-gray-600'
                    }`}
                  >
                    <Sun size={20} />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-3 rounded-2xl border transition-all flex items-center justify-center space-x-2 ${
                      theme === 'dark'
                        ? 'border-purple-400 bg-purple-50 text-purple-600'
                        : 'border-gray-200 bg-white/50 text-gray-600'
                    }`}
                  >
                    <Moon size={20} />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              <button
                onClick={saveProfile}
                disabled={saving}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg"
            >
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="text-purple-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Your Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mood Entries</span>
                  <span className="font-bold text-gray-800">
                    {stats.totalMoods}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Challenges</span>
                  <span className="font-bold text-gray-800">
                    {stats.totalChallenges}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Community Posts</span>
                  <span className="font-bold text-gray-800">
                    {stats.totalPosts}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}