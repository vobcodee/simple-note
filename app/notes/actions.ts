'use server';

console.log('[SERVER] actions.ts module loaded');

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { NoteSchema, CreateNoteInput, UpdateNoteInput } from '@/schemas/note';

// Helper to get current user from headers (set by middleware)
async function getCurrentUser() {
  console.log('[DEBUG] getCurrentUser called');
  
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  
  console.log('[DEBUG] x-user-id from headers:', userId);
  
  if (!userId) {
    throw new Error('인증이 필요합니다.');
  }

  return { id: userId };
}

// Server-side Supabase client for DB operations
async function getServiceClient() {
  const { createClient } = await import('@supabase/supabase-js');
  
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// CREATE
export async function createNoteAction(input: CreateNoteInput) {
  console.log('[SERVER] createNoteAction called');
  
  try {
    const user = await getCurrentUser();
    console.log('[SERVER] User authenticated:', user.id);
    
    const supabase = await getServiceClient();
    
    // Validate input
    const validated = NoteSchema.omit({ id: true, created_at: true, updated_at: true, user_id: true }).parse(input);
    
    const { data, error } = await supabase
      .from('notes')
      .insert({ 
        ...validated, 
        user_id: user.id 
      })
      .select()
      .single();

    if (error) {
      console.error('[SERVER] DB error:', error);
      throw new Error(`노트 생성 실패: ${error.message}`);
    }

    revalidatePath('/notes');
    return { success: true, data };
  } catch (error) {
    console.error('[SERVER] createNoteAction error:', error);
    throw error;
  }
}

// READ (all notes for current user)
export async function getNotesAction() {
  console.log('[SERVER] getNotesAction called - ENTRY');
  
  try {
    console.log('[SERVER] Calling getCurrentUser...');
    const user = await getCurrentUser();
    console.log('[SERVER] User authenticated:', user.id);
    
    const supabase = await getServiceClient();
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SERVER] DB error:', error);
      throw new Error(`노트 목록 조회 실패: ${error.message}`);
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[SERVER] getNotesAction error:', error);
    throw error;
  }
}

// READ (single note)
export async function getNoteAction(id: string) {
  console.log('[SERVER] getNoteAction called, id:', id);
  
  try {
    const user = await getCurrentUser();
    console.log('[SERVER] User authenticated:', user.id);
    
    const supabase = await getServiceClient();
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { success: true, data: null };
      console.error('[SERVER] DB error:', error);
      throw new Error(`노트 조회 실패: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('[SERVER] getNoteAction error:', error);
    throw error;
  }
}

// UPDATE
export async function updateNoteAction(id: string, input: UpdateNoteInput) {
  console.log('[SERVER] updateNoteAction called, id:', id);
  
  try {
    const user = await getCurrentUser();
    console.log('[SERVER] User authenticated:', user.id);
    
    const supabase = await getServiceClient();
    
    // Validate input
    const validated = NoteSchema.omit({ id: true, created_at: true, updated_at: true, user_id: true }).parse(input);
    
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
      console.error('[SERVER] DB error:', error);
      throw new Error(`노트 수정 실패: ${error.message}`);
    }

    revalidatePath('/notes');
    revalidatePath(`/notes/${id}/edit`);
    return { success: true, data };
  } catch (error) {
    console.error('[SERVER] updateNoteAction error:', error);
    throw error;
  }
}

// DELETE
export async function deleteNoteAction(id: string) {
  console.log('[SERVER] deleteNoteAction called, id:', id);
  
  try {
    const user = await getCurrentUser();
    console.log('[SERVER] User authenticated:', user.id);
    
    const supabase = await getServiceClient();
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[SERVER] DB error:', error);
      throw new Error(`노트 삭제 실패: ${error.message}`);
    }

    revalidatePath('/notes');
    return { success: true };
  } catch (error) {
    console.error('[SERVER] deleteNoteAction error:', error);
    throw error;
  }
}
