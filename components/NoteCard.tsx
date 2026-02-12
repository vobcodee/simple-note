'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

type NoteCardProps = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export function NoteCard({ id, title, content, createdAt }: NoteCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("정말로 이 노트를 삭제하시겠습니까?")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to delete note');
      }

      toast.success("노트가 삭제되었습니다.");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="border border-neutral-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-white flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h2 className="font-bold text-lg text-neutral-900 line-clamp-1">{title}</h2>
          <span className="text-xs text-neutral-400 whitespace-nowrap ml-2">{formattedDate}</span>
        </div>
        <p className="text-sm text-neutral-600 line-clamp-3 mb-4">{content}</p>
      </div>
      
      <div className="flex justify-between items-center pt-2 border-t border-neutral-50 mt-auto">
        <Link
          href={`/notes/${id}/edit`}
          className="text-xs text-neutral-500 hover:text-black font-medium transition-colors"
        >
          수정
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </div>
  );
}
