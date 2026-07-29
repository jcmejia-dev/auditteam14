import type { SupabaseClient } from "@supabase/supabase-js";

import { createPublicClient } from "@/lib/supabase/public";

import {
  publicationStatuses,
  type AnnouncementRecord,
  type PublicationStatus,
} from "./types";

type DatabaseAnnouncement = {
  id: unknown;
  title: unknown;
  slug: unknown;
  summary: unknown;
  body: unknown;
  is_featured: unknown;
  status: unknown;
  published_at: unknown;
  expires_at: unknown;
  display_order: unknown;
  created_at: unknown;
  updated_at: unknown;
};

function isPublicationStatus(value: unknown): value is PublicationStatus {
  return (
    typeof value === "string" &&
    publicationStatuses.includes(value as PublicationStatus)
  );
}

function nullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizeAnnouncement(
  value: DatabaseAnnouncement,
): AnnouncementRecord | null {
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.body !== "string" ||
    typeof value.is_featured !== "boolean" ||
    !isPublicationStatus(value.status) ||
    typeof value.display_order !== "number" ||
    typeof value.created_at !== "string" ||
    typeof value.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    slug: value.slug,
    summary: nullableString(value.summary),
    body: value.body,
    isFeatured: value.is_featured,
    status: value.status,
    publishedAt: nullableString(value.published_at),
    expiresAt: nullableString(value.expires_at),
    displayOrder: value.display_order,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}

const staffColumns =
  "id,title,slug,summary,body,is_featured,status,published_at,expires_at,display_order,created_at,updated_at";

export async function getStaffAnnouncements(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("announcements")
    .select(staffColumns)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    return { announcements: [], error: true };
  }

  const announcements = (data ?? [])
    .map((item) => normalizeAnnouncement(item as DatabaseAnnouncement))
    .filter((item): item is AnnouncementRecord => item !== null);

  return { announcements, error: false };
}

export async function getStaffAnnouncement(
  supabase: SupabaseClient,
  id: string,
) {
  const { data, error } = await supabase
    .from("announcements")
    .select(staffColumns)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeAnnouncement(data as DatabaseAnnouncement);
}

export async function getLatestPublicAnnouncements() {
  const supabase = createPublicClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("announcements")
    .select(staffColumns)
    .eq("status", "published")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(3);

  if (error) {
    return [];
  }

  return (data ?? [])
    .map((item) => normalizeAnnouncement(item as DatabaseAnnouncement))
    .filter((item): item is AnnouncementRecord => item !== null);
}
