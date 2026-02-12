import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

console.log('[MIDDLEWARE] Module loaded');

export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] Request:', request.url);
  
  let supabaseResponse = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('[MIDDLEWARE] User:', user?.id || 'null');

  // Protected routes - redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/notes') && !user) {
    console.log('[MIDDLEWARE] Redirecting to login');
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (request.nextUrl.pathname === '/login' && user) {
    console.log('[MIDDLEWARE] Redirecting to notes');
    const redirectUrl = new URL('/notes', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  console.log('[MIDDLEWARE] Proceeding');
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
