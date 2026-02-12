console.log('[PAGE] notes/page.tsx module loading');

import { NoteCard } from "@/components/NoteCard";
import { getNotesAction } from "./actions";
import Link from "next/link";

export const revalidate = 0;

export default async function NotesPage() {
  console.log('[PAGE] NotesPage component rendering');
  
  let notes: any[] = [];
  
  try {
    console.log('[PAGE] Calling getNotesAction...');
    const result = await getNotesAction();
    console.log('[PAGE] getNotesAction result:', result);
    notes = result.data;
  } catch (e) {
    console.error('[PAGE] Error:', e);
    throw e;
  }

  console.log('[PAGE] Rendering with', notes.length, 'notes');

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
