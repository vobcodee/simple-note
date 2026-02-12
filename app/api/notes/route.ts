import { NextRequest, NextResponse } from 'next/server';

// Helper to get user ID from header (for development)
function getUserId(request: NextRequest): string {
  const userId = request.headers.get('x-dev-user-id');
  if (userId) return userId;
  
  // Fallback to env or default
  return process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000';
}

// GET /api/notes - List all notes
export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// POST /api/notes - Create a note
export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  
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
    .insert({ title, content, user_id: userId })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
