"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  jurisdictionLocations,
  type JurisdictionCategory,
} from "@/data/jurisdictions";

import { SectionHeading } from "./section-heading";

type JurisdictionFilter = "all" | JurisdictionCategory;

const filters: readonly { label: string; value: JurisdictionFilter }[] = [
  { label: "All", value: "all" },
  { label: "Hospitals", value: "hospital" },
  { label: "Offices", value: "office" },
];

function MapLoadingState() {
  return (
    <div className="jurisdiction-map-loading" role="status">
      <span className="map-loading-pulse" aria-hidden="true" />
      <p className="font-semibold text-navy-800">Loading interactive map…</p>
    </div>
  );
}

const LazyJurisdictionMap = dynamic(() => import("./jurisdiction-map"), {
  ssr: false,
  loading: MapLoadingState,
});

export function JurisdictionSection() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<JurisdictionFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resetVersion, setResetVersion] = useState(0);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const mapSlotRef = useRef<HTMLDivElement>(null);

  const filteredLocations = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return jurisdictionLocations.filter((location) => {
      const matchesFilter =
        filter === "all" || location.category === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          location.name,
          location.abbreviation,
          location.location,
          location.category,
        ].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        );

      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  const activeSelectedId = filteredLocations.some(
    (location) => location.id === selectedId,
  )
    ? selectedId
    : null;

  useEffect(() => {
    const mapSlot = mapSlotRef.current;

    if (!mapSlot || shouldLoadMap) {
      return;
    }

    const Observer = (
      window as Window & {
        IntersectionObserver?: typeof IntersectionObserver;
      }
    ).IntersectionObserver;

    if (!Observer) {
      const fallbackTimer = globalThis.setTimeout(
        () => setShouldLoadMap(true),
        0,
      );

      return () => globalThis.clearTimeout(fallbackTimer);
    }

    const observer = new Observer(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(mapSlot);

    return () => observer.disconnect();
  }, [shouldLoadMap]);

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.currentTarget.value);
    setSelectedId(null);
  }

  function handleReset() {
    setSelectedId(null);
    setResetVersion((version) => version + 1);
  }

  return (
    <section
      id="jurisdiction"
      className="jurisdiction-field bg-cream py-16 sm:py-20 lg:py-24"
    >
      <div className="page-shell relative z-10">
        <SectionHeading
          eyebrow="Audit jurisdiction"
          title="Institutions within the team’s area of responsibility"
          description="Explore the listed hospitals and offices by name, category, or location."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(19rem,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <div className="rounded-sm border border-navy-900/10 bg-white p-5 shadow-soft sm:p-6">
            <label
              htmlFor="jurisdiction-search"
              className="text-sm font-bold text-navy-900"
            >
              Search locations
            </label>
            <div className="relative mt-2">
              <input
                id="jurisdiction-search"
                type="search"
                value={query}
                onChange={handleSearch}
                placeholder="Name, acronym, or municipality"
                className="min-h-12 w-full rounded-sm border border-navy-900/20 bg-white px-4 py-3 pr-10 text-base text-navy-900 placeholder:text-navy-700/65 hover:border-navy-900/40 focus:border-teal-700 focus:outline-none"
              />
              <span
                aria-hidden="true"
                className="absolute right-4 top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-teal-700 after:absolute after:left-2 after:top-2 after:h-1.5 after:w-0.5 after:-rotate-45 after:bg-teal-700"
              />
            </div>

            <div className="mt-5" role="group" aria-label="Filter locations">
              <p className="text-sm font-bold text-navy-900">Show</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {filters.map((option) => {
                  const isActive = filter === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setFilter(option.value);
                        setSelectedId(null);
                      }}
                      className={[
                        "min-h-11 rounded-sm border px-4 py-2 text-sm font-bold transition-colors",
                        isActive
                          ? "border-navy-900 bg-navy-900 text-white"
                          : "border-navy-900/20 bg-white text-navy-800 hover:border-teal-700 hover:text-teal-700",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-navy-900/10 pt-5">
              <p
                className="text-sm font-semibold text-navy-700"
                aria-live="polite"
              >
                {filteredLocations.length}{" "}
                {filteredLocations.length === 1 ? "location" : "locations"}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="min-h-11 rounded-sm px-3 py-2 text-sm font-bold text-teal-700 underline decoration-gold-500/60 underline-offset-4 hover:text-navy-900"
              >
                Reset View
              </button>
            </div>

            <div className="mt-4 max-h-[31rem] space-y-3 overflow-y-auto pr-1">
              {filteredLocations.map((location) => {
                const isSelected = location.id === activeSelectedId;

                return (
                  <button
                    key={location.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedId(location.id)}
                    className={[
                      "w-full rounded-sm border p-4 text-left transition-colors",
                      isSelected
                        ? "border-gold-600 bg-gold-200/35 shadow-[inset_4px_0_0_#b42318]"
                        : "border-navy-900/10 bg-cream/55 hover:border-teal-600 hover:bg-teal-100/45",
                    ].join(" ")}
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span>
                        <span className="block font-display text-lg font-bold leading-6 text-navy-900">
                          {location.name}
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-ink">
                          {location.location}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-navy-900 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white">
                        {location.category}
                      </span>
                    </span>
                  </button>
                );
              })}

              {filteredLocations.length === 0 ? (
                <div className="rounded-sm border border-dashed border-navy-900/20 bg-cream p-5 text-center">
                  <p className="font-semibold text-navy-900">
                    No matching locations
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink">
                    Try another search term or choose a different category.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div
            ref={mapSlotRef}
            className="sticky-map-frame overflow-hidden rounded-sm border border-navy-900/10 bg-navy-100 shadow-soft"
          >
            {shouldLoadMap ? (
              <LazyJurisdictionMap
                locations={filteredLocations}
                selectedId={activeSelectedId}
                onSelect={setSelectedId}
                resetVersion={resetVersion}
              />
            ) : (
              <MapLoadingState />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
