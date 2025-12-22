import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
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

      // If this is an email verification (signup confirmation), redirect to verified page
      if (type === 'signup' || type === 'email') {
        return NextResponse.redirect(`${origin}/auth/verified`);
      }
    }
  }

  // Redirect back to home for other cases (OAuth, magic link, etc.)
  return NextResponse.redirect(`${origin}/`);
}

