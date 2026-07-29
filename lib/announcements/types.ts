export const publicationStatuses = [
  "draft",
  "published",
  "archived",
] as const;

export type PublicationStatus = (typeof publicationStatuses)[number];

export type AnnouncementRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  isFeatured: boolean;
  status: PublicationStatus;
  publishedAt: string | null;
  expiresAt: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementFormValues = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  isFeatured: boolean;
  expiresOn: string;
  displayOrder: number;
};

export type AnnouncementDisplayStatus =
  | "Draft"
  | "Published"
  | "Archived"
  | "Expired";

export function getAnnouncementDisplayStatus(
  announcement: Pick<AnnouncementRecord, "status" | "expiresAt">,
  now = new Date(),
): AnnouncementDisplayStatus {
  if (announcement.status === "draft") {
    return "Draft";
  }

  if (announcement.status === "archived") {
    return "Archived";
  }

  if (
    announcement.expiresAt &&
    new Date(announcement.expiresAt).getTime() <= now.getTime()
  ) {
    return "Expired";
  }

  return "Published";
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function toPhilippineDateInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Manila",
    year: "numeric",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}
