import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Trophy, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  Camera, 
  X,      
  RefreshCw, 
  Check,
  AlertCircle   
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FloatingBubbles } from '../components/FloatingBubbles';

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
  { value: 1, emoji: '😢', label: 'Struggling', key: 'sad' },
  { value: 2, emoji: '😕', label: 'Down', key: 'fearful' }, 
  { value: 2, emoji: '😠', label: 'Angry', key: 'angry' },
  { value: 2, emoji: '🤢', label: 'Disgusted', key: 'disgusted' },
  { value: 3, emoji: '😐', label: 'Okay', key: 'neutral' },
  { value: 4, emoji: '😯', label: 'Surprised', key: 'surprised' },
  { value: 5, emoji: '😄', label: 'Amazing', key: 'happy' },
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

  // Camera & AI State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictedMood, setPredictedMood] = useState<{ value: number; emoji: string; label: string } | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionError, setDetectionError] = useState('');
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    if (token) {
      loadRecentMoods();
    }
  }, [profile, token]);

  // Load models from CDN (Web) to prevent file corruption issues
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log("AI Models loaded successfully");
      } catch (err) {
        console.error("Failed to load models", err);
        setDetectionError("Failed to load AI models. Please check your internet.");
      }
    };
    loadModels();
  }, []);

  const loadRecentMoods = async () => {
    if (!profile || !token) return;

    try {
      const res = await fetch(`${API_URL}/moods`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch moods');
      const data: Mood[] = await res.json(); 
      
      const today = new Date().toDateString();
      const uniqueDateMoods: Mood[] = [];
      const seenDates = new Set<string>();
      let hasLoggedToday = false;

      for (const mood of data) {
        const dateString = new Date(mood.created_at).toDateString();
        if (dateString === today) hasLoggedToday = true;
        
        if (!seenDates.has(dateString)) {
          uniqueDateMoods.push(mood);
          seenDates.add(dateString);
        }
      }
      
      setRecentMoods(uniqueDateMoods.slice(0, 7));
      setLoggedToday(hasLoggedToday);
      if (hasLoggedToday) setShowMoodInput(false); 

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
        setSaveError("You've already logged today.");
        setLoggedToday(true);
        setShowMoodInput(false);
        return;
      }
      if (!res.ok) throw new Error('Failed to save mood');

      setSelectedMood(null);
      setMoodNote('');
      setLoggedToday(true);
      setShowMoodInput(false);
      loadRecentMoods();
    } catch (error: any) {
      console.error('Error saving mood:', error);
      setSaveError(error.message || 'Failed to save mood.');
    }
  };

  // --- SAFE CAPTURE METHOD ---
  // Instead of scanning the video directly (which crashes), we convert it to an image first.
  const capture = useCallback(async () => {
    if (!webcamRef.current || !modelsLoaded) return;
    setDetectionError('');
    setIsAnalyzing(true);
    
    // 1. Get the screenshot (base64 string)
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      setDetectionError('Camera is not ready yet. Please wait...');
      setIsAnalyzing(false);
      return;
    }

    setImgSrc(imageSrc);

    try {
      // 2. Create a temporary HTML Image element
      // This is safer than using the video element directly
      const img = new Image();
      img.src = imageSrc;
      
      // Wait for image to load before scanning
      await new Promise((resolve) => { img.onload = resolve; });

      // 3. Scan the image
      const detections = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections) {
        const expressions = detections.expressions;
        const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
        const dominantExpression = sorted[0][0];
        
        const matchedMood = moodEmojis.find(m => m.key === dominantExpression) || moodEmojis.find(m => m.key === 'neutral');
        
        if (matchedMood) {
          setPredictedMood(matchedMood);
        }
      } else {
        setDetectionError('No face detected. Please center your face.');
        setImgSrc(null); // Clear screenshot so user sees video again
      }
    } catch (error) {
      console.error("Detection error:", error);
      setDetectionError('Error analyzing image. Please try again.');
      setImgSrc(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [webcamRef, modelsLoaded]);

  const savePredictedMood = async () => {
    if (!predictedMood || !token) return;

    try {
      const res = await fetch(`${API_URL}/moods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mood_value: predictedMood.value,
          mood_emoji: predictedMood.emoji,
          notes: 'Detected via AI Camera Scan'
        })
      });

      if (res.status === 409) {
        setLoggedToday(true);
        closeCamera();
        return;
      }

      if (res.ok) {
        loadRecentMoods();
        closeCamera();
      }
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    setImgSrc(null);
    setPredictedMood(null);
    setIsAnalyzing(false);
    setDetectionError('');
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

      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full overflow-hidden relative"
            >
              <button
                onClick={closeCamera}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 z-10"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                AI Mood Scanner
              </h2>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 mb-6 group">
                {!imgSrc ? (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover transform scale-x-[-1]"
                    videoConstraints={{ facingMode: "user" }}
                  />
                ) : (
                  <img
                    src={imgSrc}
                    alt="Captured"
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                )}

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                    <RefreshCw className="w-10 h-10 animate-spin mb-2" />
                    <p className="font-medium">Analyzing facial expression...</p>
                  </div>
                )}
                
                {detectionError && !isAnalyzing && (
                   <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                   <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
                   <p className="font-medium px-4 text-center">{detectionError}</p>
                   <button 
                     onClick={() => { setDetectionError(''); setImgSrc(null); }}
                     className="mt-4 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-100"
                   >
                     Try Again
                   </button>
                 </div>
                )}
              </div>

              {predictedMood ? (
                <div className="text-center space-y-4">
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <p className="text-sm text-gray-500 mb-1">We detected you are feeling</p>
                    <div className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-800">
                      <span>{predictedMood.emoji}</span>
                      <span>{predictedMood.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setImgSrc(null);
                        setPredictedMood(null);
                      }}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Retake
                    </button>
                    <button
                      onClick={savePredictedMood}
                      className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Save Log
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={capture}
                  // We removed the strict camera ready check because the screenshot method handles it automatically
                  disabled={isAnalyzing || !modelsLoaded}
                  className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 
                    ${isAnalyzing || !modelsLoaded
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-200 hover:shadow-purple-300 transform active:scale-[0.98]'
                    }`}
                >
                  <Camera size={20} />
                  {!modelsLoaded 
                    ? 'Loading AI Models...' 
                    : isAnalyzing 
                        ? 'Scanning...' 
                        : 'Capture & Analyze'}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          {/* Main Tracker Card */}
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
              <div className="flex gap-4 flex-col sm:flex-row">
                <button
                  onClick={() => setShowMoodInput(true)}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
                >
                  Log Manually
                </button>
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="flex-1 py-4 rounded-2xl bg-white text-purple-600 border border-purple-200 font-medium hover:bg-purple-50 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Camera size={20} />
                  Scan Face (AI)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between gap-2">
                  {moodEmojis.filter(m => [1,2,3,4,5].includes(m.value) && ['sad','fearful','neutral','surprised','happy'].includes(m.key)).map((mood) => (
                    <button
                      key={mood.label}
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
                  {recentMoods.slice(0, 7).reverse().map((mood) => (
                    <div
                      key={mood.id} 
                      className="flex-1 bg-white/50 rounded-xl p-3 text-center"
                    >
                      <div className="text-2xl mb-1">{mood.mood_emoji}</div>
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