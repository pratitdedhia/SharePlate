import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from './env.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  supabaseClient = createClient(config.supabase.url, config.supabase.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  if (config.supabase.serviceRoleKey) {
    supabaseAdminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
}

export const getSupabase = (): SupabaseClient => {
  if (!supabaseClient) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment.');
  }
  return supabaseClient;
};

export const getSupabaseAdmin = (): SupabaseClient => {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }
  return getSupabase();
};
