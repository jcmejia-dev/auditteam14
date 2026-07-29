import { siteContent } from "@/data/site-content";

import { SectionHeading } from "./section-heading";

export function ValuesSection() {
  return (
    <section className="values-field bg-teal-700 py-20 text-white sm:py-24">
      <div className="page-shell relative z-10">
        <SectionHeading
          eyebrow="Commission on Audit"
          title="Official core values"
          description="The seven values that guide the Commission on Audit."
          inverse
          align="center"
        />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {siteContent.values.map((value, index) => (
            <li
              key={value.title}
              className="group flex min-h-44 flex-col border border-white/20 bg-navy-950/20 p-6 shadow-[0_12px_28px_rgba(11,31,51,0.09)]"
            >
              <span className="text-xs font-bold tracking-[0.18em] text-gold-200">
                0{index + 1}
              </span>
              <div className="mt-auto pt-9">
                <span
                  aria-hidden="true"
                  className="mb-4 block h-0.5 w-10 bg-gold-500"
                />
                <h3 className="font-display text-xl leading-7 font-bold text-white">
                  {value.title}
                </h3>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="values-wave" aria-hidden="true" />
    </section>
  );
}
