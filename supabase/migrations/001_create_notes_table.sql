-- Create notes table
create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create index for faster sorting by creation date
create index if not exists notes_created_at_idx
on public.notes (created_at desc);

-- Add comment for documentation
comment on table public.notes is 'Stores user notes with title and content';
