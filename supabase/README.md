# Supabase Database Setup

This directory contains SQL migrations for setting up the database schema.

## Migrations

### 001_create_notes_table.sql
Creates the main `notes` table with:
- `id` (UUID, primary key, auto-generated)
- `title` (text, required)
- `content` (text, optional)
- `created_at` (timestamp, auto-set)
- `updated_at` (timestamp, auto-set)

Also creates an index on `created_at` for optimized sorting.

### 002_create_rls_policies.sql
Sets up Row Level Security (RLS) policies:
- Enables RLS on the notes table
- Creates policies for SELECT, INSERT, UPDATE, DELETE
- Currently allows public access (no authentication required)

## How to Apply Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `001_create_notes_table.sql`
5. Click **Run** to execute
6. Repeat steps 3-5 for `002_create_rls_policies.sql`

## Verification

After running migrations, verify in the **Table Editor**:
- ✅ `notes` table exists
- ✅ RLS is enabled (green lock icon)
- ✅ Index `notes_created_at_idx` exists

## Testing

Visit `/test-crud` in your Next.js app to test all CRUD operations:
- Create notes
- Read all notes
- Update specific notes
- Delete notes

## Production Considerations

⚠️ **Security Warning**: Current RLS policies allow public access without authentication.

For production, consider implementing user-based policies:

```sql
-- Example: User-specific access
create policy "Users can only access their own notes"
on public.notes for all
using (auth.uid() = user_id);
```

You would need to add a `user_id` column to the notes table for this approach.
