'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { NoteSchema, CreateNoteInput, UpdateNoteInput } from '@/schemas/note';

// Helper to get current user from session
export async function getCurrentUser() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('인증이 필요합니다.');
  }

  return { id: user.id };
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
  try {
    const user = await getCurrentUser();
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
    const supabase = await getServiceClient();
    
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
    const supabase = await getServiceClient();
    
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
    const user = await getCurrentUser();
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
    const supabase = await getServiceClient();
    
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
