import type { Metadata } from "next";

import { PhotoAlbumCard } from "@/components/public/photo-album-card";
import { PublicPageFrame } from "@/components/public/public-page-frame";
import { getPublishedPhotoAlbums } from "@/lib/media/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Photo Gallery | Audit Team 14",
  description:
    "Approved public photo albums from Commission on Audit – BARMM, Audit Team 14.",
};

export default async function PhotosPage() {
  const albums = await getPublishedPhotoAlbums();

  return (
    <PublicPageFrame>
      <section className="media-page-field bg-cream py-16 sm:py-20 lg:py-24">
        <div className="page-shell relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            Approved public media
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold text-navy-900 sm:text-5xl lg:text-6xl">
            Photo Gallery
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Browse photographs released for public viewing by Audit Team 14.
          </p>

          {albums.length === 0 ? (
            <div className="mt-12 border border-navy-900/10 bg-white px-6 py-12 text-center shadow-[0_16px_38px_rgba(16,42,67,0.06)] sm:px-10">
              <h2 className="font-display text-3xl font-bold text-navy-900">
                No photo albums are published
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                Approved public photographs will appear here after review and
                publication.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {albums.map((album) => (
                <PhotoAlbumCard key={album.slug} album={album} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicPageFrame>
  );
}
