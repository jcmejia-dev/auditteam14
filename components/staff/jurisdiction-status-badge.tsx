import type { JurisdictionPublicationStatus } from "@/lib/jurisdictions/types";

const styles: Record<JurisdictionPublicationStatus, string> = {
  draft: "border-gold-500/30 bg-gold-200/45 text-navy-900",
  published: "border-teal-700/25 bg-teal-100 text-teal-800",
  archived: "border-slate-300 bg-slate-100 text-slate-700",
};

export function JurisdictionStatusBadge({
  status,
}: {
  status: JurisdictionPublicationStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}
