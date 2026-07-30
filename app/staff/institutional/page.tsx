import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { InstitutionalInformationForm } from "@/components/staff/institutional-information-form";
import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import { getStaffInstitutionalInformation } from "@/lib/institutional/data";

import { saveInstitutionalInformationAction } from "./actions";

export const metadata: Metadata = {
  title: "Manage Institutional Information",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

const notices: Record<string, string> = {
  published: "The institutional information was published.",
  saved: "The institutional information draft was saved.",
};

export default async function StaffInstitutionalPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { access, supabase } = await getStaffContext();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  const setting = await getStaffInstitutionalInformation(supabase);
  const { notice } = await searchParams;
  const canEdit =
    !setting.error &&
    (access.staff.role === "admin" ||
      (access.staff.role === "editor" &&
        (setting.status === null || setting.status === "draft")));

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
            Back to Dashboard
          </Link>
        </nav>

        <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <section
            aria-labelledby="institutional-management-heading"
            className="border border-navy-900/10 bg-white p-6 shadow-[0_16px_40px_rgba(16,42,67,0.07)] sm:p-9"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              Public website
            </p>
            <h1
              id="institutional-management-heading"
              className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
            >
              Manage Institutional Information
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Maintain the approved organizational details, regional coverage,
              and Core Values shown on the public homepage.
            </p>

            {notice && notices[notice] ? (
              <div
                role="status"
                className="mt-7 border-l-4 border-teal-700 bg-teal-50 px-5 py-4 font-semibold text-navy-900"
              >
                {notices[notice]}
              </div>
            ) : null}

            {setting.error ? (
              <div
                role="alert"
                className="mt-7 border-l-4 border-patriot-red bg-red-50 px-5 py-4 font-semibold leading-7 text-navy-900"
              >
                Institutional information is temporarily unavailable. No
                changes can be saved.
              </div>
            ) : null}

            <div className="mt-9">
              <InstitutionalInformationForm
                action={saveInstitutionalInformationAction}
                information={setting.information}
                role={access.staff.role}
                status={setting.status}
                canEdit={canEdit}
              />
            </div>
          </section>

          <aside className="h-fit space-y-6 xl:sticky xl:top-6">
            <div className="border-t-4 border-gold-500 bg-navy-900 p-6 text-white">
              <h2 className="font-display text-2xl font-bold">
                Publication access
              </h2>
              <p className="mt-3 text-sm leading-6 text-navy-100">
                Editors can prepare drafts. Only administrators can publish or
                update information already visible to the public.
              </p>
            </div>
            <div className="border border-navy-900/10 bg-white p-6">
              <h2 className="font-display text-xl font-bold text-navy-900">
                Current status
              </h2>
              <p className="mt-3 capitalize text-slate-700">
                {setting.status ?? "Static website fallback"}
              </p>
              {!canEdit ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  This record is read-only for your active role.
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
