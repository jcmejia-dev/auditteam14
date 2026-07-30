import type { ActivityFormValues } from "./types";

export type ActivityField =
  | "title"
  | "summary"
  | "body"
  | "activityDate"
  | "locationText"
  | "displayOrder";

export type ActivityFieldErrors = Partial<Record<ActivityField, string>>;

type ParsedActivity = {
  values: ActivityFormValues;
  databaseValues: {
    title: string;
    slug: string;
    summary: string | null;
    body: string | null;
    activity_date: string | null;
    location_text: string | null;
    display_order: number;
  };
};

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseActivityDate(value: string) {
  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));

  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return undefined;
  }

  return value;
}

export function validateActivityForm(formData: FormData, slug: string):
  | { success: true; data: ParsedActivity }
  | {
      success: false;
      errors: ActivityFieldErrors;
      values: ActivityFormValues;
    } {
  const title = textValue(formData, "title").trim();
  const summary = textValue(formData, "summary").trim();
  const body = textValue(formData, "body").trim();
  const activityDateValue = textValue(formData, "activityDate");
  const locationText = textValue(formData, "locationText").trim();
  const displayOrderText = textValue(formData, "displayOrder").trim();
  const displayOrder = Number(displayOrderText);
  const activityDate = parseActivityDate(activityDateValue);
  const errors: ActivityFieldErrors = {};

  if (title.length < 1 || title.length > 240) {
    errors.title = "Enter a title between 1 and 240 characters.";
  }

  if (summary.length > 600) {
    errors.summary = "Keep the summary within 600 characters.";
  }

  if (body.length > 20000) {
    errors.body = "Keep the activity details within 20,000 characters.";
  }

  if (activityDate === undefined) {
    errors.activityDate = "Enter a valid activity date.";
  }

  if (locationText.length > 240) {
    errors.locationText = "Keep the location within 240 characters.";
  }

  if (
    !Number.isInteger(displayOrder) ||
    displayOrder < 0 ||
    displayOrder > 100000
  ) {
    errors.displayOrder = "Enter a whole number from 0 to 100,000.";
  }

  const values: ActivityFormValues = {
    title,
    summary,
    body,
    activityDate: activityDateValue,
    locationText,
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
  };

  if (Object.keys(errors).length > 0 || activityDate === undefined) {
    return { success: false, errors, values };
  }

  return {
    success: true,
    data: {
      values,
      databaseValues: {
        title,
        slug,
        summary: summary || null,
        body: body || null,
        activity_date: activityDate,
        location_text: locationText || null,
        display_order: displayOrder,
      },
    },
  };
}
