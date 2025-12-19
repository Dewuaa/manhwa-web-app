import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase credentials not configured. Comments feature will be disabled.',
    );
    return null;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton instance for client-side
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;
let instanceChecked = false;

export function getSupabaseClient() {
  if (!instanceChecked) {
    supabaseInstance = createClient();
    instanceChecked = true;
  }
  return supabaseInstance;
}
