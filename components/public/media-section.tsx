import Link from "next/link";

import { getPublishedPhotoAlbums } from "@/lib/media/data";

import { PhotoAlbumCard } from "./photo-album-card";
import { SectionHeading } from "./section-heading";

export async function MediaSection() {
  const albums = await getPublishedPhotoAlbums(3);

  return (
    <section id="media" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Media"
          title="Approved public photos and videos"
          description="Browse media released for public viewing by Audit Team 14."
        />

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/photos"
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-navy-900 px-6 py-3 font-bold text-white shadow-sm hover:bg-teal-700"
          >
            View Photos
          </Link>
          <Link
            href="/videos"
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-navy-900/25 px-6 py-3 font-bold text-navy-900 hover:bg-navy-900 hover:text-white"
          >
            View Videos
          </Link>
        </div>

        {albums.length === 0 ? (
          <div className="mt-10 border border-navy-900/10 bg-cream px-6 py-10 text-center sm:px-10">
            <h3 className="font-display text-2xl font-bold text-navy-900">
              No media is published
            </h3>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
              Approved photo albums and videos will appear here after review
              and publication.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {albums.map((album) => (
              <PhotoAlbumCard
                key={album.slug}
                album={album}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
