import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { JurisdictionLocation } from "@/data/jurisdictions";
import { createPublicClient } from "@/lib/supabase/public";

import {
  jurisdictionCategories,
  jurisdictionPublicationStatuses,
  type JurisdictionCategory,
  type JurisdictionPublicationStatus,
  type JurisdictionRecord,
} from "./types";

type DatabaseJurisdiction = {
  id: unknown;
  name: unknown;
  abbreviation: unknown;
  category: unknown;
  general_location: unknown;
  latitude: unknown;
  longitude: unknown;
  status: unknown;
  published_at: unknown;
  display_order: unknown;
  created_at: unknown;
  updated_at: unknown;
};

type DatabasePublicJurisdiction = {
  name: unknown;
  abbreviation: unknown;
  category: unknown;
  general_location: unknown;
  latitude: unknown;
  longitude: unknown;
};

function nullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function numericValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function isCategory(value: unknown): value is JurisdictionCategory {
  return (
    typeof value === "string" &&
    jurisdictionCategories.includes(value as JurisdictionCategory)
  );
}

function isPublicationStatus(
  value: unknown,
): value is JurisdictionPublicationStatus {
  return (
    typeof value === "string" &&
    jurisdictionPublicationStatuses.includes(
      value as JurisdictionPublicationStatus,
    )
  );
}

function normalizeJurisdiction(
  value: DatabaseJurisdiction,
): JurisdictionRecord | null {
  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    !isCategory(value.category) ||
    typeof value.general_location !== "string" ||
    !isPublicationStatus(value.status) ||
    typeof value.display_order !== "number" ||
    typeof value.created_at !== "string" ||
    typeof value.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    abbreviation: nullableString(value.abbreviation),
    category: value.category,
    generalLocation: value.general_location,
    latitude: numericValue(value.latitude),
    longitude: numericValue(value.longitude),
    status: value.status,
    publishedAt: nullableString(value.published_at),
    displayOrder: value.display_order,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}

function normalizePublicJurisdiction(
  value: DatabasePublicJurisdiction,
  index: number,
): JurisdictionLocation | null {
  const latitude = numericValue(value.latitude);
  const longitude = numericValue(value.longitude);

  if (
    typeof value.name !== "string" ||
    !isCategory(value.category) ||
    typeof value.general_location !== "string" ||
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    id: `published-jurisdiction-${index + 1}`,
    name: value.name,
    abbreviation:
      typeof value.abbreviation === "string" ? value.abbreviation : "",
    latitude,
    longitude,
    location: value.general_location,
    category: value.category,
  };
}

const staffColumns =
  "id,name,abbreviation,category,general_location,latitude,longitude,status,published_at,display_order,created_at,updated_at";
const publicColumns =
  "name,abbreviation,category,general_location,latitude,longitude";

export async function getStaffJurisdictions(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("jurisdictions")
    .select(staffColumns)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(200);

  if (error) {
    return { jurisdictions: [], error: true };
  }

  const jurisdictions = (data ?? [])
    .map((item) =>
      normalizeJurisdiction(item as DatabaseJurisdiction),
    )
    .filter((item): item is JurisdictionRecord => item !== null);

  return { jurisdictions, error: false };
}

export async function getStaffJurisdiction(
  supabase: SupabaseClient,
  id: string,
) {
  const { data, error } = await supabase
    .from("jurisdictions")
    .select(staffColumns)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeJurisdiction(data as DatabaseJurisdiction);
}

export async function getPublicJurisdictionSource() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("jurisdictions")
    .select(publicColumns)
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(200);

  if (error) {
    return {
      locations: [] as JurisdictionLocation[],
      useFallback: true,
    };
  }

  const rows = data ?? [];
  const locations = rows
    .map((item, index) =>
      normalizePublicJurisdiction(
        item as DatabasePublicJurisdiction,
        index,
      ),
    )
    .filter((item): item is JurisdictionLocation => item !== null);

  return {
    locations,
    useFallback: rows.length === 0,
  };
}
