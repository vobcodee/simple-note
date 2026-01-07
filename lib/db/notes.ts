import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/types/note";

// CREATE
export async function createNote(title: string, content: string): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .insert({ title, content })
    .select()
    .single();

  if (error) {
    console.error("Error creating note:", error);
    throw new Error(`노트 생성 실패: ${error.message}`);
  }
  return data as Note;
}

// READ (all)
export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    throw new Error(`노트 목록 조회 실패: ${error.message}`);
  }
  return (data as Note[]) || [];
}

// READ (single)
export async function getNote(id: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error(`Error fetching note ${id}:`, error);
    throw new Error(`노트 조회 실패: ${error.message}`);
  }
  return data as Note;
}

// UPDATE
export async function updateNote(id: string, title: string, content: string): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating note ${id}:`, error);
    throw new Error(`노트 수정 실패: ${error.message}`);
  }
  return data as Note;
}

// DELETE
export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting note ${id}:`, error);
    throw new Error(`노트 삭제 실패: ${error.message}`);
  }
}
