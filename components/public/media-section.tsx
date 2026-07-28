import { siteContent } from "@/data/site-content";

import { SectionHeading } from "./section-heading";

export function MediaSection() {
  return (
    <section id="media" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Media"
          title="A place for approved public updates"
          description="Published activities, photographs, and videos will appear here following review."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {siteContent.media.map((item, index) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-sm border border-navy-900/10 bg-white shadow-[0_12px_30px_rgba(16,42,67,0.06)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden border-b border-navy-900/10 bg-navy-900 p-6">
                <span
                  aria-hidden="true"
                  className="absolute -right-12 -top-12 size-48 rounded-full border border-gold-500/25"
                />
                <span
                  aria-hidden="true"
                  className="absolute -right-4 -top-4 size-28 rounded-full border border-white/10"
                />
                <div className="relative flex h-full flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-200">
                    Public media
                  </span>
                  <span className="font-display text-7xl font-bold text-white/15">
                    0{index + 1}
                  </span>
                </div>
              </div>
              <div className="p-6 sm:p-7">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl font-bold text-navy-900">
                    {item.title}
                  </h3>
                  <span className="text-xs font-bold text-gold-600">
                    0{index + 1}
                  </span>
                </div>
                <p className="mt-4 leading-7 text-ink">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
