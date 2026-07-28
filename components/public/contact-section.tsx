import { siteContent } from "@/data/site-content";

import { SectionHeading } from "./section-heading";

export function ContactSection() {
  return (
    <section id="contact" className="bg-navy-900 py-16 sm:py-20">
      <div className="page-shell grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <SectionHeading
          eyebrow="Contact"
          title={siteContent.contact.title}
          inverse
        />

        <address className="border-l-2 border-gold-500 pl-6 not-italic sm:pl-8">
          <p className="font-display text-2xl font-bold text-white">
            {siteContent.contact.organization}
          </p>
          <p className="mt-3 text-lg text-navy-100">
            {siteContent.contact.group}
          </p>
          <p className="mt-2 text-lg text-navy-100">
            {siteContent.contact.city}
          </p>
          <a
            href={siteContent.contact.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-sm border border-gold-500/70 px-5 py-3 font-bold text-gold-200 transition-colors hover:border-gold-200 hover:bg-white/5 hover:text-white"
          >
            View on Google Maps
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </address>
      </div>
    </section>
  );
}
