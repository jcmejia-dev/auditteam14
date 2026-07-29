import type {
  ActivityDateStatus,
  ActivityPublicationStatus,
} from "@/lib/activities/types";

const publicationStyles: Record<ActivityPublicationStatus, string> = {
  draft: "border-gold-600/25 bg-gold-200/45 text-navy-900",
  published: "border-teal-700/25 bg-teal-100 text-teal-700",
  archived: "border-slate-400/30 bg-slate-100 text-slate-700",
};

const dateStyles: Record<ActivityDateStatus, string> = {
  Upcoming: "border-royal-700/20 bg-blue-50 text-royal-700",
  Completed: "border-navy-900/15 bg-navy-100/50 text-navy-700",
  "Date not set": "border-slate-400/25 bg-white text-slate-600",
};

export function ActivityPublicationBadge({
  status,
}: {
  status: ActivityPublicationStatus;
}) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${publicationStyles[status]}`}
    >
      {status}
    </span>
  );
}

export function ActivityDateBadge({
  status,
}: {
  status: ActivityDateStatus;
}) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${dateStyles[status]}`}
    >
      {status}
    </span>
  );
}
