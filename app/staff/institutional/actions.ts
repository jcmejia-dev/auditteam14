"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getStaffContext } from "@/lib/auth/staff";
import { INSTITUTIONAL_SETTING_KEY } from "@/lib/institutional/types";
import {
  type InstitutionalFieldErrors,
  validateInstitutionalInformation,
} from "@/lib/institutional/validation";

export type InstitutionalActionState = {
  message: string | null;
  fieldErrors?: InstitutionalFieldErrors;
};

const GENERIC_SAVE_ERROR =
  "The institutional information could not be saved. Review the fields and try again.";
const GENERIC_PERMISSION_ERROR =
  "Your account is not permitted to perform this institutional information action.";

export async function saveInstitutionalInformationAction(
  _previousState: InstitutionalActionState,
  formData: FormData,
): Promise<InstitutionalActionState> {
  void _previousState;
  const { access, supabase } = await getStaffContext();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  const intent = formData.get("intent");
  const role = access.staff.role;

  if (
    (role !== "admin" && role !== "editor") ||
    (intent !== "draft" && intent !== "publish")
  ) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  if (intent === "publish" && role !== "admin") {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  const validation = validateInstitutionalInformation(formData);

  if (!validation.success) {
    return {
      message: "Review the highlighted fields before saving.",
      fieldErrors: validation.errors,
    };
  }

  const { data: existing, error: readError } = await supabase
    .from("site_settings")
    .select("status")
    .eq("setting_key", INSTITUTIONAL_SETTING_KEY)
    .maybeSingle();

  if (readError) {
    return { message: GENERIC_SAVE_ERROR };
  }

  if (
    role === "editor" &&
    existing &&
    existing.status !== "draft"
  ) {
    return { message: GENERIC_PERMISSION_ERROR };
  }

  if (
    role === "admin" &&
    existing?.status === "published" &&
    intent === "draft"
  ) {
    return {
      message:
        "Use Update Published Information to keep the public page available.",
    };
  }

  const values = {
    public_value: validation.information,
    is_public: intent === "publish",
    status: intent === "publish" ? "published" : "draft",
    published_at: null,
  };

  const mutation = existing
    ? supabase
        .from("site_settings")
        .update(values)
        .eq("setting_key", INSTITUTIONAL_SETTING_KEY)
    : supabase.from("site_settings").insert({
        setting_key: INSTITUTIONAL_SETTING_KEY,
        display_order: 0,
        ...values,
      });
  const { data, error } = await mutation.select("id").maybeSingle();

  if (error || !data) {
    return { message: GENERIC_SAVE_ERROR };
  }

  revalidatePath("/");
  revalidatePath("/staff/institutional");
  redirect(
    intent === "publish"
      ? "/staff/institutional?notice=published"
      : "/staff/institutional?notice=saved",
  );
}

