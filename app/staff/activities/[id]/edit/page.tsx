import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  archiveActivityAction,
  deleteActivityAction,
  updateActivityAction,
} from "@/app/staff/activities/actions";
import { ActivityForm } from "@/components/staff/activity-form";
import { ActivityRecordAction } from "@/components/staff/activity-record-action";
import {
  ActivityDateBadge,
  ActivityPublicationBadge,
} from "@/components/staff/activity-status-badges";
import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { getStaffActivity } from "@/lib/activities/data";
import {
  getActivityDateStatus,
  isActivityUuid,
} from "@/lib/activities/types";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";

export const metadata: Metadata = {
  title: "Activity Details",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export default async function EditActivityPage({
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

  if (!isActivityUuid(id)) {
    notFound();
  }

  const activity = await getStaffActivity(supabase, id);

  if (!activity) {
    notFound();
  }

  const canEdit =
    access.staff.role === "admin" ||
    (access.staff.role === "editor" && activity.status === "draft");
  const dateStatus = getActivityDateStatus(activity.activityDate);
  const updateAction = updateActivityAction.bind(null, id);
  const archiveAction = archiveActivityAction.bind(null, id);
  const deleteAction = deleteActivityAction.bind(null, id);

  return (
    <div className="min-h-screen bg-cream">
      <StaffPortalHeader
        displayName={access.staff.displayName}
        roleLabel={roleLabels[access.staff.role]}
      />
      <main className="page-shell py-9 sm:py-12">
        <nav aria-label="Staff breadcrumbs">
          <Link
            href="/staff/activities"
            className="font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            Back to Activities
          </Link>
        </nav>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section
            aria-labelledby="activity-details-heading"
            className="border border-navy-900/10 bg-white p-6 shadow-[0_16px_40px_rgba(16,42,67,0.07)] sm:p-9"
          >
            <div className="flex flex-wrap items-center gap-3">
              <ActivityPublicationBadge status={activity.status} />
              <ActivityDateBadge status={dateStatus} />
              {!canEdit ? (
                <span className="text-sm font-bold text-slate-600">
                  Read-only
                </span>
              ) : null}
            </div>
            <h1
              id="activity-details-heading"
              className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
            >
              {canEdit ? "Edit Activity" : "Activity Details"}
            </h1>
            <p className="mt-3 mb-8 max-w-2xl text-lg leading-8 text-slate-600">
              {canEdit
                ? "Review each field before saving or publishing."
                : "Your active role can view this record but cannot change it."}
            </p>

            {canEdit ? (
              <ActivityForm
                action={updateAction}
                initialValues={{
                  title: activity.title,
                  summary: activity.summary ?? "",
                  body: activity.body ?? "",
                  activityDate: activity.activityDate ?? "",
                  locationText: activity.locationText ?? "",
                  displayOrder: activity.displayOrder,
                }}
                mode="edit"
                role={access.staff.role}
                status={activity.status}
              />
            ) : (
              <dl className="space-y-6">
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                    Title
                  </dt>
                  <dd className="mt-2 text-lg leading-8 text-navy-900">
                    {activity.title}
                  </dd>
                </div>
                {activity.activityDate ? (
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      Activity date
                    </dt>
                    <dd className="mt-2 leading-7 text-slate-700">
                      {activity.activityDate}
                    </dd>
                  </div>
                ) : null}
                {activity.locationText ? (
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      General location
                    </dt>
                    <dd className="mt-2 leading-7 text-slate-700">
                      {activity.locationText}
                    </dd>
                  </div>
                ) : null}
                {activity.summary ? (
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      Summary
                    </dt>
                    <dd className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                      {activity.summary}
                    </dd>
                  </div>
                ) : null}
                {activity.body ? (
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      Activity details
                    </dt>
                    <dd className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                      {activity.body}
                    </dd>
                  </div>
                ) : null}
              </dl>
            )}
          </section>

          <aside className="h-fit space-y-6 lg:sticky lg:top-6">
            <div className="border-t-4 border-gold-500 bg-navy-900 p-6 text-white">
              <h2 className="font-display text-2xl font-bold">Access</h2>
              <p className="mt-3 text-sm leading-6 text-navy-100">
                Administrators manage all activity states. Editors can change
                drafts only. Viewers have read-only access.
              </p>
            </div>

            {access.staff.role === "admin" ? (
              <div className="border border-navy-900/10 bg-white p-6">
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  Record actions
                </h2>
                <div className="mt-5 space-y-4">
                  {activity.status !== "archived" ? (
                    <ActivityRecordAction
                      action={archiveAction}
                      label="Archive Activity"
                      confirmation="Archive this activity? It will no longer appear publicly."
                    />
                  ) : null}
                  <ActivityRecordAction
                    action={deleteAction}
                    label="Delete Permanently"
                    confirmation="Permanently delete this activity? This action cannot be undone."
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
