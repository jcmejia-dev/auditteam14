"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffTeamMember } from "@/lib/team/data";
import { isTeamMemberUuid } from "@/lib/team/types";
import {
  type TeamMemberFieldErrors,
  validateTeamMemberForm,
} from "@/lib/team/validation";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";

export type TeamMemberActionState = {
  message: string | null;
  fieldErrors?: TeamMemberFieldErrors;
};

const GENERIC_SAVE_ERROR =
  "The team member could not be saved. Check the entries and try again.";
const GENERIC_PERMISSION_ERROR =
  "Your account is not permitted to perform this team action.";

async function getActionContext() {
  const context = await getStaffContext();

  if (context.access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (context.access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  return {
    role: context.access.staff.role,
    supabase: context.supabase,
  };
}

function isEditorOrAdmin(role: StaffRole) {
  return role === "admin" || role === "editor";
}

function databaseErrorMessage(code: string | undefined) {
  if (code === "23505") {
    return "That web address name is already in use. Choose another slug.";
  }

  return GENERIC_SAVE_ERROR;
}

export async function createTeamMemberAction(
  _previousState: TeamMemberActionState,
  formData: FormData,
): Promise<TeamMemberActionState> {
  const context = await getActionContext();
  const intent = formData.get("intent");

  if (!isEditorOrAdmin(context.role)) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  if (intent !== "draft" && intent !== "publish") {
    return { message: GENERIC_SAVE_ERROR };
  }

  if (intent === "publish" && context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const validation = validateTeamMemberForm(formData);

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      fieldErrors: validation.errors,
    };
  }

  const databaseValues = {
    ...validation.data.databaseValues,
    display_order:
      context.role === "admin"
        ? validation.data.databaseValues.display_order
        : 0,
  };
  const { data, error } = await context.supabase
    .from("team_members")
    .insert({
      ...databaseValues,
      status: intent === "publish" ? "published" : "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { message: databaseErrorMessage(error?.code) };
  }

  revalidatePath("/staff/team");
  revalidatePath("/");
  redirect(
    intent === "publish"
      ? "/staff/team?notice=published"
      : "/staff/team?notice=created",
  );
}

export async function updateTeamMemberAction(
  id: string,
  _previousState: TeamMemberActionState,
  formData: FormData,
): Promise<TeamMemberActionState> {
  void _previousState;
  const context = await getActionContext();

  if (!isTeamMemberUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const intent = formData.get("intent");

  if (!isEditorOrAdmin(context.role)) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  if (intent !== "save" && intent !== "publish") {
    return { message: GENERIC_SAVE_ERROR };
  }

  const existing = await getStaffTeamMember(context.supabase, id);

  if (!existing) {
    return {
      message:
        "The team member is unavailable or your account cannot access it.",
    };
  }

  if (
    context.role === "editor" &&
    (existing.status !== "draft" || intent !== "save")
  ) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  if (intent === "publish" && context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const validation = validateTeamMemberForm(formData);

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      fieldErrors: validation.errors,
    };
  }

  const databaseValues = {
    ...validation.data.databaseValues,
    display_order:
      context.role === "admin"
        ? validation.data.databaseValues.display_order
        : existing.displayOrder,
  };
  const updateValues =
    intent === "publish"
      ? {
          ...databaseValues,
          status: "published",
          published_at: null,
        }
      : databaseValues;

  const { data, error } = await context.supabase
    .from("team_members")
    .update(updateValues)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: databaseErrorMessage(error?.code) };
  }

  revalidatePath("/staff/team");
  revalidatePath(`/staff/team/${id}/edit`);
  revalidatePath("/");
  redirect(
    intent === "publish"
      ? "/staff/team?notice=published"
      : "/staff/team?notice=updated",
  );
}

export async function archiveTeamMemberAction(
  id: string,
  _previousState: TeamMemberActionState,
  _formData: FormData,
): Promise<TeamMemberActionState> {
  void _previousState;
  void _formData;
  const context = await getActionContext();

  if (!isTeamMemberUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  if (context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const existing = await getStaffTeamMember(context.supabase, id);

  if (!existing) {
    return {
      message:
        "The team member is unavailable or your account cannot access it.",
    };
  }

  const { data, error } = await context.supabase
    .from("team_members")
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/staff/team");
  revalidatePath("/");
  redirect("/staff/team?notice=archived");
}

export async function deleteTeamMemberAction(
  id: string,
  _previousState: TeamMemberActionState,
  _formData: FormData,
): Promise<TeamMemberActionState> {
  void _previousState;
  void _formData;
  const context = await getActionContext();

  if (!isTeamMemberUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  if (context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const existing = await getStaffTeamMember(context.supabase, id);

  if (!existing) {
    return {
      message:
        "The team member is unavailable or your account cannot access it.",
    };
  }

  const { data, error } = await context.supabase
    .from("team_members")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/staff/team");
  revalidatePath("/");
  redirect("/staff/team?notice=deleted");
}
