import { siteContent } from "@/data/site-content";

function DirectionIcon({ type }: { type: "vision" | "mission" }) {
  if (type === "vision") {
    return (
      <svg
        viewBox="0 0 48 48"
        className="size-11"
        aria-hidden="true"
      >
        <path
          d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24Z"
          fill="currentColor"
        />
        <circle cx="24" cy="24" r="8" fill="#f7f4ec" />
        <circle cx="24" cy="24" r="4" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 48 48"
      className="size-11"
      aria-hidden="true"
    >
      <circle
        cx="24"
        cy="24"
        r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
      />
      <circle
        cx="24"
        cy="24"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
      />
      <circle cx="24" cy="24" r="3.5" fill="currentColor" />
    </svg>
  );
}

export function VisionMissionSection() {
  return (
    <section
      id="mandate"
      className="border-t border-teal-700/20 bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="page-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance font-display text-4xl leading-tight text-navy-900 sm:text-5xl">
            Our Vision &amp; Mission
          </h2>
          <span
            aria-hidden="true"
            className="mx-auto mt-6 block h-0.5 w-20 bg-patriot-red"
          />
        </div>

        <div className="mt-12 grid gap-7 lg:grid-cols-2">
          {[siteContent.vision, siteContent.mission].map((item, index) => (
            <article
              key={item.title}
              className="relative min-h-80 overflow-hidden border border-navy-900/10 bg-white px-7 py-10 shadow-[0_18px_45px_rgba(16,42,67,0.09)] sm:px-10 sm:py-12"
            >
              <div className="text-navy-800">
                <DirectionIcon
                  type={index === 0 ? "vision" : "mission"}
                />
              </div>
              <h3 className="relative mt-9 font-display text-2xl font-bold text-navy-900">
                {item.title}
              </h3>
              <p className="relative mt-6 max-w-2xl leading-8 text-ink">
                {item.text}
              </p>
              <span
                aria-hidden="true"
                className={[
                  "absolute inset-x-0 bottom-0 h-1",
                  index === 0 ? "bg-gold-500" : "bg-teal-600",
                ].join(" ")}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
