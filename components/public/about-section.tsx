import { siteContent } from "@/data/site-content";

import { SectionHeading } from "./section-heading";

export function AboutSection() {
  return (
    <section id="about" className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="page-shell grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <SectionHeading
          eyebrow={siteContent.about.eyebrow}
          title={siteContent.about.title}
        />

        <div className="border-l-2 border-gold-500 pl-6 sm:pl-9">
          <p className="text-xl leading-9 text-navy-800 sm:text-2xl sm:leading-10">
            {siteContent.about.introduction}
          </p>
        </div>
      </div>
    </section>
  );
}
