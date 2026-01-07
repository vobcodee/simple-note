import { supabase } from "@/lib/supabaseClient";

export default async function TestPage() {
  const { data, error } = await supabase.rpc("now"); // NOW() 실행

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Supabase Test</h1>

      {error && (
        <div className="text-red-500 mt-4">Error: {error.message}</div>
      )}

      {data && (
        <div className="mt-4">
          <p>Connected! Server time:</p>
          <p className="font-mono text-lg mt-2">{JSON.stringify(data)}</p>
        </div>
      )}
    </main>
  );
}
