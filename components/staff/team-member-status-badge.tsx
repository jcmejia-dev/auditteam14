import type { TeamPublicationStatus } from "@/lib/team/types";

const statusStyles: Record<TeamPublicationStatus, string> = {
  draft: "border-gold-600/25 bg-gold-200/45 text-navy-900",
  published: "border-teal-700/25 bg-teal-100 text-teal-700",
  archived: "border-slate-400/30 bg-slate-100 text-slate-700",
};

export function TeamMemberStatusBadge({
  status,
}: {
  status: TeamPublicationStatus;
}) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
