import Link from "next/link";

import { BrandMark } from "@/components/public/brand-mark";

import { SignOutForm } from "./sign-out-form";

export function StaffPortalHeader({
  displayName,
  roleLabel,
}: {
  displayName: string;
  roleLabel: string;
}) {
  return (
    <header className="border-b border-navy-900/10 bg-white shadow-[0_1px_0_rgba(16,42,67,0.04)]">
      <div className="page-shell flex flex-col gap-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <BrandMark />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              Secure staff portal
            </p>
            <p className="mt-1 font-display text-xl font-bold text-navy-900">
              Audit Team 14
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <p className="text-sm leading-6 text-navy-700">
            <span className="font-bold text-navy-900">{displayName}</span>
            <span aria-hidden="true"> · </span>
            <span>{roleLabel}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-sm px-2 py-2.5 font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
            >
              View Public Website
            </Link>
            <SignOutForm />
          </div>
        </div>
      </div>
    </header>
  );
}
