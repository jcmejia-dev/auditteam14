"use client";

import { useActionState } from "react";

import type { MediaActionState } from "@/app/staff/media/actions";

const inputClass =
  "mt-2 min-h-12 w-full rounded-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 shadow-sm focus:border-teal-700";

export function PhotoUploadForm({
  action,
}: {
  action: (
    state: MediaActionState,
    formData: FormData,
  ) => Promise<MediaActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, {
    message: null,
  });

  return (
    <form action={formAction} className="space-y-7">
      {state.message ? (
        <div
          role="alert"
          className="border-l-4 border-patriot-red bg-red-50 px-5 py-4 font-semibold leading-7 text-navy-900"
        >
          {state.message}
        </div>
      ) : null}

      <fieldset disabled={pending} className="space-y-7 disabled:opacity-70">
        <div>
          <label htmlFor="photo-file" className="font-bold text-navy-900">
            Image file <span className="text-patriot-red">*</span>
          </label>
          <input
            id="photo-file"
            name="file"
            type="file"
            required
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            aria-describedby="photo-file-help"
            className={`${inputClass} file:mr-4 file:rounded-sm file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:font-bold file:text-white`}
          />
          <p
            id="photo-file-help"
            className="mt-2 text-sm leading-6 text-slate-600"
          >
            JPEG, PNG, or WebP only. Maximum 4 MB. GIF, TIFF, SVG, PDF, video,
            HTML, executables, and unknown formats are rejected.
          </p>
          {state.itemFieldErrors?.file ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              {state.itemFieldErrors.file}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="upload-title" className="font-bold text-navy-900">
            Photo title <span className="text-patriot-red">*</span>
          </label>
          <input
            id="upload-title"
            name="title"
            type="text"
            required
            maxLength={240}
            className={inputClass}
          />
          {state.itemFieldErrors?.title ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              {state.itemFieldErrors.title}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="upload-alt-text" className="font-bold text-navy-900">
            Image description <span className="text-patriot-red">*</span>
          </label>
          <textarea
            id="upload-alt-text"
            name="altText"
            required
            rows={3}
            maxLength={500}
            className={`${inputClass} leading-7`}
          />
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Describe what is visible for people using screen readers.
          </p>
          {state.itemFieldErrors?.altText ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              {state.itemFieldErrors.altText}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="upload-caption" className="font-bold text-navy-900">
            Public caption
          </label>
          <textarea
            id="upload-caption"
            name="caption"
            rows={5}
            maxLength={2000}
            className={`${inputClass} leading-7`}
          />
          {state.itemFieldErrors?.caption ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              {state.itemFieldErrors.caption}
            </p>
          ) : null}
        </div>

        <div className="max-w-xs">
          <label
            htmlFor="upload-display-order"
            className="font-bold text-navy-900"
          >
            Display order
          </label>
          <input
            id="upload-display-order"
            name="displayOrder"
            type="number"
            min={0}
            max={100000}
            step={1}
            defaultValue={0}
            className={inputClass}
          />
          {state.itemFieldErrors?.displayOrder ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              {state.itemFieldErrors.displayOrder}
            </p>
          ) : null}
        </div>

        <div className="border-t border-navy-900/10 pt-6">
          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-sm bg-teal-700 px-6 py-3 font-bold text-white hover:bg-navy-900 disabled:cursor-not-allowed sm:w-auto"
          >
            {pending ? "Uploading…" : "Upload as Draft"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
