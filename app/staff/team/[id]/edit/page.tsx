import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  archiveTeamMemberAction,
  deleteTeamMemberAction,
  updateTeamMemberAction,
} from "@/app/staff/team/actions";
import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { TeamMemberForm } from "@/components/staff/team-member-form";
import { TeamMemberRecordAction } from "@/components/staff/team-member-record-action";
import { TeamMemberStatusBadge } from "@/components/staff/team-member-status-badge";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import { getStaffTeamMember } from "@/lib/team/data";
import {
  getTeamMemberInitials,
  isTeamMemberUuid,
} from "@/lib/team/types";

export const metadata: Metadata = {
  title: "Team Member Details",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { access, supabase } = await getStaffContext();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  if (!isTeamMemberUuid(id)) {
    notFound();
  }

  const member = await getStaffTeamMember(supabase, id);

  if (!member) {
    notFound();
  }

  const canEdit =
    access.staff.role === "admin" ||
    (access.staff.role === "editor" && member.status === "draft");
  const updateAction = updateTeamMemberAction.bind(null, id);
  const archiveAction = archiveTeamMemberAction.bind(null, id);
  const deleteAction = deleteTeamMemberAction.bind(null, id);

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
            aria-labelledby="team-member-details-heading"
            className="border border-navy-900/10 bg-white p-6 shadow-[0_16px_40px_rgba(16,42,67,0.07)] sm:p-9"
          >
            <div className="flex flex-wrap items-center gap-3">
              <TeamMemberStatusBadge status={member.status} />
              {!canEdit ? (
                <span className="text-sm font-bold text-slate-600">
                  Read-only
                </span>
              ) : null}
            </div>
            <h1
              id="team-member-details-heading"
              className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
            >
              {canEdit ? "Edit Team Member" : "Team Member Details"}
            </h1>
            <p className="mt-3 mb-8 max-w-2xl text-lg leading-8 text-slate-600">
              {canEdit
                ? "Review every public field before saving or publishing."
                : "Your active role can view this record but cannot change it."}
            </p>

            {canEdit ? (
              <TeamMemberForm
                action={updateAction}
                initialValues={{
                  name: member.name,
                  positionTitle: member.positionTitle,
                  biography: member.biography ?? "",
                  displayOrder: member.displayOrder,
                }}
                mode="edit"
                role={access.staff.role}
                status={member.status}
              />
            ) : (
              <div className="grid gap-8 sm:grid-cols-[7rem_minmax(0,1fr)]">
                <div className="grid size-28 place-items-center rounded-full bg-navy-900 font-display text-3xl font-bold text-gold-200">
                  {getTeamMemberInitials(member.name)}
                </div>
                <dl className="space-y-6">
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      Public name
                    </dt>
                    <dd className="mt-2 text-lg leading-8 text-navy-900">
                      {member.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      Official position
                    </dt>
                    <dd className="mt-2 leading-7 text-slate-700">
                      {member.positionTitle}
                    </dd>
                  </div>
                  {member.biography ? (
                    <div>
                      <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                        Approved biography
                      </dt>
                      <dd className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                        {member.biography}
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      Display order
                    </dt>
                    <dd className="mt-2 leading-7 text-slate-700">
                      {member.displayOrder}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </section>

          <aside className="h-fit space-y-6 lg:sticky lg:top-6">
            <div className="border-t-4 border-gold-500 bg-navy-900 p-6 text-white">
              <h2 className="font-display text-2xl font-bold">Access</h2>
              <p className="mt-3 text-sm leading-6 text-navy-100">
                Administrators manage publication, ordering, and deletion.
                Editors can change drafts only. Viewers have read-only access.
              </p>
            </div>

            {access.staff.role === "admin" ? (
              <div className="border border-navy-900/10 bg-white p-6">
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  Record actions
                </h2>
                <div className="mt-5 space-y-4">
                  {member.status !== "archived" ? (
                    <TeamMemberRecordAction
                      action={archiveAction}
                      label="Archive Team Member"
                      confirmation="Archive this team member? The record will no longer appear publicly."
                    />
                  ) : null}
                  <TeamMemberRecordAction
                    action={deleteAction}
                    label="Delete Permanently"
                    confirmation="Permanently delete this team member? This action cannot be undone."
                    tone="danger"
                  />
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}
