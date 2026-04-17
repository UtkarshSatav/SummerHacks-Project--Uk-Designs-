import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Support both legacy ANON_KEY and new PUBLISHABLE_KEY naming
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}
