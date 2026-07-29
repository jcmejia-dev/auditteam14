"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { defaultOptions, Upload } from "tus-js-client";

import {
  cancelVideoUploadAction,
  finalizeVideoUploadAction,
  prepareVideoUploadAction,
  type VideoUploadRequest,
} from "@/app/staff/media/actions";
import { VIDEO_BUCKET } from "@/lib/media/storage";
import { getVideoTusEndpoint } from "@/lib/media/video-upload-client";
import {
  formatVideoBytes,
  validateVideoFile,
} from "@/lib/media/video-validation";
import { createClient } from "@/lib/supabase/client";

type AlbumOption = {
  id: string;
  title: string;
  status: "draft" | "published" | "archived";
};

type UploadStage =
  | "idle"
  | "validating"
  | "reserving"
  | "uploading"
  | "retrying"
  | "verifying"
  | "success"
  | "error"
  | "cancelled";

const inputClass =
  "mt-2 min-h-12 w-full rounded-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 shadow-sm focus:border-teal-700";

function fieldValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function VideoUploadForm({
  albums,
}: {
  albums: AlbumOption[];
}) {
  const router = useRouter();
  const uploadRef = useRef<Upload | null>(null);
  const reservationIdRef = useRef<string | null>(null);
  const submissionActiveRef = useRef(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, string>>
  >({});
  const [bytesUploaded, setBytesUploaded] = useState(0);
  const [bytesTotal, setBytesTotal] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [reservationId, setReservationId] = useState<string | null>(
    null,
  );
  const [canRetryUpload, setCanRetryUpload] = useState(false);
  const [canRetryVerification, setCanRetryVerification] =
    useState(false);

  const uploadInProgress =
    stage === "validating" ||
    stage === "reserving" ||
    stage === "uploading" ||
    stage === "retrying" ||
    stage === "verifying";
  const percentage =
    bytesTotal > 0
      ? Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100))
      : 0;

  async function verifyCompletedUpload(mediaId: string) {
    setStage("verifying");
    setMessage("Upload complete. Verifying the private stored object...");
    setCanRetryVerification(false);

    const result = await finalizeVideoUploadAction(mediaId);

    if (result.success && result.editPath) {
      setStage("success");
      setMessage(result.message);
      reservationIdRef.current = null;
      setReservationId(null);
      submissionActiveRef.current = false;
      router.push(result.editPath);
      router.refresh();
      return;
    }

    setStage("error");
    setMessage(result.message);
    setCanRetryVerification(true);
    submissionActiveRef.current = false;
  }

  async function startTusUpload(
    file: File,
    reservation: {
      mediaId: string;
      storagePath: string;
      contentType: "video/mp4" | "video/webm";
    },
  ) {
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (error || !accessToken) {
      setStage("error");
      setMessage(
        "Your secure session is unavailable. Sign in again before uploading.",
      );
      submissionActiveRef.current = false;
      return;
    }

    let endpoint: string;

    try {
      endpoint = getVideoTusEndpoint();
    } catch {
      setStage("error");
      setMessage(
        "The secure direct-upload address is unavailable. Ask an administrator to check the Supabase project URL.",
      );
      submissionActiveRef.current = false;
      return;
    }

    const upload = new Upload(file, {
      endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize: 6 * 1024 * 1024,
      uploadDataDuringCreation: false,
      removeFingerprintOnSuccess: true,
      storeFingerprintForResuming: false,
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-upsert": "false",
      },
      metadata: {
        bucketName: VIDEO_BUCKET,
        objectName: reservation.storagePath,
        contentType: reservation.contentType,
        cacheControl: "3600",
      },
      onProgress(uploaded, total) {
        setStage("uploading");
        setBytesUploaded(uploaded);
        setBytesTotal(total);
        setMessage("Uploading directly to secure Storage. Keep this page open.");
      },
      onShouldRetry(uploadError, attempt, options) {
        const shouldRetry =
          defaultOptions.onShouldRetry?.(
            uploadError,
            attempt,
            options,
          ) ?? false;

        if (shouldRetry) {
          setStage("retrying");
          setRetryAttempt(attempt + 1);
          setMessage(
            "The connection was interrupted. The upload will resume automatically.",
          );
        }

        return shouldRetry;
      },
      onError() {
        setStage("error");
        setMessage(
          "The upload was interrupted after automatic recovery attempts. Retry the upload or cancel it safely.",
        );
        setCanRetryUpload(true);
        submissionActiveRef.current = false;
      },
      onSuccess() {
        setBytesUploaded(file.size);
        setBytesTotal(file.size);
        void verifyCompletedUpload(reservation.mediaId);
      },
    });

    uploadRef.current = upload;
    setStage("uploading");
    setMessage("Starting the direct secure upload...");
    upload.start();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submissionActiveRef.current || uploadInProgress) {
      return;
    }

    submissionActiveRef.current = true;
    setMessage(null);
    setFieldErrors({});
    setCanRetryUpload(false);
    setCanRetryVerification(false);
    setBytesUploaded(0);
    setBytesTotal(selectedFile?.size ?? 0);
    setRetryAttempt(0);

    if (!selectedFile) {
      setStage("error");
      setFieldErrors({ file: "Choose an MP4 or WebM video." });
      setMessage("Choose a video before starting the upload.");
      submissionActiveRef.current = false;
      return;
    }

    setStage("validating");
    setMessage("Checking the selected video type, size, and signature...");
    const fileValidation = await validateVideoFile(selectedFile);

    if (!fileValidation.success) {
      setStage("error");
      setFieldErrors({ file: fileValidation.message });
      setMessage(fileValidation.message);
      submissionActiveRef.current = false;
      return;
    }

    const formData = new FormData(event.currentTarget);
    const displayOrder = Number(fieldValue(formData, "displayOrder"));
    const albumValue = fieldValue(formData, "albumId").trim();
    const request: VideoUploadRequest = {
      title: fieldValue(formData, "title"),
      accessibleDescription: fieldValue(
        formData,
        "accessibleDescription",
      ),
      caption: fieldValue(formData, "caption"),
      eventDate: fieldValue(formData, "eventDate"),
      displayOrder,
      albumId: albumValue || null,
      fileSize: selectedFile.size,
      contentType: fileValidation.contentType,
      extension: fileValidation.extension,
    };

    setStage("reserving");
    setMessage("Preparing a private draft and secure upload path...");
    const preparation = await prepareVideoUploadAction(request);

    if (!preparation.success) {
      setStage("error");
      setMessage(preparation.message);
      setFieldErrors(preparation.fieldErrors ?? {});
      submissionActiveRef.current = false;
      return;
    }

    reservationIdRef.current = preparation.reservation.mediaId;
    setReservationId(preparation.reservation.mediaId);
    await startTusUpload(selectedFile, preparation.reservation);
  }

  async function handleCancel() {
    const mediaId = reservationIdRef.current;

    if (!mediaId) {
      return;
    }

    setMessage("Stopping the upload and checking private cleanup...");

    try {
      await uploadRef.current?.abort(true);
    } catch {
      // The protected cleanup action still checks whether an object exists.
    }

    uploadRef.current = null;
    const result = await cancelVideoUploadAction(mediaId);
    setStage(result.success ? "cancelled" : "error");
    setMessage(result.message);
    setCanRetryUpload(false);
    setCanRetryVerification(false);
    reservationIdRef.current = null;
    setReservationId(null);
    submissionActiveRef.current = false;
    setBytesUploaded(0);
  }

  function handleRetryUpload() {
    if (!uploadRef.current || uploadInProgress) {
      return;
    }

    submissionActiveRef.current = true;
    setCanRetryUpload(false);
    setStage("retrying");
    setMessage("Recovering the interrupted upload...");
    uploadRef.current.start();
  }

  async function handleRetryVerification() {
    const mediaId = reservationIdRef.current;

    if (!mediaId || uploadInProgress) {
      return;
    }

    submissionActiveRef.current = true;
    await verifyCompletedUpload(mediaId);
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-0 space-y-7">
      {message ? (
        <div
          role={stage === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`border-l-4 px-5 py-4 font-semibold leading-7 text-navy-900 ${
            stage === "error"
              ? "border-patriot-red bg-red-50"
              : "border-teal-700 bg-teal-100"
          }`}
        >
          {message}
        </div>
      ) : null}

      <fieldset
        disabled={uploadInProgress}
        className="min-w-0 space-y-7 disabled:opacity-70"
      >
        <div>
          <label htmlFor="video-file" className="font-bold text-navy-900">
            Video file <span className="text-patriot-red">*</span>
          </label>
          <input
            id="video-file"
            type="file"
            required
            accept=".mp4,.webm,video/mp4,video/webm"
            aria-describedby="video-file-help video-file-selection"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0] ?? null;
              setSelectedFile(file);
              setFieldErrors((current) => ({ ...current, file: undefined }));
              setMessage(null);
              setStage("idle");
            }}
            className={`${inputClass} max-w-full overflow-hidden file:mr-4 file:min-h-10 file:rounded-sm file:border-0 file:bg-navy-900 file:px-5 file:py-2 file:font-bold file:text-white`}
          />
          <p
            id="video-file-help"
            className="mt-2 text-sm leading-6 text-slate-600"
          >
            MP4 or WebM only, maximum exactly 50 MB. For the widest browser and
            phone compatibility, use MP4 with H.264 video and AAC audio.
            Individual codecs inside MP4 or WebM may still vary by browser.
          </p>
          <p
            id="video-file-selection"
            className="mt-2 break-words text-sm font-semibold text-teal-700"
          >
            {selectedFile
              ? `Selected: ${selectedFile.name} (${formatVideoBytes(selectedFile.size)})`
              : "No video selected."}
          </p>
          {fieldErrors.file ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              {fieldErrors.file}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="video-title" className="font-bold text-navy-900">
            Video title <span className="text-patriot-red">*</span>
          </label>
          <input
            id="video-title"
            name="title"
            type="text"
            required
            maxLength={240}
            className={inputClass}
          />
          {fieldErrors.title ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              {fieldErrors.title}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="video-description"
            className="font-bold text-navy-900"
          >
            Accessible description <span className="text-patriot-red">*</span>
          </label>
          <textarea
            id="video-description"
            name="accessibleDescription"
            required
            rows={3}
            maxLength={500}
            className={`${inputClass} leading-7`}
          />
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Briefly describe the video for people who cannot see or hear all of
            it.
          </p>
          {fieldErrors.altText ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              {fieldErrors.altText}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="video-caption" className="font-bold text-navy-900">
            Public caption
          </label>
          <textarea
            id="video-caption"
            name="caption"
            rows={5}
            maxLength={2000}
            className={`${inputClass} leading-7`}
          />
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Optional plain text only. Include public-release information only.
          </p>
          {fieldErrors.caption ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              {fieldErrors.caption}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="video-event-date"
              className="font-bold text-navy-900"
            >
              Event date
            </label>
            <input
              id="video-event-date"
              name="eventDate"
              type="date"
              min="1900-01-01"
              className={inputClass}
            />
            {fieldErrors.eventDate ? (
              <p className="mt-2 text-sm font-semibold text-red-700">
                {fieldErrors.eventDate}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="video-display-order"
              className="font-bold text-navy-900"
            >
              Display order
            </label>
            <input
              id="video-display-order"
              name="displayOrder"
              type="number"
              min={0}
              max={100000}
              step={1}
              defaultValue={0}
              className={inputClass}
            />
            {fieldErrors.displayOrder ? (
              <p className="mt-2 text-sm font-semibold text-red-700">
                {fieldErrors.displayOrder}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="video-album" className="font-bold text-navy-900">
            Album
          </label>
          <select id="video-album" name="albumId" className={inputClass}>
            <option value="">No album - show in the video gallery</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title} ({album.status})
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Optional. A video attached to an album becomes public only when
            both the video and album are published.
          </p>
        </div>
      </fieldset>

      {bytesTotal > 0 && reservationId ? (
        <section
          aria-label="Upload progress"
          className="min-w-0 border border-navy-900/10 bg-cream p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-navy-900">
              {stage === "retrying"
                ? `Recovering connection (attempt ${retryAttempt})`
                : stage === "verifying"
                  ? "Verifying completed upload"
                  : "Video upload"}
            </p>
            <p className="font-bold text-teal-700">{percentage}%</p>
          </div>
          <progress
            className="mt-3 h-3 w-full accent-teal-700"
            max={bytesTotal}
            value={bytesUploaded}
          >
            {percentage}%
          </progress>
          <p className="mt-2 break-words text-sm text-slate-600">
            {formatVideoBytes(bytesUploaded)} of{" "}
            {formatVideoBytes(bytesTotal)}
          </p>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-navy-900/10 pt-6 sm:flex-row sm:flex-wrap">
        <button
          type="submit"
          disabled={uploadInProgress || Boolean(reservationId)}
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-6 py-3 font-bold text-white hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploadInProgress ? "Upload in progress..." : "Upload Video as Draft"}
        </button>
        {reservationId ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={stage === "verifying" || stage === "success"}
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-patriot-red px-6 py-3 font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel Upload
          </button>
        ) : null}
        {canRetryUpload ? (
          <button
            type="button"
            onClick={handleRetryUpload}
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-teal-700 px-6 py-3 font-bold text-teal-700 hover:bg-teal-100"
          >
            Retry Upload
          </button>
        ) : null}
        {canRetryVerification ? (
          <button
            type="button"
            onClick={handleRetryVerification}
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-teal-700 px-6 py-3 font-bold text-teal-700 hover:bg-teal-100"
          >
            Retry Verification
          </button>
        ) : null}
      </div>

      <p className="text-sm leading-6 text-slate-600">
        Keep this page open until verification finishes. If the internet
        briefly disconnects, the resumable upload automatically retries from
        the last accepted chunk.
      </p>
    </form>
  );
}
