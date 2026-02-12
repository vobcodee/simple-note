'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('로그인 처리 중...');

  useEffect(() => {
    const processAuth = async () => {
      // Check for hash-based auth (Magic Link)
      const hash = window.location.hash;
      console.log('[CALLBACK PAGE] Hash:', hash);

      if (hash && hash.includes('access_token')) {
        console.log('[CALLBACK PAGE] Processing hash-based auth');
        
        try {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          console.log('[CALLBACK PAGE] Tokens:', { 
            hasAccessToken: !!accessToken 
          });

          if (accessToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (error) {
              console.error('[CALLBACK PAGE] setSession error:', error);
              setStatus('로그인 실패: ' + error.message);
              setTimeout(() => router.push('/login?error=session'), 2000);
              return;
            }

            console.log('[CALLBACK PAGE] Success, user:', data.user?.email);
            setStatus('로그인 성공! 이동 중...');
            
            // Force full page reload to ensure cookies are set
            window.location.href = '/notes';
            return;
          }
        } catch (e) {
          console.error('[CALLBACK PAGE] Error:', e);
          setStatus('로그인 처리 중 오류');
          setTimeout(() => router.push('/login?error=unknown'), 2000);
          return;
        }
      }

      // Check for query-based auth (if Supabase uses code)
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');

      if (code) {
        console.log('[CALLBACK PAGE] Processing code-based auth');
        
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('[CALLBACK PAGE] exchangeCodeForSession error:', error);
            setStatus('로그인 실패: ' + error.message);
            setTimeout(() => router.push('/login?error=exchange'), 2000);
            return;
          }

          console.log('[CALLBACK PAGE] Code exchange success');
          setStatus('로그인 성공! 이동 중...');
          window.location.href = '/notes';
          return;
        } catch (e) {
          console.error('[CALLBACK PAGE] Code exchange error:', e);
          setStatus('로그인 처리 중 오류');
          setTimeout(() => router.push('/login?error=exception'), 2000);
          return;
        }
      }

      console.log('[CALLBACK PAGE] No auth tokens found');
      setStatus('인증 정보가 없습니다.');
      setTimeout(() => router.push('/login?error=no_token'), 2000);
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
