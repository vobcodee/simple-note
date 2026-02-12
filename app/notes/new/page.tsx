'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NoteForm from '@/components/NoteForm';
import { toast } from 'sonner';

export default function NewNotePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (title: string, content: string) => {
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to create note');
      }

      toast.success('노트가 생성되었습니다!');
      router.push('/notes');
    } catch (error: any) {
      toast.error(error.message || '노트 생성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">새 노트 작성</h2>
      <NoteForm onSubmit={handleSubmit} />
    </main>
  );
}
