'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { NoteSchema, CreateNoteInput, UpdateNoteInput } from '@/schemas/note';

// Server-side Supabase client (uses service role key, not exposed to client)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper to get current user from session (to be implemented with Supabase Auth)
async function getCurrentUser() {
  // This will be implemented when we add authentication
  // For now, return a mock user ID for testing
  // TODO: Replace with actual auth.getUser() call
  return { id: process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000' };
}

// CREATE
export async function createNoteAction(input: CreateNoteInput) {
  try {
    // Validate input
    const validated = NoteSchema.omit({ id: true, created_at: true, updated_at: true }).parse(input);
    
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('notes')
      .insert({ 
        ...validated, 
        user_id: user.id 
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw new Error(`노트 생성 실패: ${error.message}`);
    }

    revalidatePath('/notes');
    return { success: true, data };
  } catch (error) {
    console.error('Create note action error:', error);
    throw error;
  }
}

// READ (all notes for current user)
export async function getNotesAction() {
  try {
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      throw new Error(`노트 목록 조회 실패: ${error.message}`);
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get notes action error:', error);
    throw error;
  }
}

// READ (single note)
export async function getNoteAction(id: string) {
  try {
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { success: true, data: null };
      console.error(`Error fetching note ${id}:`, error);
      throw new Error(`노트 조회 실패: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Get note action error:', error);
    throw error;
  }
}

// UPDATE
export async function updateNoteAction(id: string, input: UpdateNoteInput) {
  try {
    // Validate input
    const validated = NoteSchema.omit({ id: true, created_at: true, updated_at: true }).parse(input);
    
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('notes')
      .update({ 
        ...validated, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating note ${id}:`, error);
      throw new Error(`노트 수정 실패: ${error.message}`);
    }

    revalidatePath('/notes');
    revalidatePath(`/notes/${id}/edit`);
    return { success: true, data };
  } catch (error) {
    console.error('Update note action error:', error);
    throw error;
  }
}

// DELETE
export async function deleteNoteAction(id: string) {
  try {
    const user = await getCurrentUser();
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error(`Error deleting note ${id}:`, error);
      throw new Error(`노트 삭제 실패: ${error.message}`);
    }

    revalidatePath('/notes');
    return { success: true };
  } catch (error) {
    console.error('Delete note action error:', error);
    throw error;
  }
}
