import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

console.log('[MIDDLEWARE] Module loaded');

export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] Request:', request.url);
  
  let response = NextResponse.next({
    request,
  });

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

  // IMPORTANT: First call getSession() to set auth cookie
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('[MIDDLEWARE] Session:', session?.user?.id || 'null', 'Error:', sessionError?.message || 'none');

  // Then call getUser()
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('[MIDDLEWARE] User:', user?.id || 'null', 'Error:', userError?.message || 'none');

  // Protected routes - redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/notes') && !user) {
    console.log('[MIDDLEWARE] Redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (request.nextUrl.pathname === '/login' && user) {
    console.log('[MIDDLEWARE] Redirecting to notes');
    return NextResponse.redirect(new URL('/notes', request.url));
  }

  console.log('[MIDDLEWARE] Proceeding');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
