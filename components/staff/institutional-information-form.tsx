"use client";

import { useActionState } from "react";

import type {
  InstitutionalActionState,
} from "@/app/staff/institutional/actions";
import type { StaffRole } from "@/lib/auth/staff";
import type { InstitutionalInformation } from "@/lib/institutional/types";

type InstitutionalInformationFormProps = {
  action: (
    state: InstitutionalActionState,
    formData: FormData,
  ) => Promise<InstitutionalActionState>;
  information: InstitutionalInformation;
  role: StaffRole;
  status: "draft" | "published" | "archived" | null;
  canEdit: boolean;
};

const inputClass =
  "mt-2 min-h-12 w-full rounded-sm border border-navy-900/20 bg-white px-4 py-3 text-base text-navy-900 shadow-sm focus:border-teal-700 disabled:bg-slate-100";

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

export function InstitutionalInformationForm({
  action,
  information,
  role,
  status,
  canEdit,
}: InstitutionalInformationFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    message: null,
  });
  const isAdmin = role === "admin";

  return (
    <form action={formAction} className="space-y-8">
      {state.message ? (
        <div
          role="alert"
          className="border-l-4 border-patriot-red bg-red-50 px-5 py-4 font-semibold leading-7 text-navy-900"
        >
          {state.message}
        </div>
      ) : null}

      <fieldset
        disabled={pending || !canEdit}
        className="space-y-8 disabled:opacity-75"
      >
        <section aria-labelledby="organization-fields-heading">
          <h2
            id="organization-fields-heading"
            className="font-display text-2xl font-bold text-navy-900"
          >
            Organizational Details
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {information.organization.map((item, index) => {
              const name = `organization_${index}`;
              const errorId = `${name}-error`;

              return (
                <div key={item.label}>
                  <label htmlFor={name} className="font-bold text-navy-900">
                    {item.label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type="text"
                    required
                    maxLength={300}
                    defaultValue={item.value}
                    aria-invalid={Boolean(state.fieldErrors?.[name])}
                    aria-describedby={
                      state.fieldErrors?.[name] ? errorId : undefined
                    }
                    className={inputClass}
                  />
                  <FieldError
                    id={errorId}
                    message={state.fieldErrors?.[name]}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section
          aria-labelledby="coverage-fields-heading"
          className="border-t border-navy-900/10 pt-8"
        >
          <h2
            id="coverage-fields-heading"
            className="font-display text-2xl font-bold text-navy-900"
          >
            Regional Coverage
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {information.coverage.map((item, index) => {
              const name = `coverage_${index}`;
              const errorId = `${name}-error`;

              return (
                <div key={item.label}>
                  <label htmlFor={name} className="font-bold text-navy-900">
                    {item.label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type="text"
                    required
                    maxLength={300}
                    defaultValue={item.value}
                    aria-invalid={Boolean(state.fieldErrors?.[name])}
                    aria-describedby={
                      state.fieldErrors?.[name] ? errorId : undefined
                    }
                    className={inputClass}
                  />
                  <FieldError
                    id={errorId}
                    message={state.fieldErrors?.[name]}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section
          aria-labelledby="values-fields-heading"
          className="border-t border-navy-900/10 pt-8"
        >
          <h2
            id="values-fields-heading"
            className="font-display text-2xl font-bold text-navy-900"
          >
            Core Values
          </h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {information.values.map((value, index) => {
              const titleName = `value_title_${index}`;
              const descriptionName = `value_description_${index}`;

              return (
                <fieldset
                  key={`${value.title}-${index}`}
                  className="border border-navy-900/10 bg-cream p-5"
                >
                  <legend className="px-2 font-bold text-navy-900">
                    Value {index + 1}
                  </legend>
                  <label
                    htmlFor={titleName}
                    className="font-bold text-navy-900"
                  >
                    Title
                  </label>
                  <input
                    id={titleName}
                    name={titleName}
                    type="text"
                    required
                    maxLength={100}
                    defaultValue={value.title}
                    aria-invalid={Boolean(
                      state.fieldErrors?.[titleName],
                    )}
                    aria-describedby={
                      state.fieldErrors?.[titleName]
                        ? `${titleName}-error`
                        : undefined
                    }
                    className={inputClass}
                  />
                  <FieldError
                    id={`${titleName}-error`}
                    message={state.fieldErrors?.[titleName]}
                  />
                  <label
                    htmlFor={descriptionName}
                    className="mt-5 block font-bold text-navy-900"
                  >
                    Description
                  </label>
                  <textarea
                    id={descriptionName}
                    name={descriptionName}
                    required
                    rows={3}
                    maxLength={300}
                    defaultValue={value.description}
                    aria-invalid={Boolean(
                      state.fieldErrors?.[descriptionName],
                    )}
                    aria-describedby={
                      state.fieldErrors?.[descriptionName]
                        ? `${descriptionName}-error`
                        : undefined
                    }
                    className={`${inputClass} leading-7`}
                  />
                  <FieldError
                    id={`${descriptionName}-error`}
                    message={state.fieldErrors?.[descriptionName]}
                  />
                </fieldset>
              );
            })}
          </div>
        </section>

        {canEdit ? (
          <div className="flex flex-col gap-3 border-t border-navy-900/10 pt-7 sm:flex-row">
            {status !== "published" ? (
              <button
                type="submit"
                name="intent"
                value="draft"
                className="inline-flex min-h-12 items-center justify-center rounded-sm bg-teal-700 px-6 py-3 font-bold text-white hover:bg-navy-900"
              >
                {pending ? "Saving…" : "Save Draft"}
              </button>
            ) : null}
            {isAdmin ? (
              <button
                type="submit"
                name="intent"
                value="publish"
                className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold-500 px-6 py-3 font-bold text-navy-950 hover:bg-gold-600 hover:text-white"
              >
                {pending
                  ? "Saving…"
                  : status === "published"
                    ? "Update Published Information"
                    : "Publish Information"}
              </button>
            ) : null}
          </div>
        ) : null}
      </fieldset>
    </form>
  );
}
