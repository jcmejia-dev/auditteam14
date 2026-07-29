import type { SupabaseClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "audit-team-14-media";
export const VIDEO_BUCKET = "audit-team-14-videos";
export const VIDEO_SIGNED_URL_SECONDS = 30 * 60;
export const STAFF_VIDEO_PREVIEW_SECONDS = 10 * 60;

export async function isMediaStorageReady(
  supabase: SupabaseClient,
  albumId: string,
) {
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list(albumId, { limit: 1 });

  return !error;
}

export async function isVideoStorageReady(supabase: SupabaseClient) {
  const { error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .list("", { limit: 1 });

  return !error;
}

export function isReservedVideoStoragePath(value: string) {
  return /^([0-9a-f]{32})\/\1\.(mp4|webm)$/i.test(
    value,
  );
}

export async function verifyStoredVideoObject(
  supabase: SupabaseClient,
  storagePath: string,
) {
  if (!isReservedVideoStoragePath(storagePath)) {
    return false;
  }

  const expectedContentType = storagePath.endsWith(".mp4")
    ? "video/mp4"
    : "video/webm";
  const { data, error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .info(storagePath);

  return Boolean(
    !error &&
      data &&
      data.bucketId === VIDEO_BUCKET &&
      data.name === storagePath &&
      data.contentType === expectedContentType &&
      typeof data.size === "number" &&
      data.size > 0 &&
      data.size <= 52_428_800,
  );
}
