export const jurisdictionCategories = ["hospital", "office"] as const;

export type JurisdictionCategory =
  (typeof jurisdictionCategories)[number];

export const jurisdictionPublicationStatuses = [
  "draft",
  "published",
  "archived",
] as const;

export type JurisdictionPublicationStatus =
  (typeof jurisdictionPublicationStatuses)[number];

export type JurisdictionRecord = {
  id: string;
  name: string;
  abbreviation: string | null;
  category: JurisdictionCategory;
  generalLocation: string;
  latitude: number | null;
  longitude: number | null;
  primaryContactRole: string | null;
  primaryContactName: string | null;
  secondaryContactRole: string | null;
  secondaryContactName: string | null;
  status: JurisdictionPublicationStatus;
  publishedAt: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type JurisdictionFormValues = {
  name: string;
  abbreviation: string;
  category: JurisdictionCategory;
  generalLocation: string;
  latitude: string;
  longitude: string;
  primaryContactRole: string;
  primaryContactName: string;
  secondaryContactRole: string;
  secondaryContactName: string;
  displayOrder: number;
};

export function isJurisdictionUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
