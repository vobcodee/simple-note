'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { NoteSchema, CreateNoteInput, UpdateNoteInput } from '@/schemas/note';

// Simple test action
export async function testAction() {
  console.log('[SERVER] testAction called');
  return { success: true, message: 'Server action is working' };
}

// Helper to get current user from session
async function getCurrentUser() {
  console.log('[DEBUG] getCurrentUser called');
  
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('[DEBUG] Cookies count:', allCookies.length);
    console.log('[DEBUG] Cookie names:', allCookies.map(c => c.name));
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return allCookies;
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    console.log('[DEBUG] Supabase client created');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[DEBUG] Session:', session?.user?.id || 'null', 'Error:', sessionError?.message || 'none');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    console.log('[DEBUG] getUser result:', { user: user?.id, error: error?.message });
    
    if (error) {
      console.error('[DEBUG] Auth error:', error);
      throw new Error('인증이 필요합니다. (Error: ' + error.message + ')');
    }
    
    if (!user) {
      console.error('[DEBUG] No user found');
      throw new Error('인증이 필요합니다. (No user)');
    }

    return { id: user.id };
  } catch (e) {
    console.error('[DEBUG] getCurrentUser exception:', e);
    throw e;
  }
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
  console.log('[DEBUG] getNotesAction called');
  
  try {
    const user = await getCurrentUser();
    console.log('[DEBUG] User authenticated:', user.id);
    
    const supabase = await getServiceClient();
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DEBUG] DB error:', error);
      throw new Error(`노트 목록 조회 실패: ${error.message}`);
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[DEBUG] getNotesAction error:', error);
    throw error;
  }
}

// READ (single note)
export async function getNoteAction(id: string) {
  console.log('[DEBUG] getNoteAction called, id:', id);
  
  try {
    const user = await getCurrentUser();
    console.log('[DEBUG] User authenticated:', user.id);
    
    const supabase = await getServiceClient();
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { success: true, data: null };
      console.error('[DEBUG] DB error:', error);
      throw new Error(`노트 조회 실패: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('[DEBUG] getNoteAction error:', error);
    throw error;
  }
}

// UPDATE
export async function updateNoteAction(id: string, input: UpdateNoteInput) {
  console.log('[DEBUG] updateNoteAction called, id:', id);
  
  try {
    const user = await getCurrentUser();
    console.log('[DEBUG] User authenticated:', user.id);
    
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
      console.error('[DEBUG] DB error:', error);
      throw new Error(`노트 수정 실패: ${error.message}`);
    }

    revalidatePath('/notes');
    revalidatePath(`/notes/${id}/edit`);
    return { success: true, data };
  } catch (error) {
    console.error('[DEBUG] updateNoteAction error:', error);
    throw error;
  }
}

// DELETE
export async function deleteNoteAction(id: string) {
  console.log('[DEBUG] deleteNoteAction called, id:', id);
  
  try {
    const user = await getCurrentUser();
    console.log('[DEBUG] User authenticated:', user.id);
    
    const supabase = await getServiceClient();
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[DEBUG] DB error:', error);
      throw new Error(`노트 삭제 실패: ${error.message}`);
    }

    revalidatePath('/notes');
    return { success: true };
  } catch (error) {
    console.error('[DEBUG] deleteNoteAction error:', error);
    throw error;
  }
}
