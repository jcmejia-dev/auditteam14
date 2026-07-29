import Image from "next/image";
import Link from "next/link";

import type { PublicPhotoAlbum } from "@/lib/media/types";

function formatPublishedDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "long",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export function PhotoAlbumCard({
  album,
  compact = false,
}: {
  album: PublicPhotoAlbum;
  compact?: boolean;
}) {
  const publishedDate = formatPublishedDate(album.publishedAt);

  return (
    <article className="group overflow-hidden rounded-sm border border-navy-900/10 bg-white shadow-[0_14px_34px_rgba(16,42,67,0.07)]">
      <Link
        href={`/photos/${album.slug}`}
        className="block rounded-sm focus-visible:outline-offset-[-4px]"
        aria-label={`Open photo album: ${album.title}`}
      >
        <div
          className={`relative overflow-hidden bg-navy-900 ${
            compact ? "aspect-[16/10]" : "aspect-[4/3]"
          }`}
        >
          <Image
            src={album.coverSrc}
            alt=""
            fill
            sizes={
              compact
                ? "(max-width: 768px) 100vw, 33vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none"
            unoptimized
          />
          <span className="absolute right-4 bottom-4 rounded-full bg-navy-950/90 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
            {album.photoCount} {album.photoCount === 1 ? "photo" : "photos"}
          </span>
        </div>
        <div className={compact ? "p-5" : "p-6 sm:p-7"}>
          <h3 className="font-display text-2xl font-bold text-navy-900">
            {album.title}
          </h3>
          {album.description ? (
            <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
              {album.description}
            </p>
          ) : null}
          {publishedDate ? (
            <p className="mt-4 text-sm font-semibold text-teal-700">
              Published {publishedDate}
            </p>
          ) : null}
          <span className="mt-5 inline-flex min-h-11 items-center font-bold text-navy-900 underline decoration-gold-500 decoration-2 underline-offset-4">
            View album
          </span>
        </div>
      </Link>
    </article>
  );
}
