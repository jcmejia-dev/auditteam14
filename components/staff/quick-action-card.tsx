import Link from "next/link";

type QuickActionCardProps = {
  title: string;
  description: string;
  icon:
    | "announcement"
    | "activity"
    | "information"
    | "team"
    | "map"
    | "media"
    | "history";
  href?: string;
  statusLabel?: string;
};

function QuickActionIcon({ icon }: Pick<QuickActionCardProps, "icon">) {
  const paths = {
    announcement: (
      <>
        <path d="M4 11v2a2 2 0 0 0 2 2h1l2 5h3l-2-5 8-3V6L7 9H6a2 2 0 0 0-2 2Z" />
        <path d="M18 8a3 3 0 0 1 0 6" />
      </>
    ),
    activity: (
      <>
        <path d="M6 3v3M18 3v3M4 9h16" />
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="m8 14 2 2 5-5" />
      </>
    ),
    information: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    team: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 4a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5" />
      </>
    ),
    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
        <path d="M9 3v15M15 6v15" />
      </>
    ),
    media: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m4 17 5-4 3 2 3-3 5 5" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l3 2" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-8"
    >
      {paths[icon]}
    </svg>
  );
}

export function QuickActionCard({
  title,
  description,
  icon,
  href,
  statusLabel = "Upcoming",
}: QuickActionCardProps) {
  return (
    <article className="group flex min-h-56 flex-col border border-navy-900/10 bg-white p-6 shadow-[0_14px_35px_rgba(16,42,67,0.07)] sm:p-7">
      <div className="grid size-14 place-items-center rounded-full bg-teal-100 text-teal-700">
        <QuickActionIcon icon={icon} />
      </div>
      <h2 className="mt-6 font-display text-2xl font-bold text-navy-900">
        {title}
      </h2>
      <p className="mt-3 flex-1 text-base leading-7 text-slate-600">
        {description}
      </p>
      {href ? (
        <Link
          href={href}
          className="mt-5 inline-flex min-h-11 items-center border-t border-navy-900/10 pt-4 text-sm font-bold text-teal-700 underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-navy-900"
        >
          Open tool
        </Link>
      ) : (
        <p className="mt-5 border-t border-navy-900/10 pt-4 text-xs font-bold uppercase tracking-[0.16em] text-gold-600">
          {statusLabel}
        </p>
      )}
    </article>
  );
}
