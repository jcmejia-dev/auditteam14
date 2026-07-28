import { siteContent } from "@/data/site-content";

import { SectionHeading } from "./section-heading";

export function ValuesSection() {
  return (
    <section className="bg-teal-700 py-20 text-white sm:py-24">
      <div className="page-shell">
        <SectionHeading
          eyebrow="The standards we uphold"
          title="Core values"
          description="Five values at the center of professional public service."
          inverse
          align="center"
        />
        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {siteContent.values.map((value, index) => (
            <li
              key={value.title}
              className="flex min-h-48 flex-col border border-white/20 bg-white/[0.055] p-5"
            >
              <span className="text-xs font-bold tracking-[0.18em] text-gold-200">
                0{index + 1}
              </span>
              <div className="mt-auto pt-8">
                <h3 className="font-display text-xl font-bold text-white">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-teal-100">
                  {value.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
