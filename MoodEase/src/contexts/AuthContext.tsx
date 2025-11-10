import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// This is the shape of your user profile from the backend
interface Profile {
  id: string;
  username: string;
}

interface AuthContextType {
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<string | void>;
  register: (username: string, pass: string) => Promise<string | void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define your backend API URL
const API_URL = 'http://localhost:4000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On initial load, check for a token in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('mood-token');
    const storedProfile = localStorage.getItem('mood-profile');

    if (storedToken && storedProfile) {
      setToken(storedToken);
      setProfile(JSON.parse(storedProfile));
    }
    setIsLoading(false);
  }, []);

  // --- NEW LOGIN FUNCTION ---
  const login = async (username: string, pass: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Save token and profile to state and localStorage
      setToken(data.token);
      setProfile(data.profile);
      localStorage.setItem('mood-token', data.token);
      localStorage.setItem('mood-profile', JSON.stringify(data.profile));
    } catch (error: any) {
      console.error('Login error:', error.message);
      return error.message; // Return the error message to the component
    }
  };

  // --- NEW REGISTER FUNCTION ---
  const register = async (username: string, pass: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      // Save token and profile to state and localStorage
      setToken(data.token);
      setProfile(data.profile);
      localStorage.setItem('mood-token', data.token);
      localStorage.setItem('mood-profile', JSON.stringify(data.profile));
    } catch (error: any) {
      console.error('Register error:', error.message);
      return error.message; // Return the error message to the component
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