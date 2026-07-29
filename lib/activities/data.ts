import type { SupabaseClient } from "@supabase/supabase-js";

import { createPublicClient } from "@/lib/supabase/public";

import {
  activityPublicationStatuses,
  type ActivityPublicationStatus,
  type ActivityRecord,
  type PublicActivityRecord,
} from "./types";

type DatabaseActivity = {
  id: unknown;
  title: unknown;
  slug: unknown;
  summary: unknown;
  body: unknown;
  activity_date: unknown;
  location_text: unknown;
  status: unknown;
  published_at: unknown;
  display_order: unknown;
  created_at: unknown;
  updated_at: unknown;
};

type DatabasePublicActivity = {
  title: unknown;
  slug: unknown;
  summary: unknown;
  activity_date: unknown;
  location_text: unknown;
  published_at: unknown;
};

function isPublicationStatus(
  value: unknown,
): value is ActivityPublicationStatus {
  return (
    typeof value === "string" &&
    activityPublicationStatuses.includes(value as ActivityPublicationStatus)
  );
}

function nullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizeActivity(value: DatabaseActivity): ActivityRecord | null {
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.slug !== "string" ||
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
    body: nullableString(value.body),
    activityDate: nullableString(value.activity_date),
    locationText: nullableString(value.location_text),
    status: value.status,
    publishedAt: nullableString(value.published_at),
    displayOrder: value.display_order,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}

function normalizePublicActivity(
  value: DatabasePublicActivity,
): PublicActivityRecord | null {
  if (typeof value.title !== "string" || typeof value.slug !== "string") {
    return null;
  }

  return {
    title: value.title,
    slug: value.slug,
    summary: nullableString(value.summary),
    activityDate: nullableString(value.activity_date),
    locationText: nullableString(value.location_text),
    publishedAt: nullableString(value.published_at),
  };
}

const staffColumns =
  "id,title,slug,summary,body,activity_date,location_text,status,published_at,display_order,created_at,updated_at";
const publicColumns =
  "title,slug,summary,activity_date,location_text,published_at";

export async function getStaffActivities(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("activities")
    .select(staffColumns)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    return { activities: [], error: true };
  }

  const activities = (data ?? [])
    .map((item) => normalizeActivity(item as DatabaseActivity))
    .filter((item): item is ActivityRecord => item !== null);

  return { activities, error: false };
}

export async function getStaffActivity(
  supabase: SupabaseClient,
  id: string,
) {
  const { data, error } = await supabase
    .from("activities")
    .select(staffColumns)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeActivity(data as DatabaseActivity);
}

export async function getLatestPublicActivities() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("activities")
    .select(publicColumns)
    .eq("status", "published")
    .order("activity_date", { ascending: false, nullsFirst: false })
    .order("published_at", { ascending: false })
    .limit(3);

  if (error) {
    return [];
  }

  return (data ?? [])
    .map((item) => normalizePublicActivity(item as DatabasePublicActivity))
    .filter((item): item is PublicActivityRecord => item !== null);
}
