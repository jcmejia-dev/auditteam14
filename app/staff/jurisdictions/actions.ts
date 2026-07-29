"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import { getStaffJurisdiction } from "@/lib/jurisdictions/data";
import { isJurisdictionUuid } from "@/lib/jurisdictions/types";
import {
  type JurisdictionFieldErrors,
  validateJurisdictionForm,
} from "@/lib/jurisdictions/validation";

export type JurisdictionActionState = {
  message: string | null;
  fieldErrors?: JurisdictionFieldErrors;
};

const GENERIC_SAVE_ERROR =
  "The jurisdiction could not be saved. Check the entries and try again.";
const GENERIC_PERMISSION_ERROR =
  "Your account is not permitted to perform this jurisdiction action.";

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

function coordinatesRequired(
  latitude: number | null,
  longitude: number | null,
): JurisdictionActionState | null {
  if (latitude !== null && longitude !== null) {
    return null;
  }

  return {
    message: "Add valid map coordinates before publishing.",
    fieldErrors: {
      latitude: "Latitude is required for a published map location.",
      longitude: "Longitude is required for a published map location.",
    },
  };
}

export async function createJurisdictionAction(
  _previousState: JurisdictionActionState,
  formData: FormData,
): Promise<JurisdictionActionState> {
  void _previousState;
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

  const validation = validateJurisdictionForm(formData);

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      fieldErrors: validation.errors,
    };
  }

  if (intent === "publish") {
    const coordinateError = coordinatesRequired(
      validation.data.databaseValues.latitude,
      validation.data.databaseValues.longitude,
    );

    if (coordinateError) {
      return coordinateError;
    }
  }

  const databaseValues = {
    ...validation.data.databaseValues,
    display_order:
      context.role === "admin"
        ? validation.data.databaseValues.display_order
        : 0,
  };
  const { data, error } = await context.supabase
    .from("jurisdictions")
    .insert({
      ...databaseValues,
      status: intent === "publish" ? "published" : "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/staff/jurisdictions");
  revalidatePath("/");
  redirect(
    intent === "publish"
      ? "/staff/jurisdictions?notice=published"
      : "/staff/jurisdictions?notice=created",
  );
}

export async function updateJurisdictionAction(
  id: string,
  _previousState: JurisdictionActionState,
  formData: FormData,
): Promise<JurisdictionActionState> {
  void _previousState;
  const context = await getActionContext();

  if (!isJurisdictionUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  const intent = formData.get("intent");

  if (!isEditorOrAdmin(context.role)) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  if (intent !== "save" && intent !== "publish") {
    return { message: GENERIC_SAVE_ERROR };
  }

  const existing = await getStaffJurisdiction(context.supabase, id);

  if (!existing) {
    return {
      message:
        "The jurisdiction is unavailable or your account cannot access it.",
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

  const validation = validateJurisdictionForm(formData);

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      fieldErrors: validation.errors,
    };
  }

  if (intent === "publish") {
    const coordinateError = coordinatesRequired(
      validation.data.databaseValues.latitude,
      validation.data.databaseValues.longitude,
    );

    if (coordinateError) {
      return coordinateError;
    }
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
    .from("jurisdictions")
    .update(updateValues)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/staff/jurisdictions");
  revalidatePath(`/staff/jurisdictions/${id}/edit`);
  revalidatePath("/");
  redirect(
    intent === "publish"
      ? "/staff/jurisdictions?notice=published"
      : "/staff/jurisdictions?notice=updated",
  );
}

export async function archiveJurisdictionAction(
  id: string,
  _previousState: JurisdictionActionState,
  _formData: FormData,
): Promise<JurisdictionActionState> {
  void _previousState;
  void _formData;
  const context = await getActionContext();

  if (!isJurisdictionUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  if (context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const existing = await getStaffJurisdiction(context.supabase, id);

  if (!existing) {
    return {
      message:
        "The jurisdiction is unavailable or your account cannot access it.",
    };
  }

  const { data, error } = await context.supabase
    .from("jurisdictions")
    .update({ status: "archived" })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/staff/jurisdictions");
  revalidatePath("/");
  redirect("/staff/jurisdictions?notice=archived");
}

export async function deleteJurisdictionAction(
  id: string,
  _previousState: JurisdictionActionState,
  _formData: FormData,
): Promise<JurisdictionActionState> {
  void _previousState;
  void _formData;
  const context = await getActionContext();

  if (!isJurisdictionUuid(id)) {
    return { message: GENERIC_SAVE_ERROR };
  }

  if (context.role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const existing = await getStaffJurisdiction(context.supabase, id);

  if (!existing) {
    return {
      message:
        "The jurisdiction is unavailable or your account cannot access it.",
    };
  }

  const { data, error } = await context.supabase
    .from("jurisdictions")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/staff/jurisdictions");
  revalidatePath("/");
  redirect("/staff/jurisdictions?notice=deleted");
}
