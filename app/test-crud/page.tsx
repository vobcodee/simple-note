"use client";
import { useState } from "react";
import { createNote, getNotes, updateNote, deleteNote } from "@/lib/db/notes";
import { Note } from "@/types/note";

export default function TestCRUDPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCreate = async () => {
    setLoading(true);
    try {
      const note = await createNote("Test Note", "This is test content");
      addLog(`✅ CREATE: Created note with id ${note.id}`);
      await testRead();
    } catch (error) {
      addLog(`❌ CREATE ERROR: ${error}`);
    }
    setLoading(false);
  };

  const testRead = async () => {
    setLoading(true);
    try {
      const allNotes = await getNotes();
      setNotes(allNotes);
      addLog(`✅ READ: Fetched ${allNotes.length} notes`);
    } catch (error) {
      addLog(`❌ READ ERROR: ${error}`);
    }
    setLoading(false);
  };

  const testUpdate = async (id: string) => {
    setLoading(true);
    try {
      await updateNote(id, "Updated Title", "Updated content");
      addLog(`✅ UPDATE: Updated note ${id}`);
      await testRead();
    } catch (error) {
      addLog(`❌ UPDATE ERROR: ${error}`);
    }
    setLoading(false);
  };

  const testDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteNote(id);
      addLog(`✅ DELETE: Deleted note ${id}`);
      await testRead();
    } catch (error) {
      addLog(`❌ DELETE ERROR: ${error}`);
    }
    setLoading(false);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">CRUD Functions Test</h1>

      <div className="space-y-4 mb-8">
        <button
          onClick={testCreate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test CREATE
        </button>
        <button
          onClick={testRead}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-2"
        >
          Test READ
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Notes ({notes.length})</h2>
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="border p-4 rounded">
              <h3 className="font-semibold">{note.title}</h3>
              <p className="text-sm text-neutral-600">{note.content}</p>
              <p className="text-xs text-neutral-400 mt-2">ID: {note.id}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => testUpdate(note.id)}
                  disabled={loading}
                  className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:opacity-50"
                >
                  Test UPDATE
                </button>
                <button
                  onClick={() => testDelete(note.id)}
                  disabled={loading}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Test DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Test Results</h2>
        <div className="bg-neutral-900 text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
          {testResults.map((result, i) => (
            <div key={i}>{result}</div>
          ))}
        </div>
      </div>
    </main>
  );
}
