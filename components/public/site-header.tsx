import Link from "next/link";

import { siteContent } from "@/data/site-content";

import { BrandMark } from "./brand-mark";

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      {siteContent.navigation.map((item) => (
        <li key={item.href}>
          <Link
            href={`/${item.href}`}
            className={
              mobile
                ? "block rounded-sm px-3 py-3 text-base font-semibold text-navy-800 hover:bg-cream hover:text-navy-950"
                : "rounded-sm px-1.5 py-2 text-[0.82rem] font-semibold text-navy-700 transition-colors hover:text-teal-700 xl:px-2 xl:text-sm"
            }
          >
            {item.label}
          </Link>
        </li>
      ))}
    </>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/10 bg-white/95 shadow-[0_1px_0_rgba(16,42,67,0.04)] backdrop-blur-sm">
      <div className="page-shell flex min-h-20 items-center justify-between gap-5">
        <Link
          href="/#home"
          aria-label="Audit Team 14 home"
          className="flex items-center gap-3 rounded-sm py-2"
        >
          <BrandMark />
          <span className="leading-tight">
            <span className="block text-[0.64rem] font-bold uppercase tracking-[0.18em] text-teal-700 sm:text-[0.7rem]">
              Commission on Audit
            </span>
            <span className="mt-1 block font-display text-lg font-bold text-navy-900 sm:text-xl">
              Audit Team 14
            </span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            <NavigationLinks />
            <li className="ml-3 border-l border-navy-900/15 pl-4">
              <a
                href="/staff"
                className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-navy-900 px-4 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(16,42,67,0.16)] transition-colors hover:bg-teal-700"
              >
                <span className="lock-icon" aria-hidden="true" />
                Staff Portal
              </a>
            </li>
          </ul>
        </nav>

        <details className="mobile-navigation relative lg:hidden">
          <summary className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm border border-navy-900/20 px-3 py-2 font-semibold text-navy-900">
            <span>Menu</span>
            <span aria-hidden="true" className="grid w-5 gap-2">
              <span className="menu-line h-0.5 bg-current transition-transform" />
              <span className="menu-line h-0.5 bg-current transition-transform" />
            </span>
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(19rem,calc(100vw-1.5rem))] rounded-md border border-navy-900/10 bg-white p-3 shadow-soft"
          >
            <ul>
              <NavigationLinks mobile />
              <li className="mt-2 border-t border-navy-900/10 pt-2">
                <a
                  href="/staff"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-sm bg-navy-900 px-4 py-3 text-base font-bold text-white shadow-[0_8px_20px_rgba(16,42,67,0.15)] hover:bg-teal-700"
                >
                  <span className="lock-icon" aria-hidden="true" />
                  Staff Portal
                </a>
              </li>
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
