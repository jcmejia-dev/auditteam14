"use client";

import { useActionState } from "react";

import type { JurisdictionActionState } from "@/app/staff/jurisdictions/actions";
import type { StaffRole } from "@/lib/auth/staff";
import type {
  JurisdictionFormValues,
  JurisdictionPublicationStatus,
} from "@/lib/jurisdictions/types";

type JurisdictionFormProps = {
  action: (
    state: JurisdictionActionState,
    formData: FormData,
  ) => Promise<JurisdictionActionState>;
  initialValues?: JurisdictionFormValues;
  mode: "create" | "edit";
  role: StaffRole;
  status?: JurisdictionPublicationStatus;
  contactsReady?: boolean;
};

const emptyValues: JurisdictionFormValues = {
  name: "",
  abbreviation: "",
  category: "hospital",
  generalLocation: "",
  latitude: "",
  longitude: "",
  primaryContactRole: "",
  primaryContactName: "",
  secondaryContactRole: "",
  secondaryContactName: "",
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

export function JurisdictionForm({
  action,
  initialValues = emptyValues,
  mode,
  role,
  status,
  contactsReady = false,
}: JurisdictionFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    message: null,
  });
  const isAdmin = role === "admin";
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
          <label htmlFor="jurisdiction-name" className="font-bold text-navy-900">
            Institution name <span className="text-patriot-red">*</span>
          </label>
          <input
            id="jurisdiction-name"
            name="name"
            type="text"
            required
            maxLength={240}
            defaultValue={initialValues.name}
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={
              state.fieldErrors?.name
                ? "jurisdiction-name-error"
                : "jurisdiction-name-help"
            }
            className={inputClass}
          />
          <FieldError
            id="jurisdiction-name-error"
            message={state.fieldErrors?.name}
          />
          {!state.fieldErrors?.name ? (
            <p
              id="jurisdiction-name-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Use the confirmed official public name.
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="jurisdiction-abbreviation"
              className="font-bold text-navy-900"
            >
              Abbreviation
            </label>
            <input
              id="jurisdiction-abbreviation"
              name="abbreviation"
              type="text"
              maxLength={40}
              defaultValue={initialValues.abbreviation}
              aria-invalid={Boolean(state.fieldErrors?.abbreviation)}
              aria-describedby={
                state.fieldErrors?.abbreviation
                  ? "jurisdiction-abbreviation-error"
                  : "jurisdiction-abbreviation-help"
              }
              className={inputClass}
            />
            <FieldError
              id="jurisdiction-abbreviation-error"
              message={state.fieldErrors?.abbreviation}
            />
            {!state.fieldErrors?.abbreviation ? (
              <p
                id="jurisdiction-abbreviation-help"
                className="mt-2 text-sm leading-6 text-slate-600"
              >
                Optional approved acronym, up to 40 characters.
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="jurisdiction-category"
              className="font-bold text-navy-900"
            >
              Category <span className="text-patriot-red">*</span>
            </label>
            <select
              id="jurisdiction-category"
              name="category"
              required
              defaultValue={initialValues.category}
              aria-invalid={Boolean(state.fieldErrors?.category)}
              aria-describedby={
                state.fieldErrors?.category
                  ? "jurisdiction-category-error"
                  : undefined
              }
              className={inputClass}
            >
              <option value="hospital">Hospital</option>
              <option value="office">Office</option>
            </select>
            <FieldError
              id="jurisdiction-category-error"
              message={state.fieldErrors?.category}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="jurisdiction-location"
            className="font-bold text-navy-900"
          >
            General location <span className="text-patriot-red">*</span>
          </label>
          <input
            id="jurisdiction-location"
            name="generalLocation"
            type="text"
            required
            maxLength={300}
            defaultValue={initialValues.generalLocation}
            aria-invalid={Boolean(state.fieldErrors?.generalLocation)}
            aria-describedby={
              state.fieldErrors?.generalLocation
                ? "jurisdiction-location-error"
                : "jurisdiction-location-help"
            }
            className={inputClass}
          />
          <FieldError
            id="jurisdiction-location-error"
            message={state.fieldErrors?.generalLocation}
          />
          {!state.fieldErrors?.generalLocation ? (
            <p
              id="jurisdiction-location-help"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Use a municipality, city, and province—not a private or
              unconfirmed street address.
            </p>
          ) : null}
        </div>

        <fieldset className="border border-navy-900/10 bg-cream p-5">
          <legend className="px-2 font-bold text-navy-900">
            Map coordinates
          </legend>
          <p className="mb-5 text-sm leading-6 text-slate-600">
            Coordinates may be left blank in a draft, but both are required
            before publication.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="jurisdiction-latitude"
                className="font-bold text-navy-900"
              >
                Latitude
              </label>
              <input
                id="jurisdiction-latitude"
                name="latitude"
                type="number"
                min={-90}
                max={90}
                step="0.000001"
                inputMode="decimal"
                defaultValue={initialValues.latitude}
                aria-invalid={Boolean(state.fieldErrors?.latitude)}
                aria-describedby={
                  state.fieldErrors?.latitude
                    ? "jurisdiction-latitude-error"
                    : undefined
                }
                className={inputClass}
              />
              <FieldError
                id="jurisdiction-latitude-error"
                message={state.fieldErrors?.latitude}
              />
            </div>
            <div>
              <label
                htmlFor="jurisdiction-longitude"
                className="font-bold text-navy-900"
              >
                Longitude
              </label>
              <input
                id="jurisdiction-longitude"
                name="longitude"
                type="number"
                min={-180}
                max={180}
                step="0.000001"
                inputMode="decimal"
                defaultValue={initialValues.longitude}
                aria-invalid={Boolean(state.fieldErrors?.longitude)}
                aria-describedby={
                  state.fieldErrors?.longitude
                    ? "jurisdiction-longitude-error"
                    : undefined
                }
                className={inputClass}
              />
              <FieldError
                id="jurisdiction-longitude-error"
                message={state.fieldErrors?.longitude}
              />
            </div>
          </div>
        </fieldset>

        <fieldset
          disabled={!contactsReady}
          className="border border-navy-900/10 bg-cream p-5 disabled:opacity-70"
        >
          <legend className="px-2 font-bold text-navy-900">
            Approved public contacts
          </legend>
          <p className="mb-5 text-sm leading-6 text-slate-600">
            Add only names and official roles approved for public release.
            Both fields in a contact must be completed.
          </p>
          {!contactsReady ? (
            <p className="mb-5 border-l-4 border-gold-500 bg-white px-4 py-3 text-sm font-semibold leading-6 text-navy-900">
              Contact editing will become available after the reviewed
              jurisdiction-contact migration is applied.
            </p>
          ) : null}
          <div className="space-y-6">
            {[
              {
                label: "Primary contact",
                roleName: "primaryContactRole",
                personName: "primaryContactName",
                roleValue: initialValues.primaryContactRole,
                personValue: initialValues.primaryContactName,
              },
              {
                label: "Secondary contact",
                roleName: "secondaryContactRole",
                personName: "secondaryContactName",
                roleValue: initialValues.secondaryContactRole,
                personValue: initialValues.secondaryContactName,
              },
            ].map((contact) => (
              <div
                key={contact.roleName}
                className="grid gap-5 border-t border-navy-900/10 pt-5 sm:grid-cols-2"
              >
                <div>
                  <label
                    htmlFor={`jurisdiction-${contact.roleName}`}
                    className="font-bold text-navy-900"
                  >
                    {contact.label} role
                  </label>
                  <input
                    id={`jurisdiction-${contact.roleName}`}
                    name={contact.roleName}
                    type="text"
                    maxLength={100}
                    defaultValue={contact.roleValue}
                    aria-invalid={Boolean(
                      state.fieldErrors?.[
                        contact.roleName as
                          | "primaryContactRole"
                          | "secondaryContactRole"
                      ],
                    )}
                    aria-describedby={
                      state.fieldErrors?.[
                        contact.roleName as
                          | "primaryContactRole"
                          | "secondaryContactRole"
                      ]
                        ? `jurisdiction-${contact.roleName}-error`
                        : undefined
                    }
                    className={inputClass}
                  />
                  <FieldError
                    id={`jurisdiction-${contact.roleName}-error`}
                    message={
                      state.fieldErrors?.[
                        contact.roleName as
                          | "primaryContactRole"
                          | "secondaryContactRole"
                      ]
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor={`jurisdiction-${contact.personName}`}
                    className="font-bold text-navy-900"
                  >
                    {contact.label} name
                  </label>
                  <input
                    id={`jurisdiction-${contact.personName}`}
                    name={contact.personName}
                    type="text"
                    maxLength={180}
                    defaultValue={contact.personValue}
                    aria-invalid={Boolean(
                      state.fieldErrors?.[
                        contact.personName as
                          | "primaryContactName"
                          | "secondaryContactName"
                      ],
                    )}
                    aria-describedby={
                      state.fieldErrors?.[
                        contact.personName as
                          | "primaryContactName"
                          | "secondaryContactName"
                      ]
                        ? `jurisdiction-${contact.personName}-error`
                        : undefined
                    }
                    className={inputClass}
                  />
                  <FieldError
                    id={`jurisdiction-${contact.personName}-error`}
                    message={
                      state.fieldErrors?.[
                        contact.personName as
                          | "primaryContactName"
                          | "secondaryContactName"
                      ]
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        {isAdmin ? (
          <div className="max-w-xs">
            <label
              htmlFor="jurisdiction-order"
              className="font-bold text-navy-900"
            >
              Display order
            </label>
            <input
              id="jurisdiction-order"
              name="displayOrder"
              type="number"
              min={0}
              max={100000}
              step={1}
              defaultValue={initialValues.displayOrder}
              aria-invalid={Boolean(state.fieldErrors?.displayOrder)}
              aria-describedby={
                state.fieldErrors?.displayOrder
                  ? "jurisdiction-order-error"
                  : "jurisdiction-order-help"
              }
              className={inputClass}
            />
            <FieldError
              id="jurisdiction-order-error"
              message={state.fieldErrors?.displayOrder}
            />
            {!state.fieldErrors?.displayOrder ? (
              <p
                id="jurisdiction-order-help"
                className="mt-2 text-sm leading-6 text-slate-600"
              >
                Lower numbers appear first. Only administrators can reorder
                locations.
              </p>
            ) : null}
          </div>
        ) : null}

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
          {isAdmin ? (
            <button
              type="submit"
              name="intent"
              value="publish"
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold-500 px-6 py-3 font-bold text-navy-950 shadow-sm hover:bg-gold-600 hover:text-white disabled:cursor-not-allowed"
            >
              {pending
                ? "Saving…"
                : status === "published"
                  ? "Update Published Location"
                  : "Publish Location"}
            </button>
          ) : null}
        </div>
      </fieldset>
    </form>
  );
}
