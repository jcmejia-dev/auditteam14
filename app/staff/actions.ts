"use server";

import { redirect } from "next/navigation";

import { resolveStaffAccess } from "@/lib/auth/staff";
import { createClient } from "@/lib/supabase/server";

const GENERIC_LOGIN_ERROR =
  "We could not sign you in with those credentials. Check your details and try again.";

export type LoginActionState = {
  message: string | null;
};

function readCredentials(formData: FormData) {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  if (typeof emailValue !== "string" || typeof passwordValue !== "string") {
    return null;
  }

  const email = emailValue.trim().toLowerCase();
  const password = passwordValue;
  const emailLooksValid =
    email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordLooksValid = password.length > 0 && password.length <= 1024;

  if (!emailLooksValid || !passwordLooksValid) {
    return null;
  }

  return { email, password };
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const credentials = readCredentials(formData);

  if (!credentials) {
    return { message: GENERIC_LOGIN_ERROR };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword(
    credentials,
  );

  if (signInError) {
    return { message: GENERIC_LOGIN_ERROR };
  }

  const access = await resolveStaffAccess(supabase);

  if (access.status === "unauthenticated") {
    await supabase.auth.signOut({ scope: "local" });
    return { message: GENERIC_LOGIN_ERROR };
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  redirect("/staff/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();

  await supabase.auth.getClaims();
  await supabase.auth.signOut({ scope: "local" });

  redirect("/staff/login");
}
