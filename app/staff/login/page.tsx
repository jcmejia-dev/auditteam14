import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandMark } from "@/components/public/brand-mark";
import { LoginForm } from "@/components/staff/login-form";
import { getStaffAccess } from "@/lib/auth/staff";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function StaffLoginPage() {
  const access = await getStaffAccess();

  if (access.status === "authorized") {
    redirect("/staff/dashboard");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-cream lg:grid-cols-[minmax(20rem,0.82fr)_minmax(32rem,1.18fr)]">
      <section className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-navy-950 px-6 py-10 text-white sm:px-10 lg:min-h-screen lg:px-12 lg:py-14">
        <div
          aria-hidden="true"
          className="absolute -right-28 top-20 size-80 rounded-full border border-gold-500/20 shadow-[0_0_0_5rem_rgba(195,154,74,0.025),0_0_0_10rem_rgba(36,77,147,0.04)]"
        />
        <div className="relative">
          <BrandMark size="large" inverted />
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-gold-200">
            Commission on Audit – BARMM
          </p>
          <h1 className="mt-4 max-w-md font-display text-4xl font-bold leading-tight sm:text-5xl">
            Staff Portal
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-navy-100">
            A secure workspace for authorized Audit Team 14 personnel.
          </p>
        </div>
        <p className="relative mt-10 max-w-md border-l-2 border-gold-500 pl-4 text-sm leading-6 text-navy-100">
          Never share your password. Audit Team 14 will not ask you to provide
          credentials through public pages or email.
        </p>
      </section>

      <section className="flex items-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            Authorized staff access
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
            Welcome back
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Enter your approved staff account details to continue.
          </p>

          <LoginForm />

          <div className="mt-8 border-t border-navy-900/10 pt-6">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-sm py-2 font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
            >
              ← Return to the public website
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
