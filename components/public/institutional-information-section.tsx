import { siteContent } from "@/data/site-content";

import { SectionHeading } from "./section-heading";

export function InstitutionalInformationSection() {
  return (
    <section
      id="institutional-information"
      className="institutional-field bg-cream py-16 sm:py-20 lg:py-24"
    >
      <div className="institutional-watermark" aria-hidden="true">
        <span />
      </div>
      <div className="page-shell relative z-10">
        <SectionHeading
          eyebrow={siteContent.institutional.eyebrow}
          title={siteContent.institutional.title}
          description={siteContent.institutional.introduction}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="institutional-card institutional-card-primary">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-200">
                  Organizational details
                </p>
                <h3 className="mt-3 font-display text-3xl font-bold text-white">
                  Commission and team
                </h3>
              </div>
              <span
                aria-hidden="true"
                className="font-display text-5xl font-bold text-white/10"
              >
                01
              </span>
            </div>
            <dl className="mt-8 divide-y divide-white/10">
              {siteContent.institutional.organization.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
                >
                  <dt className="text-sm font-bold text-gold-200">
                    {item.label}
                  </dt>
                  <dd className="leading-7 text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="institutional-card institutional-card-secondary">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                  Regional coverage
                </p>
                <h3 className="mt-3 font-display text-3xl font-bold text-navy-900">
                  Public service in BARMM
                </h3>
              </div>
              <span
                aria-hidden="true"
                className="font-display text-5xl font-bold text-navy-900/10"
              >
                02
              </span>
            </div>
            <dl className="mt-8 divide-y divide-navy-900/10">
              {siteContent.institutional.coverage.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6"
                >
                  <dt className="text-sm font-bold text-teal-700">
                    {item.label}
                  </dt>
                  <dd className="leading-7 text-navy-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </div>
      <div className="institutional-wave" aria-hidden="true" />
    </section>
  );
}
