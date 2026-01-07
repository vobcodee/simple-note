"use client";
import { useState } from "react";

type NoteFormProps = {
  onSubmit: (title: string, content: string) => Promise<void>;
  initialTitle?: string;
  initialContent?: string;
  buttonText?: string;
};

export default function NoteForm({ 
  onSubmit, 
  initialTitle = "", 
  initialContent = "",
  buttonText = "저장" 
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(title, content);
    } catch (error) {
      console.error("Form submission error:", error);
      alert("노트 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="w-full border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="제목 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
        required
      />

      <textarea
        className="w-full border border-neutral-300 rounded-lg p-3 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="내용 입력"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
        required
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
      >
        {isSubmitting ? "처리 중..." : buttonText}
      </button>
    </form>
  );
}
