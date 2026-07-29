import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { QuickActionCard } from "@/components/staff/quick-action-card";
import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { getStaffAccess, type StaffRole } from "@/lib/auth/staff";

export const metadata: Metadata = {
  title: "Dashboard",
};

const quickActions = [
  {
    title: "Add Announcement",
    description: "Create a public announcement draft for review and approval.",
    icon: "announcement",
    href: "/staff/announcements/new",
  },
  {
    title: "Add Activity",
    description: "Create an approved public activity draft for review.",
    icon: "activity",
    href: "/staff/activities/new",
  },
  {
    title: "Manage Team",
    description: "Maintain approved public names, positions, and biographies.",
    icon: "team",
    href: "/staff/team",
  },
  {
    title: "Manage Jurisdiction",
    description: "Review confirmed jurisdiction information before publication.",
    icon: "map",
  },
  {
    title: "Manage Media",
    description: "Organize approved photos and videos after uploads are enabled.",
    icon: "media",
  },
  {
    title: "Audit History",
    description: "Review authorized administrative events in a future release.",
    icon: "history",
  },
] as const;

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export default async function StaffDashboardPage() {
  const access = await getStaffAccess();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  const { displayName, role } = access.staff;

  return (
    <div className="min-h-screen bg-cream">
      <StaffPortalHeader
        displayName={displayName}
        roleLabel={roleLabels[role]}
      />
      <main className="page-shell py-10 sm:py-14">
        <section aria-labelledby="dashboard-heading">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            Staff dashboard
          </p>
          <h1
            id="dashboard-heading"
            className="mt-3 max-w-3xl font-display text-4xl font-bold text-navy-900 sm:text-5xl"
          >
            Welcome, {displayName}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Your secure workspace provides role-based access to approved
            content tools. Features still in development are marked as
            upcoming.
          </p>
          <div className="mt-6 inline-flex min-h-11 items-center rounded-full border border-teal-700/20 bg-teal-100 px-5 py-2 font-bold text-teal-700">
            Active role: {roleLabels[role]}
          </div>
        </section>

        <section
          aria-labelledby="quick-actions-heading"
          className="mt-12 border-t border-navy-900/10 pt-10"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
                Simple tools
              </p>
              <h2
                id="quick-actions-heading"
                className="mt-2 font-display text-3xl font-bold text-navy-900"
              >
                Quick actions
              </h2>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href="/staff/announcements"
                className="inline-flex min-h-11 items-center font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
              >
                Manage Announcements
              </Link>
              <Link
                href="/staff/activities"
                className="inline-flex min-h-11 items-center font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
              >
                Manage Activities
              </Link>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.title}
                {...action}
                href={
                  "href" in action &&
                  (role !== "viewer" || action.icon === "team")
                    ? action.href
                    : undefined
                }
                statusLabel={
                  (action.icon === "announcement" ||
                    action.icon === "activity") &&
                  role === "viewer"
                    ? "Read-only role"
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
