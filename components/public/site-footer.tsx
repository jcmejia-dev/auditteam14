import Link from "next/link";

import { siteContent } from "@/data/site-content";

import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-navy-100">
      <div className="page-shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.75fr_0.9fr_auto] lg:items-start">
        <div className="flex items-center gap-4">
          <BrandMark inverted />
          <div>
            <p className="font-display text-lg font-bold text-white">
              {siteContent.identity.team}
            </p>
            <p className="mt-1 text-sm">{siteContent.identity.group}</p>
            <p className="mt-1 text-sm">
              {siteContent.identity.organization}
            </p>
          </div>
        </div>

        <nav aria-label="Footer navigation">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-200">
            Navigate
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
            {siteContent.navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={`/${item.href}`}
                  className="rounded-sm hover:text-white hover:underline hover:underline-offset-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-200">
            Regional office
          </p>
          <a
            href={siteContent.contact.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block rounded-sm text-sm font-semibold leading-6 text-white hover:text-gold-200 hover:underline hover:underline-offset-4"
            aria-label={`${siteContent.contact.organization} on Google Maps (opens in a new tab)`}
          >
            {siteContent.contact.organization}
          </a>
          <p className="mt-1 text-sm text-navy-100">
            {siteContent.contact.city}
          </p>
          <a
            href={siteContent.contact.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-sm text-sm font-semibold text-gold-200 underline decoration-white/25 underline-offset-4 hover:text-white"
          >
            View office location
            <span className="sr-only">
              {" "}
              on Google Maps (opens in a new tab)
            </span>
          </a>
        </div>

        <div className="md:text-right">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-200">
            Staff access
          </p>
          <a
            href="/staff"
            className="mt-4 inline-block rounded-sm text-sm font-semibold text-white underline decoration-gold-500/70 underline-offset-4 hover:text-gold-200"
          >
            Staff Portal
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page-shell py-5 text-xs leading-5 text-navy-100">
          <p>
            Information published on this website is intended for public
            release.
          </p>
        </div>
      </div>
    </footer>
  );
}
