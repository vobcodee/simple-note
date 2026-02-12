import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

console.log('[MIDDLEWARE] Module loaded');

export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] Request:', request.url);
  
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('[MIDDLEWARE] Session:', session?.user?.id || 'null');
  
  if (sessionError) {
    console.error('[MIDDLEWARE] Session error:', sessionError);
  }

  const user = session?.user;

  // Protected routes - redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/notes') && !user) {
    console.log('[MIDDLEWARE] Redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (request.nextUrl.pathname === '/login' && user) {
    console.log('[MIDDLEWARE] Redirecting to notes');
    return NextResponse.redirect(new URL('/notes', request.url));
  }

  // Add user ID to headers for server actions
  if (user?.id) {
    response.headers.set('x-user-id', user.id);
    console.log('[MIDDLEWARE] Added x-user-id header:', user.id);
  }

  console.log('[MIDDLEWARE] Proceeding');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
