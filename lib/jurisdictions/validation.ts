import {
  jurisdictionCategories,
  type JurisdictionCategory,
  type JurisdictionFormValues,
} from "./types";

export type JurisdictionField =
  | "name"
  | "abbreviation"
  | "category"
  | "generalLocation"
  | "latitude"
  | "longitude"
  | "primaryContactRole"
  | "primaryContactName"
  | "secondaryContactRole"
  | "secondaryContactName"
  | "displayOrder";

export type JurisdictionFieldErrors = Partial<
  Record<JurisdictionField, string>
>;

type ParsedJurisdiction = {
  values: JurisdictionFormValues;
  databaseValues: {
    name: string;
    abbreviation: string | null;
    category: JurisdictionCategory;
    general_location: string;
    latitude: number | null;
    longitude: number | null;
    primary_contact_role: string | null;
    primary_contact_name: string | null;
    secondary_contact_role: string | null;
    secondary_contact_name: string | null;
    display_order: number;
  };
};

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseCoordinate(value: string, minimum: number, maximum: number) {
  if (value.length === 0) {
    return null;
  }

  if (!/^-?\d{1,3}(?:\.\d{1,6})?$/.test(value)) {
    return Number.NaN;
  }

  const parsed = Number(value);
  return parsed >= minimum && parsed <= maximum ? parsed : Number.NaN;
}

function validateContactPair(
  role: string,
  name: string,
  roleField: "primaryContactRole" | "secondaryContactRole",
  nameField: "primaryContactName" | "secondaryContactName",
  errors: JurisdictionFieldErrors,
) {
  if ((role.length === 0) !== (name.length === 0)) {
    errors[roleField] = "Enter both the public role and name, or leave both blank.";
    errors[nameField] = "Enter both the public role and name, or leave both blank.";
    return;
  }

  if (role.length > 100) {
    errors[roleField] = "Keep the public role within 100 characters.";
  }

  if (name.length > 180) {
    errors[nameField] = "Keep the public name within 180 characters.";
  }
}

export function validateJurisdictionForm(formData: FormData):
  | { success: true; data: ParsedJurisdiction }
  | {
      success: false;
      errors: JurisdictionFieldErrors;
      values: JurisdictionFormValues;
    } {
  const name = textValue(formData, "name").trim();
  const abbreviation = textValue(formData, "abbreviation").trim();
  const categoryInput = textValue(formData, "category").trim();
  const category = jurisdictionCategories.includes(
    categoryInput as JurisdictionCategory,
  )
    ? (categoryInput as JurisdictionCategory)
    : "hospital";
  const generalLocation = textValue(formData, "generalLocation").trim();
  const latitudeText = textValue(formData, "latitude").trim();
  const longitudeText = textValue(formData, "longitude").trim();
  const primaryContactRole = textValue(
    formData,
    "primaryContactRole",
  ).trim();
  const primaryContactName = textValue(
    formData,
    "primaryContactName",
  ).trim();
  const secondaryContactRole = textValue(
    formData,
    "secondaryContactRole",
  ).trim();
  const secondaryContactName = textValue(
    formData,
    "secondaryContactName",
  ).trim();
  const latitude = parseCoordinate(latitudeText, -90, 90);
  const longitude = parseCoordinate(longitudeText, -180, 180);
  const displayOrderText = textValue(formData, "displayOrder").trim();
  const displayOrder = displayOrderText ? Number(displayOrderText) : 0;
  const errors: JurisdictionFieldErrors = {};

  if (name.length < 1 || name.length > 240) {
    errors.name = "Enter an institution name between 1 and 240 characters.";
  }

  if (abbreviation.length > 40) {
    errors.abbreviation = "Keep the abbreviation within 40 characters.";
  }

  if (!jurisdictionCategories.includes(categoryInput as JurisdictionCategory)) {
    errors.category = "Choose Hospital or Office.";
  }

  if (generalLocation.length < 1 || generalLocation.length > 300) {
    errors.generalLocation =
      "Enter a general location between 1 and 300 characters.";
  }

  if (Number.isNaN(latitude)) {
    errors.latitude =
      "Enter a latitude from -90 to 90 with up to 6 decimal places.";
  }

  if (Number.isNaN(longitude)) {
    errors.longitude =
      "Enter a longitude from -180 to 180 with up to 6 decimal places.";
  }

  if ((latitude === null) !== (longitude === null)) {
    errors.latitude = "Enter both latitude and longitude, or leave both blank.";
    errors.longitude =
      "Enter both latitude and longitude, or leave both blank.";
  }

  validateContactPair(
    primaryContactRole,
    primaryContactName,
    "primaryContactRole",
    "primaryContactName",
    errors,
  );
  validateContactPair(
    secondaryContactRole,
    secondaryContactName,
    "secondaryContactRole",
    "secondaryContactName",
    errors,
  );

  if (
    !Number.isInteger(displayOrder) ||
    displayOrder < 0 ||
    displayOrder > 100000
  ) {
    errors.displayOrder = "Enter a whole number from 0 to 100,000.";
  }

  const values: JurisdictionFormValues = {
    name,
    abbreviation,
    category,
    generalLocation,
    latitude: latitudeText,
    longitude: longitudeText,
    primaryContactRole,
    primaryContactName,
    secondaryContactRole,
    secondaryContactName,
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
        abbreviation: abbreviation || null,
        category,
        general_location: generalLocation,
        latitude,
        longitude,
        primary_contact_role: primaryContactRole || null,
        primary_contact_name: primaryContactName || null,
        secondary_contact_role: secondaryContactRole || null,
        secondary_contact_name: secondaryContactName || null,
        display_order: displayOrder,
      },
    },
  };
}
