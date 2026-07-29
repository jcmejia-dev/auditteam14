import type { TeamMemberFormValues } from "./types";

export type TeamMemberField =
  | "name"
  | "slug"
  | "positionTitle"
  | "biography"
  | "displayOrder";

export type TeamMemberFieldErrors = Partial<
  Record<TeamMemberField, string>
>;

type ParsedTeamMember = {
  values: TeamMemberFormValues;
  databaseValues: {
    name: string;
    slug: string;
    position_title: string;
    biography: string | null;
    display_order: number;
  };
};

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function validateTeamMemberForm(formData: FormData):
  | { success: true; data: ParsedTeamMember }
  | {
      success: false;
      errors: TeamMemberFieldErrors;
      values: TeamMemberFormValues;
    } {
  const name = textValue(formData, "name").trim();
  const slug = textValue(formData, "slug").trim().toLowerCase();
  const positionTitle = textValue(formData, "positionTitle").trim();
  const biography = textValue(formData, "biography").trim();
  const displayOrderText = textValue(formData, "displayOrder").trim();
  const displayOrder = displayOrderText ? Number(displayOrderText) : 0;
  const errors: TeamMemberFieldErrors = {};

  if (name.length < 1 || name.length > 160) {
    errors.name = "Enter a public name between 1 and 160 characters.";
  }

  if (
    slug.length < 1 ||
    slug.length > 160 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  ) {
    errors.slug =
      "Use lowercase letters, numbers, and single hyphens only.";
  }

  if (positionTitle.length < 1 || positionTitle.length > 160) {
    errors.positionTitle =
      "Enter an official position between 1 and 160 characters.";
  }

  if (biography.length > 4000) {
    errors.biography = "Keep the biography within 4,000 characters.";
  }

  if (
    !Number.isInteger(displayOrder) ||
    displayOrder < 0 ||
    displayOrder > 100000
  ) {
    errors.displayOrder = "Enter a whole number from 0 to 100,000.";
  }

  const values: TeamMemberFormValues = {
    name,
    slug,
    positionTitle,
    biography,
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values };
  }

  return {
    success: true,
    data: {
      values,
      databaseValues: {
        name,
        slug,
        position_title: positionTitle,
        biography: biography || null,
        display_order: displayOrder,
      },
    },
  };
}
