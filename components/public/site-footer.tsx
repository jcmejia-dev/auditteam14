import Link from "next/link";

import { siteContent } from "@/data/site-content";

import { BrandMark } from "./brand-mark";

const footerLinks = [
  { label: "Home", href: "/#home" },
  { label: "Videos", href: "/videos" },
  { label: "Photos", href: "/photos" },
  { label: "Vision & Mission", href: "/#mandate" },
  { label: "Information", href: "/#institutional-information" },
  { label: "Team Leader", href: "/#leadership" },
  { label: "Jurisdiction", href: "/#jurisdiction" },
  { label: "Contact", href: "/#contact" },
] as const;

function FooterMarker() {
  return (
    <span
      aria-hidden="true"
      className="size-2.5 shrink-0 rotate-45 bg-patriot-red"
    />
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-4 border-patriot-red bg-navy-900 text-navy-100">
      <div className="page-shell grid gap-10 py-14 lg:grid-cols-[0.95fr_1fr_1fr] lg:gap-12">
        <div>
          <div className="flex items-center gap-4">
            <BrandMark inverted />
            <p className="font-display text-2xl font-bold text-white">
              {siteContent.identity.team}
            </p>
          </div>
          <p className="mt-6 max-w-md text-sm leading-7 text-navy-100">
            {siteContent.footer.description}
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold text-white">
            Contact Information
          </h2>
          <span
            aria-hidden="true"
            className="mt-3 block h-0.5 w-12 bg-patriot-red"
          />
          <div className="mt-6 grid gap-3 text-sm">
            <a
              href={siteContent.contact.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center gap-4 bg-white/10 px-4 py-3 text-white transition-colors hover:bg-white/15 hover:text-gold-200"
              aria-label={`${siteContent.contact.organization} on Google Maps (opens in a new tab)`}
            >
              <FooterMarker />
              <span>{siteContent.contact.organization}</span>
            </a>
            <div className="flex min-h-12 items-center gap-4 bg-white/[0.065] px-4 py-3">
              <FooterMarker />
              <span>{siteContent.contact.group}</span>
            </div>
            <a
              href={siteContent.leadership.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center gap-4 bg-white/10 px-4 py-3 text-white transition-colors hover:bg-white/15 hover:text-gold-200"
              aria-label={`${siteContent.leadership.name} on Facebook (opens in a new tab)`}
            >
              <FooterMarker />
              <span>{siteContent.leadership.name}</span>
            </a>
            <a
              href={siteContent.contact.clubFacebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center gap-4 bg-white/[0.065] px-4 py-3 transition-colors hover:bg-white/15 hover:text-gold-200"
              aria-label={`${siteContent.contact.address} on Facebook (opens in a new tab)`}
            >
              <FooterMarker />
              <span>{siteContent.contact.address}</span>
            </a>
          </div>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="font-display text-xl font-bold text-white">
            Quick Links
          </h2>
          <span
            aria-hidden="true"
            className="mt-3 block h-0.5 w-12 bg-patriot-red"
          />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center gap-4 bg-white/[0.065] px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/15 hover:text-gold-200"
                >
                  <FooterMarker />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <a
            href="/staff"
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-sm border border-gold-500/70 px-5 py-3 text-sm font-bold text-gold-200 transition-colors hover:border-gold-200 hover:bg-white/10 hover:text-white"
          >
            Staff Portal
          </a>
        </nav>
      </div>

      <div className="border-t border-white/15">
        <div className="page-shell space-y-1.5 py-6 text-center text-xs leading-5 text-navy-100">
          <p>{siteContent.footer.copyright}</p>
          <p>{siteContent.identity.tagline}</p>
          <p>
            Information published on this website is intended for public
            release.
          </p>
        </div>
      </div>
    </footer>
  );
}
