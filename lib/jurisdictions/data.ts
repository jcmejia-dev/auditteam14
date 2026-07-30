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
  primary_contact_role?: unknown;
  primary_contact_name?: unknown;
  secondary_contact_role?: unknown;
  secondary_contact_name?: unknown;
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
  primary_contact_role?: unknown;
  primary_contact_name?: unknown;
  secondary_contact_role?: unknown;
  secondary_contact_name?: unknown;
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

function contactValue(role: unknown, name: unknown) {
  if (
    typeof role !== "string" ||
    typeof name !== "string" ||
    role.trim().length === 0 ||
    role.trim().length > 100 ||
    name.trim().length === 0 ||
    name.trim().length > 180
  ) {
    return null;
  }

  return { role: role.trim(), name: name.trim() };
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
    primaryContactRole: nullableString(value.primary_contact_role),
    primaryContactName: nullableString(value.primary_contact_name),
    secondaryContactRole: nullableString(value.secondary_contact_role),
    secondaryContactName: nullableString(value.secondary_contact_name),
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
    contacts: [
      contactValue(
        value.primary_contact_role,
        value.primary_contact_name,
      ),
      contactValue(
        value.secondary_contact_role,
        value.secondary_contact_name,
      ),
    ].filter(
      (contact): contact is { role: string; name: string } =>
        contact !== null,
    ),
  };
}

const legacyStaffColumns =
  "id,name,abbreviation,category,general_location,latitude,longitude,status,published_at,display_order,created_at,updated_at";
const staffColumns = `${legacyStaffColumns},primary_contact_role,primary_contact_name,secondary_contact_role,secondary_contact_name`;
const legacyPublicColumns =
  "name,abbreviation,category,general_location,latitude,longitude";
const publicColumns = `${legacyPublicColumns},primary_contact_role,primary_contact_name,secondary_contact_role,secondary_contact_name`;

export async function jurisdictionContactsAreReady(
  supabase: SupabaseClient,
) {
  const { error } = await supabase
    .from("jurisdictions")
    .select("primary_contact_role")
    .limit(1);

  return !error;
}

export async function getStaffJurisdictions(supabase: SupabaseClient) {
  const contactResponse = await supabase
    .from("jurisdictions")
    .select(staffColumns)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(200);

  const contactsReady = !contactResponse.error;
  let data: unknown[] | null = contactResponse.data;
  let queryError = contactResponse.error;

  if (queryError) {
    const legacyResponse = await supabase
      .from("jurisdictions")
      .select(legacyStaffColumns)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(200);

    data = legacyResponse.data;
    queryError = legacyResponse.error;
  }

  if (queryError) {
    return { jurisdictions: [], error: true };
  }

  const jurisdictions = (data ?? [])
    .map((item) =>
      normalizeJurisdiction(item as DatabaseJurisdiction),
    )
    .filter((item): item is JurisdictionRecord => item !== null);

  return { jurisdictions, error: false, contactsReady };
}

export async function getStaffJurisdiction(
  supabase: SupabaseClient,
  id: string,
) {
  const contactResponse = await supabase
    .from("jurisdictions")
    .select(staffColumns)
    .eq("id", id)
    .maybeSingle();

  let data: unknown = contactResponse.data;
  let queryError = contactResponse.error;

  if (queryError) {
    const legacyResponse = await supabase
      .from("jurisdictions")
      .select(legacyStaffColumns)
      .eq("id", id)
      .maybeSingle();

    data = legacyResponse.data;
    queryError = legacyResponse.error;
  }

  if (queryError || !data) {
    return null;
  }

  return normalizeJurisdiction(data as DatabaseJurisdiction);
}

export async function getPublicJurisdictionSource() {
  const supabase = createPublicClient();
  const contactResponse = await supabase
    .from("jurisdictions")
    .select(publicColumns)
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(200);

  let data: unknown[] | null = contactResponse.data;
  let queryError = contactResponse.error;

  if (queryError) {
    const legacyResponse = await supabase
      .from("jurisdictions")
      .select(legacyPublicColumns)
      .eq("status", "published")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(200);

    data = legacyResponse.data;
    queryError = legacyResponse.error;
  }

  if (queryError) {
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
