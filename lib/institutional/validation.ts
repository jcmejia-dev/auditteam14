import {
  fallbackInstitutionalInformation,
  type InstitutionalInformation,
} from "./types";

export type InstitutionalFieldErrors = Record<string, string>;

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function requiredText(
  formData: FormData,
  name: string,
  label: string,
  maximum: number,
  errors: InstitutionalFieldErrors,
) {
  const value = textValue(formData, name);

  if (value.length < 1 || value.length > maximum) {
    errors[name] = `Enter ${label.toLowerCase()} between 1 and ${maximum} characters.`;
  }

  return value;
}

export function validateInstitutionalInformation(formData: FormData) {
  const errors: InstitutionalFieldErrors = {};
  const organization = fallbackInstitutionalInformation.organization.map(
    (item, index) => ({
      label: item.label,
      value: requiredText(
        formData,
        `organization_${index}`,
        item.label,
        300,
        errors,
      ),
    }),
  );
  const coverage = fallbackInstitutionalInformation.coverage.map(
    (item, index) => ({
      label: item.label,
      value: requiredText(
        formData,
        `coverage_${index}`,
        item.label,
        300,
        errors,
      ),
    }),
  );
  const values = fallbackInstitutionalInformation.values.map(
    (_item, index) => ({
      title: requiredText(
        formData,
        `value_title_${index}`,
        `Core value ${index + 1} title`,
        100,
        errors,
      ),
      description: requiredText(
        formData,
        `value_description_${index}`,
        `Core value ${index + 1} description`,
        300,
        errors,
      ),
    }),
  );

  const information: InstitutionalInformation = {
    organization,
    coverage,
    values,
  };

  return Object.keys(errors).length > 0
    ? { success: false as const, errors, information }
    : { success: true as const, information };
}

