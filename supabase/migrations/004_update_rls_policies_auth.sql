-- Update RLS policies to use user-based authentication

-- Drop existing public policies
drop policy if exists "Enable read for all" on public.notes;
drop policy if exists "Enable insert for all" on public.notes;
drop policy if exists "Enable update for all" on public.notes;
drop policy if exists "Enable delete for all" on public.notes;

-- Create user-based policies
create policy "Users can read own notes"
on public.notes for select
using (auth.uid() = user_id);

create policy "Users can insert own notes"
on public.notes for insert
with check (auth.uid() = user_id);

create policy "Users can update own notes"
on public.notes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own notes"
on public.notes for delete
using (auth.uid() = user_id);

-- Note: These policies require authentication
-- Users can only access their own notes based on user_id
