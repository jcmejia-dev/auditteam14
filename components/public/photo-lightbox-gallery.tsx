"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { PublicPhoto } from "@/lib/media/types";

function formatPublishedDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "long",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export function PhotoLightboxGallery({
  albumTitle,
  photos,
}: {
  albumTitle: string;
  photos: PublicPhoto[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + photos.length) % photos.length,
    );
  }, [photos.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % photos.length,
    );
  }, [photos.length]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, closeLightbox, showNext, showPrevious]);

  const activePhoto =
    activeIndex === null ? null : photos[activeIndex];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <figure
            key={`${photo.src}-${index}`}
            className="overflow-hidden rounded-sm border border-navy-900/10 bg-white shadow-[0_12px_28px_rgba(16,42,67,0.06)]"
          >
            <button
              ref={(node) => {
                if (activeIndex === index && node) {
                  openerRef.current = node;
                }
              }}
              type="button"
              onClick={(event) => {
                openerRef.current = event.currentTarget;
                setActiveIndex(index);
              }}
              className="group block w-full rounded-sm text-left"
              aria-label={`View ${photo.title} fullscreen`}
              aria-haspopup="dialog"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-navy-900">
                <Image
                  src={photo.src}
                  alt={photo.altText}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none"
                  unoptimized
                />
              </span>
            </button>
            <figcaption className="p-5">
              <span className="block font-display text-xl font-bold text-navy-900">
                {photo.title}
              </span>
              {photo.caption ? (
                <span className="mt-2 line-clamp-2 block text-sm leading-6 text-slate-600">
                  {photo.caption}
                </span>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>

      {activePhoto && activeIndex !== null ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-lightbox-title"
          aria-describedby={
            activePhoto.caption ? "photo-lightbox-caption" : undefined
          }
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/95 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeLightbox();
            }
          }}
        >
          <div className="flex max-h-full w-full max-w-6xl flex-col">
            <div className="flex justify-end">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeLightbox}
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/30 bg-navy-900 px-5 py-3 font-bold text-white hover:bg-white hover:text-navy-950"
                aria-label="Close fullscreen photo"
              >
                Close
              </button>
            </div>

            <div className="mt-3 min-h-0 overflow-y-auto border border-white/15 bg-navy-950">
              <div className="relative mx-auto aspect-[4/3] max-h-[66vh] w-full">
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.altText}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="border-t border-white/15 px-5 py-5 text-white sm:px-7">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-200">
                  {albumTitle} · Photo {activeIndex + 1} of {photos.length}
                </p>
                <h2
                  id="photo-lightbox-title"
                  className="mt-2 font-display text-2xl font-bold"
                >
                  {activePhoto.title}
                </h2>
                {activePhoto.caption ? (
                  <p
                    id="photo-lightbox-caption"
                    className="mt-2 max-w-3xl leading-7 text-navy-100"
                  >
                    {activePhoto.caption}
                  </p>
                ) : null}
                {formatPublishedDate(activePhoto.publishedAt) ? (
                  <p className="mt-3 text-sm text-navy-100">
                    Published {formatPublishedDate(activePhoto.publishedAt)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={showPrevious}
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/30 px-5 py-3 font-bold text-white hover:bg-white hover:text-navy-950"
                aria-label="View previous photo"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={showNext}
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/30 px-5 py-3 font-bold text-white hover:bg-white hover:text-navy-950"
                aria-label="View next photo"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
