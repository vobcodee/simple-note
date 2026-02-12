import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/notes';

  console.log('[CALLBACK] Received callback, code exists:', !!code);
  console.log('[CALLBACK] Origin:', origin);
  console.log('[CALLBACK] Next URL:', next);

  if (!code) {
    console.error('[CALLBACK] No code provided');
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  try {
    const cookieStore = await cookies();
    const initialCookies = cookieStore.getAll().map(c => c.name);
    console.log('[CALLBACK] Initial cookies:', initialCookies);
    
    // Create response first to set cookies on it
    const response = NextResponse.redirect(`${origin}${next}`);
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            console.log('[CALLBACK] Setting cookies:', cookiesToSet.map(c => c.name));
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set on both cookieStore and response
              cookieStore.set(name, value, options);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    console.log('[CALLBACK] Exchanging code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    console.log('[CALLBACK] Exchange result:', { 
      success: !error, 
      error: error?.message,
      hasSession: !!data.session,
      user: data.session?.user?.email 
    });
    
    if (error) {
      console.error('[CALLBACK] Exchange error:', error);
      return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
    }

    if (!data.session) {
      console.error('[CALLBACK] No session returned');
      return NextResponse.redirect(`${origin}/login?error=no_session`);
    }

    console.log('[CALLBACK] Success! Redirecting to:', next);
    return response;
    
  } catch (e) {
    console.error('[CALLBACK] Exception:', e);
    return NextResponse.redirect(`${origin}/login?error=exception`);
  }
}
