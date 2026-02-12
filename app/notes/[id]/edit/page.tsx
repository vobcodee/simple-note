'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NoteForm from '@/components/NoteForm';
import { toast } from 'sonner';

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNote() {
      try {
        const userId = localStorage.getItem('dev_user_id');
        
        const headers: HeadersInit = {};
        if (userId) {
          headers['x-dev-user-id'] = userId;
        }
        
        const res = await fetch(`/api/notes/${id}`, { headers });
        
        if (!res.ok) {
          toast.error('노트를 찾을 수 없습니다.');
          router.push('/notes');
          return;
        }
        
        const { data } = await res.json();
        setNote(data);
      } catch (error) {
        console.error(error);
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [id, router]);

  const handleSubmit = async (title: string, content: string) => {
    try {
      const userId = localStorage.getItem('dev_user_id');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (userId) {
        headers['x-dev-user-id'] = userId;
      }
      
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to update note');
      }

      toast.success('노트가 수정되었습니다!');
      router.push('/notes');
    } catch (error: any) {
      toast.error(error.message || '노트 수정 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;
  if (!note) return null;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">노트 수정</h2>
      <NoteForm 
        onSubmit={handleSubmit} 
        initialTitle={note.title} 
        initialContent={note.content}
        buttonText="수정 완료"
      />
    </main>
  );
}
