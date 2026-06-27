# Supabase Setup

1. Create a Supabase project.
2. Open the SQL editor and run [`schema.sql`](./schema.sql).
3. Copy `.env.example` to `.env.local`.
4. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
5. Restart `npm run dev`.

The app uses a server-only admin client for this first slice, so the fridge and shopping list work before auth is fully wired. Once auth is added, the RLS policies in `schema.sql` are already in place for authenticated household members.
