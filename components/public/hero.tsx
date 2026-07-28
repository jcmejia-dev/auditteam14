import Image from "next/image";

import { siteContent } from "@/data/site-content";

import { BrandMark } from "./brand-mark";

export function Hero() {
  return (
    <section id="home" className="hero-field bg-navy-950 text-white">
      <div className="hero-flag-watermark" aria-hidden="true">
        <span className="flag-sun" />
        <span className="flag-star flag-star-one">★</span>
        <span className="flag-star flag-star-two">★</span>
        <span className="flag-star flag-star-three">★</span>
      </div>
      <div className="page-shell relative z-10 grid min-h-[calc(100svh-5rem)] items-center gap-14 py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:py-24">
        <div className="max-w-4xl">
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-10 bg-gold-500" />
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold-200 sm:text-sm">
              Public institutional website
            </p>
          </div>
          <p className="text-base font-semibold tracking-wide text-teal-100 sm:text-lg">
            {siteContent.identity.organization}
          </p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-navy-100 sm:text-base">
            {siteContent.identity.group}
          </p>
          <h1 className="mt-6 text-balance font-display text-5xl leading-[0.98] font-bold tracking-[-0.025em] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
            {siteContent.identity.team}
          </h1>
          <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-navy-100 sm:text-xl sm:leading-9">
            {siteContent.identity.tagline}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#about"
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold-500 px-6 py-3 font-bold text-navy-950 transition-colors hover:bg-gold-200"
            >
              Explore Our Work
            </a>
            <a
              href="#media"
              className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/35 px-6 py-3 font-bold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              View Media
            </a>
          </div>
          <div
            aria-label="Commission on Audit and BARMM institutional seals"
            className="mt-10 flex items-center gap-4 lg:hidden"
          >
            <BrandMark inverted />
            <span aria-hidden="true" className="h-9 w-px bg-gold-500/40" />
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white p-0.5 ring-1 ring-gold-500/55">
              <Image
                src="/logo (1).png"
                alt="Official seal of the Bangsamoro Autonomous Region in Muslim Mindanao"
                width={5000}
                height={5000}
                sizes="48px"
                className="size-full object-contain"
                priority
              />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-gold-200">
              Public service
            </span>
          </div>
        </div>

        <div
          aria-label="Commission on Audit identity"
          className="relative mx-auto hidden min-h-[27rem] w-full max-w-[25rem] place-items-center border border-white/15 bg-white/[0.035] p-8 lg:grid"
        >
          <span className="absolute inset-x-5 top-5 h-px bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />
          <span className="absolute inset-y-5 right-5 w-px bg-gradient-to-b from-transparent via-gold-500/50 to-transparent" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-5">
              <BrandMark size="large" inverted />
              <span
                aria-hidden="true"
                className="h-20 w-px bg-gold-500/40"
              />
              <span className="grid size-32 shrink-0 place-items-center rounded-full bg-white p-2 ring-1 ring-gold-500/55 sm:size-36">
                <Image
                  src="/logo (1).png"
                  alt="Official seal of the Bangsamoro Autonomous Region in Muslim Mindanao"
                  width={5000}
                  height={5000}
                  sizes="(min-width: 640px) 144px, 128px"
                  className="size-full object-contain"
                  priority
                />
              </span>
            </div>
            <p className="mt-8 font-display text-2xl font-bold">Public Service</p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-gold-200">
              Accountability · Integrity
            </p>
          </div>
          <span className="absolute bottom-5 left-5 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-navy-100">
            Maguindanao
          </span>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 bg-navy-900/80">
        <div className="page-shell grid md:grid-cols-3">
          {siteContent.quickInformation.map((item, index) => (
            <div
              key={item.title}
              className={[
                "flex gap-4 py-6 md:px-7",
                index > 0 ? "border-t border-white/10 md:border-t-0 md:border-l" : "",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className="mt-2 size-2 shrink-0 rotate-45 bg-gold-500"
              />
              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  {item.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-navy-100">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="patriotic-wave" aria-hidden="true" />
    </section>
  );
}
