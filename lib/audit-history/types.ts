export const auditOperations = ["INSERT", "UPDATE", "DELETE"] as const;

export type AuditOperation = (typeof auditOperations)[number];

export const auditContentTypes = [
  {
    value: "public.site_settings",
    label: "Site settings",
    table: "site_settings",
    labelColumn: "setting_key",
  },
  {
    value: "public.team_members",
    label: "Team members",
    table: "team_members",
    labelColumn: "name",
  },
  {
    value: "public.announcements",
    label: "Announcements",
    table: "announcements",
    labelColumn: "title",
  },
  {
    value: "public.activities",
    label: "Activities",
    table: "activities",
    labelColumn: "title",
  },
  {
    value: "public.jurisdictions",
    label: "Jurisdictions",
    table: "jurisdictions",
    labelColumn: "name",
  },
  {
    value: "public.albums",
    label: "Albums",
    table: "albums",
    labelColumn: "title",
  },
  {
    value: "public.media_items",
    label: "Media items",
    table: "media_items",
    labelColumn: "title",
  },
  {
    value: "public.public_documents",
    label: "Public documents",
    table: "public_documents",
    labelColumn: "title",
  },
  {
    value: "private.user_roles",
    label: "Role assignments",
    table: null,
    labelColumn: null,
  },
] as const;

export type AuditContentType = (typeof auditContentTypes)[number]["value"];

export type AuditHistoryFilters = {
  action?: AuditOperation;
  contentType?: AuditContentType;
  dateFrom?: string;
  dateTo?: string;
};

export type AuditHistoryItem = {
  key: string;
  action: AuditOperation;
  actionLabel: string;
  contentTypeLabel: string;
  recordLabel: string;
  staffDisplayName: string;
  occurredAt: string;
};
