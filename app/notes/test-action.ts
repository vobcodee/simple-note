'use server';

import { cookies } from 'next/headers';

export async function testAuthAction() {
  console.log('[TEST] Action called');
  
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  console.log('[TEST] All cookies:', allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));
  
  const authCookie = allCookies.find(c => c.name.includes('auth') || c.name.includes('sb-'));
  
  return {
    success: true,
    cookieCount: allCookies.length,
    hasAuthCookie: !!authCookie,
    authCookieName: authCookie?.name || null,
  };
}
