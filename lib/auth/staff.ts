import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export const staffRoles = ["admin", "editor", "viewer"] as const;

export type StaffRole = (typeof staffRoles)[number];

type AuthorizedStaff = {
  status: "authorized";
  staff: {
    displayName: string;
    role: StaffRole;
  };
};

export type StaffAccess =
  | AuthorizedStaff
  | { status: "unauthenticated" }
  | { status: "unauthorized" };

function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === "string" && staffRoles.includes(value as StaffRole);
}

function safeDisplayName(value: unknown) {
  if (typeof value !== "string") {
    return "Staff member";
  }

  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= 100
    ? normalized
    : "Staff member";
}

export async function resolveStaffAccess(
  supabase: SupabaseClient,
): Promise<StaffAccess> {
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const subject = claimsData?.claims.sub;

  if (claimsError || typeof subject !== "string" || subject.length === 0) {
    return { status: "unauthenticated" };
  }

  const { data: roleData, error: roleError } =
    await supabase.rpc("get_my_role");

  if (roleError || !isStaffRole(roleData)) {
    return { status: "unauthorized" };
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", subject)
    .maybeSingle();

  return {
    status: "authorized",
    staff: {
      displayName: safeDisplayName(profileData?.display_name),
      role: roleData,
    },
  };
}

export async function getStaffAccess() {
  const supabase = await createClient();
  return resolveStaffAccess(supabase);
}
