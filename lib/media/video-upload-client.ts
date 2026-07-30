import { getSupabaseEnvironment } from "@/lib/supabase/env";

export function getVideoTusEndpoint() {
  const { url } = getSupabaseEnvironment();
  const projectUrl = new URL(url);
  const hostnameParts = projectUrl.hostname.split(".");
  const projectRef = hostnameParts[0];

  if (
    projectUrl.protocol !== "https:" ||
    !projectUrl.hostname.endsWith(".supabase.co") ||
    !/^[a-z0-9-]+$/.test(projectRef)
  ) {
    throw new Error(
      "Direct video uploads require the standard secure Supabase project hostname.",
    );
  }

  return `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`;
}
