import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  archiveMediaItemAction,
  deleteMediaItemAction,
  updateMediaItemAction,
} from "@/app/staff/media/actions";
import { MediaItemForm } from "@/components/staff/media-item-form";
import { MediaRecordAction } from "@/components/staff/media-record-action";
import { MediaStatusBadge } from "@/components/staff/media-status-badge";
import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import {
  createStaffVideoPreviewUrl,
  getStaffAlbum,
  getStaffMediaItem,
  getStaffVideoItem,
} from "@/lib/media/data";
import { isMediaUuid } from "@/lib/media/types";

export const metadata: Metadata = {
  title: "Media Item Details",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export default async function EditMediaItemPage({
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

  const initialItem = await getStaffMediaItem(supabase, id);
  const item =
    initialItem?.mediaType === "video"
      ? await getStaffVideoItem(supabase, id)
      : initialItem;

  if (!item) {
    notFound();
  }

  const album = item.albumId
    ? await getStaffAlbum(supabase, item.albumId)
    : null;

  const canEdit =
    access.staff.role === "admin" ||
    (access.staff.role === "editor" && item.status === "draft");
  const canPublish =
    access.staff.role === "admin" &&
    item.storagePath !== null &&
    (item.mediaType === "image" ||
      item.videoUploadCompletedAt !== null);
  const videoPreviewUrl =
    item.mediaType === "video" &&
    item.storagePath &&
    item.videoUploadCompletedAt
      ? await createStaffVideoPreviewUrl(supabase, item.storagePath)
      : null;
  const requestedNotice = (await searchParams).notice;
  const notice =
    requestedNotice === "video-uploaded"
      ? "The video was uploaded and saved as a private draft."
      : null;
  const updateAction = updateMediaItemAction.bind(null, id);
  const archiveAction = archiveMediaItemAction.bind(null, id);
  const deleteAction = deleteMediaItemAction.bind(null, id);

  return (
    <div className="min-h-screen bg-cream">
      <StaffPortalHeader
        displayName={access.staff.displayName}
        roleLabel={roleLabels[access.staff.role]}
      />
      <main className="page-shell py-9 sm:py-12">
        <nav aria-label="Staff breadcrumbs">
          <Link
            href={
              item.albumId
                ? `/staff/media/albums/${item.albumId}/edit`
                : "/staff/media"
            }
            className="font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            {album ? `Back to ${album.title}` : "Back to Media Gallery"}
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
          <section className="border border-navy-900/10 bg-white p-6 shadow-[0_16px_40px_rgba(16,42,67,0.07)] sm:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <MediaStatusBadge status={item.status} />
              <span className="text-sm font-bold text-slate-600">
                {item.mediaType === "image" ? "Photo" : "Direct video"}
              </span>
              {!canEdit ? (
                <span className="text-sm font-bold text-slate-600">
                  Read-only
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
              {canEdit ? "Manage Media Item" : "Media Item Details"}
            </h1>
            <p className="mt-3 mb-8 max-w-2xl text-lg leading-8 text-slate-600">
              {item.mediaType === "video"
                ? "Review the accessible description, caption, event date, and ordering before publication."
                : "Review the accessible description, caption, and ordering before publication."}
            </p>

            {videoPreviewUrl ? (
              <figure className="mb-8 border border-navy-900/10 bg-navy-950 p-3 sm:p-4">
                <video
                  controls
                  preload="metadata"
                  playsInline
                  aria-label={`Private preview: ${item.title}`}
                  aria-describedby="staff-video-preview-description"
                  className="aspect-video w-full bg-black object-contain"
                >
                  <source src={videoPreviewUrl} />
                  Your browser does not support the native video player.
                </video>
                <figcaption
                  id="staff-video-preview-description"
                  className="px-2 pt-3 text-sm leading-6 text-navy-100"
                >
                  Private staff preview. The signed playback link is temporary
                  and this page is not publicly cached.
                </figcaption>
              </figure>
            ) : null}

            {canEdit ? (
              <MediaItemForm
                action={updateAction}
                initialValues={{
                  title: item.title,
                  altText: item.altText ?? "",
                  caption: item.caption ?? "",
                  eventDate: item.eventDate ?? "",
                  displayOrder: item.displayOrder,
                }}
                role={access.staff.role}
                status={item.status}
                canPublish={canPublish}
                mediaType={item.mediaType}
              />
            ) : (
              <dl className="space-y-6">
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                    Title
                  </dt>
                  <dd className="mt-2 text-lg text-navy-900">
                    {item.title}
                  </dd>
                </div>
                {item.altText ? (
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      {item.mediaType === "video"
                        ? "Accessible description"
                        : "Image description"}
                    </dt>
                    <dd className="mt-2 leading-7 text-slate-700">
                      {item.altText}
                    </dd>
                  </div>
                ) : null}
                {item.caption ? (
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      Caption
                    </dt>
                    <dd className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                      {item.caption}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                    Display order
                  </dt>
                  <dd className="mt-2 text-slate-700">
                    {item.displayOrder}
                  </dd>
                </div>
              </dl>
                )}
                {item.mediaType === "video" && item.eventDate ? (
                  <div>
                    <dt className="text-sm font-bold uppercase tracking-[0.12em] text-teal-700">
                      Event date
                    </dt>
                    <dd className="mt-2 text-slate-700">
                      {item.eventDate}
                    </dd>
                  </div>
                ) : null}
          </section>

          <aside className="h-fit space-y-6 lg:sticky lg:top-6">
            <div className="border-t-4 border-gold-500 bg-navy-900 p-6 text-white">
              <h2 className="font-display text-2xl font-bold">File status</h2>
              <p className="mt-3 text-sm leading-6 text-navy-100">
                {item.storagePath
                  ? item.mediaType === "video" &&
                    !item.videoUploadCompletedAt
                    ? "A private video draft is reserved, but its completed upload has not been verified. It cannot be published."
                    : "A protected Storage object is attached. Its path is intentionally hidden."
                  : "No protected file is attached, so this item cannot be published."}
              </p>
            </div>

            {access.staff.role === "admin" ? (
              <div className="border border-navy-900/10 bg-white p-6">
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  Media actions
                </h2>
                <div className="mt-5 space-y-4">
                  {item.status !== "archived" ? (
                    <MediaRecordAction
                      action={archiveAction}
                      label="Archive Media Item"
                      confirmation="Archive this media item? It will no longer appear publicly."
                    />
                  ) : null}
                  <MediaRecordAction
                    action={deleteAction}
                    label="Delete Permanently"
                    confirmation="Permanently delete this media item and its stored file? This cannot be undone."
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
