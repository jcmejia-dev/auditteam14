import { JurisdictionExplorer } from "@/components/public/jurisdiction-explorer";
import { SectionHeading } from "@/components/public/section-heading";
import { jurisdictionLocations } from "@/data/jurisdictions";
import { getPublicJurisdictionSource } from "@/lib/jurisdictions/data";

export async function JurisdictionSection() {
  const publicSource = await getPublicJurisdictionSource();
  const locations = publicSource.useFallback
    ? jurisdictionLocations
    : publicSource.locations;

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
        <JurisdictionExplorer locations={locations} />
      </div>
    </section>
  );
}
