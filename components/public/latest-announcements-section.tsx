import { getLatestPublicAnnouncements } from "@/lib/announcements/data";

function formatPublishedDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "long",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function announcementExcerpt(summary: string | null, body: string) {
  const text = summary || body;
  return text.length > 280 ? `${text.slice(0, 277).trimEnd()}…` : text;
}

export async function LatestAnnouncementsSection() {
  const announcements = await getLatestPublicAnnouncements();

  return (
    <section
      id="announcements"
      aria-labelledby="latest-announcements-heading"
      className="border-y border-navy-900/10 bg-white py-16 sm:py-20"
    >
      <div className="page-shell">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            Public information
          </p>
          <h2
            id="latest-announcements-heading"
            className="mt-3 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
          >
            Latest Announcements
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Official public notices and approved updates from Audit Team 14.
          </p>
        </div>

        {announcements.length === 0 ? (
          <div className="mt-9 border-l-4 border-gold-500 bg-cream px-6 py-8 sm:px-8">
            <h3 className="font-display text-2xl font-bold text-navy-900">
              No current announcements
            </h3>
            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
              Approved public announcements will appear here when available.
            </p>
          </div>
        ) : (
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {announcements.map((announcement) => {
              const publishedDate = formatPublishedDate(
                announcement.publishedAt,
              );

              return (
                <article
                  key={announcement.id}
                  className="flex min-h-72 flex-col border border-navy-900/10 bg-cream p-6 shadow-[0_14px_35px_rgba(16,42,67,0.06)] sm:p-7"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">
                      Announcement
                    </span>
                    {announcement.isFeatured ? (
                      <span className="text-xs font-bold uppercase tracking-[0.15em] text-gold-600">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-navy-900">
                    {announcement.title}
                  </h3>
                  <p className="mt-4 flex-1 whitespace-pre-line leading-7 text-slate-600">
                    {announcementExcerpt(
                      announcement.summary,
                      announcement.body,
                    )}
                  </p>
                  {publishedDate ? (
                    <p className="mt-6 border-t border-navy-900/10 pt-4 text-sm font-semibold text-navy-700">
                      Published {publishedDate}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
