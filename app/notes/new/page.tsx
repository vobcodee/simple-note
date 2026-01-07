"use client";

import NoteForm from "@/components/NoteForm";
import { createNote } from "@/lib/db/notes";
import { useRouter } from "next/navigation";

export default function NewNotePage() {
  const router = useRouter();

  const handleSubmit = async (title: string, content: string) => {
    await createNote(title, content);
    router.push("/notes");
    router.refresh();
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">새 노트 작성</h2>
      <NoteForm onSubmit={handleSubmit} />
    </main>
  );
}
