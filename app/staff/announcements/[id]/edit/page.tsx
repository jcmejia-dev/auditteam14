import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  archiveAnnouncementAction,
  deleteAnnouncementAction,
  updateAnnouncementAction,
} from "@/app/staff/announcements/actions";
import { AnnouncementForm } from "@/components/staff/announcement-form";
import { AnnouncementRecordAction } from "@/components/staff/announcement-record-action";
import { AnnouncementStatusBadge } from "@/components/staff/announcement-status-badge";
import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { getStaffAnnouncement } from "@/lib/announcements/data";
import {
  getAnnouncementDisplayStatus,
  isUuid,
  toPhilippineDateInput,
} from "@/lib/announcements/types";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";

export const metadata: Metadata = {
  title: "Announcement Details",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isUuid(id)) {
    notFound();
  }

  const { access, supabase } = await getStaffContext();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  const announcement = await getStaffAnnouncement(supabase, id);

  if (!announcement) {
    notFound();
  }

  const canEdit =
    access.staff.role === "admin" ||
    (access.staff.role === "editor" && announcement.status === "draft");
  const displayStatus = getAnnouncementDisplayStatus(announcement);
  const updateAction = updateAnnouncementAction.bind(null, id);
  const archiveAction = archiveAnnouncementAction.bind(null, id);
  const deleteAction = deleteAnnouncementAction.bind(null, id);

  return (
    <div className="min-h-screen bg-cream">
      <StaffPortalHeader
        displayName={access.staff.displayName}
        roleLabel={roleLabels[access.staff.role]}
      />
      <main className="page-shell py-9 sm:py-12">
        <nav aria-label="Staff breadcrumbs">
          <Link
            href="/staff/announcements"
            className="font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            Back to Announcements
          </Link>
        </nav>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section
            aria-labelledby="announcement-details-heading"
            className="border border-navy-900/10 bg-white p-6 shadow-[0_16px_40px_rgba(16,42,67,0.07)] sm:p-9"
          >
            <div className="flex flex-wrap items-center gap-3">
              <AnnouncementStatusBadge status={displayStatus} />
              {!canEdit ? (
                <span className="text-sm font-bold text-slate-600">
                  Read-only
                </span>
              ) : null}
            </div>
            <h1
              id="announcement-details-heading"
              className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
            >
              {canEdit ? "Edit Announcement" : "Announcement Details"}
            </h1>
            <p className="mt-3 mb-8 max-w-2xl text-lg leading-8 text-slate-600">
              {canEdit
                ? "Review each field before saving or publishing."
                : "Your active role can view this record but cannot change it."}
            </p>

            {canEdit ? (
              <AnnouncementForm
                action={updateAction}
                initialValues={{
                  title: announcement.title,
                  summary: announcement.summary ?? "",
                  body: announcement.body,
                  isFeatured: announcement.isFeatured,
                  expiresOn: toPhilippineDateInput(announcement.expiresAt),
                  displayOrder: announcement.displayOrder,
                }}
                mode="edit"
                role={access.staff.role}
                status={announcement.status}
              />
            ) : (
              <dl className="space-y-6">
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                    Title
                  </dt>
                  <dd className="mt-2 text-lg leading-8 text-navy-900">
                    {announcement.title}
                  </dd>
                </div>
                {announcement.summary ? (
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      Summary
                    </dt>
                    <dd className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                      {announcement.summary}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                    Announcement text
                  </dt>
                  <dd className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                    {announcement.body}
                  </dd>
                </div>
              </dl>
            )}
          </section>

          <aside className="h-fit space-y-6 lg:sticky lg:top-6">
            <div className="border-t-4 border-gold-500 bg-navy-900 p-6 text-white">
              <h2 className="font-display text-2xl font-bold">Access</h2>
              <p className="mt-3 text-sm leading-6 text-navy-100">
                Administrators manage all announcement states. Editors can
                change drafts only. Viewers have read-only access.
              </p>
            </div>

            {access.staff.role === "admin" ? (
              <div className="border border-navy-900/10 bg-white p-6">
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  Record actions
                </h2>
                <div className="mt-5 space-y-4">
                  {announcement.status !== "archived" ? (
                    <AnnouncementRecordAction
                      action={archiveAction}
                      label="Archive Announcement"
                      confirmation="Archive this announcement? It will no longer appear publicly."
                    />
                  ) : null}
                  <AnnouncementRecordAction
                    action={deleteAction}
                    label="Delete Permanently"
                    confirmation="Permanently delete this announcement? This action cannot be undone."
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
