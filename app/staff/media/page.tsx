import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MediaStatusBadge } from "@/components/staff/media-status-badge";
import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import { getStaffAlbums, getStaffVideos } from "@/lib/media/data";

export const metadata: Metadata = {
  title: "Manage Media",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

const notices: Record<string, string> = {
  "album-archived": "The album was archived.",
  "album-created": "The album draft was saved.",
  "album-deleted": "The album was permanently deleted.",
  "album-published": "The album was published.",
  "album-updated": "The album changes were saved.",
  "video-archived": "The video was archived.",
  "video-deleted": "The video and its private file were deleted.",
  "video-published": "The video was published.",
  "video-updated": "The video details were saved.",
};

export default async function StaffMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { access, supabase } = await getStaffContext();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  const [
    { albums, error: albumsError },
    { videos, error: videosError },
  ] = await Promise.all([
    getStaffAlbums(supabase),
    getStaffVideos(supabase),
  ]);
  const requestedNotice = (await searchParams).notice;
  const noticeKey =
    typeof requestedNotice === "string" ? requestedNotice : undefined;
  const notice = noticeKey ? notices[noticeKey] : undefined;
  const canCreate =
    access.staff.role === "admin" || access.staff.role === "editor";

  return (
    <div className="min-h-screen bg-cream">
      <StaffPortalHeader
        displayName={access.staff.displayName}
        roleLabel={roleLabels[access.staff.role]}
      />
      <main className="page-shell py-9 sm:py-12">
        <nav aria-label="Staff breadcrumbs">
          <Link
            href="/staff/dashboard"
            className="font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            Dashboard
          </Link>
        </nav>

        <section aria-labelledby="media-heading" className="mt-7">
          <div className="flex flex-col gap-6 border-b border-navy-900/10 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
                Public content
              </p>
              <h1
                id="media-heading"
                className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
              >
                Media Gallery
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
                Organize approved photo albums and direct video drafts, then
                review their publication status.
              </p>
            </div>
            {canCreate ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/staff/media/videos/new"
                  className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold-500 px-6 py-3 font-bold text-navy-950 shadow-sm hover:bg-gold-600 hover:text-white"
                >
                  Add Video
                </Link>
                <Link
                  href="/staff/media/albums/new"
                  className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-6 py-3 font-bold text-white shadow-sm hover:bg-navy-900"
                >
                  Create Album
                </Link>
              </div>
            ) : (
              <span className="inline-flex min-h-11 items-center rounded-full border border-navy-900/15 bg-white px-5 py-2 font-bold text-navy-700">
                Read-only access
              </span>
            )}
          </div>

          {notice ? (
            <p
              role="status"
              className="mt-6 border-l-4 border-teal-700 bg-teal-100 px-5 py-4 font-semibold text-navy-900"
            >
              {notice}
            </p>
          ) : null}

          {albumsError ? (
            <div
              role="alert"
              className="mt-7 border-l-4 border-patriot-red bg-red-50 px-5 py-5"
            >
              <h2 className="font-display text-2xl font-bold text-navy-900">
                Media records are temporarily unavailable
              </h2>
              <p className="mt-2 leading-7 text-slate-700">
                Please refresh the page or try again later.
              </p>
            </div>
          ) : albums.length === 0 ? (
            <div className="mt-7 border border-navy-900/10 bg-white px-6 py-10 text-center shadow-[0_14px_35px_rgba(16,42,67,0.06)] sm:px-10">
              <h2 className="font-display text-3xl font-bold text-navy-900">
                No albums yet
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                {canCreate
                  ? "Create a draft album when approved public photographs are ready to organize."
                  : "There are no album records available to view."}
              </p>
            </div>
          ) : (
            <div className="mt-7 grid gap-5">
              {albums.map((album) => {
                const canEdit =
                  access.staff.role === "admin" ||
                  (access.staff.role === "editor" &&
                    album.status === "draft");

                return (
                  <article
                    key={album.id}
                    className="border border-navy-900/10 bg-white p-6 shadow-[0_12px_30px_rgba(16,42,67,0.06)] sm:p-7"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <MediaStatusBadge status={album.status} />
                        <h2 className="mt-4 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
                          {album.title}
                        </h2>
                        <p className="mt-2 break-words text-sm font-semibold text-teal-700">
                          /photos/{album.slug}
                        </p>
                        {album.description ? (
                          <p className="mt-4 max-w-3xl line-clamp-3 leading-7 text-slate-600">
                            {album.description}
                          </p>
                        ) : null}
                      </div>
                      <Link
                        href={`/staff/media/albums/${album.id}/edit`}
                        className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-sm border border-navy-900/20 px-5 py-3 font-bold text-navy-900 hover:bg-navy-900 hover:text-white"
                      >
                        {canEdit ? "Manage Album" : "View Album"}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <section
            aria-labelledby="staff-videos-heading"
            className="mt-12 border-t border-navy-900/10 pt-9"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
                  Direct uploads
                </p>
                <h2
                  id="staff-videos-heading"
                  className="mt-2 font-display text-3xl font-bold text-navy-900"
                >
                  Videos
                </h2>
              </div>
              {canCreate ? (
                <Link
                  href="/staff/media/videos/new"
                  className="inline-flex min-h-12 items-center justify-center rounded-sm border border-teal-700 px-5 py-3 font-bold text-teal-700 hover:bg-teal-100"
                >
                  Add Video
                </Link>
              ) : null}
            </div>

            {videosError ? (
              <p
                role="alert"
                className="mt-6 border-l-4 border-patriot-red bg-red-50 px-5 py-4 font-semibold text-navy-900"
              >
                Video records are temporarily unavailable.
              </p>
            ) : videos.length === 0 ? (
              <div className="mt-6 border border-navy-900/10 bg-white px-6 py-9 text-center">
                <h3 className="font-display text-2xl font-bold text-navy-900">
                  No video drafts yet
                </h3>
                <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">
                  Published and draft video records will be organized here.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {videos.map((video) => {
                  const canEdit =
                    access.staff.role === "admin" ||
                    (access.staff.role === "editor" &&
                      video.status === "draft");

                  return (
                    <article
                      key={video.id}
                      className="flex min-w-0 flex-col gap-4 border border-navy-900/10 bg-white p-5 shadow-[0_12px_30px_rgba(16,42,67,0.05)] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <MediaStatusBadge status={video.status} />
                          <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            {video.videoUploadCompletedAt
                              ? "Upload verified"
                              : "Upload incomplete"}
                          </span>
                        </div>
                        <h3 className="mt-3 break-words font-display text-xl font-bold text-navy-900">
                          {video.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                          Order {video.displayOrder}
                          {video.eventDate
                            ? ` - Event ${video.eventDate}`
                            : ""}
                        </p>
                      </div>
                      <Link
                        href={`/staff/media/items/${video.id}/edit`}
                        className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-sm border border-navy-900/20 px-5 py-3 font-bold text-navy-900 hover:bg-navy-900 hover:text-white"
                      >
                        {canEdit ? "Manage Video" : "View Video"}
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
