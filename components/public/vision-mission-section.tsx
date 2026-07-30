import { siteContent } from "@/data/site-content";

import { SectionHeading } from "./section-heading";

export function VisionMissionSection() {
  return (
    <section id="mandate" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Institutional direction"
          title="Vision and mission"
          description="The Commission on Audit’s vision and mission guide its commitment to accountable public service."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {[siteContent.vision, siteContent.mission].map((item, index) => (
            <article
              key={item.title}
              className={[
                "relative overflow-hidden border border-navy-900/10 border-t-4 bg-cream px-6 py-10 shadow-[0_16px_38px_rgba(16,42,67,0.06)] sm:px-10 sm:py-12",
                index === 0 ? "border-gold-500" : "border-teal-600",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "absolute top-7 right-7 font-display text-7xl font-bold",
                  index === 0 ? "text-gold-500/30" : "text-teal-600/25",
                ].join(" ")}
              >
                0{index + 1}
              </span>
              <h3 className="relative font-display text-3xl font-bold text-navy-900">
                {item.title}
              </h3>
              <p className="relative mt-7 max-w-2xl text-lg leading-8 text-ink">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
