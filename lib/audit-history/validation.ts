import {
  auditContentTypes,
  auditOperations,
  type AuditContentType,
  type AuditHistoryFilters,
  type AuditOperation,
} from "./types";

type SearchValue = string | string[] | undefined;

export type AuditHistorySearchParams = {
  action?: SearchValue;
  content?: SearchValue;
  from?: SearchValue;
  page?: SearchValue;
  to?: SearchValue;
};

function singleValue(value: SearchValue) {
  return typeof value === "string" ? value : undefined;
}

function validDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== value
    ? undefined
    : value;
}

export function parseAuditHistorySearchParams(
  searchParams: AuditHistorySearchParams,
) {
  const rawAction = singleValue(searchParams.action);
  const rawContent = singleValue(searchParams.content);
  const rawFrom = singleValue(searchParams.from);
  const rawTo = singleValue(searchParams.to);
  const rawPage = singleValue(searchParams.page);
  const action = auditOperations.includes(rawAction as AuditOperation)
    ? (rawAction as AuditOperation)
    : undefined;
  const contentType = auditContentTypes.some(
    (option) => option.value === rawContent,
  )
    ? (rawContent as AuditContentType)
    : undefined;
  let dateFrom = validDate(rawFrom);
  let dateTo = validDate(rawTo);
  const parsedPage = rawPage ? Number(rawPage) : 1;
  const page =
    Number.isInteger(parsedPage) && parsedPage >= 1 && parsedPage <= 10000
      ? parsedPage
      : 1;
  let invalid =
    (rawAction !== undefined && rawAction !== "" && !action) ||
    (rawContent !== undefined && rawContent !== "" && !contentType) ||
    (rawFrom !== undefined && rawFrom !== "" && !dateFrom) ||
    (rawTo !== undefined && rawTo !== "" && !dateTo) ||
    (rawPage !== undefined && page !== parsedPage);

  if (dateFrom && dateTo && dateFrom > dateTo) {
    dateFrom = undefined;
    dateTo = undefined;
    invalid = true;
  }

  return {
    filters: {
      action,
      contentType,
      dateFrom,
      dateTo,
    } satisfies AuditHistoryFilters,
    invalid,
    page,
  };
}

export function auditHistoryHref(
  filters: AuditHistoryFilters,
  page: number,
) {
  const params = new URLSearchParams();

  if (filters.action) {
    params.set("action", filters.action);
  }

  if (filters.contentType) {
    params.set("content", filters.contentType);
  }

  if (filters.dateFrom) {
    params.set("from", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("to", filters.dateTo);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/staff/audit-history?${query}` : "/staff/audit-history";
}
