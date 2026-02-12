import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// TODO: Fix auth before production!
// Currently using hardcoded user ID for development
const DEV_USER_ID = process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000';

// Helper to get user (currently returns hardcoded user for development)
async function getUser() {
  // TEMPORARY: Skip auth check for development
  // In production, use: const { data: { user } } = await supabase.auth.getUser();
  console.log('[WARNING] Using hardcoded user ID for development:', DEV_USER_ID);
  return { id: DEV_USER_ID };
}

// GET /api/notes - List all notes
export async function GET(request: NextRequest) {
  const user = await getUser();
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// POST /api/notes - Create a note
export async function POST(request: NextRequest) {
  const user = await getUser();
  
  const body = await request.json();
  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('notes')
    .insert({ title, content, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
