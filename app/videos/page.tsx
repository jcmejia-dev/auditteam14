import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageFrame } from "@/components/public/public-page-frame";
import { getPublishedVideos } from "@/lib/media/data";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Video Gallery | Audit Team 14",
  description:
    "Approved public videos from Commission on Audit – BARMM, Audit Team 14.",
};

function formatPublicDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en-PH", {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(date);
}

export default async function VideosPage() {
  const videos = await getPublishedVideos();

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
            View approved public videos using accessible native browser
            controls. Videos never start automatically.
          </p>

          {videos.length === 0 ? (
            <div className="mt-12 border border-navy-900/10 bg-white px-6 py-12 text-center shadow-[0_16px_38px_rgba(16,42,67,0.06)] sm:px-10">
              <h2 className="font-display text-3xl font-bold text-navy-900">
                No videos are published
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                Approved public videos will appear here after staff review and
                publication.
              </p>
              <Link
                href="/photos"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-sm bg-navy-900 px-6 py-3 font-bold text-white hover:bg-teal-700"
              >
                View Photos
              </Link>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {videos.map((video, index) => {
                const eventDate = formatPublicDate(video.eventDate);
                const publicationDate = formatPublicDate(video.publishedAt);
                const descriptionId = `video-description-${index + 1}`;

                return (
                  <article
                    key={`${video.title}-${index}`}
                    className="min-w-0 overflow-hidden border border-navy-900/10 bg-white shadow-[0_16px_38px_rgba(16,42,67,0.07)]"
                  >
                    <div className="bg-navy-950 p-3 sm:p-4">
                      <video
                        controls
                        preload="metadata"
                        playsInline
                        aria-label={video.title}
                        aria-describedby={descriptionId}
                        className="aspect-video w-full bg-black object-contain"
                      >
                        <source src={video.playbackUrl} />
                        Your browser does not support the native video player.
                      </video>
                    </div>
                    <div className="p-6 sm:p-7">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-600">
                        {eventDate
                          ? `Event date: ${eventDate}`
                          : publicationDate
                            ? `Published: ${publicationDate}`
                            : "Published video"}
                      </p>
                      <h2 className="mt-3 break-words font-display text-2xl font-bold text-navy-900 sm:text-3xl">
                        {video.title}
                      </h2>
                      <p
                        id={descriptionId}
                        className="mt-3 whitespace-pre-wrap leading-7 text-slate-700"
                      >
                        {video.accessibleDescription}
                      </p>
                      {video.caption ? (
                        <p className="mt-4 border-t border-navy-900/10 pt-4 whitespace-pre-wrap leading-7 text-slate-600">
                          {video.caption}
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicPageFrame>
  );
}
