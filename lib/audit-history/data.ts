import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  auditContentTypes,
  auditOperations,
  type AuditHistoryFilters,
  type AuditHistoryItem,
  type AuditOperation,
} from "./types";

export const AUDIT_HISTORY_PAGE_SIZE = 20;

type DatabaseAuditLog = {
  actor_id: unknown;
  entity_id: unknown;
  entity_table: unknown;
  occurred_at: unknown;
  operation: unknown;
};

type SafeAuditLog = {
  actorId: string;
  entityId: string;
  entityTable: string;
  occurredAt: string;
  operation: AuditOperation;
};

type DatabaseProfile = {
  id: unknown;
  display_name: unknown;
};

type DatabaseEntityLabel = {
  id: unknown;
  [key: string]: unknown;
};

function normalizeAuditLog(value: DatabaseAuditLog): SafeAuditLog | null {
  if (
    typeof value.actor_id !== "string" ||
    typeof value.entity_id !== "string" ||
    typeof value.entity_table !== "string" ||
    typeof value.occurred_at !== "string" ||
    typeof value.operation !== "string" ||
    !auditOperations.includes(value.operation as AuditOperation)
  ) {
    return null;
  }

  return {
    actorId: value.actor_id,
    entityId: value.entity_id,
    entityTable: value.entity_table,
    occurredAt: value.occurred_at,
    operation: value.operation as AuditOperation,
  };
}

function safeDisplayName(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length >= 1 && normalized.length <= 100
    ? normalized
    : null;
}

function safeRecordLabel(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length >= 1 && normalized.length <= 240
    ? normalized
    : null;
}

function nextPhilippineDate(date: string) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return `${value.toISOString().slice(0, 10)}T00:00:00+08:00`;
}

function contentConfig(value: string) {
  return auditContentTypes.find((option) => option.value === value);
}

async function getProfileNames(
  supabase: SupabaseClient,
  actorIds: readonly string[],
) {
  if (actorIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,display_name")
    .in("id", [...new Set(actorIds)]);

  if (error) {
    return new Map<string, string>();
  }

  const names = new Map<string, string>();

  for (const item of (data ?? []) as DatabaseProfile[]) {
    const name = safeDisplayName(item.display_name);

    if (typeof item.id === "string" && name) {
      names.set(item.id, name);
    }
  }

  return names;
}

async function getEntityLabels(
  supabase: SupabaseClient,
  logs: readonly SafeAuditLog[],
) {
  const labels = new Map<string, string>();
  const lookups = auditContentTypes
    .filter(
      (
        option,
      ): option is (typeof auditContentTypes)[number] & {
        table: string;
        labelColumn: string;
      } => option.table !== null && option.labelColumn !== null,
    )
    .map(async (option) => {
      const entityIds = [
        ...new Set(
          logs
            .filter(
              (log) =>
                log.entityTable === option.value &&
                log.operation !== "DELETE",
            )
            .map((log) => log.entityId),
        ),
      ];

      if (entityIds.length === 0) {
        return;
      }

      const { data, error } = await supabase
        .from(option.table)
        .select(`id,${option.labelColumn}`)
        .in("id", entityIds);

      if (error) {
        return;
      }

      for (const item of (data ?? []) as DatabaseEntityLabel[]) {
        const label = safeRecordLabel(item[option.labelColumn]);

        if (typeof item.id === "string" && label) {
          labels.set(`${option.value}:${item.id}`, label);
        }
      }
    });

  await Promise.all(lookups);
  return labels;
}

const actionLabels: Record<AuditOperation, string> = {
  INSERT: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
};

export async function getAuditHistoryPage(
  supabase: SupabaseClient,
  filters: AuditHistoryFilters,
  page: number,
) {
  const from = (page - 1) * AUDIT_HISTORY_PAGE_SIZE;
  const to = from + AUDIT_HISTORY_PAGE_SIZE - 1;
  let query = supabase
    .from("audit_logs")
    .select(
      "actor_id,operation,entity_table,entity_id,occurred_at",
      { count: "exact" },
    )
    .order("occurred_at", { ascending: false })
    .range(from, to);

  if (filters.action) {
    query = query.eq("operation", filters.action);
  }

  if (filters.contentType) {
    query = query.eq("entity_table", filters.contentType);
  }

  if (filters.dateFrom) {
    query = query.gte(
      "occurred_at",
      `${filters.dateFrom}T00:00:00+08:00`,
    );
  }

  if (filters.dateTo) {
    query = query.lt(
      "occurred_at",
      nextPhilippineDate(filters.dateTo),
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return {
      error: true,
      items: [] as AuditHistoryItem[],
      total: 0,
    };
  }

  const logs = (data ?? [])
    .map((item) => normalizeAuditLog(item as DatabaseAuditLog))
    .filter((item): item is SafeAuditLog => item !== null);
  const [profileNames, entityLabels] = await Promise.all([
    getProfileNames(
      supabase,
      logs.map((log) => log.actorId),
    ),
    getEntityLabels(supabase, logs),
  ]);
  const items = logs.map((log, index): AuditHistoryItem => {
    const config = contentConfig(log.entityTable);
    const recordLabel =
      entityLabels.get(`${log.entityTable}:${log.entityId}`) ??
      (log.entityTable === "private.user_roles"
        ? "Protected role assignment"
        : log.operation === "DELETE"
          ? "Deleted record"
          : "Record unavailable");

    return {
      key: `audit-event-${from + index + 1}`,
      action: log.operation,
      actionLabel: actionLabels[log.operation],
      contentTypeLabel: config?.label ?? "Other audited content",
      recordLabel,
      staffDisplayName:
        profileNames.get(log.actorId) ?? "Authorized staff member",
      occurredAt: log.occurredAt,
    };
  });

  return {
    error: false,
    items,
    total: count ?? 0,
  };
}
