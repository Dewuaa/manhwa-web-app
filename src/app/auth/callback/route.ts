import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();

    if (!supabase) {
      // Supabase not configured, redirect home
      return NextResponse.redirect(`${origin}/`);
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists, create if not
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username:
            data.user.user_metadata?.full_name ||
            data.user.email?.split('@')[0] ||
            'User',
          avatar_url: data.user.user_metadata?.avatar_url || null,
          chapters_read: 0,
          level: 1,
        });
      }
    }
  }

  // Redirect back to home
  return NextResponse.redirect(`${origin}/`);
}
