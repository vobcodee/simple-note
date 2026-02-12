"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error("로그인 링크 발송 실패: " + error.message);
    } else {
      toast.success("이메일로 로그인 링크를 발송했습니다!");
      setSent(true);
    }

    setLoading(false);
  };

  if (sent) {
    return (
      <main className="max-w-md mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">📧 확인하세요!</h2>
        <p className="text-neutral-600">
          <strong>{email}</strong>로 로그인 링크를 발송했습니다.<br />
          이메일을 확인하고 링크를 클릭하면 로그인됩니다.
        </p>
        <p className="mt-4 text-sm text-neutral-400">
          이메일이 안 보이면 스팸함을 확인해주세요.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Simple Notes</h2>
        <p className="text-neutral-500">로그인하여 노트를 관리하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            이메일 주소
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-black text-white rounded-lg p-3 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "전송 중..." : "로그인 링크 받기"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-500">
          비밀번호 없이 이메일로 간편하게 로그인하세요.<br />
          로그인 링크가 이메일로 발송됩니다.
        </p>
      </div>
    </main>
  );
}
