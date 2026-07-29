import { getLatestPublicActivities } from "@/lib/activities/data";
import { getActivityDateStatus } from "@/lib/activities/types";

function formatActivityDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "long",
    timeZone: "Asia/Manila",
  }).format(new Date(`${value}T00:00:00+08:00`));
}

export async function LatestActivitiesSection() {
  const activities = await getLatestPublicActivities();

  return (
    <section
      id="activities"
      aria-labelledby="latest-activities-heading"
      className="bg-cream py-16 sm:py-20"
    >
      <div className="page-shell">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            Team updates
          </p>
          <h2
            id="latest-activities-heading"
            className="mt-3 font-display text-4xl font-bold text-navy-900 sm:text-5xl"
          >
            Latest Activities
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Approved public information about Audit Team 14 activities.
          </p>
        </div>

        {activities.length === 0 ? (
          <div className="mt-9 border-l-4 border-teal-700 bg-white px-6 py-8 shadow-[0_12px_30px_rgba(16,42,67,0.05)] sm:px-8">
            <h3 className="font-display text-2xl font-bold text-navy-900">
              No published activities
            </h3>
            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
              Approved public activity updates will appear here when
              available.
            </p>
          </div>
        ) : (
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            {activities.map((activity) => {
              const activityDate = formatActivityDate(activity.activityDate);
              const dateStatus = getActivityDateStatus(activity.activityDate);

              return (
                <article
                  key={activity.slug}
                  className="flex min-h-72 flex-col border border-navy-900/10 bg-white p-6 shadow-[0_14px_35px_rgba(16,42,67,0.06)] sm:p-7"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">
                      Activity
                    </span>
                    {activity.activityDate ? (
                      <span className="text-xs font-bold uppercase tracking-[0.15em] text-gold-600">
                        {dateStatus}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-navy-900">
                    {activity.title}
                  </h3>
                  {activity.summary ? (
                    <p className="mt-4 flex-1 whitespace-pre-line leading-7 text-slate-600">
                      {activity.summary}
                    </p>
                  ) : (
                    <div className="flex-1" aria-hidden="true" />
                  )}
                  {activityDate || activity.locationText ? (
                    <div className="mt-6 space-y-2 border-t border-navy-900/10 pt-4 text-sm font-semibold text-navy-700">
                      {activityDate ? <p>{activityDate}</p> : null}
                      {activity.locationText ? (
                        <p>{activity.locationText}</p>
                      ) : null}
                    </div>
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
