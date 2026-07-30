"use client";

import { useActionState } from "react";

import type { MediaActionState } from "@/app/staff/media/actions";
import type { StaffRole } from "@/lib/auth/staff";
import type {
  AlbumFormValues,
  MediaPublicationStatus,
} from "@/lib/media/types";

const emptyValues: AlbumFormValues = {
  title: "",
  description: "",
  displayOrder: 0,
};

const inputClass =
  "mt-2 min-h-12 w-full rounded-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 shadow-sm placeholder:text-slate-400 focus:border-teal-700";

function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}) {
  return message ? (
    <p id={id} className="mt-2 text-sm font-semibold text-red-700">
      {message}
    </p>
  ) : null;
}

export function AlbumForm({
  action,
  initialValues = emptyValues,
  mode,
  role,
  status,
}: {
  action: (
    state: MediaActionState,
    formData: FormData,
  ) => Promise<MediaActionState>;
  initialValues?: AlbumFormValues;
  mode: "create" | "edit";
  role: StaffRole;
  status?: MediaPublicationStatus;
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
          <label htmlFor="album-title" className="font-bold text-navy-900">
            Album title <span className="text-patriot-red">*</span>
          </label>
          <input
            id="album-title"
            name="title"
            type="text"
            required
            maxLength={240}
            defaultValue={initialValues.title}
            aria-invalid={Boolean(state.albumFieldErrors?.title)}
            aria-describedby={
              state.albumFieldErrors?.title
                ? "album-title-error"
                : "album-title-help"
            }
            className={inputClass}
          />
          <FieldError
            id="album-title-error"
            message={state.albumFieldErrors?.title}
          />
          {!state.albumFieldErrors?.title ? (
            <p
              id="album-title-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Use a short public title that describes the occasion.
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="album-description"
            className="font-bold text-navy-900"
          >
            Description
          </label>
          <textarea
            id="album-description"
            name="description"
            rows={5}
            maxLength={2000}
            defaultValue={initialValues.description}
            aria-invalid={Boolean(state.albumFieldErrors?.description)}
            aria-describedby={
              state.albumFieldErrors?.description
                ? "album-description-error"
                : "album-description-help"
            }
            className={`${inputClass} leading-7`}
          />
          <FieldError
            id="album-description-error"
            message={state.albumFieldErrors?.description}
          />
          {!state.albumFieldErrors?.description ? (
            <p
              id="album-description-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Optional plain text only. Do not include personal or confidential
              information.
            </p>
          ) : null}
        </div>

        <div className="max-w-xs">
          <label
            htmlFor="album-display-order"
            className="font-bold text-navy-900"
          >
            Display order
          </label>
          <input
            id="album-display-order"
            name="displayOrder"
            type="number"
            min={0}
            max={100000}
            step={1}
            defaultValue={initialValues.displayOrder}
            aria-invalid={Boolean(state.albumFieldErrors?.displayOrder)}
            aria-describedby={
              state.albumFieldErrors?.displayOrder
                ? "album-order-error"
                : "album-order-help"
            }
            className={inputClass}
          />
          <FieldError
            id="album-order-error"
            message={state.albumFieldErrors?.displayOrder}
          />
          {!state.albumFieldErrors?.displayOrder ? (
            <p
              id="album-order-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Lower numbers appear first. Use zero unless ordering is needed.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-navy-900/10 pt-6 sm:flex-row">
          <button
            type="submit"
            name="intent"
            value={mode === "create" ? "draft" : "save"}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-6 py-3 font-bold text-white shadow-sm hover:bg-navy-900 disabled:cursor-not-allowed"
          >
            {pending
              ? "Saving…"
              : mode === "create" || status === "draft"
                ? "Save Draft"
                : "Save Changes"}
          </button>
          {mode === "edit" && role === "admin" ? (
            <button
              type="submit"
              name="intent"
              value="publish"
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold-500 px-6 py-3 font-bold text-navy-950 shadow-sm hover:bg-gold-600 hover:text-white disabled:cursor-not-allowed"
            >
              {pending
                ? "Saving…"
                : status === "published"
                  ? "Update Published Album"
                  : "Publish Album"}
            </button>
          ) : null}
        </div>
      </fieldset>
    </form>
  );
}
