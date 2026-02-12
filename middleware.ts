import { NextResponse, type NextRequest } from 'next/server';

// TEMPORARY: Auth checks disabled for development
// TODO: Re-enable before production!

export async function middleware(request: NextRequest) {
  // Skip all auth checks for now
  return NextResponse.next({ request });
}

export const config = {
  matcher: [], // Disable middleware entirely
};
