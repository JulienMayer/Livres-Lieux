import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fgwepwyiqlhvwaalqckx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fZ3JXmdxx1kia-QJ91xvgg_QZhj51LL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  displayName?: string;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
};
