import type { SupabaseClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "audit-team-14-media";

export async function isMediaStorageReady(
  supabase: SupabaseClient,
  albumId: string,
) {
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list(albumId, { limit: 1 });

  return !error;
}
