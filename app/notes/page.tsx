'use client';

import { useEffect, useState } from 'react';
import { NoteCard } from '@/components/NoteCard';
import Link from 'next/link';

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes');
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch notes');
        }
        const { data } = await res.json();
        setNotes(data);
      } catch (e) {
        setError('노트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">노트 목록</h1>
        <Link 
          href="/notes/new" 
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          새 노트 작성
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
            <p className="text-neutral-500">작성된 노트가 없습니다. 첫 노트를 작성필보세요!</p>
          </div>
        ) : (
          notes.map((n) => (
            <NoteCard 
              key={n.id} 
              id={n.id}
              title={n.title} 
              content={n.content} 
              createdAt={n.created_at}
            />
          ))
        )}
      </div>
    </main>
  );
}
