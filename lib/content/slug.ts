import "server-only";

import { randomBytes } from "node:crypto";

const MAX_SLUG_LENGTH = 160;
const SUFFIX_LENGTH = 8;

export function createContentSlug(value: FormDataEntryValue | null) {
  const label = typeof value === "string" ? value : "";
  const base =
    label
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "content";
  const suffix = randomBytes(SUFFIX_LENGTH / 2).toString("hex");
  const maximumBaseLength = MAX_SLUG_LENGTH - suffix.length - 1;
  const safeBase =
    base
      .slice(0, maximumBaseLength)
      .replace(/-+$/g, "") || "content";

  return `${safeBase}-${suffix}`;
}
