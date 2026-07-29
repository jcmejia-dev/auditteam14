"use client";

import { useActionState } from "react";

import type { ActivityActionState } from "@/app/staff/activities/actions";
import type {
  ActivityFormValues,
  ActivityPublicationStatus,
} from "@/lib/activities/types";
import type { StaffRole } from "@/lib/auth/staff";

type ActivityFormProps = {
  action: (
    state: ActivityActionState,
    formData: FormData,
  ) => Promise<ActivityActionState>;
  initialValues?: ActivityFormValues;
  mode: "create" | "edit";
  role: StaffRole;
  status?: ActivityPublicationStatus;
};

const emptyValues: ActivityFormValues = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  activityDate: "",
  locationText: "",
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

export function ActivityForm({
  action,
  initialValues = emptyValues,
  mode,
  role,
  status,
}: ActivityFormProps) {
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
          <label htmlFor="activity-title" className="font-bold text-navy-900">
            Title <span className="text-patriot-red">*</span>
          </label>
          <input
            id="activity-title"
            name="title"
            type="text"
            required
            maxLength={240}
            defaultValue={initialValues.title}
            aria-invalid={Boolean(state.fieldErrors?.title)}
            aria-describedby={
              state.fieldErrors?.title
                ? "activity-title-error"
                : "activity-title-help"
            }
            className={inputClass}
          />
          <FieldError
            id="activity-title-error"
            message={state.fieldErrors?.title}
          />
          {!state.fieldErrors?.title ? (
            <p
              id="activity-title-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Use a clear, public-facing activity title.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="activity-slug" className="font-bold text-navy-900">
            Web address name <span className="text-patriot-red">*</span>
          </label>
          <div className="mt-2 flex min-h-12 items-stretch">
            <span className="flex items-center rounded-l-sm border border-r-0 border-navy-900/20 bg-cream-dark px-3 text-sm text-slate-600">
              /activities/
            </span>
            <input
              id="activity-slug"
              name="slug"
              type="text"
              required
              maxLength={160}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={initialValues.slug}
              aria-invalid={Boolean(state.fieldErrors?.slug)}
              aria-describedby={
                state.fieldErrors?.slug
                  ? "activity-slug-error"
                  : "activity-slug-help"
              }
              className="min-w-0 flex-1 rounded-r-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 shadow-sm focus:border-teal-700"
            />
          </div>
          <FieldError
            id="activity-slug-error"
            message={state.fieldErrors?.slug}
          />
          {!state.fieldErrors?.slug ? (
            <p
              id="activity-slug-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Lowercase letters, numbers, and single hyphens only.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="activity-summary" className="font-bold text-navy-900">
            Short summary
          </label>
          <textarea
            id="activity-summary"
            name="summary"
            rows={3}
            maxLength={600}
            defaultValue={initialValues.summary}
            aria-invalid={Boolean(state.fieldErrors?.summary)}
            aria-describedby={
              state.fieldErrors?.summary
                ? "activity-summary-error"
                : "activity-summary-help"
            }
            className={inputClass}
          />
          <FieldError
            id="activity-summary-error"
            message={state.fieldErrors?.summary}
          />
          {!state.fieldErrors?.summary ? (
            <p
              id="activity-summary-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Optional. Up to 600 characters.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="activity-body" className="font-bold text-navy-900">
            Activity details
          </label>
          <textarea
            id="activity-body"
            name="body"
            rows={10}
            maxLength={20000}
            defaultValue={initialValues.body}
            aria-invalid={Boolean(state.fieldErrors?.body)}
            aria-describedby={
              state.fieldErrors?.body
                ? "activity-body-error"
                : "activity-body-help"
            }
            className={`${inputClass} leading-7`}
          />
          <FieldError
            id="activity-body-error"
            message={state.fieldErrors?.body}
          />
          {!state.fieldErrors?.body ? (
            <p
              id="activity-body-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Optional plain text only. Do not enter HTML or confidential audit
              information.
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="activity-date" className="font-bold text-navy-900">
              Activity date
            </label>
            <input
              id="activity-date"
              name="activityDate"
              type="date"
              defaultValue={initialValues.activityDate}
              aria-invalid={Boolean(state.fieldErrors?.activityDate)}
              aria-describedby={
                state.fieldErrors?.activityDate
                  ? "activity-date-error"
                  : "activity-date-help"
              }
              className={inputClass}
            />
            <FieldError
              id="activity-date-error"
              message={state.fieldErrors?.activityDate}
            />
            {!state.fieldErrors?.activityDate ? (
              <p
                id="activity-date-help"
                className="mt-2 text-sm leading-6 text-slate-600"
              >
                Optional. This determines upcoming or completed status.
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="activity-location"
              className="font-bold text-navy-900"
            >
              General location
            </label>
            <input
              id="activity-location"
              name="locationText"
              type="text"
              maxLength={240}
              defaultValue={initialValues.locationText}
              aria-invalid={Boolean(state.fieldErrors?.locationText)}
              aria-describedby={
                state.fieldErrors?.locationText
                  ? "activity-location-error"
                  : "activity-location-help"
              }
              className={inputClass}
            />
            <FieldError
              id="activity-location-error"
              message={state.fieldErrors?.locationText}
            />
            {!state.fieldErrors?.locationText ? (
              <p
                id="activity-location-help"
                className="mt-2 text-sm leading-6 text-slate-600"
              >
                Optional. Use an approved general location only.
              </p>
            ) : null}
          </div>
        </div>

        <div className="max-w-xs">
          <label
            htmlFor="activity-display-order"
            className="font-bold text-navy-900"
          >
            Display order
          </label>
          <input
            id="activity-display-order"
            name="displayOrder"
            type="number"
            min={0}
            max={100000}
            step={1}
            defaultValue={initialValues.displayOrder}
            aria-invalid={Boolean(state.fieldErrors?.displayOrder)}
            aria-describedby={
              state.fieldErrors?.displayOrder
                ? "activity-order-error"
                : "activity-order-help"
            }
            className={inputClass}
          />
          <FieldError
            id="activity-order-error"
            message={state.fieldErrors?.displayOrder}
          />
          {!state.fieldErrors?.displayOrder ? (
            <p
              id="activity-order-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Use zero unless a deliberate ordering is needed.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-navy-900/10 pt-6 sm:flex-row">
          <button
            type="submit"
            name="intent"
            value={saveIntent}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-6 py-3 font-bold text-white shadow-sm hover:bg-navy-900 disabled:cursor-not-allowed"
          >
            {pending
              ? "Saving…"
              : mode === "create" || status === "draft"
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
                  ? "Update Published Activity"
                  : "Publish Activity"}
            </button>
          ) : null}
        </div>
      </fieldset>
    </form>
  );
}
