'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('로그인 처리 중...');

  useEffect(() => {
    const processAuth = async () => {
      console.log('[CALLBACK] Starting auth process');

      // Wait a bit for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('[CALLBACK] Session check:', { 
        hasSession: !!session, 
        error: sessionError?.message 
      });

      if (session) {
        console.log('[CALLBACK] Session found, user:', session.user.email);
        setStatus('로그인 성공! 이동 중...');
        window.location.href = '/notes';
        return;
      }

      // If no session, check for hash-based auth (fallback)
      const hash = window.location.hash;
      console.log('[CALLBACK] Hash:', hash);

      if (hash && hash.includes('access_token')) {
        console.log('[CALLBACK] Processing hash-based auth');
        
        try {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (error) {
              console.error('[CALLBACK] setSession error:', error);
              setStatus('로그인 실패: ' + error.message);
              setTimeout(() => router.push('/login?error=session'), 2000);
              return;
            }

            console.log('[CALLBACK] Session set, user:', data.user?.email);
            setStatus('로그인 성공! 이동 중...');
            window.location.href = '/notes';
            return;
          }
        } catch (e) {
          console.error('[CALLBACK] Hash processing error:', e);
        }
      }

      // Check for query params (code-based auth)
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');

      if (code) {
        console.log('[CALLBACK] Processing code-based auth');
        
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('[CALLBACK] exchangeCodeForSession error:', error);
            setStatus('로그인 실패: ' + error.message);
            setTimeout(() => router.push('/login?error=exchange'), 2000);
            return;
          }

          console.log('[CALLBACK] Code exchange success');
          setStatus('로그인 성공! 이동 중...');
          window.location.href = '/notes';
          return;
        } catch (e) {
          console.error('[CALLBACK] Code exchange error:', e);
        }
      }

      // Listen for auth state changes
      console.log('[CALLBACK] Setting up auth state listener');
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('[CALLBACK] Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          setStatus('로그인 성공! 이동 중...');
          window.location.href = '/notes';
        }
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        console.log('[CALLBACK] Timeout - no auth detected');
        setStatus('인증 정보를 찾을 수 없습니다.');
        subscription.unsubscribe();
        setTimeout(() => router.push('/login?error=no_auth'), 2000);
      }, 5000);

      return () => {
        subscription.unsubscribe();
      };
    };

    processAuth();
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-4xl mb-4">⏳</div>
        <h2 className="text-xl font-bold mb-2">{status}</h2>
        <p className="text-neutral-500 text-sm">
          잠시만 기다려주세요...
        </p>
      </div>
    </main>
  );
}
