export const activityPublicationStatuses = [
  "draft",
  "published",
  "archived",
] as const;

export type ActivityPublicationStatus =
  (typeof activityPublicationStatuses)[number];

export type ActivityRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  activityDate: string | null;
  locationText: string | null;
  status: ActivityPublicationStatus;
  publishedAt: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicActivityRecord = Pick<
  ActivityRecord,
  | "title"
  | "slug"
  | "summary"
  | "activityDate"
  | "locationText"
  | "publishedAt"
>;

export type ActivityFormValues = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  activityDate: string;
  locationText: string;
  displayOrder: number;
};

export type ActivityDateStatus = "Upcoming" | "Completed" | "Date not set";

export function getActivityDateStatus(
  activityDate: string | null,
  today = new Date(),
): ActivityDateStatus {
  if (!activityDate) {
    return "Date not set";
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Manila",
    year: "numeric",
  });
  const todayInPhilippines = formatter.format(today);

  return activityDate < todayInPhilippines ? "Completed" : "Upcoming";
}

export function isActivityUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
