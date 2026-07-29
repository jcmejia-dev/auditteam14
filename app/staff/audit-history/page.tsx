import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import {
  AUDIT_HISTORY_PAGE_SIZE,
  getAuditHistoryPage,
} from "@/lib/audit-history/data";
import {
  auditContentTypes,
  auditOperations,
  type AuditOperation,
} from "@/lib/audit-history/types";
import {
  auditHistoryHref,
  parseAuditHistorySearchParams,
  type AuditHistorySearchParams,
} from "@/lib/audit-history/validation";
import { getStaffContext } from "@/lib/auth/staff";

export const metadata: Metadata = {
  title: "Audit History",
};

const operationLabels: Record<AuditOperation, string> = {
  INSERT: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
};

const operationStyles: Record<AuditOperation, string> = {
  INSERT: "border-teal-700/25 bg-teal-100 text-teal-800",
  UPDATE: "border-gold-500/35 bg-gold-200/45 text-navy-900",
  DELETE: "border-red-700/25 bg-red-50 text-red-800",
};

function formatAuditTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(date);
}

export default async function AuditHistoryPage({
  searchParams,
}: {
  searchParams: Promise<AuditHistorySearchParams>;
}) {
  const { access, supabase } = await getStaffContext();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "unauthorized" || access.staff.role !== "admin") {
    redirect("/staff/access-denied");
  }

  const parsedSearch = parseAuditHistorySearchParams(await searchParams);
  const result = await getAuditHistoryPage(
    supabase,
    parsedSearch.filters,
    parsedSearch.page,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(result.total / AUDIT_HISTORY_PAGE_SIZE),
  );

  if (
    !result.error &&
    result.total > 0 &&
    parsedSearch.page > totalPages
  ) {
    redirect(auditHistoryHref(parsedSearch.filters, totalPages));
  }

  const firstResult =
    result.items.length > 0
      ? (parsedSearch.page - 1) * AUDIT_HISTORY_PAGE_SIZE + 1
      : 0;
  const lastResult =
    firstResult > 0 ? firstResult + result.items.length - 1 : 0;

  return (
    <div className="min-h-screen bg-cream">
      <StaffPortalHeader
        displayName={access.staff.displayName}
        roleLabel="Administrator"
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

        <section aria-labelledby="audit-history-heading" className="mt-7">
          <div className="border-b border-navy-900/10 pb-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              Administrator access
            </p>
            <h1
              id="audit-history-heading"
              className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
            >
              Audit History
            </h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
              Review the protected, append-only history of authorized content
              and role-assignment changes.
            </p>
          </div>

          <form
            action="/staff/audit-history"
            method="get"
            className="mt-7 border border-navy-900/10 bg-white p-5 shadow-[0_12px_30px_rgba(16,42,67,0.05)] sm:p-6"
          >
            <h2 className="font-display text-2xl font-bold text-navy-900">
              Filter history
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label
                  htmlFor="audit-action"
                  className="font-bold text-navy-900"
                >
                  Action
                </label>
                <select
                  id="audit-action"
                  name="action"
                  defaultValue={parsedSearch.filters.action ?? ""}
                  className="mt-2 min-h-12 w-full rounded-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 focus:border-teal-700"
                >
                  <option value="">All actions</option>
                  {auditOperations.map((operation) => (
                    <option key={operation} value={operation}>
                      {operationLabels[operation]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="audit-content"
                  className="font-bold text-navy-900"
                >
                  Content type
                </label>
                <select
                  id="audit-content"
                  name="content"
                  defaultValue={parsedSearch.filters.contentType ?? ""}
                  className="mt-2 min-h-12 w-full rounded-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 focus:border-teal-700"
                >
                  <option value="">All content types</option>
                  {auditContentTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="audit-date-from"
                  className="font-bold text-navy-900"
                >
                  From date
                </label>
                <input
                  id="audit-date-from"
                  name="from"
                  type="date"
                  defaultValue={parsedSearch.filters.dateFrom}
                  className="mt-2 min-h-12 w-full rounded-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 focus:border-teal-700"
                />
              </div>

              <div>
                <label
                  htmlFor="audit-date-to"
                  className="font-bold text-navy-900"
                >
                  To date
                </label>
                <input
                  id="audit-date-to"
                  name="to"
                  type="date"
                  defaultValue={parsedSearch.filters.dateTo}
                  className="mt-2 min-h-12 w-full rounded-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 focus:border-teal-700"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-navy-900/10 pt-5 sm:flex-row">
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-6 py-3 font-bold text-white hover:bg-navy-900"
              >
                Apply Filters
              </button>
              <Link
                href="/staff/audit-history"
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-navy-900/20 px-6 py-3 font-bold text-navy-900 hover:border-teal-700 hover:text-teal-700"
              >
                Clear Filters
              </Link>
            </div>
          </form>

          {parsedSearch.invalid ? (
            <p
              role="status"
              className="mt-5 border-l-4 border-gold-500 bg-gold-200/35 px-5 py-4 font-semibold text-navy-900"
            >
              One or more invalid filters were ignored.
            </p>
          ) : null}

          {result.error ? (
            <div
              role="alert"
              className="mt-7 border-l-4 border-patriot-red bg-red-50 px-5 py-5"
            >
              <h2 className="font-display text-2xl font-bold text-navy-900">
                Audit history is temporarily unavailable
              </h2>
              <p className="mt-2 leading-7 text-slate-700">
                No audit information was displayed. Please refresh or try
                again later.
              </p>
            </div>
          ) : result.items.length === 0 ? (
            <div className="mt-7 border border-navy-900/10 bg-white px-6 py-10 text-center shadow-[0_14px_35px_rgba(16,42,67,0.06)] sm:px-10">
              <h2 className="font-display text-3xl font-bold text-navy-900">
                No matching audit events
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                Try clearing the filters or selecting a wider date range.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-display text-3xl font-bold text-navy-900">
                  Recorded events
                </h2>
                <p className="font-semibold text-slate-600">
                  Showing {firstResult}–{lastResult} of {result.total}
                </p>
              </div>

              <ol className="mt-5 space-y-4">
                {result.items.map((item) => (
                  <li
                    key={item.key}
                    className="border border-navy-900/10 bg-white p-5 shadow-[0_10px_26px_rgba(16,42,67,0.05)] sm:p-6"
                  >
                    <article>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${operationStyles[item.action]}`}
                            >
                              {item.actionLabel}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">
                              {item.contentTypeLabel}
                            </span>
                          </div>
                          <h3 className="mt-4 break-words font-display text-2xl font-bold text-navy-900">
                            {item.recordLabel}
                          </h3>
                          <p className="mt-2 leading-7 text-slate-600">
                            Staff:{" "}
                            <span className="font-semibold text-navy-900">
                              {item.staffDisplayName}
                            </span>
                          </p>
                        </div>
                        <time
                          dateTime={item.occurredAt}
                          className="shrink-0 text-sm font-semibold text-slate-600"
                        >
                          {formatAuditTime(item.occurredAt)}
                        </time>
                      </div>
                    </article>
                  </li>
                ))}
              </ol>

              <nav
                aria-label="Audit history pages"
                className="mt-7 flex flex-col gap-3 border-t border-navy-900/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="font-semibold text-slate-600">
                  Page {parsedSearch.page} of {totalPages}
                </p>
                <div className="flex gap-3">
                  {parsedSearch.page > 1 ? (
                    <Link
                      href={auditHistoryHref(
                        parsedSearch.filters,
                        parsedSearch.page - 1,
                      )}
                      className="inline-flex min-h-12 items-center justify-center rounded-sm border border-navy-900/20 px-5 py-3 font-bold text-navy-900 hover:border-teal-700 hover:text-teal-700"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="inline-flex min-h-12 items-center justify-center rounded-sm border border-navy-900/10 px-5 py-3 font-bold text-slate-400"
                    >
                      Previous
                    </span>
                  )}
                  {parsedSearch.page < totalPages ? (
                    <Link
                      href={auditHistoryHref(
                        parsedSearch.filters,
                        parsedSearch.page + 1,
                      )}
                      className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-5 py-3 font-bold text-white hover:bg-navy-900"
                    >
                      Next
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="inline-flex min-h-12 items-center justify-center rounded-sm bg-slate-200 px-5 py-3 font-bold text-slate-500"
                    >
                      Next
                    </span>
                  )}
                </div>
              </nav>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
