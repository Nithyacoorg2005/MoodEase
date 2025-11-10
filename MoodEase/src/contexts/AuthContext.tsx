import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// 1. FIX: Add 'email' to the Profile interface
interface Profile {
  id: string;
  username: string;
  email: string; // This was missing
}

interface AuthContextType {
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
  // 2. FIX: Login takes 'email', not 'username'
  login: (email: string, pass: string) => Promise<string | void>;
  // 3. FIX: Register takes all three fields
  register: (
    username: string,
    email: string,
    pass: string
  ) => Promise<string | void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:4000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('mood-token');
    const storedProfile = localStorage.getItem('mood-profile');

    if (storedToken && storedProfile) {
      setToken(storedToken);
      setProfile(JSON.parse(storedProfile));
    }
    setIsLoading(false);
  }, []);

     // --- CORRECT LOGIN FUNCTION ---
  const login = async (email: string, pass: string) => {
    try {
      // FIX: Use backticks (`) instead of single quotes (')
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      setToken(data.token);
      setProfile(data.profile);
      localStorage.setItem('mood-token', data.token);
      localStorage.setItem('mood-profile', JSON.stringify(data.profile));
    } catch (error: any) {
      console.error('Login error:', error.message);
      return error.message;
    }
  };


  // --- CORRECT REGISTER FUNCTION ---
  const register = async (username: string, email: string, pass: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 5. FIX: Send 'username', 'email', and 'password'
        body: JSON.stringify({ username, email, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      setToken(data.token);
      setProfile(data.profile);
      localStorage.setItem('mood-token', data.token);
      localStorage.setItem('mood-profile', JSON.stringify(data.profile));
    } catch (error: any) {
      console.error('Register error:', error.message);
      return error.message;
    }
  };

  // --- NEW LOGOUT FUNCTION ---
  const logout = () => {
    setToken(null);
    setProfile(null);
    localStorage.removeItem('mood-token');
    localStorage.removeItem('mood-profile');
  };

  return (
    <AuthContext.Provider
      value={{ profile, token, isLoading, login, register, logout }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};