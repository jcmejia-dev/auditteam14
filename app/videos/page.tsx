import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageFrame } from "@/components/public/public-page-frame";

export const metadata: Metadata = {
  title: "Video Gallery | Audit Team 14",
  description:
    "Approved public videos from Commission on Audit – BARMM, Audit Team 14.",
};

export default function VideosPage() {
  return (
    <PublicPageFrame>
      <section className="media-page-field bg-cream py-16 sm:py-20 lg:py-24">
        <div className="page-shell relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            Approved public media
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold text-navy-900 sm:text-5xl lg:text-6xl">
            Video Gallery
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Approved public videos will be presented here without autoplay.
          </p>

          <div className="mt-12 border border-navy-900/10 bg-white px-6 py-12 text-center shadow-[0_16px_38px_rgba(16,42,67,0.06)] sm:px-10">
            <h2 className="font-display text-3xl font-bold text-navy-900">
              No videos are published
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
              Video sources will appear only after an approved provider and
              publishing method are established.
            </p>
            <Link
              href="/photos"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-sm bg-navy-900 px-6 py-3 font-bold text-white hover:bg-teal-700"
            >
              View Photos
            </Link>
          </div>
        </div>
      </section>
    </PublicPageFrame>
  );
}
