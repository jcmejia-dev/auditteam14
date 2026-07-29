export const teamPublicationStatuses = [
  "draft",
  "published",
  "archived",
] as const;

export type TeamPublicationStatus =
  (typeof teamPublicationStatuses)[number];

export type TeamMemberRecord = {
  id: string;
  name: string;
  slug: string;
  positionTitle: string;
  biography: string | null;
  photoPath: string | null;
  status: TeamPublicationStatus;
  publishedAt: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicTeamMemberRecord = Pick<
  TeamMemberRecord,
  "name" | "slug" | "positionTitle" | "biography" | "photoPath"
>;

export type TeamMemberFormValues = {
  name: string;
  slug: string;
  positionTitle: string;
  biography: string;
  displayOrder: number;
};

export function isTeamMemberUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function getTeamMemberInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "AT";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
