import { NextResponse, type NextRequest } from 'next/server';

console.log('[MIDDLEWARE] Module loaded');

// Parse Supabase auth token from cookie
function parseAuthToken(cookieValue: string): { access_token: string; refresh_token?: string } | null {
  try {
    console.log('[MIDDLEWARE] Raw cookie length:', cookieValue.length);
    console.log('[MIDDLEWARE] Raw cookie preview:', cookieValue.substring(0, 50));
    
    // Try to decode base64
    let decoded: string;
    try {
      decoded = atob(cookieValue);
    } catch (e) {
      console.log('[MIDDLEWARE] atob failed, trying Buffer');
      // For Node.js environment
      decoded = Buffer.from(cookieValue, 'base64').toString('utf-8');
    }
    
    console.log('[MIDDLEWARE] Decoded:', decoded.substring(0, 100));
    
    const parsed = JSON.parse(decoded);
    console.log('[MIDDLEWARE] Parsed type:', typeof parsed, 'isArray:', Array.isArray(parsed));
    
    if (Array.isArray(parsed) && parsed.length >= 1) {
      return {
        access_token: parsed[0],
        refresh_token: parsed[1],
      };
    }
    return null;
  } catch (e) {
    console.error('[MIDDLEWARE] Failed to parse auth cookie:', e);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] Request:', request.url);
  
  // Find auth cookie
  const cookies = request.cookies.getAll();
  console.log('[MIDDLEWARE] All cookies:', cookies.map(c => c.name));
  
  const authCookie = cookies.find(c => 
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );
  
  console.log('[MIDDLEWARE] Auth cookie found:', authCookie?.name || 'none');
  
  let isAuthenticated = false;
  let userId: string | null = null;
  
  if (authCookie?.value) {
    const tokens = parseAuthToken(authCookie.value);
    console.log('[MIDDLEWARE] Parsed tokens:', { 
      hasAccess: !!tokens?.access_token,
      hasRefresh: !!tokens?.refresh_token 
    });
    
    if (tokens?.access_token) {
      isAuthenticated = true;
      // Decode JWT to get user ID
      try {
        const base64Payload = tokens.access_token.split('.')[1];
        // Add padding if needed
        const padding = '='.repeat((4 - base64Payload.length % 4) % 4);
        const payload = JSON.parse(atob(base64Payload + padding));
        userId = payload.sub || null;
        console.log('[MIDDLEWARE] Decoded userId from token:', userId);
      } catch (e) {
        console.error('[MIDDLEWARE] Failed to decode token:', e);
      }
    }
  }
  
  console.log('[MIDDLEWARE] Auth status:', { isAuthenticated, userId });

  // Protected routes - redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/notes') && !isAuthenticated) {
    console.log('[MIDDLEWARE] Redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (request.nextUrl.pathname === '/login' && isAuthenticated) {
    console.log('[MIDDLEWARE] Redirecting to notes');
    return NextResponse.redirect(new URL('/notes', request.url));
  }

  // Add user ID to headers for server actions
  const response = NextResponse.next({ request });
  if (userId) {
    response.headers.set('x-user-id', userId);
  }

  console.log('[MIDDLEWARE] Proceeding');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
