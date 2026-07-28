import Image from "next/image";

import { siteContent } from "@/data/site-content";

import { SectionHeading } from "./section-heading";

export function LeadershipSection() {
  return (
    <section id="leadership" className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="page-shell grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div
          aria-hidden="true"
          className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden bg-navy-900"
        >
          <Image
            src="/logo2.png"
            alt="Bernard R. Sero, Audit Team Leader"
            fill
            sizes="(min-width: 1024px) 384px, (min-width: 640px) 384px, calc(100vw - 3rem)"
            className="object-cover object-[center_42%]"
          />
          <div className="absolute inset-5 border border-gold-500/55" />
          <div className="absolute inset-x-0 bottom-0 bg-navy-950/80 px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-gold-200">
            Audit Team 14
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="Leadership"
            title="Service with clear responsibility"
          />
          <div className="mt-10 border-t border-navy-900/15 pt-8">
            <p className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">
              {siteContent.leadership.name}
            </p>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
              {siteContent.leadership.role}
            </p>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink">
              {siteContent.leadership.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
