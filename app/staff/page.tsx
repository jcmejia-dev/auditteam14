import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/public/brand-mark";

export const metadata: Metadata = {
  title: "Staff Portal | Audit Team 14",
  description: "Staff access for Audit Team 14.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StaffPortalPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-navy-950 px-6 py-16 text-white">
      <section className="w-full max-w-xl border border-white/15 bg-white/[0.045] p-8 shadow-soft sm:p-12">
        <BrandMark size="large" inverted />
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.22em] text-gold-200">
          Authorized staff access
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
          Staff Portal
        </h1>
        <p className="mt-6 text-lg leading-8 text-navy-100">
          Secure staff services are not available in this public release. No
          sign-in or administrative actions are enabled.
        </p>
        <Link
          href="/#home"
          className="mt-9 inline-flex min-h-12 items-center justify-center rounded-sm bg-gold-500 px-6 py-3 font-bold text-navy-950 transition-colors hover:bg-gold-200"
        >
          Return to public homepage
        </Link>
      </section>
    </main>
  );
}
