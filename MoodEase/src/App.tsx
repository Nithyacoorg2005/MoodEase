import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { MoodTracker } from './pages/MoodTracker';
import { Mindfulness } from './pages/Mindfulness';
import { Challenges } from './pages/Challenges';
import { Community } from './pages/Community';
import { Profile } from './pages/Profile';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>(user ? 'dashboard' : 'landing');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">💛</div>
          <p className="text-gray-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'login') {
      return <Login onNavigate={handleNavigate} />;
    }
    if (currentPage === 'signup') {
      return <Signup onNavigate={handleNavigate} />;
    }
    return <Landing onNavigate={handleNavigate} />;
  }

  return (
    <>
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'tracker' && <MoodTracker />}
      {currentPage === 'mindfulness' && <Mindfulness />}
      {currentPage === 'challenges' && <Challenges />}
      {currentPage === 'community' && <Community />}
      {currentPage === 'profile' && <Profile onNavigate={handleNavigate} />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
