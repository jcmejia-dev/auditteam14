import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { TeamMemberForm } from "@/components/staff/team-member-form";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";

import { createTeamMemberAction } from "../actions";

export const metadata: Metadata = {
  title: "New Team Member",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export default async function NewTeamMemberPage() {
  const { access } = await getStaffContext();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  if (access.staff.role === "viewer") {
    redirect("/staff/team");
  }

  return (
    <div className="min-h-screen bg-cream">
      <StaffPortalHeader
        displayName={access.staff.displayName}
        roleLabel={roleLabels[access.staff.role]}
      />
      <main className="page-shell py-9 sm:py-12">
        <nav aria-label="Staff breadcrumbs">
          <Link
            href="/staff/team"
            className="font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            Back to Team Members
          </Link>
        </nav>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section
            aria-labelledby="new-team-member-heading"
            className="border border-navy-900/10 bg-white p-6 shadow-[0_16px_40px_rgba(16,42,67,0.07)] sm:p-9"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              Public content
            </p>
            <h1
              id="new-team-member-heading"
              className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
            >
              New Team Member
            </h1>
            <p className="mt-3 mb-8 max-w-2xl text-lg leading-8 text-slate-600">
              Enter only approved professional information intended for public
              release.
            </p>
            <TeamMemberForm
              action={createTeamMemberAction}
              mode="create"
              role={access.staff.role}
            />
          </section>

          <aside className="h-fit border-t-4 border-gold-500 bg-navy-900 p-6 text-white lg:sticky lg:top-6">
            <h2 className="font-display text-2xl font-bold">
              Before publishing
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-navy-100">
              <li>Confirm the public name and official position.</li>
              <li>Use approved biography wording only.</li>
              <li>Do not include contact details or personal information.</li>
              <li>Editors may save drafts; only administrators may publish.</li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}
