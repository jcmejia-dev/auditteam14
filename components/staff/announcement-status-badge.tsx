import type { AnnouncementDisplayStatus } from "@/lib/announcements/types";

const statusStyles: Record<AnnouncementDisplayStatus, string> = {
  Draft: "border-gold-600/25 bg-gold-200/45 text-navy-900",
  Published: "border-teal-700/25 bg-teal-100 text-teal-700",
  Archived: "border-slate-400/30 bg-slate-100 text-slate-700",
  Expired: "border-patriot-red/20 bg-red-50 text-patriot-red",
};

export function AnnouncementStatusBadge({
  status,
}: {
  status: AnnouncementDisplayStatus;
}) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
