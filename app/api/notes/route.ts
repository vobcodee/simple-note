import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Helper to get authenticated user from cookie
async function getUser() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.getAll().find(c => 
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  if (!authCookie?.value) {
    return null;
  }

  try {
    // Decode the auth cookie (base64 JSON array)
    const decoded = Buffer.from(authCookie.value, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    
    if (Array.isArray(parsed) && parsed.length >= 1) {
      const accessToken = parsed[0];
      // Decode JWT payload
      const base64Payload = accessToken.split('.')[1];
      const padding = '='.repeat((4 - base64Payload.length % 4) % 4);
      const payload = JSON.parse(Buffer.from(base64Payload + padding, 'base64').toString('utf-8'));
      
      return { id: payload.sub, email: payload.email };
    }
  } catch (e) {
    console.error('Failed to parse auth:', e);
  }

  return null;
}

// GET /api/notes - List all notes
export async function GET(request: NextRequest) {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

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
