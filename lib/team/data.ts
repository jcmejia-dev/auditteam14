import type { SupabaseClient } from "@supabase/supabase-js";

import { createPublicClient } from "@/lib/supabase/public";

import {
  teamPublicationStatuses,
  type PublicTeamMemberRecord,
  type TeamMemberRecord,
  type TeamPublicationStatus,
} from "./types";

type DatabaseTeamMember = {
  id: unknown;
  name: unknown;
  slug: unknown;
  position_title: unknown;
  biography: unknown;
  photo_path: unknown;
  status: unknown;
  published_at: unknown;
  display_order: unknown;
  created_at: unknown;
  updated_at: unknown;
};

type DatabasePublicTeamMember = {
  name: unknown;
  slug: unknown;
  position_title: unknown;
  biography: unknown;
  photo_path: unknown;
};

function isPublicationStatus(
  value: unknown,
): value is TeamPublicationStatus {
  return (
    typeof value === "string" &&
    teamPublicationStatuses.includes(value as TeamPublicationStatus)
  );
}

function nullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizeTeamMember(
  value: DatabaseTeamMember,
): TeamMemberRecord | null {
  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.position_title !== "string" ||
    !isPublicationStatus(value.status) ||
    typeof value.display_order !== "number" ||
    typeof value.created_at !== "string" ||
    typeof value.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    positionTitle: value.position_title,
    biography: nullableString(value.biography),
    photoPath: nullableString(value.photo_path),
    status: value.status,
    publishedAt: nullableString(value.published_at),
    displayOrder: value.display_order,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}

function normalizePublicTeamMember(
  value: DatabasePublicTeamMember,
): PublicTeamMemberRecord | null {
  if (
    typeof value.name !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.position_title !== "string"
  ) {
    return null;
  }

  return {
    name: value.name,
    slug: value.slug,
    positionTitle: value.position_title,
    biography: nullableString(value.biography),
    photoPath: value.photo_path === "/logo2.png" ? value.photo_path : null,
  };
}

const staffColumns =
  "id,name,slug,position_title,biography,photo_path,status,published_at,display_order,created_at,updated_at";
const publicColumns =
  "name,slug,position_title,biography,photo_path";

export async function getStaffTeamMembers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("team_members")
    .select(staffColumns)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(100);

  if (error) {
    return { teamMembers: [], error: true };
  }

  const teamMembers = (data ?? [])
    .map((item) => normalizeTeamMember(item as DatabaseTeamMember))
    .filter((item): item is TeamMemberRecord => item !== null);

  return { teamMembers, error: false };
}

export async function getStaffTeamMember(
  supabase: SupabaseClient,
  id: string,
) {
  const { data, error } = await supabase
    .from("team_members")
    .select(staffColumns)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeTeamMember(data as DatabaseTeamMember);
}

export async function getPublishedTeamMembers() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("team_members")
    .select(publicColumns)
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(24);

  if (error) {
    return [];
  }

  return (data ?? [])
    .map((item) =>
      normalizePublicTeamMember(item as DatabasePublicTeamMember),
    )
    .filter((item): item is PublicTeamMemberRecord => item !== null);
}
