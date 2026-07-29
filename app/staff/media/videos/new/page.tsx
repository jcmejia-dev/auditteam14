import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StaffPortalHeader } from "@/components/staff/staff-portal-header";
import { VideoUploadForm } from "@/components/staff/video-upload-form";
import { getStaffContext, type StaffRole } from "@/lib/auth/staff";
import { getStaffAlbums } from "@/lib/media/data";
import { isVideoStorageReady } from "@/lib/media/storage";

export const metadata: Metadata = {
  title: "Add Video",
};

const roleLabels: Record<StaffRole, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export default async function AddVideoPage() {
  const { access, supabase } = await getStaffContext();

  if (access.status === "unauthenticated") {
    redirect("/staff/login");
  }

  if (access.status === "unauthorized") {
    redirect("/staff/access-denied");
  }

  if (access.staff.role === "viewer") {
    redirect("/staff/media");
  }

  const [{ albums, error: albumsError }, storageReady] =
    await Promise.all([
      getStaffAlbums(supabase),
      isVideoStorageReady(supabase),
    ]);
  const allowedAlbums = albums
    .filter(
      (album) =>
        access.staff.role === "admin" || album.status === "draft",
    )
    .map((album) => ({
      id: album.id,
      title: album.title,
      status: album.status,
    }));

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

        <div className="mt-7 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="min-w-0 border border-navy-900/10 bg-white p-6 shadow-[0_16px_40px_rgba(16,42,67,0.07)] sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              Direct secure upload
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
              Add Video
            </h1>
            <p className="mt-3 mb-8 max-w-2xl text-lg leading-8 text-slate-600">
              Upload one approved MP4 or WebM file directly to private Storage
              and save it as a draft for review.
            </p>

            {albumsError ? (
              <div
                role="alert"
                className="border-l-4 border-patriot-red bg-red-50 px-6 py-6"
              >
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  Album choices are unavailable
                </h2>
                <p className="mt-3 leading-7 text-slate-700">
                  Please refresh the page before preparing a video upload.
                </p>
              </div>
            ) : storageReady ? (
              <VideoUploadForm albums={allowedAlbums} />
            ) : (
              <div
                role="status"
                className="border-l-4 border-gold-500 bg-gold-100 px-6 py-6"
              >
                <h2 className="font-display text-2xl font-bold text-navy-900">
                  Secure video uploads are not enabled yet
                </h2>
                <p className="mt-3 leading-7 text-slate-700">
                  The reviewed video metadata and private-bucket migration must
                  be applied and verified before this form becomes available.
                  No video was accepted or uploaded.
                </p>
              </div>
            )}
          </section>

          <aside className="h-fit border-t-4 border-gold-500 bg-navy-900 p-6 text-white lg:sticky lg:top-6">
            <h2 className="font-display text-2xl font-bold">Video safety</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-navy-100">
              <li>MP4 or WebM only.</li>
              <li>Maximum file size: exactly 50 MB.</li>
              <li>MP4 with H.264 video and AAC audio is recommended.</li>
              <li>No transcoding, thumbnails, FFmpeg, or Sharp processing.</li>
              <li>Upload approved public-release media only.</li>
              <li>Keep this page open until verification finishes.</li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}
