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
        display_order: displayOrder,
      },
    },
  };
}
