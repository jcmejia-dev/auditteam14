import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { uploadPhotoAction } from "@/app/staff/media/actions";
import { PhotoUploadForm } from "@/components/staff/photo-upload-form";
import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import { getStaffAlbum } from "@/lib/media/data";
import { isMediaStorageReady } from "@/lib/media/storage";
import { isMediaUuid } from "@/lib/media/types";

export const metadata: Metadata = {
  title: "Add Photo",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export default async function NewMediaItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  if (
    access.staff.role === "viewer" ||
    (access.staff.role === "editor" && album.status !== "draft")
  ) {
    redirect(`/staff/media/albums/${id}/edit`);
  }

  const storageReady = await isMediaStorageReady(supabase, id);
  const uploadAction = uploadPhotoAction.bind(null, id);

  return (
    <div className="min-h-screen bg-cream">
      <StaffPortalHeader
        displayName={access.staff.displayName}
        roleLabel={roleLabels[access.staff.role]}
      />
      <main className="page-shell py-9 sm:py-12">
        <nav aria-label="Staff breadcrumbs">
          <Link
            href={`/staff/media/albums/${id}/edit`}
            className="font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            Back to Album
          </Link>
        </nav>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="border border-navy-900/10 bg-white p-6 shadow-[0_16px_40px_rgba(16,42,67,0.07)] sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              {album.title}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
              Add Photo
            </h1>
            <p className="mt-3 mb-8 max-w-2xl text-lg leading-8 text-slate-600">
              Upload one approved image and save it as a draft for review.
            </p>

            {storageReady ? (
              <PhotoUploadForm action={uploadAction} />
            ) : (
              <div
                role="status"
                className="border-l-4 border-gold-500 bg-gold-100 px-6 py-6"
              >
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  Secure uploads are not enabled yet
                </h2>
                <p className="mt-3 leading-7 text-slate-700">
                  The reviewed private bucket migration must be applied and
                  verified before this form becomes available. No file was
                  accepted or uploaded.
                </p>
              </div>
            )}
          </section>

          <aside className="h-fit border-t-4 border-gold-500 bg-navy-900 p-6 text-white lg:sticky lg:top-6">
            <h2 className="font-display text-2xl font-bold">Image safety</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-navy-100">
              <li>JPEG, PNG, or WebP only.</li>
              <li>Maximum file size: 4 MB.</li>
              <li>Files are never resized or processed with Sharp.</li>
              <li>Videos, GIF, TIFF, SVG, PDF, and HTML are rejected.</li>
              <li>Upload public-release media only.</li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}
