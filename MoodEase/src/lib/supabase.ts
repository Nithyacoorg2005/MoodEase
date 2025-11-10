import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  theme: string;
  created_at: string;
  updated_at: string;
};

export type Mood = {
  id: string;
  user_id: string;
  mood_value: number;
  mood_emoji: string;
  notes: string;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Challenge = {
  id: string;
  user_id: string;
  challenge_type: string;
  streak_count: number;
  last_completed: string | null;
  badges: string[];
  created_at: string;
};

export type CommunityPost = {
  id: string;
  user_id: string;
  content: string;
  reactions: Record<string, number>;
  created_at: string;
};
