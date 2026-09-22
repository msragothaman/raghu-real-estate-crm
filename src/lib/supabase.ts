import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Normalize Supabase Project URL (strip trailing slashes, /rest/v1, etc.)
export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let clean = rawUrl.trim();
  clean = clean.replace(/\/+$/, '');
  clean = clean.replace(/\/rest\/v1$/i, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

// Retrieve credentials from environment or localStorage
export function getSupabaseCredentials() {
  const envUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  let storedUrl = '';
  let storedKey = '';
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      storedUrl = normalizeSupabaseUrl(localStorage.getItem('raghu_crm_supabase_url') || '');
      storedKey = (localStorage.getItem('raghu_crm_supabase_key') || '').trim();
    }
  } catch (e) {}

  const isPlaceholderUrl = (u: string) =>
    !u || u.includes('your-project') || !u.startsWith('http');
  const isPlaceholderKey = (k: string) => !k || k.includes('your-anon');

  let url = '';
  let key = '';

  // Check stored credentials first if they are valid
  if (!isPlaceholderUrl(storedUrl) && !isPlaceholderKey(storedKey)) {
    url = storedUrl;
    key = storedKey;
  } else if (!isPlaceholderUrl(envUrl) && !isPlaceholderKey(envKey)) {
    url = envUrl;
    key = envKey;
  }

  const isConfigured = Boolean(
    url && key && url.startsWith('http') && !isPlaceholderUrl(url) && !isPlaceholderKey(key)
  );

  return { url, key, isConfigured };
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
