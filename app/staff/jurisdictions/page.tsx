import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { JurisdictionStatusBadge } from "@/components/staff/jurisdiction-status-badge";
import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import { getStaffJurisdictions } from "@/lib/jurisdictions/data";

export const metadata: Metadata = {
  title: "Manage Jurisdictions",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

const notices: Record<string, string> = {
  archived: "The jurisdiction was archived.",
  created: "The jurisdiction draft was saved.",
  deleted: "The jurisdiction was deleted.",
  published: "The jurisdiction was published.",
  updated: "The jurisdiction changes were saved.",
};

export default async function StaffJurisdictionsPage({
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

  const { jurisdictions, error } =
    await getStaffJurisdictions(supabase);
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

        <section aria-labelledby="jurisdictions-heading" className="mt-7">
          <div className="flex flex-col gap-6 border-b border-navy-900/10 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
                Public content
              </p>
              <h1
                id="jurisdictions-heading"
                className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
              >
                Jurisdictions
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
                Maintain confirmed institution names, locations, map
                coordinates, categories, publication state, and display order.
              </p>
            </div>
            {canCreate ? (
              <Link
                href="/staff/jurisdictions/new"
                className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-6 py-3 font-bold text-white shadow-sm hover:bg-navy-900"
              >
                Add Jurisdiction
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
                Jurisdiction information is temporarily unavailable
              </h2>
              <p className="mt-2 leading-7 text-slate-700">
                Please refresh the page or try again later.
              </p>
            </div>
          ) : jurisdictions.length === 0 ? (
            <div className="mt-7 border border-navy-900/10 bg-white px-6 py-10 text-center shadow-[0_14px_35px_rgba(16,42,67,0.06)] sm:px-10">
              <h2 className="font-display text-3xl font-bold text-navy-900">
                No database jurisdiction records yet
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                {canCreate
                  ? "Create a draft only after the institution details and coordinates are confirmed."
                  : "There are no jurisdiction records available to view."}
              </p>
            </div>
          ) : (
            <div className="mt-7 grid gap-5">
              {jurisdictions.map((jurisdiction) => {
                const editorCanEdit =
                  access.staff.role === "editor" &&
                  jurisdiction.status === "draft";
                const canEdit =
                  access.staff.role === "admin" || editorCanEdit;

                return (
                  <article
                    key={jurisdiction.id}
                    className="border border-navy-900/10 bg-white p-6 shadow-[0_12px_30px_rgba(16,42,67,0.06)] sm:p-7"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <JurisdictionStatusBadge
                            status={jurisdiction.status}
                          />
                          <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            {jurisdiction.category}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            Order {jurisdiction.displayOrder}
                          </span>
                        </div>
                        <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
                          {jurisdiction.name}
                          {jurisdiction.abbreviation
                            ? ` (${jurisdiction.abbreviation})`
                            : ""}
                        </h2>
                        <p className="mt-2 leading-7 text-slate-600">
                          {jurisdiction.generalLocation}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-teal-700">
                          {jurisdiction.latitude !== null &&
                          jurisdiction.longitude !== null
                            ? `${jurisdiction.latitude}, ${jurisdiction.longitude}`
                            : "Map coordinates not yet entered"}
                        </p>
                      </div>
                      <Link
                        href={`/staff/jurisdictions/${jurisdiction.id}/edit`}
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
