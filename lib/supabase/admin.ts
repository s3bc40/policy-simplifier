// lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";
// 'server-only' is a Next.js optimization to ensure this is never bundled for the client
import "server-only";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  throw new Error(
    "Missing Supabase URL or Service Role Key environment variables."
  );
}

// This client uses the service key and bypasses RLS for administrative tasks (like usage tracking).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);
