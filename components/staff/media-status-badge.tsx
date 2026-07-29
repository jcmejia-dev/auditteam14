import type { MediaPublicationStatus } from "@/lib/media/types";

const styles: Record<MediaPublicationStatus, string> = {
  archived: "border-slate-300 bg-slate-100 text-slate-700",
  draft: "border-gold-500/35 bg-gold-100 text-navy-900",
  published: "border-teal-700/25 bg-teal-100 text-teal-800",
};

export function MediaStatusBadge({
  status,
}: {
  status: MediaPublicationStatus;
}) {
  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}
