"use client";

import { useActionState } from "react";

import type { TeamMemberActionState } from "@/app/staff/team/actions";
import type { StaffRole } from "@/lib/auth/staff";
import type {
  TeamMemberFormValues,
  TeamPublicationStatus,
} from "@/lib/team/types";

type TeamMemberFormProps = {
  action: (
    state: TeamMemberActionState,
    formData: FormData,
  ) => Promise<TeamMemberActionState>;
  initialValues?: TeamMemberFormValues;
  mode: "create" | "edit";
  role: StaffRole;
  status?: TeamPublicationStatus;
};

const emptyValues: TeamMemberFormValues = {
  name: "",
  slug: "",
  positionTitle: "",
  biography: "",
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

export function TeamMemberForm({
  action,
  initialValues = emptyValues,
  mode,
  role,
  status,
}: TeamMemberFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    message: null,
  });
  const canPublishAndReorder = role === "admin";
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
          <label htmlFor="team-name" className="font-bold text-navy-900">
            Public name <span className="text-patriot-red">*</span>
          </label>
          <input
            id="team-name"
            name="name"
            type="text"
            required
            maxLength={160}
            defaultValue={initialValues.name}
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={
              state.fieldErrors?.name ? "team-name-error" : "team-name-help"
            }
            className={inputClass}
          />
          <FieldError id="team-name-error" message={state.fieldErrors?.name} />
          {!state.fieldErrors?.name ? (
            <p
              id="team-name-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Use the approved public form of the person’s name.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="team-slug" className="font-bold text-navy-900">
            Web address name <span className="text-patriot-red">*</span>
          </label>
          <div className="mt-2 flex min-h-12 items-stretch">
            <span className="flex items-center rounded-l-sm border border-r-0 border-navy-900/20 bg-cream-dark px-3 text-sm text-slate-600">
              /team/
            </span>
            <input
              id="team-slug"
              name="slug"
              type="text"
              required
              maxLength={160}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={initialValues.slug}
              aria-invalid={Boolean(state.fieldErrors?.slug)}
              aria-describedby={
                state.fieldErrors?.slug ? "team-slug-error" : "team-slug-help"
              }
              className="min-w-0 flex-1 rounded-r-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 shadow-sm focus:border-teal-700"
            />
          </div>
          <FieldError id="team-slug-error" message={state.fieldErrors?.slug} />
          {!state.fieldErrors?.slug ? (
            <p
              id="team-slug-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Lowercase letters, numbers, and single hyphens only.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="team-position" className="font-bold text-navy-900">
            Official position or title{" "}
            <span className="text-patriot-red">*</span>
          </label>
          <input
            id="team-position"
            name="positionTitle"
            type="text"
            required
            maxLength={160}
            defaultValue={initialValues.positionTitle}
            aria-invalid={Boolean(state.fieldErrors?.positionTitle)}
            aria-describedby={
              state.fieldErrors?.positionTitle
                ? "team-position-error"
                : "team-position-help"
            }
            className={inputClass}
          />
          <FieldError
            id="team-position-error"
            message={state.fieldErrors?.positionTitle}
          />
          {!state.fieldErrors?.positionTitle ? (
            <p
              id="team-position-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Enter only the confirmed official position displayed publicly.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="team-biography" className="font-bold text-navy-900">
            Approved biography
          </label>
          <textarea
            id="team-biography"
            name="biography"
            rows={8}
            maxLength={4000}
            defaultValue={initialValues.biography}
            aria-invalid={Boolean(state.fieldErrors?.biography)}
            aria-describedby={
              state.fieldErrors?.biography
                ? "team-biography-error"
                : "team-biography-help"
            }
            className={`${inputClass} leading-7`}
          />
          <FieldError
            id="team-biography-error"
            message={state.fieldErrors?.biography}
          />
          {!state.fieldErrors?.biography ? (
            <p
              id="team-biography-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Optional plain text only. Include only approved professional
              information intended for public release.
            </p>
          ) : null}
        </div>

        {canPublishAndReorder ? (
          <div className="max-w-xs">
            <label htmlFor="team-order" className="font-bold text-navy-900">
              Display order
            </label>
            <input
              id="team-order"
              name="displayOrder"
              type="number"
              min={0}
              max={100000}
              step={1}
              defaultValue={initialValues.displayOrder}
              aria-invalid={Boolean(state.fieldErrors?.displayOrder)}
              aria-describedby={
                state.fieldErrors?.displayOrder
                  ? "team-order-error"
                  : "team-order-help"
              }
              className={inputClass}
            />
            <FieldError
              id="team-order-error"
              message={state.fieldErrors?.displayOrder}
            />
            {!state.fieldErrors?.displayOrder ? (
              <p
                id="team-order-help"
                className="mt-2 text-sm leading-6 text-slate-600"
              >
                Lower numbers appear first. Only administrators can reorder
                team members.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="border-l-4 border-gold-500 bg-cream px-5 py-4">
          <p className="font-bold text-navy-900">Portrait</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Portrait uploads and external image URLs are disabled. A
            professional initials placeholder will be used unless an approved
            local portrait is configured separately.
          </p>
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
          {canPublishAndReorder ? (
            <button
              type="submit"
              name="intent"
              value="publish"
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold-500 px-6 py-3 font-bold text-navy-950 shadow-sm hover:bg-gold-600 hover:text-white disabled:cursor-not-allowed"
            >
              {pending
                ? "Saving…"
                : status === "published"
                  ? "Update Published Member"
                  : "Publish Team Member"}
            </button>
          ) : null}
        </div>
      </fieldset>
    </form>
  );
}
