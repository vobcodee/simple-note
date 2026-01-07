export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-3xl font-bold mb-4">Simple Notes에 오신 것을 환영합니다</h2>
      <p className="text-neutral-600 mb-8">간단하고 효율적인 노트 관리</p>
      <div className="flex gap-4">
        <a
          href="/notes"
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition"
        >
          노트 목록 보기
        </a>
        <a
          href="/notes/new"
          className="border border-black px-6 py-3 rounded-lg hover:bg-neutral-50 transition"
        >
          새 노트 작성
        </a>
      </div>
    </main>
  );
}
