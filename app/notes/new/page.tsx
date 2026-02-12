"use client";

import NoteForm from "@/components/NoteForm";
import { createNoteAction } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewNotePage() {
  const router = useRouter();

  const handleSubmit = async (title: string, content: string) => {
    try {
      const result = await createNoteAction({ title, content });
      
      if (result.success) {
        toast.success("노트가 생성되었습니다!");
        router.push("/notes");
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("노트 생성 중 오류가 발생했습니다.");
      throw error;
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">새 노트 작성</h2>
      <NoteForm onSubmit={handleSubmit} />
    </main>
  );
}
