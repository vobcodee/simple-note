'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { LogoutButton } from './LogoutButton';

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

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-xl font-bold">Simple Notes</h1>
        <nav className="flex gap-4 text-sm items-center">
          <span className="text-neutral-400">로딩 중...</span>
        </nav>
      </header>
    );
  }

  return (
    <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
      <h1 className="text-xl font-bold">Simple Notes</h1>
      <nav className="flex gap-4 text-sm items-center">
        {user ? (
          <>
            <a href="/notes" className="hover:text-neutral-600 transition-colors">
              노트 목록
            </a>
            <a href="/notes/new" className="text-neutral-900 font-medium hover:underline">
              새 노트
            </a>
            <LogoutButton />
          </>
        ) : (
          <a href="/login" className="text-neutral-900 font-medium hover:underline">
            로그인
          </a>
        )}
      </nav>
    </header>
  );
}
