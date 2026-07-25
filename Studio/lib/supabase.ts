import { createClient } from "@supabase/supabase-js";

// Client de servidor com poder total (service role) — ignora RLS
// USAR SÓ em API routes e Server Components, NUNCA no browser
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);