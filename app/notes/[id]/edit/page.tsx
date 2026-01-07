"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import NoteForm from "@/components/NoteForm";
import { getNote, updateNote } from "@/lib/db/notes";
import { Note } from "@/types/note";

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNote() {
      try {
        const data = await getNote(id);
        if (!data) {
          alert("노트를 찾을 수 없습니다.");
          router.push("/notes");
          return;
        }
        setNote(data);
      } catch (error) {
        console.error(error);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [id, router]);

  const handleSubmit = async (title: string, content: string) => {
    await updateNote(id, title, content);
    router.push("/notes");
    router.refresh();
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
