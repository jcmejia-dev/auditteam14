import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { TeamMemberStatusBadge } from "@/components/staff/team-member-status-badge";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import { getStaffTeamMembers } from "@/lib/team/data";
import { getTeamMemberInitials } from "@/lib/team/types";

export const metadata: Metadata = {
  title: "Manage Team",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

const notices: Record<string, string> = {
  archived: "The team member was archived.",
  created: "The team member draft was saved.",
  deleted: "The team member was deleted.",
  published: "The team member was published.",
  updated: "The team member changes were saved.",
};

export default async function StaffTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { access, supabase } = await getStaffContext();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  const { teamMembers, error } = await getStaffTeamMembers(supabase);
  const requestedNotice = (await searchParams).notice;
  const noticeKey =
    typeof requestedNotice === "string" ? requestedNotice : undefined;
  const notice = noticeKey ? notices[noticeKey] : undefined;
  const canCreate =
    access.staff.role === "admin" || access.staff.role === "editor";

  return (
    <div className="min-h-screen bg-cream">
      <StaffPortalHeader
        displayName={access.staff.displayName}
        roleLabel={roleLabels[access.staff.role]}
      />
      <main className="page-shell py-9 sm:py-12">
        <nav aria-label="Staff breadcrumbs">
          <Link
            href="/staff/dashboard"
            className="font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            Dashboard
          </Link>
        </nav>

        <section aria-labelledby="team-heading" className="mt-7">
          <div className="flex flex-col gap-6 border-b border-navy-900/10 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
                Public content
              </p>
              <h1
                id="team-heading"
                className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
              >
                Team Members
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
                Maintain approved public names, official positions,
                biographies, publication state, and display order.
              </p>
            </div>
            {canCreate ? (
              <Link
                href="/staff/team/new"
                className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-6 py-3 font-bold text-white shadow-sm hover:bg-navy-900"
              >
                Add Team Member
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center rounded-full border border-navy-900/15 bg-white px-5 py-2 font-bold text-navy-700">
                Read-only access
              </span>
            )}
          </div>

          {notice ? (
            <p
              role="status"
              className="mt-6 border-l-4 border-teal-700 bg-teal-100 px-5 py-4 font-semibold text-navy-900"
            >
              {notice}
            </p>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-7 border-l-4 border-patriot-red bg-red-50 px-5 py-5"
            >
              <h2 className="font-display text-2xl font-bold text-navy-900">
                Team information is temporarily unavailable
              </h2>
              <p className="mt-2 leading-7 text-slate-700">
                Please refresh the page or try again later.
              </p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="mt-7 border border-navy-900/10 bg-white px-6 py-10 text-center shadow-[0_14px_35px_rgba(16,42,67,0.06)] sm:px-10">
              <h2 className="font-display text-3xl font-bold text-navy-900">
                No team records yet
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                {canCreate
                  ? "Create a draft after a team member’s public information is approved."
                  : "There are no team-member records available to view."}
              </p>
            </div>
          ) : (
            <div className="mt-7 grid gap-5">
              {teamMembers.map((member) => {
                const editorCanEdit =
                  access.staff.role === "editor" &&
                  member.status === "draft";
                const canEdit =
                  access.staff.role === "admin" || editorCanEdit;

                return (
                  <article
                    key={member.id}
                    className="border border-navy-900/10 bg-white p-6 shadow-[0_12px_30px_rgba(16,42,67,0.06)] sm:p-7"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="flex min-w-0 gap-5">
                        <div className="grid size-16 shrink-0 place-items-center rounded-full bg-navy-900 font-display text-xl font-bold text-gold-200">
                          {getTeamMemberInitials(member.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <TeamMemberStatusBadge status={member.status} />
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                              Order {member.displayOrder}
                            </span>
                          </div>
                          <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
                            {member.name}
                          </h2>
                          <p className="mt-2 font-bold text-teal-700">
                            {member.positionTitle}
                          </p>
                          {member.biography ? (
                            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                              {member.biography}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <Link
                        href={`/staff/team/${member.id}/edit`}
                        className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-sm border border-teal-700 px-5 py-3 font-bold text-teal-700 hover:bg-teal-700 hover:text-white"
                      >
                        {canEdit ? "Open and Edit" : "View Details"}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
