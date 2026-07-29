import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnvironment } from "./env";

export function createPublicClient() {
  const { url, publishableKey } = getSupabaseEnvironment();

  return createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
