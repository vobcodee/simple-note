-- Enable Row Level Security
alter table public.notes enable row level security;

-- Create policy: Enable read access for all users
create policy "Enable read for all"
on public.notes for select
using (true);

-- Create policy: Enable insert for all users
create policy "Enable insert for all"
on public.notes for insert
with check (true);

-- Create policy: Enable update for all users
create policy "Enable update for all"
on public.notes for update
using (true);

-- Create policy: Enable delete for all users
create policy "Enable delete for all"
on public.notes for delete
using (true);

-- Note: These policies allow public access without authentication
-- For production, consider implementing user-based policies with auth.uid()
