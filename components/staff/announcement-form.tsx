"use client";

import { useActionState } from "react";

import type { AnnouncementActionState } from "@/app/staff/announcements/actions";
import type {
  AnnouncementFormValues,
  PublicationStatus,
} from "@/lib/announcements/types";
import type { StaffRole } from "@/lib/auth/staff";

type AnnouncementFormProps = {
  action: (
    state: AnnouncementActionState,
    formData: FormData,
  ) => Promise<AnnouncementActionState>;
  initialValues?: AnnouncementFormValues;
  mode: "create" | "edit";
  role: StaffRole;
  status?: PublicationStatus;
};

const emptyValues: AnnouncementFormValues = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  isFeatured: false,
  expiresOn: "",
  displayOrder: 0,
};

const inputClass =
  "mt-2 min-h-12 w-full rounded-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 shadow-sm placeholder:text-slate-400 focus:border-teal-700";

export function AnnouncementForm({
  action,
  initialValues = emptyValues,
  mode,
  role,
  status,
}: AnnouncementFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    message: null,
  });
  const canPublish = role === "admin";
  const saveIntent = mode === "create" ? "draft" : "save";

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
          <label htmlFor="title" className="font-bold text-navy-900">
            Title <span className="text-patriot-red">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={240}
            defaultValue={initialValues.title}
            aria-describedby={
              state.fieldErrors?.title ? "title-error" : "title-help"
            }
            aria-invalid={Boolean(state.fieldErrors?.title)}
            className={inputClass}
          />
          {state.fieldErrors?.title ? (
            <p id="title-error" className="mt-2 text-sm font-semibold text-red-700">
              {state.fieldErrors.title}
            </p>
          ) : (
            <p id="title-help" className="mt-2 text-sm leading-6 text-slate-600">
              Use a clear public-facing title.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="font-bold text-navy-900">
            Web address name <span className="text-patriot-red">*</span>
          </label>
          <div className="mt-2 flex min-h-12 items-stretch">
            <span className="flex items-center rounded-l-sm border border-r-0 border-navy-900/20 bg-cream-dark px-3 text-sm text-slate-600">
              /announcements/
            </span>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              maxLength={160}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={initialValues.slug}
              aria-describedby={
                state.fieldErrors?.slug ? "slug-error" : "slug-help"
              }
              aria-invalid={Boolean(state.fieldErrors?.slug)}
              className="min-w-0 flex-1 rounded-r-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 shadow-sm focus:border-teal-700"
            />
          </div>
          {state.fieldErrors?.slug ? (
            <p id="slug-error" className="mt-2 text-sm font-semibold text-red-700">
              {state.fieldErrors.slug}
            </p>
          ) : (
            <p id="slug-help" className="mt-2 text-sm leading-6 text-slate-600">
              Lowercase letters, numbers, and single hyphens only.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="summary" className="font-bold text-navy-900">
            Short summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            maxLength={600}
            defaultValue={initialValues.summary}
            aria-describedby={
              state.fieldErrors?.summary ? "summary-error" : "summary-help"
            }
            aria-invalid={Boolean(state.fieldErrors?.summary)}
            className={inputClass}
          />
          {state.fieldErrors?.summary ? (
            <p
              id="summary-error"
              className="mt-2 text-sm font-semibold text-red-700"
            >
              {state.fieldErrors.summary}
            </p>
          ) : (
            <p id="summary-help" className="mt-2 text-sm leading-6 text-slate-600">
              Optional. Up to 600 characters.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="body" className="font-bold text-navy-900">
            Announcement text <span className="text-patriot-red">*</span>
          </label>
          <textarea
            id="body"
            name="body"
            rows={12}
            required
            maxLength={20000}
            defaultValue={initialValues.body}
            aria-describedby={
              state.fieldErrors?.body ? "body-error" : "body-help"
            }
            aria-invalid={Boolean(state.fieldErrors?.body)}
            className={`${inputClass} leading-7`}
          />
          {state.fieldErrors?.body ? (
            <p id="body-error" className="mt-2 text-sm font-semibold text-red-700">
              {state.fieldErrors.body}
            </p>
          ) : (
            <p id="body-help" className="mt-2 text-sm leading-6 text-slate-600">
              Plain text only. Formatting code and HTML are not accepted.
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="expiresOn" className="font-bold text-navy-900">
              Expiration date
            </label>
            <input
              id="expiresOn"
              name="expiresOn"
              type="date"
              defaultValue={initialValues.expiresOn}
              aria-describedby={
                state.fieldErrors?.expiresOn
                  ? "expires-error"
                  : "expires-help"
              }
              aria-invalid={Boolean(state.fieldErrors?.expiresOn)}
              className={inputClass}
            />
            {state.fieldErrors?.expiresOn ? (
              <p
                id="expires-error"
                className="mt-2 text-sm font-semibold text-red-700"
              >
                {state.fieldErrors.expiresOn}
              </p>
            ) : (
              <p
                id="expires-help"
                className="mt-2 text-sm leading-6 text-slate-600"
              >
                Optional. The announcement stops appearing publicly after this
                date.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="displayOrder" className="font-bold text-navy-900">
              Display order
            </label>
            <input
              id="displayOrder"
              name="displayOrder"
              type="number"
              min={0}
              max={100000}
              step={1}
              defaultValue={initialValues.displayOrder}
              aria-describedby={
                state.fieldErrors?.displayOrder
                  ? "order-error"
                  : "order-help"
              }
              aria-invalid={Boolean(state.fieldErrors?.displayOrder)}
              className={inputClass}
            />
            {state.fieldErrors?.displayOrder ? (
              <p
                id="order-error"
                className="mt-2 text-sm font-semibold text-red-700"
              >
                {state.fieldErrors.displayOrder}
              </p>
            ) : (
              <p id="order-help" className="mt-2 text-sm leading-6 text-slate-600">
                Use zero unless a deliberate ordering is needed.
              </p>
            )}
          </div>
        </div>

        <label className="flex min-h-14 cursor-pointer items-start gap-4 rounded-sm border border-navy-900/15 bg-cream px-5 py-4">
          <input
            name="isFeatured"
            type="checkbox"
            defaultChecked={initialValues.isFeatured}
            className="mt-0.5 size-5 accent-teal-700"
          />
          <span>
            <span className="block font-bold text-navy-900">
              Feature this announcement
            </span>
            <span className="mt-1 block text-sm leading-6 text-slate-600">
              Featured announcements receive priority in the public list after
              publication.
            </span>
          </span>
        </label>

        <div className="flex flex-col gap-3 border-t border-navy-900/10 pt-6 sm:flex-row">
          <button
            type="submit"
            name="intent"
            value={saveIntent}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-6 py-3 font-bold text-white shadow-sm hover:bg-navy-900 disabled:cursor-not-allowed"
          >
            {pending
              ? "Saving…"
              : mode === "create"
                ? "Save Draft"
                : "Save Changes"}
          </button>
          {canPublish ? (
            <button
              type="submit"
              name="intent"
              value="publish"
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold-500 px-6 py-3 font-bold text-navy-950 shadow-sm hover:bg-gold-600 hover:text-white disabled:cursor-not-allowed"
            >
              {pending
                ? "Saving…"
                : status === "published"
                  ? "Update Published Announcement"
                  : "Publish Announcement"}
            </button>
          ) : null}
        </div>
      </fieldset>
    </form>
  );
}
