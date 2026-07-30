import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PhotoLightboxGallery } from "@/components/public/photo-lightbox-gallery";
import { PublicPageFrame } from "@/components/public/public-page-frame";
import { getPublishedPhotoAlbum } from "@/lib/media/data";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/photos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const album = await getPublishedPhotoAlbum(slug);

  return album
    ? {
        title: `${album.title} | Photo Gallery | Audit Team 14`,
        description:
          album.description ??
          "Approved public photographs from Audit Team 14.",
      }
    : { title: "Photo Album Not Found | Audit Team 14" };
}

export default async function PhotoAlbumPage({
  params,
}: PageProps<"/photos/[slug]">) {
  const { slug } = await params;
  const album = await getPublishedPhotoAlbum(slug);

  if (!album) {
    notFound();
  }

  return (
    <PublicPageFrame>
      <section className="bg-cream py-12 sm:py-16 lg:py-20">
        <div className="page-shell">
          <nav aria-label="Gallery breadcrumbs">
            <Link
              href="/photos"
              className="inline-flex min-h-11 items-center font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
            >
              Back to Photo Gallery
            </Link>
          </nav>

          <header className="mt-7 border-b border-navy-900/10 pb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              Public photo album
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold text-navy-900 sm:text-5xl">
              {album.title}
            </h1>
            {album.description ? (
              <p className="mt-4 max-w-3xl whitespace-pre-wrap text-lg leading-8 text-slate-600">
                {album.description}
              </p>
            ) : null}
          </header>

          {album.photos.length === 0 ? (
            <div className="mt-10 border border-navy-900/10 bg-white px-6 py-10 text-center">
              <h2 className="font-display text-2xl font-bold text-navy-900">
                No published photos in this album
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Approved photographs will appear after publication.
              </p>
            </div>
          ) : (
            <div className="mt-10">
              <PhotoLightboxGallery
                albumTitle={album.title}
                photos={album.photos}
              />
            </div>
          )}
        </div>
      </section>
    </PublicPageFrame>
  );
}
