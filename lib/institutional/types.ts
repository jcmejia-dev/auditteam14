import { siteContent } from "@/data/site-content";

export const INSTITUTIONAL_SETTING_KEY = "institutional_information";

export type InstitutionalInformationItem = {
  label: string;
  value: string;
};

export type InstitutionalCoreValue = {
  title: string;
  description: string;
};

export type InstitutionalInformation = {
  organization: InstitutionalInformationItem[];
  coverage: InstitutionalInformationItem[];
  values: InstitutionalCoreValue[];
};

export const fallbackInstitutionalInformation: InstitutionalInformation = {
  organization: siteContent.institutional.organization.map((item) => ({
    label: item.label,
    value: item.value,
  })),
  coverage: siteContent.institutional.coverage.map((item) => ({
    label: item.label,
    value: item.value,
  })),
  values: siteContent.values.map((value) => ({
    title: value.title,
    description: value.description,
  })),
};

function safeText(value: unknown, maximum: number) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length >= 1 && normalized.length <= maximum
    ? normalized
    : null;
}

export function normalizeInstitutionalInformation(
  value: unknown,
): InstitutionalInformation | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("organization" in value) ||
    !("coverage" in value) ||
    !("values" in value)
  ) {
    return null;
  }

  const candidate = value as {
    organization: unknown;
    coverage: unknown;
    values: unknown;
  };

  if (
    !Array.isArray(candidate.organization) ||
    candidate.organization.length !==
      fallbackInstitutionalInformation.organization.length ||
    !Array.isArray(candidate.coverage) ||
    candidate.coverage.length !==
      fallbackInstitutionalInformation.coverage.length ||
    !Array.isArray(candidate.values) ||
    candidate.values.length !==
      fallbackInstitutionalInformation.values.length
  ) {
    return null;
  }

  const organization = candidate.organization.map((item, index) => {
    const storedValue =
      typeof item === "object" && item !== null && "value" in item
        ? safeText(item.value, 300)
        : null;

    return storedValue
      ? {
          label:
            fallbackInstitutionalInformation.organization[index].label,
          value: storedValue,
        }
      : null;
  });
  const coverage = candidate.coverage.map((item, index) => {
    const storedValue =
      typeof item === "object" && item !== null && "value" in item
        ? safeText(item.value, 300)
        : null;

    return storedValue
      ? {
          label: fallbackInstitutionalInformation.coverage[index].label,
          value: storedValue,
        }
      : null;
  });
  const values = candidate.values.map((item) => {
    if (
      typeof item !== "object" ||
      item === null ||
      !("title" in item) ||
      !("description" in item)
    ) {
      return null;
    }

    const title = safeText(item.title, 100);
    const description = safeText(item.description, 300);

    return title && description ? { title, description } : null;
  });

  if (
    organization.some((item) => item === null) ||
    coverage.some((item) => item === null) ||
    values.some((item) => item === null)
  ) {
    return null;
  }

  return {
    organization: organization as InstitutionalInformationItem[],
    coverage: coverage as InstitutionalInformationItem[],
    values: values as InstitutionalCoreValue[],
  };
}

