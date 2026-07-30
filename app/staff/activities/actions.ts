"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffActivity } from "@/lib/activities/data";
import { isActivityUuid } from "@/lib/activities/types";
import { createContentSlug } from "@/lib/content/slug";
import {
  type ActivityFieldErrors,
  validateActivityForm,
} from "@/lib/activities/validation";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";

export type ActivityActionState = {
  message: string | null;
  fieldErrors?: ActivityFieldErrors;
};

const GENERIC_SAVE_ERROR =
  "The activity could not be saved. Check your entries and try again.";
const GENERIC_PERMISSION_ERROR =
  "Your account is not permitted to perform this activity action.";

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
    return "A matching activity already exists. Please try again.";
  }

  return GENERIC_SAVE_ERROR;
}

export async function createActivityAction(
  _previousState: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
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

  const validation = validateActivityForm(
    formData,
    createContentSlug(formData.get("title")),
  );

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      fieldErrors: validation.errors,
    };
  }

  const { data, error } = await context.supabase
    .from("activities")
    .insert({
      ...validation.data.databaseValues,
      status: intent === "publish" ? "published" : "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { message: databaseErrorMessage(error?.code) };
  }

  revalidatePath("/staff/activities");
  revalidatePath("/");
  redirect(
    intent === "publish"
      ? "/staff/activities?notice=published"
      : "/staff/activities?notice=created",
  );
}

export async function updateActivityAction(
  id: string,
  _previousState: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  void _previousState;
  const context = await getActionContext();

  if (!isActivityUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const intent = formData.get("intent");

  if (!isEditorOrAdmin(context.role)) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  if (intent !== "save" && intent !== "publish") {
    return { message: GENERIC_SAVE_ERROR };
  }

  const existing = await getStaffActivity(context.supabase, id);

  if (!existing) {
    return {
      message: "The activity is unavailable or your account cannot access it.",
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

  const validation = validateActivityForm(formData, existing.slug);

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      fieldErrors: validation.errors,
    };
  }

  const updateValues =
    intent === "publish"
      ? {
          ...validation.data.databaseValues,
          status: "published",
          published_at: null,
        }
      : validation.data.databaseValues;

  const { data, error } = await context.supabase
    .from("activities")
    .update(updateValues)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: databaseErrorMessage(error?.code) };
  }

  revalidatePath("/staff/activities");
  revalidatePath(`/staff/activities/${id}/edit`);
  revalidatePath("/");
  redirect(
    intent === "publish"
      ? "/staff/activities?notice=published"
      : "/staff/activities?notice=updated",
  );
}

export async function archiveActivityAction(
  id: string,
  _previousState: ActivityActionState,
  _formData: FormData,
): Promise<ActivityActionState> {
  void _previousState;
  void _formData;
  const context = await getActionContext();

  if (!isActivityUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  if (context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const existing = await getStaffActivity(context.supabase, id);

  if (!existing) {
    return {
      message: "The activity is unavailable or your account cannot access it.",
    };
  }

  const { data, error } = await context.supabase
    .from("activities")
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/staff/activities");
  revalidatePath("/");
  redirect("/staff/activities?notice=archived");
}

export async function deleteActivityAction(
  id: string,
  _previousState: ActivityActionState,
  _formData: FormData,
): Promise<ActivityActionState> {
  void _previousState;
  void _formData;
  const context = await getActionContext();

  if (!isActivityUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  if (context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const existing = await getStaffActivity(context.supabase, id);

  if (!existing) {
    return {
      message: "The activity is unavailable or your account cannot access it.",
    };
  }

  const { data, error } = await context.supabase
    .from("activities")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/staff/activities");
  revalidatePath("/");
  redirect("/staff/activities?notice=deleted");
}
