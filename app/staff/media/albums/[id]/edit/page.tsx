import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  archiveAlbumAction,
  deleteAlbumAction,
  updateAlbumAction,
} from "@/app/staff/media/actions";
import { AlbumForm } from "@/components/staff/album-form";
import { MediaRecordAction } from "@/components/staff/media-record-action";
import { MediaStatusBadge } from "@/components/staff/media-status-badge";
import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import {
  getStaffAlbum,
  getStaffMediaItems,
} from "@/lib/media/data";
import { isMediaUuid } from "@/lib/media/types";

export const metadata: Metadata = {
  title: "Manage Media Album",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

const notices: Record<string, string> = {
  "photo-archived": "The photo was archived.",
  "photo-deleted": "The photo and its stored file were deleted.",
  "photo-published": "The photo was published.",
  "photo-updated": "The photo details were saved.",
  "photo-uploaded": "The photo was uploaded as a draft.",
  "video-archived": "The video was archived.",
  "video-deleted": "The video and its private file were deleted.",
  "video-published": "The video was published.",
  "video-updated": "The video details were saved.",
};

export default async function EditAlbumPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { id } = await params;
  const { access, supabase } = await getStaffContext();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  if (!isMediaUuid(id)) {
    notFound();
  }

  const album = await getStaffAlbum(supabase, id);

  if (!album) {
    notFound();
  }

  const { items, error: itemsError } = await getStaffMediaItems(
    supabase,
    id,
  );
  const requestedNotice = (await searchParams).notice;
  const noticeKey =
    typeof requestedNotice === "string" ? requestedNotice : undefined;
  const notice = noticeKey ? notices[noticeKey] : undefined;
  const canEdit =
    access.staff.role === "admin" ||
    (access.staff.role === "editor" && album.status === "draft");
  const canAddPhoto =
    access.staff.role === "admin" ||
    (access.staff.role === "editor" && album.status === "draft");
  const updateAction = updateAlbumAction.bind(null, id);
  const archiveAction = archiveAlbumAction.bind(null, id);
  const deleteAction = deleteAlbumAction.bind(null, id);

  return (
    <div className="min-h-screen bg-cream">
      <StaffPortalHeader
        displayName={access.staff.displayName}
        roleLabel={roleLabels[access.staff.role]}
      />
      <main className="page-shell py-9 sm:py-12">
        <nav aria-label="Staff breadcrumbs">
          <Link
            href="/staff/media"
            className="font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            Back to Media Gallery
          </Link>
        </nav>

        {notice ? (
          <p
            role="status"
            className="mt-6 border-l-4 border-teal-700 bg-teal-100 px-5 py-4 font-semibold text-navy-900"
          >
            {notice}
          </p>
        ) : null}

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-8">
            <section className="border border-navy-900/10 bg-white p-6 shadow-[0_16px_40px_rgba(16,42,67,0.07)] sm:p-9">
              <div className="flex flex-wrap items-center gap-3">
                <MediaStatusBadge status={album.status} />
                {!canEdit ? (
                  <span className="text-sm font-bold text-slate-600">
                    Read-only
                  </span>
                ) : null}
              </div>
              <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
                {canEdit ? "Manage Album" : "Album Details"}
              </h1>
              <p className="mt-3 mb-8 max-w-2xl text-lg leading-8 text-slate-600">
                {canEdit
                  ? "Review the album details before saving or publishing."
                  : "Your active role can view this album but cannot change it."}
              </p>

              {canEdit ? (
                <AlbumForm
                  action={updateAction}
                  initialValues={{
                    title: album.title,
                    slug: album.slug,
                    description: album.description ?? "",
                    displayOrder: album.displayOrder,
                  }}
                  mode="edit"
                  role={access.staff.role}
                  status={album.status}
                />
              ) : (
                <dl className="space-y-6">
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      Album title
                    </dt>
                    <dd className="mt-2 text-lg text-navy-900">
                      {album.title}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      Web address name
                    </dt>
                    <dd className="mt-2 break-words text-slate-700">
                      {album.slug}
                    </dd>
                  </div>
                  {album.description ? (
                    <div>
                      <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                        Description
                      </dt>
                      <dd className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                        {album.description}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              )}
            </section>

            <section
              aria-labelledby="album-photos-heading"
              className="border border-navy-900/10 bg-white p-6 shadow-[0_14px_35px_rgba(16,42,67,0.06)] sm:p-9"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
                    Album contents
                  </p>
                  <h2
                    id="album-photos-heading"
                    className="mt-2 font-display text-3xl font-bold text-navy-900"
                  >
                    Album media
                  </h2>
                </div>
                {canAddPhoto ? (
                  <Link
                    href={`/staff/media/albums/${id}/items/new`}
                    className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-5 py-3 font-bold text-white hover:bg-navy-900"
                  >
                    Add Photo
                  </Link>
                ) : null}
              </div>

              {itemsError ? (
                <p role="alert" className="mt-6 font-semibold text-red-700">
                  The album contents are temporarily unavailable.
                </p>
              ) : items.length === 0 ? (
                <div className="mt-6 border border-navy-900/10 bg-cream px-5 py-8 text-center">
                  <h3 className="font-display text-2xl font-bold text-navy-900">
                    No media items yet
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600">
                    Add an approved photograph as a draft when Storage is
                    ready.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {items.map((item) => {
                    const itemCanEdit =
                      access.staff.role === "admin" ||
                      (access.staff.role === "editor" &&
                        item.status === "draft");

                    return (
                      <article
                        key={item.id}
                        className="flex flex-col gap-4 border border-navy-900/10 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <MediaStatusBadge status={item.status} />
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                              {item.mediaType === "image"
                                ? "Photo"
                                : "Video"}
                            </span>
                          </div>
                          <h3 className="mt-3 font-display text-xl font-bold text-navy-900">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600">
                            Order {item.displayOrder}
                            {item.storagePath ? " · File attached" : " · No file"}
                          </p>
                        </div>
                        <Link
                          href={`/staff/media/items/${item.id}/edit`}
                          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-sm border border-navy-900/20 px-5 py-3 font-bold text-navy-900 hover:bg-navy-900 hover:text-white"
                        >
                          {itemCanEdit ? "Manage" : "View"}
                        </Link>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="h-fit space-y-6 lg:sticky lg:top-6">
            <div className="border-t-4 border-gold-500 bg-navy-900 p-6 text-white">
              <h2 className="font-display text-2xl font-bold">Publishing</h2>
              <p className="mt-3 text-sm leading-6 text-navy-100">
                Publish approved photos first. An album needs at least one
                published photo before it can be published.
              </p>
              {album.status === "published" ? (
                <Link
                  href={`/photos/${album.slug}`}
                  className="mt-5 inline-flex min-h-11 items-center font-bold text-gold-200 underline underline-offset-4"
                >
                  View public album
                </Link>
              ) : null}
            </div>

            {access.staff.role === "admin" ? (
              <div className="border border-navy-900/10 bg-white p-6">
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  Album actions
                </h2>
                <div className="mt-5 space-y-4">
                  {album.status !== "archived" ? (
                    <MediaRecordAction
                      action={archiveAction}
                      label="Archive Album"
                      confirmation="Archive this album? Its photos will no longer appear publicly."
                    />
                  ) : null}
                  <MediaRecordAction
                    action={deleteAction}
                    label="Delete Album Permanently"
                    confirmation="Permanently delete this empty album? This cannot be undone."
                    tone="danger"
                  />
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}
