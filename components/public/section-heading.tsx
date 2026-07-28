type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  inverse?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  inverse = false,
}: SectionHeadingProps) {
  return (
    <div
      className={[
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "",
      ].join(" ")}
    >
      <p
        className={[
          "mb-4 text-xs font-bold uppercase tracking-[0.22em]",
          inverse ? "text-gold-200" : "text-teal-700",
        ].join(" ")}
      >
        {eyebrow}
      </p>
      <h2
        className={[
          "text-balance font-display text-3xl leading-tight sm:text-4xl lg:text-5xl",
          inverse ? "text-white" : "text-navy-900",
        ].join(" ")}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={[
            "mt-5 text-lg leading-8",
            inverse ? "text-navy-100" : "text-ink",
          ].join(" ")}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
