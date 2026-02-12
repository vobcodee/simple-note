'use client';

import { useState, useEffect } from 'react';

export default function DevAuthPage() {
  const [userId, setUserId] = useState('');
  const [savedId, setSavedId] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('dev_user_id');
    if (saved) {
      setSavedId(saved);
      setUserId(saved);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('dev_user_id', userId);
    setSavedId(userId);
    alert('User ID가 저장되었습니다!');
  };

  const handleClear = () => {
    localStorage.removeItem('dev_user_id');
    setSavedId('');
    setUserId('');
    alert('User ID가 초기화되었습니다!');
  };

  return (
    <main className="max-w-md mx-auto p-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-bold text-yellow-800 mb-2">⚠️ 개발용 인증 설정</h2>
        <p className="text-sm text-yellow-700">
          이 페이지는 개발 중에만 사용됩니다.
          <br />
          Supabase Dashboard에서 user ID를 확인하고 입력하세요.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            User ID (UUID)
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="00000000-0000-0000-0000-000000000000"
            className="w-full border border-neutral-300 rounded-lg p-3 font-mono text-sm"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Supabase Dashboard → Authentication → Users 에서 확인
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-black text-white rounded-lg p-3 hover:bg-neutral-800"
          >
            저장
          </button>
          <button
            onClick={handleClear}
            className="px-4 border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            초기화
          </button>
        </div>

        {savedId && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ 현재 저장된 User ID:
              <br />
              <span className="font-mono">{savedId}</span>
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <a
            href="/notes"
            className="block w-full text-center bg-blue-500 text-white rounded-lg p-3 hover:bg-blue-600"
          >
            노트 목록으로 이동 →
          </a>
        </div>
      </div>
    </main>
  );
}
