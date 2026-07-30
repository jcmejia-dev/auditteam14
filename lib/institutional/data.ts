import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createPublicClient } from "@/lib/supabase/public";

import {
  fallbackInstitutionalInformation,
  INSTITUTIONAL_SETTING_KEY,
  normalizeInstitutionalInformation,
} from "./types";

export async function getPublicInstitutionalInformation() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("public_value")
    .eq("setting_key", INSTITUTIONAL_SETTING_KEY)
    .eq("is_public", true)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return fallbackInstitutionalInformation;
  }

  return (
    normalizeInstitutionalInformation(data.public_value) ??
    fallbackInstitutionalInformation
  );
}

export async function getStaffInstitutionalInformation(
  supabase: SupabaseClient,
) {
  const { data, error } = await supabase
    .from("site_settings")
    .select("public_value,status")
    .eq("setting_key", INSTITUTIONAL_SETTING_KEY)
    .maybeSingle();

  if (error) {
    return {
      error: true,
      exists: false,
      status: null,
      information: fallbackInstitutionalInformation,
    } as const;
  }

  return {
    error: false,
    exists: Boolean(data),
    status:
      data?.status === "draft" ||
      data?.status === "published" ||
      data?.status === "archived"
        ? data.status
        : null,
    information:
      normalizeInstitutionalInformation(data?.public_value) ??
      fallbackInstitutionalInformation,
  } as const;
}
