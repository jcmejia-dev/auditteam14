import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  archiveJurisdictionAction,
  deleteJurisdictionAction,
  updateJurisdictionAction,
} from "@/app/staff/jurisdictions/actions";
import { JurisdictionForm } from "@/components/staff/jurisdiction-form";
import { JurisdictionRecordAction } from "@/components/staff/jurisdiction-record-action";
import { JurisdictionStatusBadge } from "@/components/staff/jurisdiction-status-badge";
import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import { getStaffJurisdiction } from "@/lib/jurisdictions/data";
import { isJurisdictionUuid } from "@/lib/jurisdictions/types";

export const metadata: Metadata = {
  title: "Jurisdiction Details",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export default async function EditJurisdictionPage({
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

  if (!isJurisdictionUuid(id)) {
    notFound();
  }

  const jurisdiction = await getStaffJurisdiction(supabase, id);

  if (!jurisdiction) {
    notFound();
  }

  const canEdit =
    access.staff.role === "admin" ||
    (access.staff.role === "editor" &&
      jurisdiction.status === "draft");
  const updateAction = updateJurisdictionAction.bind(null, id);
  const archiveAction = archiveJurisdictionAction.bind(null, id);
  const deleteAction = deleteJurisdictionAction.bind(null, id);

  return (
    <div className="min-h-screen bg-cream">
      <StaffPortalHeader
        displayName={access.staff.displayName}
        roleLabel={roleLabels[access.staff.role]}
      />
      <main className="page-shell py-9 sm:py-12">
        <nav aria-label="Staff breadcrumbs">
          <Link
            href="/staff/jurisdictions"
            className="font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            Back to Jurisdictions
          </Link>
        </nav>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section
            aria-labelledby="jurisdiction-details-heading"
            className="border border-navy-900/10 bg-white p-6 shadow-[0_16px_40px_rgba(16,42,67,0.07)] sm:p-9"
          >
            <div className="flex flex-wrap items-center gap-3">
              <JurisdictionStatusBadge status={jurisdiction.status} />
              {!canEdit ? (
                <span className="text-sm font-bold text-slate-600">
                  Read-only
                </span>
              ) : null}
            </div>
            <h1
              id="jurisdiction-details-heading"
              className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
            >
              {canEdit ? "Edit Jurisdiction" : "Jurisdiction Details"}
            </h1>
            <p className="mt-3 mb-8 max-w-2xl text-lg leading-8 text-slate-600">
              {canEdit
                ? "Review every public field and coordinate before saving or publishing."
                : "Your active role can view this record but cannot change it."}
            </p>

            {canEdit ? (
              <JurisdictionForm
                action={updateAction}
                initialValues={{
                  name: jurisdiction.name,
                  abbreviation: jurisdiction.abbreviation ?? "",
                  category: jurisdiction.category,
                  generalLocation: jurisdiction.generalLocation,
                  latitude:
                    jurisdiction.latitude === null
                      ? ""
                      : String(jurisdiction.latitude),
                  longitude:
                    jurisdiction.longitude === null
                      ? ""
                      : String(jurisdiction.longitude),
                  displayOrder: jurisdiction.displayOrder,
                }}
                mode="edit"
                role={access.staff.role}
                status={jurisdiction.status}
              />
            ) : (
              <dl className="grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                    Institution
                  </dt>
                  <dd className="mt-2 text-lg leading-8 text-navy-900">
                    {jurisdiction.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                    Abbreviation
                  </dt>
                  <dd className="mt-2 leading-7 text-slate-700">
                    {jurisdiction.abbreviation ?? "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                    Category
                  </dt>
                  <dd className="mt-2 capitalize leading-7 text-slate-700">
                    {jurisdiction.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                    General location
                  </dt>
                  <dd className="mt-2 leading-7 text-slate-700">
                    {jurisdiction.generalLocation}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                    Coordinates
                  </dt>
                  <dd className="mt-2 leading-7 text-slate-700">
                    {jurisdiction.latitude !== null &&
                    jurisdiction.longitude !== null
                      ? `${jurisdiction.latitude}, ${jurisdiction.longitude}`
                      : "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                    Display order
                  </dt>
                  <dd className="mt-2 leading-7 text-slate-700">
                    {jurisdiction.displayOrder}
                  </dd>
                </div>
              </dl>
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
                  {jurisdiction.status !== "archived" ? (
                    <JurisdictionRecordAction
                      action={archiveAction}
                      label="Archive Jurisdiction"
                      confirmation="Archive this jurisdiction? It will no longer appear on the public map."
                    />
                  ) : null}
                  <JurisdictionRecordAction
                    action={deleteAction}
                    label="Delete Permanently"
                    confirmation="Permanently delete this jurisdiction? This action cannot be undone."
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
