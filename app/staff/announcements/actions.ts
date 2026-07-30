"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffAnnouncement } from "@/lib/announcements/data";
import { isUuid } from "@/lib/announcements/types";
import { createContentSlug } from "@/lib/content/slug";
import {
  expirationAllowsPublishing,
  type AnnouncementFieldErrors,
  validateAnnouncementForm,
} from "@/lib/announcements/validation";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";

export type AnnouncementActionState = {
  message: string | null;
  fieldErrors?: AnnouncementFieldErrors;
};

const GENERIC_SAVE_ERROR =
  "The announcement could not be saved. Check your entries and try again.";
const GENERIC_PERMISSION_ERROR =
  "Your account is not permitted to perform this announcement action.";

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
    return "A matching announcement already exists. Please try again.";
  }

  return GENERIC_SAVE_ERROR;
}

export async function createAnnouncementAction(
  _previousState: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
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

  const validation = validateAnnouncementForm(
    formData,
    createContentSlug(formData.get("title")),
  );

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      fieldErrors: validation.errors,
    };
  }

  if (
    intent === "publish" &&
    !expirationAllowsPublishing(validation.data.databaseValues.expires_at)
  ) {
    return {
      message: "Review the highlighted fields before publishing.",
      fieldErrors: {
        expiresOn: "Published announcements need a future expiration date.",
      },
    };
  }

  const { data, error } = await context.supabase
    .from("announcements")
    .insert({
      ...validation.data.databaseValues,
      status: intent === "publish" ? "published" : "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { message: databaseErrorMessage(error?.code) };
  }

  revalidatePath("/staff/announcements");
  revalidatePath("/");
  redirect(
    intent === "publish"
      ? "/staff/announcements?notice=published"
      : "/staff/announcements?notice=created",
  );
}

export async function updateAnnouncementAction(
  id: string,
  _previousState: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  void _previousState;

  if (!isUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const context = await getActionContext();
  const intent = formData.get("intent");

  if (!isEditorOrAdmin(context.role)) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  if (intent !== "save" && intent !== "publish") {
    return { message: GENERIC_SAVE_ERROR };
  }

  const existing = await getStaffAnnouncement(context.supabase, id);

  if (!existing) {
    return {
      message:
        "The announcement is unavailable or your account cannot access it.",
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

  const validation = validateAnnouncementForm(formData, existing.slug);

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      fieldErrors: validation.errors,
    };
  }

  if (
    intent === "publish" &&
    !expirationAllowsPublishing(validation.data.databaseValues.expires_at)
  ) {
    return {
      message: "Review the highlighted fields before publishing.",
      fieldErrors: {
        expiresOn: "Published announcements need a future expiration date.",
      },
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
    .from("announcements")
    .update(updateValues)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: databaseErrorMessage(error?.code) };
  }

  revalidatePath("/staff/announcements");
  revalidatePath(`/staff/announcements/${id}/edit`);
  revalidatePath("/");
  redirect(
    intent === "publish"
      ? "/staff/announcements?notice=published"
      : "/staff/announcements?notice=updated",
  );
}

export async function archiveAnnouncementAction(
  id: string,
  _previousState: AnnouncementActionState,
  _formData: FormData,
): Promise<AnnouncementActionState> {
  void _previousState;
  void _formData;

  if (!isUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const context = await getActionContext();

  if (context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const existing = await getStaffAnnouncement(context.supabase, id);

  if (!existing) {
    return {
      message:
        "The announcement is unavailable or your account cannot access it.",
    };
  }

  const { data, error } = await context.supabase
    .from("announcements")
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/staff/announcements");
  revalidatePath("/");
  redirect("/staff/announcements?notice=archived");
}

export async function deleteAnnouncementAction(
  id: string,
  _previousState: AnnouncementActionState,
  _formData: FormData,
): Promise<AnnouncementActionState> {
  void _previousState;
  void _formData;

  if (!isUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const context = await getActionContext();

  if (context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const existing = await getStaffAnnouncement(context.supabase, id);

  if (!existing) {
    return {
      message:
        "The announcement is unavailable or your account cannot access it.",
    };
  }

  const { data, error } = await context.supabase
    .from("announcements")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/staff/announcements");
  revalidatePath("/");
  redirect("/staff/announcements?notice=deleted");
}
