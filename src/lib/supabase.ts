import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  // Check localStorage for saved credentials
  const savedUrl = localStorage.getItem('smd_supabase_url');
  const savedKey = localStorage.getItem('smd_supabase_key');

  if (savedUrl && savedKey) {
    try {
      supabaseInstance = createClient(savedUrl, savedKey);
      return supabaseInstance;
    } catch (e) {
      console.error('Failed to init Supabase', e);
      return null;
    }
  }
  return null;
};

export const initSupabase = (url: string, key: string): boolean => {
  try {
    const client = createClient(url, key);
    // Simple verification (optional, can be skipped as client is lazy)
    supabaseInstance = client;
    localStorage.setItem('smd_supabase_url', url);
    localStorage.setItem('smd_supabase_key', key);
    return true;
  } catch (e) {
    console.error('Invalid Supabase Config', e);
    return false;
  }
};

export const clearSupabaseConfig = () => {
  supabaseInstance = null;
  localStorage.removeItem('smd_supabase_url');
  localStorage.removeItem('smd_supabase_key');
};
