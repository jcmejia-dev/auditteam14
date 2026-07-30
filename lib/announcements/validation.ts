import type { AnnouncementFormValues } from "./types";

export type AnnouncementField =
  | "title"
  | "summary"
  | "body"
  | "expiresOn"
  | "displayOrder";

export type AnnouncementFieldErrors = Partial<
  Record<AnnouncementField, string>
>;

type ParsedAnnouncement = {
  values: AnnouncementFormValues;
  databaseValues: {
    title: string;
    slug: string;
    summary: string | null;
    body: string;
    is_featured: boolean;
    expires_at: string | null;
    display_order: number;
  };
};

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseExpirationDate(value: string) {
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

  const date = new Date(`${value}T23:59:59.999+08:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function validateAnnouncementForm(formData: FormData, slug: string):
  | { success: true; data: ParsedAnnouncement }
  | {
      success: false;
      errors: AnnouncementFieldErrors;
      values: AnnouncementFormValues;
    } {
  const title = textValue(formData, "title").trim();
  const summary = textValue(formData, "summary").trim();
  const body = textValue(formData, "body").trim();
  const expiresOn = textValue(formData, "expiresOn");
  const displayOrderText = textValue(formData, "displayOrder").trim();
  const displayOrder = Number(displayOrderText);
  const isFeatured = formData.get("isFeatured") === "on";
  const expiresAt = parseExpirationDate(expiresOn);
  const errors: AnnouncementFieldErrors = {};

  if (title.length < 1 || title.length > 240) {
    errors.title = "Enter a title between 1 and 240 characters.";
  }

  if (summary.length > 600) {
    errors.summary = "Keep the summary within 600 characters.";
  }

  if (body.length < 1 || body.length > 20000) {
    errors.body = "Enter announcement text between 1 and 20,000 characters.";
  }

  if (expiresAt === undefined) {
    errors.expiresOn = "Enter a valid expiration date.";
  }

  if (
    !Number.isInteger(displayOrder) ||
    displayOrder < 0 ||
    displayOrder > 100000
  ) {
    errors.displayOrder = "Enter a whole number from 0 to 100,000.";
  }

  const values: AnnouncementFormValues = {
    title,
    summary,
    body,
    isFeatured,
    expiresOn,
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
  };

  if (Object.keys(errors).length > 0 || expiresAt === undefined) {
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
        body,
        is_featured: isFeatured,
        expires_at: expiresAt,
        display_order: displayOrder,
      },
    },
  };
}

export function expirationAllowsPublishing(expiresAt: string | null) {
  return !expiresAt || new Date(expiresAt).getTime() > Date.now();
}
