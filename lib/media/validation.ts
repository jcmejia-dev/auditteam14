import type {
  AlbumFormValues,
  MediaItemFormValues,
} from "./types";

export type AlbumField =
  | "title"
  | "slug"
  | "description"
  | "displayOrder";
export type AlbumFieldErrors = Partial<Record<AlbumField, string>>;

export type MediaItemField =
  | "title"
  | "altText"
  | "caption"
  | "eventDate"
  | "displayOrder"
  | "file";
export type MediaItemFieldErrors = Partial<
  Record<MediaItemField, string>
>;

type ValidatedUpload = {
  bytes: ArrayBuffer;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseDisplayOrder(
  formData: FormData,
  errors: { displayOrder?: string },
) {
  const value = textValue(formData, "displayOrder").trim();
  const displayOrder = Number(value);

  if (
    !Number.isInteger(displayOrder) ||
    displayOrder < 0 ||
    displayOrder > 100000
  ) {
    errors.displayOrder = "Enter a whole number from 0 to 100,000.";
  }

  return Number.isFinite(displayOrder) ? displayOrder : 0;
}

export function validateAlbumForm(formData: FormData):
  | {
      success: true;
      values: AlbumFormValues;
      databaseValues: {
        title: string;
        slug: string;
        description: string | null;
        display_order: number;
      };
    }
  | {
      success: false;
      errors: AlbumFieldErrors;
      values: AlbumFormValues;
    } {
  const title = textValue(formData, "title").trim();
  const slug = textValue(formData, "slug").trim().toLowerCase();
  const description = textValue(formData, "description").trim();
  const errors: AlbumFieldErrors = {};
  const displayOrder = parseDisplayOrder(formData, errors);

  if (title.length < 1 || title.length > 240) {
    errors.title = "Enter a title between 1 and 240 characters.";
  }

  if (
    slug.length < 1 ||
    slug.length > 160 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    errors.slug =
      "Use lowercase letters, numbers, and single hyphens only.";
  }

  if (description.length > 2000) {
    errors.description = "Keep the description within 2,000 characters.";
  }

  const values = { title, slug, description, displayOrder };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values };
  }

  return {
    success: true,
    values,
    databaseValues: {
      title,
      slug,
      description: description || null,
      display_order: displayOrder,
    },
  };
}

function parseEventDate(value: string, errors: MediaItemFieldErrors) {
  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.eventDate = "Enter a valid event date.";
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value ||
    Number(value.slice(0, 4)) < 1900
  ) {
    errors.eventDate = "Enter a valid event date from 1900 onward.";
    return null;
  }

  return value;
}

export function validateMediaItemForm(
  formData: FormData,
  mediaType: "image" | "video" = "image",
):
  | {
      success: true;
      values: MediaItemFormValues;
      databaseValues: {
        title: string;
        alt_text: string | null;
        caption: string | null;
        event_date?: string | null;
        display_order: number;
      };
    }
  | {
      success: false;
      errors: MediaItemFieldErrors;
      values: MediaItemFormValues;
    } {
  const title = textValue(formData, "title").trim();
  const altText = textValue(formData, "altText").trim();
  const caption = textValue(formData, "caption").trim();
  const eventDateValue = textValue(formData, "eventDate").trim();
  const errors: MediaItemFieldErrors = {};
  const displayOrder = parseDisplayOrder(formData, errors);
  const eventDate =
    mediaType === "video"
      ? parseEventDate(eventDateValue, errors)
      : null;

  if (title.length < 1 || title.length > 240) {
    errors.title = "Enter a title between 1 and 240 characters.";
  }

  if (altText.length < 1 || altText.length > 500) {
    errors.altText =
      mediaType === "video"
        ? "Describe the video in 1 to 500 characters for accessibility."
        : "Describe the image in 1 to 500 characters for accessibility.";
  }

  if (caption.length > 2000) {
    errors.caption = "Keep the caption within 2,000 characters.";
  }

  const values = {
    title,
    altText,
    caption,
    eventDate: mediaType === "video" ? eventDateValue : "",
    displayOrder,
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values };
  }

  return {
    success: true,
    values,
    databaseValues: {
      title,
      alt_text: altText,
      caption: caption || null,
      ...(mediaType === "video" ? { event_date: eventDate } : {}),
      display_order: displayOrder,
    },
  };
}

function matches(
  bytes: Uint8Array,
  expected: readonly number[],
  offset = 0,
) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

export async function validateImageUpload(
  formData: FormData,
): Promise<
  | { success: true; upload: ValidatedUpload }
  | { success: false; error: string }
> {
  const value = formData.get("file");

  if (!(value instanceof File) || value.size === 0) {
    return { success: false, error: "Choose an image to upload." };
  }

  if (value.size > MAX_IMAGE_BYTES) {
    return {
      success: false,
      error: "The image must be 4 MB or smaller.",
    };
  }

  const extension = value.name.split(".").pop()?.toLowerCase();
  const allowedByExtension =
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "webp";

  if (!allowedByExtension) {
    return {
      success: false,
      error: "Use a JPEG, PNG, or WebP image only.",
    };
  }

  const bytes = await value.arrayBuffer();
  const signature = new Uint8Array(bytes.slice(0, 16));
  const isJpeg = matches(signature, [0xff, 0xd8, 0xff]);
  const isPng = matches(
    signature,
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  );
  const isWebp =
    matches(signature, [0x52, 0x49, 0x46, 0x46]) &&
    matches(signature, [0x57, 0x45, 0x42, 0x50], 8);

  const validPair =
    (isJpeg &&
      value.type === "image/jpeg" &&
      (extension === "jpg" || extension === "jpeg")) ||
    (isPng && value.type === "image/png" && extension === "png") ||
    (isWebp && value.type === "image/webp" && extension === "webp");

  if (!validPair) {
    return {
      success: false,
      error:
        "The file contents, type, and extension do not identify the same supported image format.",
    };
  }

  if (isJpeg) {
    return {
      success: true,
      upload: { bytes, contentType: "image/jpeg", extension: "jpg" },
    };
  }

  if (isPng) {
    return {
      success: true,
      upload: { bytes, contentType: "image/png", extension: "png" },
    };
  }

  return {
    success: true,
    upload: { bytes, contentType: "image/webp", extension: "webp" },
  };
}

export function detectSafeImageContentType(bytes: ArrayBuffer) {
  const signature = new Uint8Array(bytes.slice(0, 16));

  if (matches(signature, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (
    matches(
      signature,
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    )
  ) {
    return "image/png";
  }

  if (
    matches(signature, [0x52, 0x49, 0x46, 0x46]) &&
    matches(signature, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp";
  }

  return null;
}
