'use server';

console.log('[SERVER] actions.ts module loaded');

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { NoteSchema, CreateNoteInput, UpdateNoteInput } from '@/schemas/note';

// Helper to get current user from session using SSR
async function getCurrentUser() {
  console.log('[DEBUG] getCurrentUser called');
  
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('[DEBUG] Cookies count:', allCookies.length);
    console.log('[DEBUG] Cookie names:', allCookies.map(c => c.name));
    
    // Find the auth token cookie (sb-*-auth-token pattern)
    const authCookie = allCookies.find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
    console.log('[DEBUG] Auth cookie found:', authCookie?.name || 'none');
    
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

// Server-side Supabase client for DB operations with service role
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
