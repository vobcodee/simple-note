-- Add user_id column to notes table for authentication
alter table public.notes
add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Create index for faster user-specific queries
create index if not exists notes_user_id_idx
on public.notes (user_id);

-- Backfill existing notes with a default user (if any exist)
-- Note: In production, you might want to handle existing data differently
-- update public.notes set user_id = '00000000-0000-0000-0000-000000000000' where user_id is null;

-- Add comment for documentation
comment on column public.notes.user_id is 'Reference to the auth.users table';
