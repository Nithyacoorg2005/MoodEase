import { motion } from 'framer-motion';
import { Heart, Sparkles, Users, TrendingUp } from 'lucide-react';
import { FloatingBubbles } from '../components/FloatingBubbles';

type LandingProps = {
  onNavigate: (page: string) => void;
};

export function Landing({ onNavigate }: LandingProps) {
  const features = [
    {
      icon: Heart,
      title: 'Mood Tracking',
      description: 'Track your emotions and discover patterns',
    },
    {
      icon: Sparkles,
      title: 'Mindfulness',
      description: 'Guided activities for inner peace',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with supportive peers',
    },
    {
      icon: TrendingUp,
      title: 'Progress',
      description: 'Celebrate your growth journey',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      <FloatingBubbles />

      <div className="relative z-10">
        <nav className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">💛</span>
            <span className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MoodEase
            </span>
          </div>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-2 rounded-2xl bg-white/80 backdrop-blur-sm text-purple-600 font-medium hover:bg-white transition-colors shadow-md"
          >
            Log In
          </button>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-6 py-20 text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                Your calm corner
              </span>
              <br />
              <span className="text-gray-800">for everyday balance</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-light">
              A safe space to explore your feelings, find peace, and grow stronger every day
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <button
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-8 py-4 rounded-2xl bg-white/80 backdrop-blur-sm text-purple-600 font-medium hover:bg-white transition-colors shadow-md"
            >
              Log In
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4 mx-auto">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-light">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
