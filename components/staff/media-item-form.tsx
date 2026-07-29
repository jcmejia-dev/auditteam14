"use client";

import { useActionState } from "react";

import type { MediaActionState } from "@/app/staff/media/actions";
import type { StaffRole } from "@/lib/auth/staff";
import type {
  MediaItemFormValues,
  MediaPublicationStatus,
} from "@/lib/media/types";

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

export function MediaItemForm({
  action,
  initialValues,
  role,
  status,
  canPublish,
}: {
  action: (
    state: MediaActionState,
    formData: FormData,
  ) => Promise<MediaActionState>;
  initialValues: MediaItemFormValues;
  role: StaffRole;
  status: MediaPublicationStatus;
  canPublish: boolean;
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
          <label htmlFor="media-title" className="font-bold text-navy-900">
            Photo title <span className="text-patriot-red">*</span>
          </label>
          <input
            id="media-title"
            name="title"
            type="text"
            required
            maxLength={240}
            defaultValue={initialValues.title}
            aria-invalid={Boolean(state.itemFieldErrors?.title)}
            className={inputClass}
          />
          <FieldError
            id="media-title-error"
            message={state.itemFieldErrors?.title}
          />
        </div>

        <div>
          <label htmlFor="media-alt-text" className="font-bold text-navy-900">
            Image description <span className="text-patriot-red">*</span>
          </label>
          <textarea
            id="media-alt-text"
            name="altText"
            required
            rows={3}
            maxLength={500}
            defaultValue={initialValues.altText}
            aria-invalid={Boolean(state.itemFieldErrors?.altText)}
            className={`${inputClass} leading-7`}
          />
          <FieldError
            id="media-alt-text-error"
            message={state.itemFieldErrors?.altText}
          />
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Briefly describe what is visible for people using screen readers.
          </p>
        </div>

        <div>
          <label htmlFor="media-caption" className="font-bold text-navy-900">
            Public caption
          </label>
          <textarea
            id="media-caption"
            name="caption"
            rows={5}
            maxLength={2000}
            defaultValue={initialValues.caption}
            aria-invalid={Boolean(state.itemFieldErrors?.caption)}
            className={`${inputClass} leading-7`}
          />
          <FieldError
            id="media-caption-error"
            message={state.itemFieldErrors?.caption}
          />
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Optional plain text only. Do not identify private individuals or
            include confidential information.
          </p>
        </div>

        <div className="max-w-xs">
          <label
            htmlFor="media-display-order"
            className="font-bold text-navy-900"
          >
            Display order
          </label>
          <input
            id="media-display-order"
            name="displayOrder"
            type="number"
            min={0}
            max={100000}
            step={1}
            defaultValue={initialValues.displayOrder}
            aria-invalid={Boolean(state.itemFieldErrors?.displayOrder)}
            className={inputClass}
          />
          <FieldError
            id="media-order-error"
            message={state.itemFieldErrors?.displayOrder}
          />
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Lower numbers appear first.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-navy-900/10 pt-6 sm:flex-row">
          <button
            type="submit"
            name="intent"
            value="save"
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-6 py-3 font-bold text-white hover:bg-navy-900 disabled:cursor-not-allowed"
          >
            {pending
              ? "Saving…"
              : status === "draft"
                ? "Save Draft"
                : "Save Changes"}
          </button>
          {role === "admin" && canPublish ? (
            <button
              type="submit"
              name="intent"
              value="publish"
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold-500 px-6 py-3 font-bold text-navy-950 hover:bg-gold-600 hover:text-white disabled:cursor-not-allowed"
            >
              {pending
                ? "Saving…"
                : status === "published"
                  ? "Update Published Photo"
                  : "Publish Photo"}
            </button>
          ) : null}
        </div>
      </fieldset>
    </form>
  );
}
