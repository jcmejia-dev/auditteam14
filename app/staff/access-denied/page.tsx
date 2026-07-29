import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandMark } from "@/components/public/brand-mark";
import { SignOutForm } from "@/components/staff/sign-out-form";
import { getStaffAccess } from "@/lib/auth/staff";

export const metadata: Metadata = {
  title: "Access denied",
};

export default async function AccessDeniedPage() {
  const access = await getStaffAccess();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "authorized") {
    redirect("/staff/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-6 py-12">
      <section className="w-full max-w-2xl border-t-4 border-gold-500 bg-white p-8 shadow-soft sm:p-12">
        <BrandMark size="large" />
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-patriot-red">
          Access denied
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
          Your account is not authorized
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          You signed in successfully, but this account does not have an active
          Audit Team 14 staff role. Contact the designated system administrator
          through an approved internal channel.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-600">
          For your security, sign out before leaving this device.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <SignOutForm emphasis="primary" />
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-sm px-5 py-3 font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            View Public Website
          </Link>
        </div>
      </section>
    </main>
  );
}
