import { redirect } from "next/navigation";

import { getStaffAccess } from "@/lib/auth/staff";

export default async function StaffPortalPage() {
  const access = await getStaffAccess();

  if (access.status === "authorized") {
    redirect("/staff/dashboard");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  redirect("/staff/login");
}
