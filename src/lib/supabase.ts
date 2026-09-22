import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment or localStorage
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const storedUrl = localStorage.getItem('raghu_crm_supabase_url') || '';
  const storedKey = localStorage.getItem('raghu_crm_supabase_key') || '';

  const url = storedUrl || envUrl;
  const key = storedKey || envKey;

  return { url, key, isConfigured: Boolean(url && key && url.startsWith('http')) };
}

export function createSupabaseInstance(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  try {
    return createClient(url, key);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export const supabase = createSupabaseInstance();
