import Image from "next/image";

type BrandMarkProps = {
  size?: "small" | "large";
  inverted?: boolean;
};

export function BrandMark({
  size = "small",
  inverted = false,
}: BrandMarkProps) {
  return (
    <span
      className={[
        "grid shrink-0 place-items-center rounded-full bg-white",
        size === "large" ? "size-32 p-2 sm:size-36" : "size-12 p-0.5",
        inverted
          ? "ring-1 ring-gold-500/55"
          : "ring-1 ring-navy-900/10",
      ].join(" ")}
    >
      <Image
        src="/logo1.png"
        alt="Official seal of the Commission on Audit"
        width={200}
        height={200}
        sizes={size === "large" ? "(min-width: 640px) 144px, 128px" : "48px"}
        className="size-full object-contain"
        priority={size === "small"}
      />
    </span>
  );
}
