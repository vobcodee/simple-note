'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error('로그아웃 중 오류가 발생했습니다.');
        console.error('Logout error:', error);
        return;
      }

      toast.success('로그아웃되었습니다.');
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-neutral-500 hover:text-red-500 transition-colors"
    >
      로그아웃
    </button>
  );
}
