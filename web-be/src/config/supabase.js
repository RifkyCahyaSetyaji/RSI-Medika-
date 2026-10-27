import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Supabase client untuk sisi server.
 * Menggunakan SERVICE ROLE KEY -> bypass RLS. JANGAN pernah expose key ini ke frontend.
 */
export const supabase =
  env.supabase.url && env.supabase.serviceRoleKey
    ? createClient(env.supabase.url, env.supabase.serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase belum dikonfigurasi. Cek SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY di .env');
  }
  return supabase;
}
