import { siteContent } from "@/data/site-content";
import { getPublicInstitutionalInformation } from "@/lib/institutional/data";

import { SectionHeading } from "./section-heading";

export async function InstitutionalInformationSection() {
  const information = await getPublicInstitutionalInformation();

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
          align="center"
        />

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          <article className="institutional-card institutional-card-secondary">
            <div className="border-b border-navy-900/10 pb-5">
              <h3 className="font-display text-2xl font-bold text-navy-900">
                Organizational Details
              </h3>
              <span
                aria-hidden="true"
                className="mt-4 block h-0.5 w-12 bg-patriot-red"
              />
            </div>
            <dl className="mt-4 divide-y divide-navy-900/10">
              {information.organization.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-1 py-3.5 sm:grid-cols-[7.5rem_1fr] sm:gap-4 lg:grid-cols-1 xl:grid-cols-[7.5rem_1fr]"
                >
                  <dt className="text-sm font-bold text-navy-900">
                    {item.label}
                  </dt>
                  <dd className="text-sm leading-6 text-teal-700">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="institutional-card institutional-card-secondary">
            <div className="border-b border-navy-900/10 pb-5">
              <h3 className="font-display text-2xl font-bold text-navy-900">
                Regional Coverage
              </h3>
              <span
                aria-hidden="true"
                className="mt-4 block h-0.5 w-12 bg-patriot-red"
              />
            </div>
            <dl className="mt-4 divide-y divide-navy-900/10">
              {information.coverage.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-1 py-3.5 sm:grid-cols-[7.5rem_1fr] sm:gap-4 lg:grid-cols-1 xl:grid-cols-[7.5rem_1fr]"
                >
                  <dt className="text-sm font-bold text-navy-900">
                    {item.label}
                  </dt>
                  <dd className="text-sm leading-6 text-teal-700">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="institutional-card institutional-card-secondary">
            <div className="border-b border-navy-900/10 pb-5">
              <h3 className="font-display text-2xl font-bold text-navy-900">
                Core Values
              </h3>
              <span
                aria-hidden="true"
                className="mt-4 block h-0.5 w-12 bg-patriot-red"
              />
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {information.values.map((value) => (
                <li
                  key={value.title}
                  className="border-l-2 border-teal-700 bg-navy-900/[0.035] px-4 py-4"
                >
                  <h4 className="text-sm font-bold text-navy-900">
                    {value.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-ink">
                    {value.description}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
      <div className="institutional-wave" aria-hidden="true" />
    </section>
  );
}
